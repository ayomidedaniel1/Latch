/**
 * Test Suite: Latch Replay Engine
 * Artifact: tests/replay-engine.test.ts
 *
 * CHANGES FROM RUN 2:
 * 1. Edge Case 1 (Non-JSON Destination Response Body): Added test verifying that when destination
 *    returns text/html (e.g. <html><body>502 Bad Gateway</body></html>), the replay engine stores
 *    the full HTML string in response_body and records HTTP status 502 in response_status without
 *    attempting to parse JSON or crashing.
 * 2. Edge Case 2 (Source Event with Null raw_body): Added test verifying that when findForReplay
 *    returns a row with raw_body = null (valid per lib/schema.sql), outgoing fetch receives null
 *    as body, completes successfully, and persists a row in replays table.
 * 3. Edge Case 3 (Two Concurrent Replays of Same Event): Added test verifying that firing two
 *    replayEvent() calls simultaneously with Promise.all targeting different destination URLs
 *    both resolve successfully and record distinct INSERT INTO replays queries with different
 *    destination_url values.
 * 4. Strict Schema Compliance & Typing: Mock handlers return exact SELECT columns
 *    ({ id, project_id, method, headers, raw_body } for events; { id, name, destination_url, cli_token, created_at }
 *    for projects), all tests use flat test('replay-engine: ...') calls, and zero 'any' types are used.
 *
 * CHANGES FROM RUN 1:
 * 1. Flat test() Structure: Refactored all describe/it blocks into flat test('replay-engine: ...')
 *    calls using test.before, test.after, and test.beforeEach for lifecycle management, aligning
 *    with codebase conventions in tests/ingest.test.ts and tests/replay.test.ts.
 * 2. Removed Duplicate Tests: Deleted the 6 redundant invariant/edge-case tests (auth 401,
 *    invalid JSON 400, non-UUID 400, malformed URL 400, ownership 403, response body truncation)
 *    that were already covered in tests/replay.test.ts, focusing strictly on the required scenarios.
 * 3. Exact SELECT Return Shapes:
 *    - verifyOwnership: Mock handlers now return { id, name, destination_url, cli_token, created_at },
 *      matching the exact columns in SELECT id, name, destination_url, cli_token, created_at FROM projects
 *      (removed user_id which is NOT selected by verifyOwnership).
 *    - findForReplay: Mock handlers now return { id, project_id, method, headers, raw_body },
 *      matching the exact columns in SELECT id, project_id, method, headers, raw_body FROM events.
 * 4. TypeScript Strictness: Zero usage of 'any' across all types, casts, and signatures.
 *
 * Files Inspected:
 * - lib/services/replay.ts: Core replay logic (replayEvent, ReplayError), header manipulation,
 *   outbound fetch invocation, error recovery (status 500 fallback on network failure),
 *   duration measurement, and replay record insertion.
 * - lib/repositories/replays.ts: SQL persistence layer (insert, findByEvent), column names
 *   (id, event_id, destination_url, response_status, response_body, duration_ms, replayed_at),
 *   and response body truncation at 10,000 characters.
 * - app/api/replay/route.ts: HTTP POST route handler, requireSession authentication check,
 *   Zod input validation (UUID for eventId, valid URL for destinationUrl, SSRF filtering),
 *   and HTTP status translation for ReplayError.
 * - lib/repositories/events.ts: Source event retrieval via findForReplay (SELECT id, project_id,
 *   method, headers, raw_body FROM events WHERE id = $1 LIMIT 1).
 * - lib/repositories/projects.ts: Ownership verification via verifyOwnership (SELECT id,
 *   name, destination_url, cli_token, created_at FROM projects WHERE id = $1 AND user_id = $2).
 * - lib/schema.sql: Database schema verification. Confirmed column names and types for 'replays'
 *   (id UUID, event_id UUID REFERENCES events(id), destination_url TEXT, response_status INTEGER,
 *   response_body TEXT, duration_ms INTEGER, replayed_at TIMESTAMPTZ) and 'events' (id UUID,
 *   project_id UUID, method TEXT, headers JSONB, body JSONB, raw_body TEXT, source_ip TEXT,
 *   received_at TIMESTAMPTZ). Confirmed that replays.event_id does NOT have a UNIQUE constraint,
 *   enabling multiple replay rows per event.
 * - lib/types.ts: Shared type definitions (WebhookEvent, WebhookPayload, DiffEntry).
 * - tests/mock-helper.ts: Project mocking infrastructure (mockDbState, mockFetchState,
 *   setupMockFetch, restoreFetch, setMockSession, resetAllMocks).
 * - tests/ingest.test.ts, tests/processor.test.ts, tests/replay.test.ts: Assertion styles,
 *   lifecycle hooks (before, after, beforeEach), and flat test() structure.
 *
 * Assumptions:
 * 1. Outgoing replay requests preserve all original headers from the event's headers JSONB column,
 *    stripping only hop-by-hop headers ('host' and 'content-length'), and injecting
 *    'x-webhook-replay: true' and 'x-webhook-original-id: <eventId>'.
 * 2. When destination URLs are unreachable or throw network errors (e.g. ECONNREFUSED or timeout),
 *    the engine catches the error, assigns status 500 and the error message string as response_body,
 *    records duration_ms, and inserts the failure row into the replays table without throwing.
 * 3. When an eventId does not exist, replayEvent throws ReplayError('Event not found', 404).
 *    The HTTP route handler translates this into HTTP 404 with JSON { error: 'Event not found' }.
 *    No outbound HTTP request is made and no replay row is created.
 * 4. duration_ms measures real elapsed milliseconds of the replay attempt. In tests with
 *    asynchronous work, duration_ms is a positive integer (> 0).
 * 5. Multiple replays of the same event ID succeed and append distinct rows to the replays table.
 *    No prior replay row is mutated, replaced, or deleted.
 * 6. The test runner is Node.js built-in (node:test) with node:assert, executed via tsx --test.
 *    No external test framework or 'any' type is used.
 */

import test from 'node:test';
import assert from 'node:assert';
import {
  mockDbState,
  mockFetchState,
  setupMockFetch,
  restoreFetch,
  setMockSession,
  resetAllMocks,
} from './mock-helper';
import { replayEvent, ReplayError, type ReplayResult } from '@/lib/services/replay';
import * as replaysRepo from '@/lib/repositories/replays';
import * as replayRoute from '@/app/api/replay/route';

// ─── Test Constants ─────────────────────────────────────────────────────────

const USER_ID = 'usr-00000000-0000-0000-0000-000000000001';
const PROJECT_ID = 'b1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
const EVENT_ID = 'e1e2e3e4-f5f6-7a8b-9c0d-1e2f3a4b5c6d';
const DESTINATION_URL = 'https://receiver.example.com/webhook-endpoint';

// ─── Exact Mock Return Shapes (Adhering strictly to repository SQL SELECTs) ──

/**
 * Shape returned by projectsRepo.verifyOwnership:
 * SELECT id, name, destination_url, cli_token, created_at FROM projects WHERE id = $1 AND user_id = $2
 */
interface MockProjectOwnershipRow {
  id: string;
  name: string;
  destination_url: string | null;
  cli_token: string;
  created_at: string;
}

const mockProjectRow: MockProjectOwnershipRow = {
  id: PROJECT_ID,
  name: 'Production Invoicing',
  destination_url: DESTINATION_URL,
  cli_token: 'tok-1111-2222',
  created_at: '2026-01-01T00:00:00.000Z',
};

/**
 * Shape returned by eventsRepo.findForReplay:
 * SELECT id, project_id, method, headers, raw_body FROM events WHERE id = $1 LIMIT 1
 */
interface MockEventForReplayRow {
  id: string;
  project_id: string;
  method: string;
  headers: Record<string, string>;
  raw_body: string | null;
}

const createMockEventRow = (overrides: {
  method?: string;
  headers?: Record<string, string>;
  raw_body?: string | null;
} = {}): MockEventForReplayRow => ({
  id: EVENT_ID,
  project_id: PROJECT_ID,
  method: overrides.method ?? 'POST',
  headers: overrides.headers ?? { 'content-type': 'application/json' },
  raw_body: overrides.raw_body !== undefined ? overrides.raw_body : '{"event":"test"}',
});

/**
 * Shape of replays table rows (lib/schema.sql & lib/repositories/replays.ts)
 */
interface ReplayRecord {
  id: string;
  event_id: string;
  destination_url: string;
  response_status: number;
  response_body: string;
  duration_ms: number;
  replayed_at: string;
}

// ─── Lifecycle Hooks ────────────────────────────────────────────────────────

test.before(() => {
  setupMockFetch();
});

test.after(() => {
  restoreFetch();
});

test.beforeEach(() => {
  resetAllMocks();
  setMockSession({ user: { id: USER_ID } });
});

// ─── 1. Successful Replay & Database Persistence ────────────────────────────

test('replay-engine: executes a successful replay, stores destination response status and body in replays table, and returns result', async () => {
  const originalPayload = JSON.stringify({ event: 'invoice.paid', amount: 4900 });
  const originalHeaders: Record<string, string> = {
    'content-type': 'application/json',
    'x-provider-signature': 'sig_valid_123',
  };

  let insertedReplayValues: unknown[] | null = null;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({ headers: originalHeaders, raw_body: originalPayload })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      insertedReplayValues = values;
      return [{
        id: 'rep-uuid-0001',
        event_id: values[0],
        destination_url: values[1],
        response_status: values[2],
        response_body: values[3],
        duration_ms: values[4],
        replayed_at: new Date().toISOString(),
      }];
    }
    return [];
  };

  const destinationResponseBody = JSON.stringify({ status: 'accepted', processing_id: 'proc_9988' });
  mockFetchState.defaultResponse = {
    status: 200,
    body: destinationResponseBody,
    headers: { 'content-type': 'application/json' },
  };

  const result: ReplayResult = await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);

  // 1. Verify returned result
  assert.strictEqual(result.status, 200, 'Replay result status should match destination status');
  assert.strictEqual(result.body, destinationResponseBody, 'Replay result body should match destination response body');
  assert.strictEqual(typeof result.duration, 'number', 'Duration must be a number');

  // 2. Verify destination fetch invocation
  assert.strictEqual(mockFetchState.calls.length, 1, 'Exactly one fetch call should be made');
  const fetchCall = mockFetchState.calls[0];
  assert.strictEqual(fetchCall.url, DESTINATION_URL);
  assert.strictEqual(fetchCall.init?.method, 'POST');
  assert.strictEqual(fetchCall.init?.body, originalPayload);

  // 3. Verify database persistence in replays table with exact schema columns
  assert.ok(insertedReplayValues !== null, 'An INSERT INTO replays query must be executed');
  const insertQuery = mockDbState.queries.find((q) => q.text.includes('INSERT INTO replays'));
  assert.ok(insertQuery, 'Should have recorded INSERT INTO replays query in query log');

  // Values map to: (event_id, destination_url, response_status, response_body, duration_ms)
  assert.strictEqual(insertedReplayValues[0], EVENT_ID, 'event_id column must match original eventId');
  assert.strictEqual(insertedReplayValues[1], DESTINATION_URL, 'destination_url column must match destination URL');
  assert.strictEqual(insertedReplayValues[2], 200, 'response_status column must record HTTP 200');
  assert.strictEqual(insertedReplayValues[3], destinationResponseBody, 'response_body column must record destination body');
  assert.strictEqual(typeof insertedReplayValues[4], 'number', 'duration_ms column must be numeric');
});

test('replay-engine: processes successful replay via HTTP POST /api/replay route and returns 200 with result payload', async () => {
  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({ raw_body: '{"ping":true}' })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{
        id: 'rep-uuid-route-success',
        event_id: values[0],
        destination_url: values[1],
        response_status: values[2],
        response_body: values[3],
        duration_ms: values[4],
        replayed_at: new Date().toISOString(),
      }];
    }
    return [];
  };

  mockFetchState.defaultResponse = {
    status: 201,
    body: '{"created":true}',
  };

  const req = new Request('http://localhost:3000/api/replay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      eventId: EVENT_ID,
      destinationUrl: DESTINATION_URL,
    }),
  });

  const response = await replayRoute.POST(req);
  assert.strictEqual(response.status, 200, 'Route must return 200 for successful replay operation');

  const data = (await response.json()) as { status: number; body: string; duration: number };
  assert.strictEqual(data.status, 201);
  assert.strictEqual(data.body, '{"created":true}');
  assert.strictEqual(typeof data.duration, 'number');
});

// ─── 2. Unreachable Destination Handling (Graceful Recovery) ────────────────

test('replay-engine: handles unreachable destination network error (ECONNREFUSED) gracefully without crashing', async () => {
  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({ raw_body: '{"test":"network-error"}' })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{
        id: 'rep-uuid-unreachable',
        event_id: values[0],
        destination_url: values[1],
        response_status: values[2],
        response_body: values[3],
        duration_ms: values[4],
        replayed_at: new Date().toISOString(),
      }];
    }
    return [];
  };

  // Simulate a network failure where destination is unreachable
  mockFetchState.customHandler = async () => {
    throw new Error('fetch failed: connect ECONNREFUSED 198.51.100.25:443');
  };

  const unreachableUrl = 'https://unreachable.example.com/hook';
  const result: ReplayResult = await replayEvent(EVENT_ID, unreachableUrl, USER_ID);

  // Must not throw: graceful recovery with status 500 and error message
  assert.strictEqual(result.status, 500, 'Replay result status must be 500 when destination is unreachable');
  assert.ok(
    result.body.includes('ECONNREFUSED'),
    `Expected error message in result body, got: ${result.body}`,
  );
  assert.strictEqual(typeof result.duration, 'number');

  // Persistence check: replays row is still created with status 500 and error body
  const insertQuery = mockDbState.queries.find((q) => q.text.includes('INSERT INTO replays'));
  assert.ok(insertQuery, 'Failed replay attempt must still be logged to replays table');
  assert.strictEqual(insertQuery.values[0], EVENT_ID);
  assert.strictEqual(insertQuery.values[1], unreachableUrl);
  assert.strictEqual(insertQuery.values[2], 500, 'response_status in database must be 500');
  assert.ok((insertQuery.values[3] as string).includes('ECONNREFUSED'), 'response_body in database must contain error message');
  assert.strictEqual(typeof insertQuery.values[4], 'number', 'duration_ms must be recorded');
});

test('replay-engine: handles destination request timeout / AbortError gracefully and logs error in replays table', async () => {
  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({ raw_body: '{}' })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{
        id: 'rep-uuid-timeout',
        event_id: values[0],
        destination_url: values[1],
        response_status: values[2],
        response_body: values[3],
        duration_ms: values[4],
        replayed_at: new Date().toISOString(),
      }];
    }
    return [];
  };

  mockFetchState.customHandler = async () => {
    throw new Error('The operation was aborted due to timeout');
  };

  const result: ReplayResult = await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);

  assert.strictEqual(result.status, 500);
  assert.strictEqual(result.body, 'The operation was aborted due to timeout');

  const insertQuery = mockDbState.queries.find((q) => q.text.includes('INSERT INTO replays'));
  assert.ok(insertQuery);
  assert.strictEqual(insertQuery.values[2], 500);
  assert.strictEqual(insertQuery.values[3], 'The operation was aborted due to timeout');
});

test('replay-engine: app/api/replay POST route returns HTTP 200 with 500 status payload when destination is unreachable', async () => {
  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({ raw_body: '{}' })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{ id: 'rep-route-unreachable' }];
    }
    return [];
  };

  mockFetchState.customHandler = async () => {
    throw new Error('connect ETIMEDOUT 203.0.113.10:443');
  };

  const req = new Request('http://localhost:3000/api/replay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      eventId: EVENT_ID,
      destinationUrl: DESTINATION_URL,
    }),
  });

  const response = await replayRoute.POST(req);
  assert.strictEqual(response.status, 200);

  const data = (await response.json()) as { status: number; body: string };
  assert.strictEqual(data.status, 500);
  assert.ok(data.body.includes('ETIMEDOUT'));
});

// ─── 3. Non-Existent Event ID Handling ──────────────────────────────────────

test('replay-engine: throws ReplayError with status 404 when eventId does not exist in events table', async () => {
  const nonExistentEventId = 'f0f1f2f3-f4f5-4f6f-8f9f-0f1f2f3f4f5f';

  // Database returns empty array for events table query
  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM events')) {
      return [];
    }
    return [];
  };

  await assert.rejects(
    async () => {
      await replayEvent(nonExistentEventId, DESTINATION_URL, USER_ID);
    },
    (err: unknown) => {
      assert.ok(err instanceof ReplayError, 'Error must be an instance of ReplayError');
      assert.strictEqual(err.statusCode, 404, 'Status code must be 404');
      assert.strictEqual(err.message, 'Event not found', 'Error message must be "Event not found"');
      return true;
    },
  );

  // Verify that no HTTP request was sent to destination
  assert.strictEqual(mockFetchState.calls.length, 0, 'No outgoing fetch request should be dispatched');

  // Verify that no record was inserted into replays table
  const insertQuery = mockDbState.queries.find((q) => q.text.includes('INSERT INTO replays'));
  assert.strictEqual(insertQuery, undefined, 'No replays row should be inserted for non-existent event');
});

test('replay-engine: app/api/replay POST route returns HTTP 404 with clear error message when event is not found', async () => {
  const nonExistentEventId = 'f0f1f2f3-f4f5-4f6f-8f9f-0f1f2f3f4f5f';

  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM events')) {
      return [];
    }
    return [];
  };

  const req = new Request('http://localhost:3000/api/replay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      eventId: nonExistentEventId,
      destinationUrl: DESTINATION_URL,
    }),
  });

  const response = await replayRoute.POST(req);
  assert.strictEqual(response.status, 404, 'Route should return HTTP 404');

  const data = (await response.json()) as { error: string };
  assert.strictEqual(data.error, 'Event not found', 'Error message must clearly state "Event not found"');
});

// ─── 4. Request Headers Preservation & Replay Header Injection ──────────────

test('replay-engine: preserves every original header from event headers JSONB column and injects x-webhook-replay: true', async () => {
  const originalHeaders: Record<string, string> = {
    'content-type': 'application/json',
    'stripe-signature': 't=1700000000,v1=sec_abcdef1234567890',
    'x-github-event': 'pull_request',
    'x-hub-signature-256': 'sha256=abcdef7890abcdef7890abcdef7890abcdef7890abcdef7890abcdef7890abcd',
    'authorization': 'Bearer webhook-signing-secret-key-1234',
    'user-agent': 'GitHub-Hookshot/abc123',
    'x-custom-metric': 'latency-benchmark-99',
    'x-idempotency-key': 'idemp_key_alpha_omega_9999',
  };

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({
        headers: originalHeaders,
        raw_body: '{"action":"opened","number":42}',
      })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{ id: 'rep-headers-test', event_id: values[0] }];
    }
    return [];
  };

  mockFetchState.defaultResponse = {
    status: 200,
    body: '{"ok":true}',
  };

  await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);

  assert.strictEqual(mockFetchState.calls.length, 1);
  const call = mockFetchState.calls[0];
  const forwardedHeaders = call.init?.headers as Record<string, string>;
  assert.ok(forwardedHeaders, 'Headers object must be passed to outgoing fetch');

  // 1. Verify every original header from headers JSONB column is preserved intact
  assert.strictEqual(forwardedHeaders['content-type'], 'application/json');
  assert.strictEqual(forwardedHeaders['stripe-signature'], 't=1700000000,v1=sec_abcdef1234567890');
  assert.strictEqual(forwardedHeaders['x-github-event'], 'pull_request');
  assert.strictEqual(forwardedHeaders['x-hub-signature-256'], 'sha256=abcdef7890abcdef7890abcdef7890abcdef7890abcdef7890abcdef7890abcd');
  assert.strictEqual(forwardedHeaders['authorization'], 'Bearer webhook-signing-secret-key-1234');
  assert.strictEqual(forwardedHeaders['user-agent'], 'GitHub-Hookshot/abc123');
  assert.strictEqual(forwardedHeaders['x-custom-metric'], 'latency-benchmark-99');
  assert.strictEqual(forwardedHeaders['x-idempotency-key'], 'idemp_key_alpha_omega_9999');

  // 2. Verify x-webhook-replay: true is injected
  assert.strictEqual(forwardedHeaders['x-webhook-replay'], 'true', 'x-webhook-replay must be set to "true"');

  // 3. Verify x-webhook-original-id is injected
  assert.strictEqual(forwardedHeaders['x-webhook-original-id'], EVENT_ID, 'x-webhook-original-id must match eventId');
});

test('replay-engine: strips hop-by-hop headers (host and content-length) from the outgoing replay request', async () => {
  const headersWithHopByHop: Record<string, string> = {
    'host': 'source-webhooks.thirdparty.com',
    'content-length': '9999',
    'content-type': 'application/json',
    'x-origin-test': 'preserved-value',
  };

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({
        headers: headersWithHopByHop,
        raw_body: '{"hop":"test"}',
      })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{ id: 'rep-hop-test', event_id: values[0] }];
    }
    return [];
  };

  await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);

  const call = mockFetchState.calls[0];
  const forwardedHeaders = call.init?.headers as Record<string, string>;

  // Host and content-length must be deleted
  assert.strictEqual(forwardedHeaders['host'], undefined, 'host header must be stripped to prevent routing corruption');
  assert.strictEqual(forwardedHeaders['content-length'], undefined, 'content-length header must be stripped to avoid body mismatch');

  // Non hop-by-hop headers must be preserved
  assert.strictEqual(forwardedHeaders['content-type'], 'application/json');
  assert.strictEqual(forwardedHeaders['x-origin-test'], 'preserved-value');
  assert.strictEqual(forwardedHeaders['x-webhook-replay'], 'true');
});

test('replay-engine: preserves the original HTTP method and raw_body from the source event', async () => {
  const rawPayload = '{"action":"reopened","issue":{"id":123}}';

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({
        method: 'PUT',
        raw_body: rawPayload,
      })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{ id: 'rep-method-test', event_id: values[0] }];
    }
    return [];
  };

  await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);

  const call = mockFetchState.calls[0];
  assert.strictEqual(call.init?.method, 'PUT', 'Original event method (PUT) must be preserved');
  assert.strictEqual(call.init?.body, rawPayload, 'Original event raw_body must be passed directly as fetch body');
});

// ─── 5. duration_ms Recording & Validation ──────────────────────────────────

test('replay-engine: measures elapsed time and records duration_ms as a positive integer in the replays table', async () => {
  let recordedDurationMs: unknown = null;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({ raw_body: '{"measure":"duration"}' })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      recordedDurationMs = values[4];
      return [{
        id: 'rep-duration-test',
        event_id: values[0],
        destination_url: values[1],
        response_status: values[2],
        response_body: values[3],
        duration_ms: values[4],
        replayed_at: new Date().toISOString(),
      }];
    }
    return [];
  };

  // Introduce an intentional delay in destination response to guarantee duration > 0
  mockFetchState.customHandler = async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 15));
    return new Response('{"status":"delayed-ok"}', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const result: ReplayResult = await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);

  // 1. Verify result duration
  assert.strictEqual(typeof result.duration, 'number', 'result.duration must be of type number');
  assert.ok(Number.isInteger(result.duration), 'result.duration must be an integer');
  assert.ok(result.duration >= 10, `result.duration should reflect the elapsed time (>= 10ms), got: ${result.duration}`);

  // 2. Verify duration_ms inserted into database
  assert.ok(recordedDurationMs !== null, 'duration_ms must be passed to replays table insert');
  assert.strictEqual(typeof recordedDurationMs, 'number', 'duration_ms in SQL values must be a number');
  assert.ok(Number.isInteger(recordedDurationMs), 'duration_ms in SQL values must be an integer');
  assert.ok((recordedDurationMs as number) > 0, `duration_ms in SQL values must be a positive integer, got: ${recordedDurationMs}`);
  assert.strictEqual(recordedDurationMs, result.duration, 'duration_ms in database must match result duration');
});

test('replay-engine: records duration_ms as a positive integer even when the destination call fails', async () => {
  let recordedDurationMs: unknown = null;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({ raw_body: '{}' })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      recordedDurationMs = values[4];
      return [{ id: 'rep-fail-duration' }];
    }
    return [];
  };

  // Introduce delay before failing
  mockFetchState.customHandler = async () => {
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
    throw new Error('Destination socket closed abruptly');
  };

  const result: ReplayResult = await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);

  assert.strictEqual(result.status, 500);
  assert.strictEqual(typeof result.duration, 'number');
  assert.ok(Number.isInteger(result.duration));
  assert.ok(result.duration > 0, `Failed replay duration must still be positive, got: ${result.duration}`);

  assert.strictEqual(typeof recordedDurationMs, 'number');
  assert.ok(Number.isInteger(recordedDurationMs));
  assert.ok((recordedDurationMs as number) > 0);
  assert.strictEqual(recordedDurationMs, result.duration);
});

// ─── 6. Multiple Replays of Same Event (No Overwrite, Appends Row) ──────────

test('replay-engine: replaying an event that has already been replayed succeeds and creates a second replays row without overwriting', async () => {
  // In-memory simulation of the PostgreSQL replays table adhering strictly to lib/schema.sql
  const replayTable: ReplayRecord[] = [];

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({ raw_body: '{"event":"customer.subscription.created"}' })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      // Schema columns: id, event_id, destination_url, response_status, response_body, duration_ms, replayed_at
      const rowId = `rep-uuid-000${replayTable.length + 1}`;
      const newRecord: ReplayRecord = {
        id: rowId,
        event_id: values[0] as string,
        destination_url: values[1] as string,
        response_status: values[2] as number,
        response_body: values[3] as string,
        duration_ms: values[4] as number,
        replayed_at: new Date(Date.now() + replayTable.length * 1000).toISOString(),
      };
      replayTable.push(newRecord);
      return [newRecord as unknown as Record<string, unknown>];
    }
    if (text.includes('FROM replays') && text.includes('WHERE event_id =')) {
      const targetEventId = values[0] as string;
      const rows = replayTable.filter((r) => r.event_id === targetEventId);
      // Return rows in descending order of replayed_at
      return [...rows].reverse() as unknown as Record<string, unknown>[];
    }
    return [];
  };

  const destination1 = 'https://first-receiver.example.com/webhook';
  const destination2 = 'https://second-receiver.example.com/webhook';

  // ── First Replay ──
  mockFetchState.defaultResponse = {
    status: 200,
    body: '{"replay":1,"status":"ok"}',
  };

  const result1 = await replayEvent(EVENT_ID, destination1, USER_ID);
  assert.strictEqual(result1.status, 200);
  assert.strictEqual(replayTable.length, 1, 'First replay must create exactly 1 row');
  assert.strictEqual(replayTable[0].event_id, EVENT_ID);
  assert.strictEqual(replayTable[0].destination_url, destination1);
  assert.strictEqual(replayTable[0].response_status, 200);
  assert.strictEqual(replayTable[0].response_body, '{"replay":1,"status":"ok"}');

  // ── Second Replay of the SAME event (different destination or repeated) ──
  mockFetchState.defaultResponse = {
    status: 202,
    body: '{"replay":2,"status":"accepted"}',
  };

  const result2 = await replayEvent(EVENT_ID, destination2, USER_ID);
  assert.strictEqual(result2.status, 202);

  // Verify that a second row was appended rather than overwriting the first row
  assert.strictEqual(replayTable.length, 2, 'Second replay must create a second row in replays table (total: 2 rows)');

  // Verify Row 1 was not mutated or overwritten
  assert.strictEqual(replayTable[0].id, 'rep-uuid-0001');
  assert.strictEqual(replayTable[0].event_id, EVENT_ID);
  assert.strictEqual(replayTable[0].destination_url, destination1);
  assert.strictEqual(replayTable[0].response_status, 200);
  assert.strictEqual(replayTable[0].response_body, '{"replay":1,"status":"ok"}');

  // Verify Row 2 is distinct and contains the second replay data
  assert.strictEqual(replayTable[1].id, 'rep-uuid-0002');
  assert.strictEqual(replayTable[1].event_id, EVENT_ID);
  assert.strictEqual(replayTable[1].destination_url, destination2);
  assert.strictEqual(replayTable[1].response_status, 202);
  assert.strictEqual(replayTable[1].response_body, '{"replay":2,"status":"accepted"}');

  // ── Third Replay of the SAME event to the SAME destination as First Replay ──
  mockFetchState.defaultResponse = {
    status: 200,
    body: '{"replay":3,"status":"retry-ok"}',
  };

  const result3 = await replayEvent(EVENT_ID, destination1, USER_ID);
  assert.strictEqual(result3.status, 200);
  assert.strictEqual(replayTable.length, 3, 'Third replay must create a third row in replays table (total: 3 rows)');

  // ── Verify querying replays by event via replays repository ──
  const history = await replaysRepo.findByEvent(EVENT_ID);
  assert.strictEqual(history.length, 3, 'findByEvent must return all 3 replay rows for the event');

  // Verify history rows correspond to all 3 replays in reverse chronological order
  const historyRows = history as unknown as ReplayRecord[];
  assert.strictEqual(historyRows[0].id, 'rep-uuid-0003');
  assert.strictEqual(historyRows[1].id, 'rep-uuid-0002');
  assert.strictEqual(historyRows[2].id, 'rep-uuid-0001');
});

test('replay-engine: replays repository insert directly persists multiple rows for the same eventId without unique constraint violation', async () => {
  let insertCount = 0;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('INSERT INTO replays')) {
      insertCount++;
      return [{
        id: `rep-row-${insertCount}`,
        event_id: values[0],
        destination_url: values[1],
        response_status: values[2],
        response_body: values[3],
        duration_ms: values[4],
        replayed_at: new Date().toISOString(),
      }];
    }
    return [];
  };

  const row1 = await replaysRepo.insert({
    eventId: EVENT_ID,
    destinationUrl: 'https://test-a.example.com',
    responseStatus: 200,
    responseBody: 'OK 1',
    durationMs: 12,
  });

  const row2 = await replaysRepo.insert({
    eventId: EVENT_ID,
    destinationUrl: 'https://test-b.example.com',
    responseStatus: 500,
    responseBody: 'Error 2',
    durationMs: 25,
  });

  assert.strictEqual(insertCount, 2);
  assert.strictEqual((row1 as unknown as ReplayRecord).id, 'rep-row-1');
  assert.strictEqual((row2 as unknown as ReplayRecord).id, 'rep-row-2');
  assert.strictEqual((row1 as unknown as ReplayRecord).event_id, EVENT_ID);
  assert.strictEqual((row2 as unknown as ReplayRecord).event_id, EVENT_ID);
});

// ─── 7. Additional Edge Cases (Run 2) ───────────────────────────────────────

test('replay-engine: handles non-JSON destination response body (text/html) and stores raw HTML with status 502 without crashing', async () => {
  const htmlErrorPage = '<html><body>502 Bad Gateway</body></html>';
  let insertedResponseBody: unknown = null;
  let insertedResponseStatus: unknown = null;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({ raw_body: '{"event":"upstream.call"}' })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      insertedResponseStatus = values[2];
      insertedResponseBody = values[3];
      return [{
        id: 'rep-uuid-html-502',
        event_id: values[0],
        destination_url: values[1],
        response_status: values[2],
        response_body: values[3],
        duration_ms: values[4],
        replayed_at: new Date().toISOString(),
      }];
    }
    return [];
  };

  mockFetchState.defaultResponse = {
    status: 502,
    body: htmlErrorPage,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  };

  const result: ReplayResult = await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);

  assert.strictEqual(result.status, 502, 'Result status must match HTTP 502 status code');
  assert.strictEqual(result.body, htmlErrorPage, 'Result body must contain raw HTML error string');
  assert.strictEqual(typeof result.duration, 'number');

  // Verify persistence in replays table: full HTML stored in response_body and 502 in response_status
  assert.strictEqual(insertedResponseStatus, 502, 'response_status in replays table must be 502');
  assert.strictEqual(insertedResponseBody, htmlErrorPage, 'response_body in replays table must store the unparsed HTML error page');
});

test('replay-engine: handles source event where raw_body is null and sends null body in outgoing fetch call', async () => {
  let insertedEventId: unknown = null;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      // lib/schema.sql: raw_body TEXT (nullable)
      return [createMockEventRow({ raw_body: null })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      insertedEventId = values[0];
      return [{
        id: 'rep-uuid-null-body',
        event_id: values[0],
        destination_url: values[1],
        response_status: values[2],
        response_body: values[3],
        duration_ms: values[4],
        replayed_at: new Date().toISOString(),
      }];
    }
    return [];
  };

  mockFetchState.defaultResponse = {
    status: 200,
    body: '{"received":true}',
  };

  const result: ReplayResult = await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);

  assert.strictEqual(result.status, 200);
  assert.strictEqual(mockFetchState.calls.length, 1);
  const fetchCall = mockFetchState.calls[0];
  assert.strictEqual(fetchCall.init?.body, null, 'Outgoing fetch body must be null when event raw_body is null');
  assert.strictEqual(insertedEventId, EVENT_ID, 'Replay row must still be persisted when raw_body is null');
});

test('replay-engine: handles two concurrent replays of the same event via Promise.all and inserts distinct rows for each destination', async () => {
  const destinationA = 'https://concurrent-a.example.com/webhook';
  const destinationB = 'https://concurrent-b.example.com/webhook';

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [createMockEventRow({ raw_body: '{"concurrent":true}' })];
    }
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{
        id: `rep-uuid-concurrent-${mockDbState.queries.length}`,
        event_id: values[0],
        destination_url: values[1],
        response_status: values[2],
        response_body: values[3],
        duration_ms: values[4],
        replayed_at: new Date().toISOString(),
      }];
    }
    return [];
  };

  mockFetchState.customHandler = async (url: string) => {
    return new Response(JSON.stringify({ ack: true, target: url }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const [resultA, resultB] = await Promise.all([
    replayEvent(EVENT_ID, destinationA, USER_ID),
    replayEvent(EVENT_ID, destinationB, USER_ID),
  ]);

  // Both replays must resolve successfully
  assert.strictEqual(resultA.status, 200);
  assert.strictEqual(resultB.status, 200);
  assert.ok(resultA.body.includes(destinationA));
  assert.ok(resultB.body.includes(destinationB));

  // Verify two distinct INSERT INTO replays queries were recorded with different destination_url values
  const insertQueries = mockDbState.queries.filter((q) => q.text.includes('INSERT INTO replays'));
  assert.strictEqual(insertQueries.length, 2, 'Exactly two INSERT INTO replays queries must be recorded');

  assert.strictEqual(insertQueries[0].values[0], EVENT_ID, 'First replay query must reference EVENT_ID');
  assert.strictEqual(insertQueries[1].values[0], EVENT_ID, 'Second replay query must reference EVENT_ID');

  const recordedDestinations = new Set([
    insertQueries[0].values[1] as string,
    insertQueries[1].values[1] as string,
  ]);
  assert.strictEqual(recordedDestinations.size, 2, 'The two replay insert queries must have different destination_url values');
  assert.ok(recordedDestinations.has(destinationA), 'Must include destinationA');
  assert.ok(recordedDestinations.has(destinationB), 'Must include destinationB');
});
