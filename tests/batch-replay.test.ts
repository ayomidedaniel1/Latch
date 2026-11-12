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
import * as batchReplayRoute from '@/app/api/replay/batch/route';
import { batchReplay, ReplayError, type BatchReplaySummary } from '@/lib/services/batch-replay';
import { env } from '@/lib/env';

// ─── Test Constants ─────────────────────────────────────────────────────────

const USER_ID = 'usr-00000000-0000-0000-0000-000000000001';
const PROJECT_ID = 'b1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
const OTHER_PROJECT_ID = 'c1c2c3c4-d5d6-7a8b-9c0d-1e2f3a4b5c6d';
const EVENT_ID_1 = 'e1e2e3e4-f5f6-7a8b-9c0d-1e2f3a4b5c6d';
const EVENT_ID_2 = 'e2e2e3e4-f5f6-7a8b-9c0d-1e2f3a4b5c6d';
const EVENT_ID_3 = 'e3e2e3e4-f5f6-7a8b-9c0d-1e2f3a4b5c6d';
const DESTINATION_URL = 'https://receiver.example.com/webhook-endpoint';
const PROJECT_DEFAULT_URL = 'https://default-receiver.example.com/webhooks';

// ─── Mock Data Shapes ───────────────────────────────────────────────────────

interface MockProjectRow {
  [key: string]: unknown;
  id: string;
  name: string;
  destination_url: string | null;
  cli_token: string;
  created_at: string;
}

const mockProjectRow: MockProjectRow = {
  id: PROJECT_ID,
  name: 'Batch Test Project',
  destination_url: PROJECT_DEFAULT_URL,
  cli_token: 'tok-batch-1234',
  created_at: '2026-01-01T00:00:00.000Z',
};

interface MockEventRow {
  [key: string]: unknown;
  id: string;
  project_id: string;
  method: string;
  headers: Record<string, string>;
  raw_body: string | null;
}

function createMockEvent(id: string, overrides: Partial<MockEventRow> = {}): MockEventRow {
  return {
    id,
    project_id: overrides.project_id ?? PROJECT_ID,
    method: overrides.method ?? 'POST',
    headers: overrides.headers ?? {
      'content-type': 'application/json',
      'x-custom-signature': `sig_${id}`,
      'host': 'source-webhooks.example.com',
      'content-length': '100',
    },
    raw_body: overrides.raw_body !== undefined ? overrides.raw_body : JSON.stringify({ event: id }),
  };
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

// ─── 1. Authentication ──────────────────────────────────────────────────────

test('1. Authentication: rejects unauthenticated requests with 401 Unauthorized', async () => {
  setMockSession(null);

  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: [EVENT_ID_1],
    }),
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 401);
  assert.strictEqual(await response.text(), 'Unauthorized');
});

test('1. Authentication: rejects direct service call when userId is empty', async () => {
  await assert.rejects(
    async () => {
      await batchReplay({
        projectId: PROJECT_ID,
        eventIds: [EVENT_ID_1],
        userId: '',
        destinationUrl: DESTINATION_URL,
      });
    },
    (err: unknown) => {
      assert.ok(err instanceof ReplayError);
      assert.strictEqual(err.statusCode, 401);
      assert.strictEqual(err.message, 'Unauthorized');
      return true;
    },
  );
});

// ─── 2. Route Validation ────────────────────────────────────────────────────

test('2. Route Validation: rejects invalid JSON body with 400 Bad Request', async () => {
  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"broken-json-payload',
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string };
  assert.strictEqual(data.error, 'Invalid JSON body');
});

test('2. Route Validation: rejects missing or non-UUID projectId with 400', async () => {
  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: 'not-a-valid-uuid',
      eventIds: [EVENT_ID_1],
    }),
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string; details: { projectId?: string[] } };
  assert.strictEqual(data.error, 'Validation failed');
  assert.ok(data.details.projectId);
});

test('2. Route Validation: rejects empty eventIds array with 400', async () => {
  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: [],
    }),
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string; details: { eventIds?: string[] } };
  assert.strictEqual(data.error, 'Validation failed');
  assert.ok(data.details.eventIds);
});

test('2. Route Validation: rejects malformed eventId (non-UUID) in array with 400', async () => {
  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: [EVENT_ID_1, 'malformed-event-uuid'],
    }),
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string; details: { eventIds?: string[] } };
  assert.strictEqual(data.error, 'Validation failed');
  assert.ok(data.details.eventIds);
});

test('2. Route Validation: rejects batch size exceeding 50 events with 400', async () => {
  const fiftyOneEvents = Array.from({ length: 51 }, (_, i) => {
    const hex = i.toString(16).padStart(12, '0');
    return `00000000-0000-0000-0000-${hex}`;
  });

  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: fiftyOneEvents,
    }),
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string; details: { eventIds?: string[] } };
  assert.strictEqual(data.error, 'Validation failed');
  assert.ok(data.details.eventIds);
});

test('2. Route Validation: rejects malformed destination URL with 400', async () => {
  const invalidUrls = ['not-a-valid-url', 'ftp://not-http-url-format', 'javascript:alert(1)'];

  for (const invalidUrl of invalidUrls) {
    const req = new Request('http://localhost:3000/api/replay/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        projectId: PROJECT_ID,
        eventIds: [EVENT_ID_1],
        destinationUrl: invalidUrl,
      }),
    });

    const response = await batchReplayRoute.POST(req);
    assert.strictEqual(response.status, 400, `Expected 400 for invalid URL: ${invalidUrl}`);
    const data = (await response.json()) as { error: string; details: { destinationUrl?: string[] } };
    assert.strictEqual(data.error, 'Validation failed');
    assert.ok(data.details.destinationUrl);
  }
});

test('2. Route Validation: supports concurrency parameter name and rejects invalid bounds (<= 0 or > 10)', async () => {
  // Negative concurrency
  const reqNegative = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: [EVENT_ID_1],
      concurrency: -1,
    }),
  });
  const resNegative = await batchReplayRoute.POST(reqNegative);
  assert.strictEqual(resNegative.status, 400);

  // Concurrency exceeding upper bound of 10
  const reqOver = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: [EVENT_ID_1],
      concurrency: 15,
    }),
  });
  const resOver = await batchReplayRoute.POST(reqOver);
  assert.strictEqual(resOver.status, 400);
});

// ─── 3. Multi-Tenant IDOR Guard ─────────────────────────────────────────────

test('3. Multi-Tenant IDOR Guard: returns 404 when project does not exist', async () => {
  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM projects')) {
      return [];
    }
    return [];
  };

  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: [EVENT_ID_1],
    }),
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 404);
  const data = (await response.json()) as { error: string };
  assert.strictEqual(data.error, 'Project not found');
});

test('3. Multi-Tenant IDOR Guard: rejects project access with 403 when user is not owner', async () => {
  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM projects')) {
      if (text.includes('user_id')) {
        return []; // verifyOwnership fails
      }
      return [{ id: PROJECT_ID }]; // project exists
    }
    return [];
  };

  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: [EVENT_ID_1],
    }),
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 403);
  const data = (await response.json()) as { error: string };
  assert.strictEqual(data.error, 'Unauthorized: Project not owned by user');
});

test('3. Multi-Tenant IDOR Guard: properly flags events that do not belong to the project without dispatching them', async () => {
  const ownEvent = createMockEvent(EVENT_ID_1, { project_id: PROJECT_ID });
  const foreignEvent = createMockEvent(EVENT_ID_2, { project_id: OTHER_PROJECT_ID });

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) {
      return [mockProjectRow];
    }
    if (text.includes('FROM events')) {
      const id = values[0] as string;
      if (id === EVENT_ID_1) return [ownEvent];
      if (id === EVENT_ID_2) return [foreignEvent];
      return [];
    }
    if (text.includes('INSERT INTO replays')) {
      return [{ id: 'rep-idor', event_id: values[0] }];
    }
    return [];
  };

  mockFetchState.defaultResponse = { status: 200, body: '{"ok":true}' };

  const summary = await batchReplay({
    projectId: PROJECT_ID,
    eventIds: [EVENT_ID_1, EVENT_ID_2, EVENT_ID_3], // own, foreign, non-existent
    userId: USER_ID,
    destinationUrl: DESTINATION_URL,
  });

  assert.strictEqual(summary.total, 3);
  assert.strictEqual(summary.succeeded, 1);
  assert.strictEqual(summary.failed, 2);

  // Event 1 (own) succeeded
  assert.strictEqual(summary.results[0].eventId, EVENT_ID_1);
  assert.strictEqual(summary.results[0].success, true);
  assert.strictEqual(summary.results[0].status, 200);

  // Event 2 (foreign tenant) is rejected with 404 and flagged
  assert.strictEqual(summary.results[1].eventId, EVENT_ID_2);
  assert.strictEqual(summary.results[1].success, false);
  assert.strictEqual(summary.results[1].status, 404);
  assert.ok(summary.results[1].error?.includes('does not belong to project'));

  // Event 3 (non-existent) is rejected with 404 and flagged
  assert.strictEqual(summary.results[2].eventId, EVENT_ID_3);
  assert.strictEqual(summary.results[2].success, false);
  assert.strictEqual(summary.results[2].status, 404);
  assert.ok(summary.results[2].error?.includes('Event not found'));

  // Outbound fetch was ONLY called for Event 1!
  assert.strictEqual(mockFetchState.calls.length, 1);
  const fetchHeaders = mockFetchState.calls[0].init?.headers as Record<string, string>;
  assert.strictEqual(fetchHeaders['x-webhook-original-id'], EVENT_ID_1);

  // DB insert was ONLY executed for Event 1!
  const replayInserts = mockDbState.queries.filter((q) => q.text.includes('INSERT INTO replays'));
  assert.strictEqual(replayInserts.length, 1);
  assert.strictEqual(replayInserts[0].values[0], EVENT_ID_1);
});

// ─── 4. SSRF Defense ────────────────────────────────────────────────────────

test('4. SSRF Defense: rejects cloud metadata and internal IPs in cloud mode', async () => {
  const originalIsLocalMode = env.isLocalMode;
  try {
    (env as { isLocalMode: boolean }).isLocalMode = false;

    const ssrfTargets = [
      'http://169.254.169.254/latest/meta-data',
      'http://metadata.google.internal/computeMetadata/v1',
      'http://localhost:3000/webhook',
      'http://127.0.0.1:8080/sink',
      'http://0.0.0.0:5000/hook',
      'http://[::1]:9000/hook',
      'http://auth-service.internal/webhook',
    ];

    for (const targetUrl of ssrfTargets) {
      const req = new Request('http://localhost:3000/api/replay/batch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projectId: PROJECT_ID,
          eventIds: [EVENT_ID_1],
          destinationUrl: targetUrl,
        }),
      });

      const response = await batchReplayRoute.POST(req);
      assert.strictEqual(
        response.status,
        400,
        `Expected 400 rejection for SSRF destination: ${targetUrl}`,
      );
      const data = (await response.json()) as { error: string; details: { destinationUrl?: string[] } };
      assert.strictEqual(data.error, 'Validation failed');
      assert.ok(data.details.destinationUrl?.some((msg) => msg.includes('internal/private addresses')));
    }
  } finally {
    (env as { isLocalMode: boolean }).isLocalMode = originalIsLocalMode;
  }
});

test('4. SSRF Defense: allows localhost destination URL in local development mode', async () => {
  const originalIsLocalMode = env.isLocalMode;
  try {
    (env as { isLocalMode: boolean }).isLocalMode = true;

    mockDbState.queryHandler = (text, values) => {
      if (text.includes('FROM projects')) return [mockProjectRow];
      if (text.includes('FROM events')) return [createMockEvent(values[0] as string)];
      if (text.includes('INSERT INTO replays')) return [{ id: 'rep-loc-ok', event_id: values[0] }];
      return [];
    };

    mockFetchState.defaultResponse = { status: 200, body: '{"local":true}' };

    const req = new Request('http://localhost:3000/api/replay/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        projectId: PROJECT_ID,
        eventIds: [EVENT_ID_1],
        destinationUrl: 'http://localhost:3000/api/local-sink',
      }),
    });

    const response = await batchReplayRoute.POST(req);
    assert.strictEqual(response.status, 200);
    const data = (await response.json()) as BatchReplaySummary;
    assert.strictEqual(data.succeeded, 1);
    assert.strictEqual(mockFetchState.calls.length, 1);
    assert.strictEqual(mockFetchState.calls[0].url, 'http://localhost:3000/api/local-sink');
  } finally {
    (env as { isLocalMode: boolean }).isLocalMode = originalIsLocalMode;
  }
});

test('4. SSRF Defense: prevents replay loops targeting Latch ingest endpoint', async () => {
  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM projects')) return [mockProjectRow];
    return [];
  };

  const loopUrl = 'http://localhost:3000/api/ingest/any-project-id';
  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: [EVENT_ID_1],
      destinationUrl: loopUrl,
    }),
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string };
  assert.ok(data.error.includes('replay loop prevention'));
});

test('4. SSRF Defense: falls back to project destination_url when destinationUrl is omitted in request body', async () => {
  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) return [mockProjectRow];
    if (text.includes('FROM events')) return [createMockEvent(values[0] as string)];
    if (text.includes('INSERT INTO replays')) return [{ id: 'rep-fallback', event_id: values[0] }];
    return [];
  };

  mockFetchState.defaultResponse = { status: 200, body: '{"fallback":true}' };

  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: [EVENT_ID_1],
    }),
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 200);
  const data = (await response.json()) as BatchReplaySummary;
  assert.strictEqual(data.destinationUrl, PROJECT_DEFAULT_URL);
  assert.strictEqual(mockFetchState.calls.length, 1);
  assert.strictEqual(mockFetchState.calls[0].url, PROJECT_DEFAULT_URL);
});

test('4. SSRF Defense: returns 400 when neither request destinationUrl nor project destination_url exists', async () => {
  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM projects')) {
      return [{
        ...mockProjectRow,
        destination_url: null,
      }];
    }
    return [];
  };

  const req = new Request('http://localhost:3000/api/replay/batch', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      eventIds: [EVENT_ID_1],
    }),
  });

  const response = await batchReplayRoute.POST(req);
  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string };
  assert.ok(data.error.includes('No destination URL provided'));
});

// ─── 5. Concurrency Limiter ─────────────────────────────────────────────────

test('5. Concurrency Limiter: dispatches requests with bounded concurrency (at most N active simultaneously)', async () => {
  const eventIds = [
    'e1111111-0000-0000-0000-000000000001',
    'e2222222-0000-0000-0000-000000000002',
    'e3333333-0000-0000-0000-000000000003',
    'e4444444-0000-0000-0000-000000000004',
    'e5555555-0000-0000-0000-000000000005',
    'e6666666-0000-0000-0000-000000000006',
  ];

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) return [mockProjectRow];
    if (text.includes('FROM events')) return [createMockEvent(values[0] as string)];
    if (text.includes('INSERT INTO replays')) return [{ id: 'rep-con', event_id: values[0] }];
    return [];
  };

  let activeRequests = 0;
  let maxActiveRequests = 0;

  mockFetchState.customHandler = async () => {
    activeRequests++;
    if (activeRequests > maxActiveRequests) {
      maxActiveRequests = activeRequests;
    }
    // Simulate brief network latency
    await new Promise((r) => setTimeout(r, 20));
    activeRequests--;
    return new Response('{"dispatched":true}', { status: 200 });
  };

  const targetConcurrency = 2;

  const summary = await batchReplay({
    projectId: PROJECT_ID,
    eventIds,
    userId: USER_ID,
    destinationUrl: DESTINATION_URL,
    concurrencyLimit: targetConcurrency,
  });

  assert.strictEqual(summary.total, 6);
  assert.strictEqual(summary.succeeded, 6);
  assert.ok(
    maxActiveRequests <= targetConcurrency,
    `Max active concurrent requests (${maxActiveRequests}) must not exceed limit (${targetConcurrency})`,
  );
  assert.ok(maxActiveRequests > 1, 'Expected at least 2 concurrent workers to run');
});

test('5. Concurrency Limiter: executes strictly sequentially when concurrency is 1', async () => {
  const eventIds = [
    'e1111111-0000-0000-0000-000000000001',
    'e2222222-0000-0000-0000-000000000002',
    'e3333333-0000-0000-0000-000000000003',
  ];

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) return [mockProjectRow];
    if (text.includes('FROM events')) return [createMockEvent(values[0] as string)];
    if (text.includes('INSERT INTO replays')) return [{ id: 'rep-seq', event_id: values[0] }];
    return [];
  };

  let activeRequests = 0;
  let maxActiveRequests = 0;

  mockFetchState.customHandler = async () => {
    activeRequests++;
    if (activeRequests > maxActiveRequests) {
      maxActiveRequests = activeRequests;
    }
    await new Promise((r) => setTimeout(r, 10));
    activeRequests--;
    return new Response('OK', { status: 200 });
  };

  await batchReplay({
    projectId: PROJECT_ID,
    eventIds,
    userId: USER_ID,
    destinationUrl: DESTINATION_URL,
    concurrency: 1,
  });

  assert.strictEqual(maxActiveRequests, 1, 'Sequential mode must maintain at most 1 active request');
});

// ─── 6. Partial Failure Resilience ──────────────────────────────────────────

test('6. Partial Failure Resilience: records transport errors (ECONNREFUSED) with status 500 in replays table and allows remaining batch to succeed', async () => {
  const event1 = createMockEvent(EVENT_ID_1, { raw_body: '{"charge":"ch_1"}' });
  const event2 = createMockEvent(EVENT_ID_2, { raw_body: '{"charge":"ch_2"}' });
  const event3 = createMockEvent(EVENT_ID_3, { raw_body: '{"charge":"ch_3"}' });
  const eventMap = new Map([
    [EVENT_ID_1, event1],
    [EVENT_ID_2, event2],
    [EVENT_ID_3, event3],
  ]);

  const insertedReplayRows: {
    eventId: string;
    destinationUrl: string;
    responseStatus: number;
    responseBody: string;
    durationMs: number;
  }[] = [];

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) return [mockProjectRow];
    if (text.includes('FROM events')) {
      const id = values[0] as string;
      const row = eventMap.get(id);
      return row ? [row] : [];
    }
    if (text.includes('INSERT INTO replays')) {
      insertedReplayRows.push({
        eventId: values[0] as string,
        destinationUrl: values[1] as string,
        responseStatus: values[2] as number,
        responseBody: values[3] as string,
        durationMs: values[4] as number,
      });
      return [{
        id: `rep-${insertedReplayRows.length}`,
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

  // Event 1: Success 200
  // Event 2: Network transport failure (ECONNREFUSED)
  // Event 3: Destination HTTP 500
  mockFetchState.customHandler = async (_url, init) => {
    const headers = init?.headers as Record<string, string>;
    const eventId = headers['x-webhook-original-id'];

    if (eventId === EVENT_ID_1) {
      return new Response('{"processed":true}', { status: 200 });
    }
    if (eventId === EVENT_ID_2) {
      throw new Error('fetch failed: connect ECONNREFUSED 198.51.100.44:443');
    }
    if (eventId === EVENT_ID_3) {
      return new Response('Downstream Gateway Error', { status: 502 });
    }
    return new Response('Not Found', { status: 404 });
  };

  const summary = await batchReplay({
    projectId: PROJECT_ID,
    eventIds: [EVENT_ID_1, EVENT_ID_2, EVENT_ID_3],
    userId: USER_ID,
    destinationUrl: DESTINATION_URL,
    concurrency: 1, // deterministic order
  });

  // Verify Summary totals
  assert.strictEqual(summary.total, 3);
  assert.strictEqual(summary.succeeded, 1);
  assert.strictEqual(summary.failed, 2);

  // Outcome 1: Success
  assert.strictEqual(summary.results[0].eventId, EVENT_ID_1);
  assert.strictEqual(summary.results[0].success, true);
  assert.strictEqual(summary.results[0].status, 200);

  // Outcome 2: Transport failure
  assert.strictEqual(summary.results[1].eventId, EVENT_ID_2);
  assert.strictEqual(summary.results[1].success, false);
  assert.strictEqual(summary.results[1].status, 500);
  assert.ok(summary.results[1].body.includes('ECONNREFUSED'));
  assert.ok(summary.results[1].error?.includes('ECONNREFUSED'));

  // Outcome 3: Destination error 502
  assert.strictEqual(summary.results[2].eventId, EVENT_ID_3);
  assert.strictEqual(summary.results[2].success, false);
  assert.strictEqual(summary.results[2].status, 502);

  // Persistence check: replays table MUST contain rows for all 3 attempts!
  assert.strictEqual(insertedReplayRows.length, 3);

  // Event 1 row
  assert.strictEqual(insertedReplayRows[0].eventId, EVENT_ID_1);
  assert.strictEqual(insertedReplayRows[0].responseStatus, 200);

  // Event 2 row (transport failure recorded with status 500 and error text)
  assert.strictEqual(insertedReplayRows[1].eventId, EVENT_ID_2);
  assert.strictEqual(insertedReplayRows[1].responseStatus, 500);
  assert.ok(insertedReplayRows[1].responseBody.includes('ECONNREFUSED'));
  assert.strictEqual(typeof insertedReplayRows[1].durationMs, 'number');

  // Event 3 row (HTTP 502 recorded)
  assert.strictEqual(insertedReplayRows[2].eventId, EVENT_ID_3);
  assert.strictEqual(insertedReplayRows[2].responseStatus, 502);
});

// ─── 7. Payload and Header Fidelity ─────────────────────────────────────────

test('7. Payload and Header Fidelity: strips lowercase and mixed-case host and content-length headers, injects replay headers, and preserves raw_body unmodified', async () => {
  const originalRawPayload = '{"action":"invoice.finalized","amount":9999,"currency":"usd","metadata":{"ref":"order_99"}}';
  const originalHeaders = {
    'host': 'internal-ingress.stripe.com',
    'Host': 'internal-ingress.stripe.com',
    'content-length': '92',
    'Content-Length': '92',
    'connection': 'close',
    'keep-alive': 'timeout=5',
    'upgrade': 'websocket',
    'content-type': 'application/json',
    'stripe-signature': 't=1600000000,v1=9999999999abcdef',
    'x-request-id': 'req_xyz_12345',
    'authorization': 'Bearer webhook_token_secret',
  };

  const testEvent = createMockEvent(EVENT_ID_1, {
    method: 'PATCH',
    headers: originalHeaders,
    raw_body: originalRawPayload,
  });

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) return [mockProjectRow];
    if (text.includes('FROM events')) return [testEvent];
    if (text.includes('INSERT INTO replays')) return [{ id: 'rep-fidelity', event_id: values[0] }];
    return [];
  };

  mockFetchState.defaultResponse = { status: 200, body: '{"updated":true}' };

  await batchReplay({
    projectId: PROJECT_ID,
    eventIds: [EVENT_ID_1],
    userId: USER_ID,
    destinationUrl: DESTINATION_URL,
  });

  assert.strictEqual(mockFetchState.calls.length, 1);
  const outboundCall = mockFetchState.calls[0];
  const outboundHeaders = outboundCall.init?.headers as Record<string, string>;

  // 1. Hop-by-hop and host/content-length completely stripped
  assert.strictEqual(outboundHeaders['host'], undefined);
  assert.strictEqual(outboundHeaders['Host'], undefined);
  assert.strictEqual(outboundHeaders['content-length'], undefined);
  assert.strictEqual(outboundHeaders['Content-Length'], undefined);
  assert.strictEqual(outboundHeaders['connection'], undefined);
  assert.strictEqual(outboundHeaders['keep-alive'], undefined);
  assert.strictEqual(outboundHeaders['upgrade'], undefined);

  // 2. Provider signatures, content-type, and authorization preserved exactly
  assert.strictEqual(outboundHeaders['content-type'], 'application/json');
  assert.strictEqual(outboundHeaders['stripe-signature'], 't=1600000000,v1=9999999999abcdef');
  assert.strictEqual(outboundHeaders['x-request-id'], 'req_xyz_12345');
  assert.strictEqual(outboundHeaders['authorization'], 'Bearer webhook_token_secret');

  // 3. Replay headers injected
  assert.strictEqual(outboundHeaders['x-webhook-replay'], 'true');
  assert.strictEqual(outboundHeaders['x-webhook-original-id'], EVENT_ID_1);

  // 4. Method and raw_body preserved unmodified
  assert.strictEqual(outboundCall.init?.method, 'PATCH');
  assert.strictEqual(outboundCall.init?.body, originalRawPayload);
});

test('7. Payload and Header Fidelity: handles source event with null raw_body cleanly', async () => {
  const nullBodyEvent = createMockEvent(EVENT_ID_1, { method: 'POST', raw_body: null });

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) return [mockProjectRow];
    if (text.includes('FROM events')) return [nullBodyEvent];
    if (text.includes('INSERT INTO replays')) return [{ id: 'rep-null', event_id: values[0] }];
    return [];
  };

  mockFetchState.defaultResponse = { status: 200, body: 'OK' };

  await batchReplay({
    projectId: PROJECT_ID,
    eventIds: [EVENT_ID_1],
    userId: USER_ID,
    destinationUrl: DESTINATION_URL,
  });

  assert.strictEqual(mockFetchState.calls.length, 1);
  assert.strictEqual(mockFetchState.calls[0].init?.body, null);
});

test('7. Payload and Header Fidelity: bounds persisted response body to 10,000 characters to prevent table bloat', async () => {
  const oversizedBody = 'B'.repeat(25000);
  let persistedBodyText: unknown = null;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) return [mockProjectRow];
    if (text.includes('FROM events')) return [createMockEvent(EVENT_ID_1)];
    if (text.includes('INSERT INTO replays')) {
      persistedBodyText = values[3];
      return [{
        id: 'rep-bounded',
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

  mockFetchState.defaultResponse = { status: 200, body: oversizedBody };

  await batchReplay({
    projectId: PROJECT_ID,
    eventIds: [EVENT_ID_1],
    userId: USER_ID,
    destinationUrl: DESTINATION_URL,
  });

  assert.ok(typeof persistedBodyText === 'string');
  assert.strictEqual(
    (persistedBodyText as string).length,
    10000,
    'Persisted response_body must be bounded to at most 10,000 characters',
  );
});
