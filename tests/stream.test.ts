import test from 'node:test';
import assert from 'node:assert';
import {
  mockDbState,
  mockRedisState,
  setMockSession,
  resetAllMocks,
} from './mock-helper';
import * as streamRoute from '@/app/api/events/stream/route';

const PROJECT_ID = '44179c54-e931-4a30-b424-da479717451b';
const USER_ID = 'test-user-owner';
const CLI_TOKEN = 'token-cli-secret-123';

test.beforeEach(() => {
  resetAllMocks();
  setMockSession({ user: { id: USER_ID } });
});

// Helper to decode readable stream chunks with timeout guard
async function readStreamMessages(
  body: ReadableStream<Uint8Array>,
  expectedMessageCount: number,
  timeoutMs = 500,
): Promise<string[]> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const messages: string[] = [];
  let buffer = '';

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out waiting for ${expectedMessageCount} stream messages`)), timeoutMs),
  );

  const readPromise = (async () => {
    while (messages.length < expectedMessageCount) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      // All complete parts except the trailing remainder
      while (parts.length > 1) {
        const msg = parts.shift();
        if (msg !== undefined && msg.trim().length > 0) {
          messages.push(msg.trim());
        }
      }
      buffer = parts[0] ?? '';
    }
    return messages;
  })();

  try {
    return await Promise.race([readPromise, timeoutPromise]);
  } finally {
    reader.releaseLock();
  }
}

// ─── 1. Validation & Authentication ──────────────────────────────────

test('stream: returns 400 when projectId query parameter is missing', async () => {
  const req = new Request('http://localhost:3000/api/events/stream');
  const response = await streamRoute.GET(req);

  assert.strictEqual(response.status, 400);
  assert.strictEqual(await response.text(), 'Missing projectId');
});

test('stream: returns 401 Unauthorized when session is unauthenticated and no CLI token', async () => {
  setMockSession(null);

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`);
  const response = await streamRoute.GET(req);

  assert.strictEqual(response.status, 401);
  assert.strictEqual(await response.text(), 'Unauthorized');
});

test('stream: returns 401 when session user does not own the project', async () => {
  // DB returns empty array for verifyOwnership query
  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM projects')) {
      return []; // not owned
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`);
  const response = await streamRoute.GET(req);

  assert.strictEqual(response.status, 401);
});

// ─── 2. Response Headers (Content-Type & SSE Config) ──────────────────

test('stream: sets Content-Type text/event-stream and proper SSE headers', async () => {
  const ac = new AbortController();

  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM projects')) {
      return [{ id: PROJECT_ID, user_id: USER_ID }];
    }
    if (text.includes('FROM events')) {
      return [];
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`, {
    signal: ac.signal,
  });

  const response = await streamRoute.GET(req);

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.headers.get('content-type'), 'text/event-stream');
  assert.strictEqual(response.headers.get('cache-control'), 'no-cache, no-transform');
  assert.strictEqual(response.headers.get('x-accel-buffering'), 'no');
  assert.strictEqual(response.headers.get('connection'), 'keep-alive');

  ac.abort();
});

// ─── 3. Initial Connected Message ─────────────────────────────────────

test('stream: emits data: connected as the first SSE event', async () => {
  const ac = new AbortController();

  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM projects')) {
      return [{ id: PROJECT_ID, user_id: USER_ID }];
    }
    if (text.includes('FROM events')) {
      return [];
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`, {
    signal: ac.signal,
  });

  const response = await streamRoute.GET(req);
  assert.ok(response.body, 'Response body must be a readable stream');

  const messages = await readStreamMessages(response.body, 1);
  ac.abort();

  assert.ok(messages.length >= 1);
  assert.strictEqual(messages[0], 'data: connected');
});

// ─── 4. Initial Batch Delivery (No Last-Event-ID) ─────────────────────

test('stream: delivers initial batch of recent events when Last-Event-ID is absent', async () => {
  const ac = new AbortController();

  const mockHistoricalEvents = [
    {
      id: 'evt-hist-2',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { count: 2 },
      raw_body: '{"count":2}',
      source_ip: '127.0.0.1',
      received_at: '2026-11-08T12:01:00.000Z',
    },
    {
      id: 'evt-hist-1',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { count: 1 },
      raw_body: '{"count":1}',
      source_ip: '127.0.0.1',
      received_at: '2026-11-08T12:00:00.000Z',
    },
  ];

  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM projects')) {
      return [{ id: PROJECT_ID, user_id: USER_ID }];
    }
    if (text.includes('FROM events') && text.includes('ORDER BY received_at DESC')) {
      return [...mockHistoricalEvents];
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`, {
    signal: ac.signal,
  });

  const response = await streamRoute.GET(req);
  assert.ok(response.body);

  // Expect 3 messages: 1 "connected" + 2 historical events
  const messages = await readStreamMessages(response.body, 3);
  ac.abort();

  assert.strictEqual(messages[0], 'data: connected');

  // Verify reverse order delivery (oldest first: evt-hist-1 then evt-hist-2)
  assert.ok(messages[1].includes('id: evt-hist-1'));
  assert.ok(messages[1].includes('"count":1'));

  assert.ok(messages[2].includes('id: evt-hist-2'));
  assert.ok(messages[2].includes('"count":2'));
});

// ─── 5. Last-Event-ID Reconnection Cursor Logic ───────────────────────

test('stream: skips initial batch and resumes from cursor when valid Last-Event-ID is provided', async () => {
  const ac = new AbortController();
  const LAST_EVENT_ID = '61fb66ec-7326-4a31-a9e7-23a9ec6a4761';
  const CURSOR_TIMESTAMP = '2026-11-08T18:30:00.000Z';

  let initialBatchQueried = false;
  let cursorLookupCalled = false;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) {
      return [{ id: PROJECT_ID, user_id: USER_ID }];
    }
    // Cursor lookup query: SELECT received_at FROM events WHERE id = $1 LIMIT 1
    if (text.includes('received_at FROM events')) {
      cursorLookupCalled = true;
      assert.strictEqual(values[0], LAST_EVENT_ID);
      return [{ received_at: CURSOR_TIMESTAMP }];
    }
    // Initial batch query (ORDER BY received_at DESC without cursor)
    if (text.includes('ORDER BY received_at DESC') && !text.includes('received_at <')) {
      initialBatchQueried = true;
      return [];
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`, {
    headers: {
      'last-event-id': LAST_EVENT_ID,
    },
    signal: ac.signal,
  });

  const response = await streamRoute.GET(req);
  assert.ok(response.body);

  // Read the connected message
  const messages = await readStreamMessages(response.body, 1);
  ac.abort();

  assert.strictEqual(messages[0], 'data: connected');
  assert.strictEqual(cursorLookupCalled, true, 'getReceivedAt must be called with Last-Event-ID');
  assert.strictEqual(initialBatchQueried, false, 'Initial batch query must be SKIPPED when cursor is resolved');
});

test('stream: falls back to initial batch if Last-Event-ID is not found in database', async () => {
  const ac = new AbortController();
  let initialBatchQueried = false;

  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM projects')) {
      return [{ id: PROJECT_ID, user_id: USER_ID }];
    }
    if (text.includes('received_at FROM events')) {
      // Event not found -> cursorTimestamp is null
      return [];
    }
    if (text.includes('ORDER BY received_at DESC')) {
      initialBatchQueried = true;
      return [{
        id: 'evt-fallback-1',
        method: 'POST',
        headers: {},
        body: { fallback: true },
        raw_body: '{}',
        received_at: '2026-11-08T19:00:00.000Z',
      }];
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`, {
    headers: {
      'last-event-id': '00000000-0000-4000-8000-000000000000',
    },
    signal: ac.signal,
  });

  const response = await streamRoute.GET(req);
  assert.ok(response.body);

  const messages = await readStreamMessages(response.body, 2);
  ac.abort();

  assert.strictEqual(messages[0], 'data: connected');
  assert.strictEqual(initialBatchQueried, true, 'Must fall back to initial batch if cursor ID is invalid');
  assert.ok(messages[1].includes('id: evt-fallback-1'));
});

// ─── 6. CLI Token Auth & Heartbeat ────────────────────────────────────

test('stream: authenticates CLI via Bearer token and sets CLI active heartbeat in Redis', async () => {
  setMockSession(null); // No session
  const ac = new AbortController();

  mockDbState.queryHandler = (text) => {
    if (text.includes('cli_token')) {
      return [{ id: PROJECT_ID, user_id: USER_ID, cli_token: CLI_TOKEN }];
    }
    if (text.includes('FROM events')) {
      return [];
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`, {
    headers: {
      'authorization': `Bearer ${CLI_TOKEN}`,
    },
    signal: ac.signal,
  });

  const response = await streamRoute.GET(req);
  assert.strictEqual(response.status, 200);

  // Read connected message and give loop one tick to execute heartbeat
  await readStreamMessages(response.body!, 1);
  await new Promise(r => setTimeout(r, 50));
  ac.abort();

  // Verify CLI heartbeat in Redis
  const setCalls = mockRedisState.calls.filter(
    c => c.method === 'set' && c.args[0] === `project:${PROJECT_ID}:cli-active`,
  );
  assert.ok(setCalls.length >= 1, 'Should set CLI active key in Redis');
  assert.strictEqual(setCalls[0].args[1], 'true');
});

// ─── 7. Real-Time Redis Pub/Sub Event Delivery ────────────────────────

test('stream: receives real-time events via Redis Pub/Sub subscriber', async () => {
  const ac = new AbortController();

  try {
    mockDbState.queryHandler = (text) => {
      if (text.includes('FROM projects')) {
        return [{ id: PROJECT_ID, user_id: USER_ID }];
      }
      if (text.includes('FROM events')) {
        return [];
      }
      return [];
    };

    const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`, {
      signal: ac.signal,
    });

    const response = await streamRoute.GET(req);
    assert.ok(response.body);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Read initial connected chunk
    const first = await reader.read();
    assert.ok(decoder.decode(first.value).includes('data: connected'));

    // Allow async subscriber setup to complete
    await new Promise(r => setTimeout(r, 50));

    // Live webhook event
    const liveEvent = {
      id: 'evt-realtime-live-99',
      project_id: PROJECT_ID,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { live: true },
      raw_body: '{"live":true}',
      received_at: '2026-11-08T22:30:00.000Z',
    };

    // Find the subscriber that subscribed to events:${PROJECT_ID}
    const subscriber = mockRedisState.subscribers.find(s => s.subscribedChannels.has(`events:${PROJECT_ID}`));
    assert.ok(subscriber, 'Subscriber should be registered for events:${PROJECT_ID}');
    subscriber.emit('message', `events:${PROJECT_ID}`, JSON.stringify(liveEvent));

    // Read subsequent chunks from the stream
    let receivedExpectedEvent = false;
    for (let i = 0; i < 3; i++) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      if (text.includes('id: evt-realtime-live-99') && text.includes('"live":true')) {
        receivedExpectedEvent = true;
        break;
      }
    }
    reader.releaseLock();

    assert.strictEqual(receivedExpectedEvent, true,
      'Stream must deliver the real-time event received via Redis Pub/Sub');
  } finally {
    ac.abort();
  }
});
