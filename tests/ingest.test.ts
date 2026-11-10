import test from 'node:test';
import assert from 'node:assert';
import { mockRedisState, resetAllMocks } from './mock-helper';
import * as ingestRoute from '@/app/api/ingest/[projectId]/route';
import type { WebhookPayload } from '@/lib/types';

const VALID_PROJECT_ID = 'e2b9c3f1-7a8d-4b2e-9f3a-1c5d7e8b9a0f';

test.beforeEach(() => {
  resetAllMocks();
});

// ─── 1. Core Success & Immediate 200 Response ────────────────────────

test('ingest: returns 200 immediately for valid webhook POST', async () => {
  const req = new Request(`http://localhost:3000/api/ingest/${VALID_PROJECT_ID}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Stripe/1.0',
    },
    body: JSON.stringify({ event: 'charge.succeeded', amount: 2000 }),
  });

  const response = await ingestRoute.POST(req, {
    params: Promise.resolve({ projectId: VALID_PROJECT_ID }),
  });

  assert.strictEqual(response.status, 200);
  const data = (await response.json()) as { received: boolean };
  assert.strictEqual(data.received, true);
});

// ─── 2. Redis Queue Payload Shape & Raw Body ──────────────────────────

test('ingest: pushes to Redis queue with the exact payload shape and raw body', async () => {
  const rawBodyText = '{"event":"payment_intent.created","id":"pi_123"}';
  const req = new Request(`http://localhost:3000/api/ingest/${VALID_PROJECT_ID}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-custom-sig': 'sig_test_123',
      'x-forwarded-for': '198.51.100.42',
    },
    body: rawBodyText,
  });

  await ingestRoute.POST(req, {
    params: Promise.resolve({ projectId: VALID_PROJECT_ID }),
  });

  // Verify lpush call
  const lpushCalls = mockRedisState.calls.filter(c => c.method === 'lpush');
  assert.strictEqual(lpushCalls.length, 1);
  assert.strictEqual(lpushCalls[0].args[0], 'webhook-queue');

  // Verify stored payload in queue
  assert.strictEqual(mockRedisState.queue.length, 1);
  const payload = JSON.parse(mockRedisState.queue[0]) as WebhookPayload;

  assert.strictEqual(payload.projectId, VALID_PROJECT_ID);
  assert.strictEqual(payload.method, 'POST');
  assert.strictEqual(payload.raw, rawBodyText);
  assert.strictEqual(payload.sourceIp, '198.51.100.42');
  assert.strictEqual(payload.headers['content-type'], 'application/json');
  assert.strictEqual(payload.headers['x-custom-sig'], 'sig_test_123');
  assert.ok(payload.receivedAt);
  assert.ok(!Number.isNaN(Date.parse(payload.receivedAt)), 'receivedAt must be valid ISO date string');

  // Verify tunnel publish call
  const publishCalls = mockRedisState.calls.filter(c => c.method === 'publish');
  assert.strictEqual(publishCalls.length, 1);
  assert.strictEqual(publishCalls[0].args[0], `tunnel:${VALID_PROJECT_ID}`);
});

// ─── 3. Empty Bodies ──────────────────────────────────────────────────

test('ingest: handles empty bodies without crashing and stores raw as empty string', async () => {
  const req = new Request(`http://localhost:3000/api/ingest/${VALID_PROJECT_ID}`, {
    method: 'POST',
    headers: {
      'content-type': 'text/plain',
    },
    body: '',
  });

  const response = await ingestRoute.POST(req, {
    params: Promise.resolve({ projectId: VALID_PROJECT_ID }),
  });

  assert.strictEqual(response.status, 200);
  const data = (await response.json()) as { received: boolean };
  assert.strictEqual(data.received, true);

  const payload = JSON.parse(mockRedisState.queue[0]) as WebhookPayload;
  assert.strictEqual(payload.raw, '');
});

// ─── 4. Malformed Content-Type Headers ─────────────────────────────────

test('ingest: handles malformed content-type headers gracefully', async () => {
  const malformedHeader = ';;; invalid-mime-boundary;;; charset=???';
  const req = new Request(`http://localhost:3000/api/ingest/${VALID_PROJECT_ID}`, {
    method: 'POST',
    headers: {
      'content-type': malformedHeader,
    },
    body: 'Some unstructured data',
  });

  const response = await ingestRoute.POST(req, {
    params: Promise.resolve({ projectId: VALID_PROJECT_ID }),
  });

  assert.strictEqual(response.status, 200);
  const payload = JSON.parse(mockRedisState.queue[0]) as WebhookPayload;
  assert.strictEqual(payload.raw, 'Some unstructured data');
  assert.strictEqual(payload.headers['content-type'], malformedHeader);
});

// ─── 5. Non-POST Methods (Route Exports Check) ─────────────────────────

test('ingest: rejects GET and other unexported HTTP methods', () => {
  // In Next.js App Router, endpoints only handle methods that are explicitly exported.
  // Unexported methods (like GET, HEAD, OPTIONS) are rejected with 405 Method Not Allowed by the runtime.
  const exported = ingestRoute as Record<string, unknown>;

  assert.strictEqual(typeof exported.POST, 'function', 'POST must be exported');
  assert.strictEqual(typeof exported.PUT, 'function', 'PUT is supported for webhook updates');
  assert.strictEqual(typeof exported.PATCH, 'function', 'PATCH is supported for webhook patches');
  assert.strictEqual(typeof exported.DELETE, 'function', 'DELETE is supported for webhook deletions');

  // Verify non-POST methods like GET and HEAD are not exported
  assert.strictEqual(exported.GET, undefined, 'GET must NOT be exported (must be rejected)');
  assert.strictEqual(exported.HEAD, undefined, 'HEAD must NOT be exported');
  assert.strictEqual(exported.OPTIONS, undefined, 'OPTIONS must NOT be exported');
});

// ─── 6. Project ID Validation ─────────────────────────────────────────

test('ingest: rejects non-UUID project ID with 400 Bad Request', async () => {
  const req = new Request('http://localhost:3000/api/ingest/invalid-uuid-format', {
    method: 'POST',
    body: '{"test":true}',
  });

  const response = await ingestRoute.POST(req, {
    params: Promise.resolve({ projectId: 'invalid-uuid-format' }),
  });

  assert.strictEqual(response.status, 400);
  const data = (await response.json()) as { error: string };
  assert.strictEqual(data.error, 'Invalid projectId format');

  // Queue must not be touched
  assert.strictEqual(mockRedisState.queue.length, 0);
});

// ─── 7. Rate Limiting ─────────────────────────────────────────────────

test('ingest: rate limits requests exceeding 100 per minute from same IP', async () => {
  const clientIp = '192.0.2.1';

  // Seed Redis rate limit counter to 100
  mockRedisState.counters.set(`ratelimit:ingest:${clientIp}`, 100);

  const req = new Request(`http://localhost:3000/api/ingest/${VALID_PROJECT_ID}`, {
    method: 'POST',
    headers: { 'x-forwarded-for': clientIp },
    body: '{"event":"spam"}',
  });

  const response = await ingestRoute.POST(req, {
    params: Promise.resolve({ projectId: VALID_PROJECT_ID }),
  });

  // Count now incremented to 101 > 100
  assert.strictEqual(response.status, 429);
  const data = (await response.json()) as { error: string };
  assert.strictEqual(data.error, 'Rate limit exceeded');

  // Spammed request must not be enqueued
  assert.strictEqual(mockRedisState.queue.length, 0);
});

test('ingest: sets 60s expiration on first request for rate limiting', async () => {
  const clientIp = '198.51.100.99';
  const req = new Request(`http://localhost:3000/api/ingest/${VALID_PROJECT_ID}`, {
    method: 'POST',
    headers: { 'x-real-ip': clientIp },
    body: '{"ok":true}',
  });

  await ingestRoute.POST(req, {
    params: Promise.resolve({ projectId: VALID_PROJECT_ID }),
  });

  const expireCall = mockRedisState.calls.find(
    c => c.method === 'expire' && c.args[0] === `ratelimit:ingest:${clientIp}`,
  );
  assert.ok(expireCall, 'Should set expiration on rate limit key');
  assert.strictEqual(expireCall.args[1], 60);
});

test('ingest: Redis rate-limiting failure does not block webhook ingestion (resilience)', async () => {
  mockRedisState.customHandlers.set('incr', () => {
    throw new Error('Redis connection timeout');
  });

  const req = new Request(`http://localhost:3000/api/ingest/${VALID_PROJECT_ID}`, {
    method: 'POST',
    body: '{"event":"survives_redis_error"}',
  });

  const response = await ingestRoute.POST(req, {
    params: Promise.resolve({ projectId: VALID_PROJECT_ID }),
  });

  // Ingest must still succeed despite Redis rate limit failure
  assert.strictEqual(response.status, 200);
  assert.strictEqual(mockRedisState.queue.length, 1);
});

// ─── 8. Source IP Fallback Logic ──────────────────────────────────────

test('ingest: sourceIp falls back to null when no IP headers are present', async () => {
  const req = new Request(`http://localhost:3000/api/ingest/${VALID_PROJECT_ID}`, {
    method: 'POST',
    body: '{"test":true}',
  });

  await ingestRoute.POST(req, {
    params: Promise.resolve({ projectId: VALID_PROJECT_ID }),
  });

  const payload = JSON.parse(mockRedisState.queue[0]) as WebhookPayload;
  assert.strictEqual(payload.sourceIp, null);
});

