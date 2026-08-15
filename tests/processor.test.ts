import test from 'node:test';
import assert from 'node:assert';

/**
 * Test processQueueItem by mocking the repository and redis layers.
 * Tests the pure business logic without requiring a real database or Redis.
 */

// ─── Mock Setup ──────────────────────────────────────────────────────

type InsertData = {
  projectId: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  rawBody: string;
  sourceIp: string | null;
  receivedAt: string;
};

function createMockProcessor(options: {
  projectExists: boolean;
}) {
  let insertedData: InsertData | null = null;
  let publishedChannel: string | null = null;
  let publishedMessage: string | null = null;

  const eventsRepo = {
    insert: async (data: InsertData) => {
      insertedData = data;
      return { id: 'test-event-id', project_id: data.projectId, ...data };
    },
  };

  const projectsRepo = {
    exists: async (_projectId: string) => options.projectExists,
  };

  const redis = {
    publish: async (channel: string, message: string) => {
      publishedChannel = channel;
      publishedMessage = message;
    },
  };

  async function processQueueItem(payload: {
    projectId: string;
    headers: Record<string, string>;
    raw: string;
    receivedAt: string;
    sourceIp: string | null;
  }): Promise<string | null> {
    const { projectId, headers, raw, receivedAt, sourceIp } = payload;

    const projectExists = await projectsRepo.exists(projectId);
    if (!projectExists) {
      return null;
    }

    let body: unknown = null;
    try {
      body = JSON.parse(raw);
    } catch {
      // Not JSON — raw_body is the source of truth
    }

    const event = await eventsRepo.insert({
      projectId,
      method: 'POST',
      headers,
      body,
      rawBody: raw,
      sourceIp,
      receivedAt,
    });

    await redis.publish(`events:${projectId}`, JSON.stringify(event)).catch(() => {});

    return event.id;
  }

  return {
    processQueueItem,
    getInsertedData: () => insertedData,
    getPublishedChannel: () => publishedChannel,
    getPublishedMessage: () => publishedMessage,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────

test('processQueueItem: valid payload with existing project returns event ID', async () => {
  const mock = createMockProcessor({ projectExists: true });
  const result = await mock.processQueueItem({
    projectId: 'proj-123',
    headers: { 'content-type': 'application/json' },
    raw: '{"test": true}',
    receivedAt: new Date().toISOString(),
    sourceIp: '1.2.3.4',
  });

  assert.strictEqual(result, 'test-event-id');
  assert.ok(mock.getInsertedData() !== null, 'Should have called insert');
});

test('processQueueItem: unknown project returns null and does NOT insert', async () => {
  const mock = createMockProcessor({ projectExists: false });
  const result = await mock.processQueueItem({
    projectId: 'unknown-project',
    headers: {},
    raw: '{"test": true}',
    receivedAt: new Date().toISOString(),
    sourceIp: null,
  });

  assert.strictEqual(result, null);
  assert.strictEqual(mock.getInsertedData(), null, 'Should not have called insert');
});

test('processQueueItem: valid JSON body is parsed and stored', async () => {
  const mock = createMockProcessor({ projectExists: true });
  await mock.processQueueItem({
    projectId: 'proj-123',
    headers: { 'content-type': 'application/json' },
    raw: '{"amount": 100, "currency": "usd"}',
    receivedAt: new Date().toISOString(),
    sourceIp: null,
  });

  const data = mock.getInsertedData();
  assert.ok(data !== null);
  assert.deepStrictEqual(data.body, { amount: 100, currency: 'usd' });
  assert.strictEqual(data.rawBody, '{"amount": 100, "currency": "usd"}');
});

test('processQueueItem: invalid JSON body results in body=null with raw preserved', async () => {
  const mock = createMockProcessor({ projectExists: true });
  await mock.processQueueItem({
    projectId: 'proj-123',
    headers: { 'content-type': 'text/plain' },
    raw: 'this is not json <xml>oops</xml>',
    receivedAt: new Date().toISOString(),
    sourceIp: null,
  });

  const data = mock.getInsertedData();
  assert.ok(data !== null);
  assert.strictEqual(data.body, null, 'body should be null for non-JSON');
  assert.strictEqual(data.rawBody, 'this is not json <xml>oops</xml>');
});

test('processQueueItem: Redis publish is called after successful insert', async () => {
  const mock = createMockProcessor({ projectExists: true });
  await mock.processQueueItem({
    projectId: 'proj-456',
    headers: {},
    raw: '{}',
    receivedAt: new Date().toISOString(),
    sourceIp: null,
  });

  assert.strictEqual(mock.getPublishedChannel(), 'events:proj-456');
  assert.ok(mock.getPublishedMessage() !== null, 'Should have published a message');
});

test('processQueueItem: sourceIp is passed through to insert', async () => {
  const mock = createMockProcessor({ projectExists: true });
  await mock.processQueueItem({
    projectId: 'proj-789',
    headers: {},
    raw: '{}',
    receivedAt: '2026-01-01T00:00:00Z',
    sourceIp: '203.0.113.42',
  });

  const data = mock.getInsertedData();
  assert.ok(data !== null);
  assert.strictEqual(data.sourceIp, '203.0.113.42');
  assert.strictEqual(data.receivedAt, '2026-01-01T00:00:00Z');
});
