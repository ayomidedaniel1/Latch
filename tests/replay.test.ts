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
import * as replayRoute from '@/app/api/replay/route';
import { replayEvent, ReplayError } from '@/lib/services/replay';
import { env } from '@/lib/env';

const USER_ID = 'user-owner-123';
const OTHER_USER_ID = 'user-intruder-999';
const PROJECT_ID = 'a1b2c3d4-e5f6-4a8b-9c0d-1e2f3a4b5c6d';
const EVENT_ID = 'd3b07384-d113-4956-a5db-e1c725a34e32';
const DESTINATION_URL = 'https://webhook.site/test-receiver';

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

// ─── 1. Authentication & Route Input Validation ──────────────────────

test('replay route: returns 401 Unauthorized when session is missing', async () => {
  setMockSession(null);

  const req = new Request('http://localhost:3000/api/replay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      eventId: EVENT_ID,
      destinationUrl: DESTINATION_URL,
    }),
  });

  const response = await replayRoute.POST(req);
  assert.strictEqual(response.status, 401);
  assert.strictEqual(await response.text(), 'Unauthorized');
});

test('replay route: returns 400 for invalid JSON body', async () => {
  const req = new Request('http://localhost:3000/api/replay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: 'invalid-json-{missing-bracket',
  });

  const response = await replayRoute.POST(req);
  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string };
  assert.strictEqual(data.error, 'Invalid JSON body');
});

test('replay route: returns 400 when eventId is not a valid UUID', async () => {
  const req = new Request('http://localhost:3000/api/replay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      eventId: 'not-a-uuid',
      destinationUrl: DESTINATION_URL,
    }),
  });

  const response = await replayRoute.POST(req);
  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string; details: { eventId?: string[] } };
  assert.strictEqual(data.error, 'Validation failed');
  assert.ok(data.details.eventId, 'Should return validation error on eventId');
});

test('replay route: returns 400 when destinationUrl is malformed', async () => {
  const req = new Request('http://localhost:3000/api/replay', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      eventId: EVENT_ID,
      destinationUrl: 'not-a-valid-url',
    }),
  });

  const response = await replayRoute.POST(req);
  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string; details: { destinationUrl?: string[] } };
  assert.strictEqual(data.error, 'Validation failed');
  assert.ok(data.details.destinationUrl);
});

// ─── 2. Ownership Verification & Event Existence ─────────────────────

test('replay route: returns 404 when event is not found', async () => {
  // DB returns empty array for event query
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
      eventId: EVENT_ID,
      destinationUrl: DESTINATION_URL,
    }),
  });

  const response = await replayRoute.POST(req);
  assert.strictEqual(response.status, 404);
  const data = (await response.json()) as { error: string };
  assert.strictEqual(data.error, 'Event not found');
});

test('replay route: returns 403 when user does not own the project', async () => {
  // DB returns the event, but returns empty for verifyOwnership (not owned by user)
  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM events')) {
      return [{
        id: EVENT_ID,
        project_id: PROJECT_ID,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        raw_body: '{"event":"charge.succeeded"}',
      }];
    }
    if (text.includes('FROM projects')) {
      // User does not own the project
      return [];
    }
    return [];
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
  assert.strictEqual(response.status, 403);
  const data = (await response.json()) as { error: string };
  assert.strictEqual(data.error, 'Unauthorized: Project not owned by user');
});

// ─── 3. Header Forwarding & Header Stripping / Injection ──────────────

test('replay: forwards headers with host and content-length stripped, and injects x-webhook-replay headers', async () => {
  const originalHeaders = {
    'content-type': 'application/json',
    'host': 'api.stripe.com',
    'content-length': '999',
    'stripe-signature': 't=123456,v1=abc123def456',
    'user-agent': 'Stripe/1.0',
    'x-custom-tracking': 'track-42',
  };

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [{
        id: EVENT_ID,
        project_id: PROJECT_ID,
        method: 'POST',
        headers: originalHeaders,
        raw_body: '{"test":"payload"}',
      }];
    }
    if (text.includes('FROM projects')) {
      return [{ id: PROJECT_ID, user_id: USER_ID }];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{ id: 'rep-1', event_id: values[0] }];
    }
    return [];
  };

  mockFetchState.defaultResponse = {
    status: 200,
    body: '{"received":true}',
  };

  const result = await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);
  assert.strictEqual(result.status, 200);

  // Inspect outgoing fetch call
  assert.strictEqual(mockFetchState.calls.length, 1);
  const call = mockFetchState.calls[0];
  assert.strictEqual(call.url, DESTINATION_URL);
  assert.strictEqual(call.init?.method, 'POST');
  assert.strictEqual(call.init?.body, '{"test":"payload"}');

  const headers = call.init?.headers as Record<string, string>;
  assert.ok(headers, 'Headers must be passed to fetch');

  // Verify host and content-length are stripped
  assert.strictEqual(headers['host'], undefined, 'host header must be stripped');
  assert.strictEqual(headers['content-length'], undefined, 'content-length header must be stripped');

  // Verify injected replay headers
  assert.strictEqual(headers['x-webhook-replay'], 'true', 'x-webhook-replay: true must be added');
  assert.strictEqual(headers['x-webhook-original-id'], EVENT_ID, 'x-webhook-original-id must be added');

  // Verify custom provider headers are preserved
  assert.strictEqual(headers['stripe-signature'], 't=123456,v1=abc123def456');
  assert.strictEqual(headers['content-type'], 'application/json');
  assert.strictEqual(headers['x-custom-tracking'], 'track-42');
});

// ─── 4. Response Recording & Body Truncation at 10000 Chars ──────────

test('replay: records response in replays table with body truncated to 10000 characters', async () => {
  // Generate a 25,000 character response body
  const longResponseBody = 'ABCDE12345'.repeat(2500);
  assert.strictEqual(longResponseBody.length, 25000);

  let insertedReplayValues: unknown[] | null = null;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [{
        id: EVENT_ID,
        project_id: PROJECT_ID,
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        raw_body: '{}',
      }];
    }
    if (text.includes('FROM projects')) {
      return [{ id: PROJECT_ID, user_id: USER_ID }];
    }
    if (text.includes('INSERT INTO replays')) {
      insertedReplayValues = values;
      return [{ id: 'rep-long-body' }];
    }
    return [];
  };

  mockFetchState.defaultResponse = {
    status: 200,
    body: longResponseBody,
  };

  const result = await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);

  // The client gets the immediate response body
  assert.strictEqual(result.status, 200);
  assert.strictEqual(result.body, longResponseBody);

  // The database record must truncate the response body to 10000 characters
  assert.ok(insertedReplayValues !== null, 'Replay record must be inserted');
  const values = insertedReplayValues as unknown[];

  // SQL params: [eventId, destinationUrl, responseStatus, responseBody.slice(0, 10000), durationMs]
  assert.strictEqual(values[0], EVENT_ID);
  assert.strictEqual(values[1], DESTINATION_URL);
  assert.strictEqual(values[2], 200);

  const storedBody = values[3] as string;
  assert.strictEqual(typeof storedBody, 'string');
  assert.strictEqual(storedBody.length, 10000, 'Stored response body must be truncated to 10000 characters');
  assert.strictEqual(storedBody, longResponseBody.slice(0, 10000));
});

// ─── 5. Destination Error Handling (Network & 5xx) ───────────────────

test('replay: records status 500 when destination throws network error (e.g. ECONNREFUSED)', async () => {
  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [{
        id: EVENT_ID,
        project_id: PROJECT_ID,
        method: 'POST',
        headers: {},
        raw_body: '{}',
      }];
    }
    if (text.includes('FROM projects')) {
      return [{ id: PROJECT_ID, user_id: USER_ID }];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{ id: 'rep-econn', response_status: values[2] }];
    }
    return [];
  };

  mockFetchState.customHandler = async () => {
    throw new Error('fetch failed: connect ECONNREFUSED 127.0.0.1:9999');
  };

  const result = await replayEvent(EVENT_ID, 'http://127.0.0.1:9999/dead-end', USER_ID);
  assert.strictEqual(result.status, 500);
  assert.ok(result.body.includes('ECONNREFUSED'));

  // Verify inserted replay record has status 500
  const insertQuery = mockDbState.queries.find(q => q.text.includes('INSERT INTO replays'));
  assert.ok(insertQuery);
  assert.strictEqual(insertQuery.values[2], 500);
});

test('replay: records status 500 when destination returns HTTP 500', async () => {
  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM events')) {
      return [{
        id: EVENT_ID,
        project_id: PROJECT_ID,
        method: 'POST',
        headers: {},
        raw_body: '{}',
      }];
    }
    if (text.includes('FROM projects')) {
      return [{ id: PROJECT_ID, user_id: USER_ID }];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{ id: 'rep-500' }];
    }
    return [];
  };

  mockFetchState.defaultResponse = {
    status: 500,
    body: 'Internal Server Error: DB down',
  };

  const result = await replayEvent(EVENT_ID, DESTINATION_URL, USER_ID);
  assert.strictEqual(result.status, 500);
  assert.strictEqual(result.body, 'Internal Server Error: DB down');

  const insertQuery = mockDbState.queries.find(q => q.text.includes('INSERT INTO replays'));
  assert.ok(insertQuery);
  assert.strictEqual(insertQuery.values[2], 500);
  assert.strictEqual(insertQuery.values[3], 'Internal Server Error: DB down');
});

// ─── 6. SSRF Guard (Localhost & Internal IP Rejection) ────────────────

test('replay route: rejects destination URLs pointing to localhost or internal IPs when in cloud mode (SSRF guard)', async () => {
  const originalIsLocalMode = env.isLocalMode;
  try {
    (env as { isLocalMode: boolean }).isLocalMode = false;

    const blockedUrls = [
      'http://localhost/webhook',
      'http://localhost:8080/hook',
      'http://127.0.0.1:3000/webhook',
      'http://0.0.0.0:5000/webhook',
      'http://169.254.169.254/latest/meta-data',
      'http://metadata.google.internal/computeMetadata/v1',
      'http://service.internal/webhook',
    ];

    for (const url of blockedUrls) {
      const req = new Request('http://localhost:3000/api/replay', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          eventId: EVENT_ID,
          destinationUrl: url,
        }),
      });

      const response = await replayRoute.POST(req);
      assert.strictEqual(response.status, 400, `Expected 400 Bad Request for blocked SSRF URL: ${url}`);
      const data = (await response.json()) as { error: string; details: { destinationUrl?: string[] } };
      assert.strictEqual(data.error, 'Validation failed');
      assert.ok(
        data.details.destinationUrl?.includes('Destination URL must not target internal/private addresses'),
        `Expected SSRF rejection error message for ${url}`
      );
    }
  } finally {
    (env as { isLocalMode: boolean }).isLocalMode = originalIsLocalMode;
  }
});

test('replay route: allows localhost destination URL when running in local mode', async () => {
  const originalIsLocalMode = env.isLocalMode;
  try {
    (env as { isLocalMode: boolean }).isLocalMode = true;

    mockDbState.queryHandler = (text) => {
      if (text.includes('FROM events')) {
        return [{
          id: EVENT_ID,
          project_id: PROJECT_ID,
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          raw_body: '{}',
        }];
      }
      if (text.includes('FROM projects')) {
        return [{ id: PROJECT_ID, user_id: USER_ID }];
      }
      if (text.includes('INSERT INTO replays')) {
        return [{ id: 'rep-local-allow' }];
      }
      return [];
    };

    mockFetchState.defaultResponse = {
      status: 200,
      body: '{"status":"ok"}',
    };

    const req = new Request('http://localhost:3000/api/replay', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventId: EVENT_ID,
        destinationUrl: 'http://localhost:3000/api/webhook-sink',
      }),
    });

    const response = await replayRoute.POST(req);
    assert.strictEqual(response.status, 200);
    const data = (await response.json()) as { status: number; body: string };
    assert.strictEqual(data.status, 200);
    assert.strictEqual(data.body, '{"status":"ok"}');
  } finally {
    (env as { isLocalMode: boolean }).isLocalMode = originalIsLocalMode;
  }
});
