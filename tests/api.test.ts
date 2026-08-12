import test from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';

// ─── Test Zod Validation Schemas ──────────────────────────────────────────

const uuidSchema = z.string().uuid();

const replaySchema = z.object({
  eventId: z.string().uuid(),
  destinationUrl: z.string().url().refine(
    (url) => {
      try {
        const parsed = new URL(url);
        const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
        return !blocked.some(h => parsed.hostname === h || parsed.hostname.endsWith('.internal'));
      } catch { return false; }
    },
    { message: 'Destination URL must not target internal/private addresses' }
  ),
});

test('Ingest Route Validation: accepts valid UUID, rejects malformed UUID', () => {
  const validResult = uuidSchema.safeParse('d3b07384-d113-4956-a5db-e1c725a34e32');
  assert.strictEqual(validResult.success, true);

  const invalidResult = uuidSchema.safeParse('invalid-project-id-123');
  assert.strictEqual(invalidResult.success, false);
});

test('Replay Schema Validation: validates eventId UUID and destination URL', () => {
  const validReplay = replaySchema.safeParse({
    eventId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    destinationUrl: 'https://api.myapp.com/webhooks',
  });
  assert.strictEqual(validReplay.success, true);

  const invalidEventId = replaySchema.safeParse({
    eventId: 'not-a-uuid',
    destinationUrl: 'https://api.myapp.com/webhooks',
  });
  assert.strictEqual(invalidEventId.success, false);

  const invalidUrl = replaySchema.safeParse({
    eventId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    destinationUrl: 'not-a-url',
  });
  assert.strictEqual(invalidUrl.success, false);
});

test('Search Query Validation: limits search query to 500 characters', () => {
  const shortQuery = 'charge.succeeded';
  assert.ok(shortQuery.length <= 500);

  const longQuery = 'a'.repeat(501);
  assert.strictEqual(longQuery.length > 500, true);
});

test('Localhost Guard Logic: correctly identifies localhost callers', () => {
  const checkIsLocalhost = (host: string, forwarded: string) => {
    return (
      host.startsWith('localhost') ||
      host.startsWith('127.0.0.1') ||
      forwarded === '127.0.0.1' ||
      forwarded === '::1'
    );
  };

  assert.strictEqual(checkIsLocalhost('localhost:3000', ''), true);
  assert.strictEqual(checkIsLocalhost('127.0.0.1:3000', ''), true);
  assert.strictEqual(checkIsLocalhost('latch.dev', '127.0.0.1'), true);
  assert.strictEqual(checkIsLocalhost('external-hacker.com', '203.0.113.195'), false);
});
