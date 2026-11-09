import test from 'node:test';
import assert from 'node:assert';
import {
  mockDbState,
  mockRedisState,
  setMockHeaders,
  resetAllMocks,
} from './mock-helper';
import * as processRoute from '@/app/api/process/route';
import { drainQueue, processQueueItem } from '@/lib/services/processor';
import type { WebhookPayload } from '@/lib/types';

const VALID_PROJECT_ID = 'b7e2c1a0-4f5d-4e9b-8a7c-3d2e1f0a9b8c';

const envDict = process.env as Record<string, string | undefined>;

test.beforeEach(() => {
  resetAllMocks();
  envDict.NODE_ENV = 'test';
  setMockHeaders({ host: 'localhost:3000' });
});

// ─── 1. Environment & Localhost Access Guard ─────────────────────────

test('process: returns 404 in production environment', async () => {
  envDict.NODE_ENV = 'production';

  const response = await processRoute.POST();
  assert.strictEqual(response.status, 404);
  assert.strictEqual(await response.text(), 'Not Found');
});

test('process: returns 403 Forbidden when called by non-localhost callers', async () => {
  setMockHeaders({
    host: 'api.malicious.com',
    'x-forwarded-for': '203.0.113.195',
  });

  const response = await processRoute.POST();
  assert.strictEqual(response.status, 403);
  assert.strictEqual(await response.text(), 'Forbidden');
});

test('process: allows localhost callers via various headers (127.0.0.1, ::1)', async () => {
  // Case A: host 127.0.0.1
  setMockHeaders({ host: '127.0.0.1:3000' });
  let response = await processRoute.POST();
  assert.strictEqual(response.status, 200);

  // Case B: x-forwarded-for 127.0.0.1
  setMockHeaders({ host: 'internal-proxy', 'x-forwarded-for': '127.0.0.1' });
  response = await processRoute.POST();
  assert.strictEqual(response.status, 200);

  // Case C: IPv6 localhost ::1
  setMockHeaders({ host: 'internal-proxy', 'x-forwarded-for': '::1' });
  response = await processRoute.POST();
  assert.strictEqual(response.status, 200);
});

// ─── 2. Queue Popping & Draining Behavior ─────────────────────────────

test('process: handles empty queue returning processed=0', async () => {
  const response = await processRoute.POST();
  assert.strictEqual(response.status, 200);
  const data = (await response.json()) as { ok: boolean; processed: number };
  assert.strictEqual(data.ok, true);
  assert.strictEqual(data.processed, 0);

  const rpopCalls = mockRedisState.calls.filter(c => c.method === 'rpop');
  assert.strictEqual(rpopCalls.length, 1);
  assert.strictEqual(rpopCalls[0].args[0], 'webhook-queue');
});

test('process: pops and processes items in FIFO order up to batch limit (10)', async () => {
  // Mock DB to say project exists and return event on insert
  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) {
      return [{ id: values[0] }];
    }
    if (text.includes('INSERT INTO events')) {
      return [{
        id: 'evt-generated-1',
        project_id: values[0],
        method: values[1],
        headers: values[2],
        body: values[3],
        raw_body: values[4],
        received_at: values[6],
      }];
    }
    return [];
  };

  // Push 12 items to the queue
  for (let i = 1; i <= 12; i++) {
    const payload: WebhookPayload = {
      projectId: VALID_PROJECT_ID,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      raw: JSON.stringify({ itemIndex: i }),
      receivedAt: new Date().toISOString(),
      sourceIp: '127.0.0.1',
    };
    mockRedisState.queue.unshift(JSON.stringify(payload));
  }

  assert.strictEqual(mockRedisState.queue.length, 12);

  const response = await processRoute.POST();
  assert.strictEqual(response.status, 200);
  const data = (await response.json()) as { ok: boolean; processed: number };
  assert.strictEqual(data.ok, true);
  assert.strictEqual(data.processed, 10, 'Must process exactly MAX_BATCH_SIZE (10) items');
  assert.strictEqual(mockRedisState.queue.length, 2, 'Remaining 2 items must remain in queue');
});

// ─── 3. Project Validation (Skipping Unknown Projects) ────────────────

test('process: skips queue item and does NOT insert when project does not exist', async () => {
  // Mock DB: project does not exist
  mockDbState.queryHandler = (text) => {
    if (text.includes('FROM projects')) {
      return []; // empty -> project not found
    }
    return [];
  };

  const payload: WebhookPayload = {
    projectId: 'c9c4205c-8596-41f2-81e9-e023920280ff',
    method: 'POST',
    headers: {},
    raw: '{"test":true}',
    receivedAt: new Date().toISOString(),
    sourceIp: null,
  };
  mockRedisState.queue.push(JSON.stringify(payload));

  const processed = await drainQueue(1);
  assert.strictEqual(processed, 1);

  // Assert no INSERT INTO events query was performed
  const insertQueries = mockDbState.queries.filter(q => q.text.includes('INSERT INTO events'));
  assert.strictEqual(insertQueries.length, 0, 'Must not insert event for non-existent project');

  // Assert no pubsub message published
  const publishCalls = mockRedisState.calls.filter(c => c.method === 'publish');
  assert.strictEqual(publishCalls.length, 0, 'Must not publish event for non-existent project');
});

// ─── 4. JSON Parse Fallback for Non-JSON Payloads ─────────────────────

test('process: parses valid JSON and populates body column', async () => {
  let capturedBodyValue: unknown = undefined;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) {
      return [{ id: values[0] }];
    }
    if (text.includes('INSERT INTO events')) {
      capturedBodyValue = values[3];
      return [{ id: 'evt-json', project_id: values[0] }];
    }
    return [];
  };

  const rawJson = '{"amount": 4200, "currency": "eur", "nested": {"paid": true}}';
  const eventId = await processQueueItem({
    projectId: VALID_PROJECT_ID,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    raw: rawJson,
    receivedAt: new Date().toISOString(),
    sourceIp: '10.0.0.1',
  });

  assert.strictEqual(eventId, 'evt-json');
  assert.strictEqual(
    capturedBodyValue,
    JSON.stringify({ amount: 4200, currency: 'eur', nested: { paid: true } }),
    'Parsed JSON body must be serialized for JSONB column',
  );
});

test('process: falls back to body=null for non-JSON payloads while preserving raw_body', async () => {
  let capturedBodyValue: unknown = undefined;
  let capturedRawValue: unknown = undefined;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) {
      return [{ id: values[0] }];
    }
    if (text.includes('INSERT INTO events')) {
      capturedBodyValue = values[3];
      capturedRawValue = values[4];
      return [{ id: 'evt-non-json', project_id: values[0] }];
    }
    return [];
  };

  const nonJsonRaw = '<?xml version="1.0"?><status>SUCCESS</status>';
  const eventId = await processQueueItem({
    projectId: VALID_PROJECT_ID,
    method: 'POST',
    headers: { 'content-type': 'application/xml' },
    raw: nonJsonRaw,
    receivedAt: new Date().toISOString(),
    sourceIp: '10.0.0.1',
  });

  assert.strictEqual(eventId, 'evt-non-json');
  assert.strictEqual(capturedBodyValue, null, 'body must be null for non-JSON');
  assert.strictEqual(capturedRawValue, nonJsonRaw, 'raw_body must preserve exact raw text');
});

// ─── 5. Insert Query Shape Verification ───────────────────────────────

test('process: builds the exact expected SQL query and parameter shape on insert', async () => {
  let executedQuery: { text: string; values: unknown[] } | null = null;

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) {
      return [{ id: values[0] }];
    }
    if (text.includes('INSERT INTO events')) {
      executedQuery = { text, values };
      return [{
        id: 'evt-insert-shape',
        project_id: values[0],
        method: values[1],
        headers: values[2],
        body: values[3],
        raw_body: values[4],
        source_ip: values[5],
        received_at: values[6],
      }];
    }
    return [];
  };

  const receivedAtTime = '2026-11-08T22:00:00.000Z';
  const headersObj = { 'content-type': 'application/json', 'x-webhook-id': 'wh_456' };
  const rawBody = '{"status":"completed"}';

  await processQueueItem({
    projectId: VALID_PROJECT_ID,
    method: 'POST',
    headers: headersObj,
    raw: rawBody,
    receivedAt: receivedAtTime,
    sourceIp: '203.0.113.88',
  });

  assert.ok(executedQuery !== null, 'Insert query must be executed');
  const query = executedQuery as { text: string; values: unknown[] };

  // Verify SQL statement structure
  assert.ok(query.text.includes('INSERT INTO events'));
  assert.ok(query.text.includes('project_id'));
  assert.ok(query.text.includes('method'));
  assert.ok(query.text.includes('headers'));
  assert.ok(query.text.includes('body'));
  assert.ok(query.text.includes('raw_body'));
  assert.ok(query.text.includes('source_ip'));
  assert.ok(query.text.includes('received_at'));
  assert.ok(query.text.includes('RETURNING id, project_id, method, headers, body, raw_body, received_at'));

  // Verify parameters: [projectId, method, headers, body, rawBody, sourceIp, receivedAt]
  assert.strictEqual(query.values[0], VALID_PROJECT_ID);
  assert.strictEqual(query.values[1], 'POST');
  assert.strictEqual(query.values[2], JSON.stringify(headersObj));
  assert.strictEqual(query.values[3], JSON.stringify({ status: 'completed' }));
  assert.strictEqual(query.values[4], rawBody);
  assert.strictEqual(query.values[5], '203.0.113.88');
  assert.strictEqual(query.values[6], receivedAtTime);

  // Verify Redis Pub/Sub was notified
  const pubSubCalls = mockRedisState.calls.filter(
    c => c.method === 'publish' && c.args[0] === `events:${VALID_PROJECT_ID}`,
  );
  assert.strictEqual(pubSubCalls.length, 1);
});
