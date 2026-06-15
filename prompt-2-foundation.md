# Latch — Foundation Build (Day 1)

You are building the core data pipeline for **Latch**, a real-time webhook ledger.
The project has already been scaffolded (Next.js 15, TypeScript, Tailwind, Neon Postgres,
Upstash Redis). The database schema is live with three tables: `projects`, `events`, `replays`.

This session builds exactly three things:
1. The ingest route — receives webhook POST requests, returns 200 OK immediately
2. The queue consumer — processes items from Redis and writes to Neon
3. A smoke test — verifies the entire pipeline end to end

Read `AGENTS.md` and `skills/webhook-core/SKILL.md` before writing any code.
Every architectural decision is already made and documented there.

---

## The core rule — do not break this

The ingest route must return 200 OK **before** any database operation runs.
Stripe, GitHub, and other providers retry on non-200 responses. Slow writes
under load cause retries, duplicates, and broken user state. The Redis queue
is the buffer. Everything after the push happens asynchronously.

```
Webhook POST
    │
    ▼
Ingest route
    │── push payload to Redis (LPUSH)
    │── trigger consumer (async, fire-and-forget in dev)
    └── return 200 OK  ◄─── happens here, not after any db write
```

---

## File 1 — lib/db.ts (verify it exists, do not recreate)

This was created in the init session. Confirm it exports `db` from
`@neondatabase/serverless`. If it is missing or empty, write it now:

```typescript
import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const db = neon(process.env.DATABASE_URL);
```

---

## File 2 — lib/redis.ts (verify it exists, do not recreate)

Confirm it exports `redis` from `@upstash/redis`. If missing or empty:

```typescript
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();
```

---

## File 3 — lib/verify.ts

Webhook providers sign their payloads using HMAC. We need to verify these
signatures in the queue consumer (not the ingest route — we store first,
verify after). Write both Stripe and GitHub verification:

```typescript
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify a Stripe webhook signature.
 * Header format: "t=timestamp,v1=signature"
 * Stripe docs: https://stripe.com/docs/webhooks/signatures
 */
export function verifyStripe(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  try {
    const parts = signatureHeader.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
    const signature = parts.find(p => p.startsWith('v1='))?.slice(3);

    if (!timestamp || !signature) return false;

    const payload = `${timestamp}.${rawBody}`;
    const expected = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Verify a GitHub webhook signature.
 * Header format: "sha1=signature"
 * GitHub docs: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
 */
export function verifyGitHub(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  try {
    const signature = signatureHeader.replace('sha1=', '');
    const expected = createHmac('sha1', secret)
      .update(rawBody)
      .digest('hex');

    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}
```

---

## File 4 — app/api/ingest/[projectId]/route.ts

This is the public endpoint that receives webhook POSTs.

### What it must do
1. Read the raw body as text — **never** use `req.json()` here.
   Raw body is needed later for signature verification. Calling `.json()`
   consumes the stream and loses the original bytes.
2. Collect all request headers into a plain object.
3. Push the payload object to the Redis list named `webhook-queue` using LPUSH.
4. Trigger the consumer:
   - In **development**: fire a fetch to `/api/process` without awaiting it.
   - In **production**: publish a QStash message pointing to the consumer URL.
5. Return `{ received: true }` with status 200 immediately after the Redis push.

### What it must NOT do
- Never `await` any database operation before returning
- Never validate the signature here (we store first, verify in consumer)
- Never use `req.json()` — always `req.text()`

### Implementation

```typescript
import { redis } from '@/lib/redis';
import { Client } from '@upstash/qstash';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  // Always read raw body as text — needed for signature verification later
  const raw = await req.text();

  // Collect all headers into a plain object
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const payload = {
    projectId,
    headers,
    raw,
    receivedAt: new Date().toISOString(),
    sourceIp: req.headers.get('x-forwarded-for') ??
              req.headers.get('x-real-ip') ??
              null,
  };

  // Push to Redis queue (LPUSH = push to left/head of list)
  await redis.lpush('webhook-queue', JSON.stringify(payload));

  // Trigger the consumer
  if (process.env.NODE_ENV === 'development') {
    // In dev: call the consumer locally, fire and forget — do not await
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    fetch(`${appUrl}/api/process`, { method: 'POST' }).catch(() => {});
  } else {
    // In production: publish to QStash so it calls /api/process
    const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    await qstash.publish({
      url: `${appUrl}/api/process`,
      body: JSON.stringify({ source: 'ingest' }),
    });
  }

  // Return 200 immediately — this must happen before any db write
  return Response.json({ received: true }, { status: 200 });
}
```

---

## File 5 — app/api/process/route.ts

This is the queue consumer. QStash calls it in production after each ingest.
In development, the ingest route calls it directly.

### What it must do
1. In production: verify the request came from QStash using the signing keys.
2. Pop one item from the Redis list using RPOP (pops from the right/tail — FIFO with LPUSH).
3. If the queue is empty, return 200 (nothing to process — this is normal).
4. Parse the item: extract `projectId`, `headers`, `raw`, `receivedAt`, `sourceIp`.
5. Attempt to parse `raw` as JSON for the `body` column. If parsing fails,
   `body` is null — the `raw_body` column is always the source of truth.
6. Verify the project exists in Neon before inserting. If not found, log the
   event but do not insert (could be a misconfigured endpoint).
7. Insert into the `events` table with all fields.
8. Return `{ ok: true, eventId: row.id }`.

### On errors
Never crash silently. If Neon insert fails, log the error and return 500.
QStash will retry on 5xx responses, which is the correct behavior.

### QStash verification
In production, use the `@upstash/qstash` `verifySignatureAppRouter` wrapper.
In development, skip verification entirely (QStash cannot call localhost).

### Implementation

```typescript
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

// Core processing logic — extracted so it can be called directly in dev
async function processNextItem(): Promise<Response> {
  // Pop one item from the right of the list (FIFO with LPUSH)
  const item = await redis.rpop<string>('webhook-queue');

  if (!item) {
    // Queue is empty — normal, return 200
    return Response.json({ ok: true, message: 'Queue empty' });
  }

  const { projectId, headers, raw, receivedAt, sourceIp } = JSON.parse(item);

  // Verify the project exists
  const projectRows = await db`
    SELECT id FROM projects WHERE id = ${projectId} LIMIT 1
  `;

  if (projectRows.length === 0) {
    console.warn(`[process] Unknown projectId: ${projectId}`);
    return Response.json({ ok: true, message: 'Unknown project, skipped' });
  }

  // Try to parse raw body as JSON — fall back to null if it is not valid JSON
  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    // Not JSON — raw_body is the source of truth, body column stays null
  }

  // Insert the event
  const [event] = await db`
    INSERT INTO events (
      project_id,
      method,
      headers,
      body,
      raw_body,
      source_ip,
      received_at
    ) VALUES (
      ${projectId},
      ${'POST'},
      ${JSON.stringify(headers)},
      ${body ? JSON.stringify(body) : null},
      ${raw},
      ${sourceIp},
      ${receivedAt}
    )
    RETURNING id
  `;

  console.log(`[process] Stored event ${event.id} for project ${projectId}`);
  return Response.json({ ok: true, eventId: event.id });
}

// Production handler — QStash verifies signature before calling processNextItem
const productionHandler = verifySignatureAppRouter(
  async (_req: Request) => processNextItem()
);

// Export the correct handler depending on environment
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'development') {
    // Skip signature verification in dev — QStash cannot reach localhost
    return processNextItem();
  }
  return productionHandler(req);
}
```

---

## Step 6 — Create a test project row in Neon

The ingest route validates that `projectId` exists before inserting.
We need a real project row for the smoke test.

Create a seed script at `scripts/seed.ts`:

```typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);

const [project] = await sql`
  INSERT INTO projects (user_id, name, destination_url)
  VALUES ('dev-user', 'Test Project', 'http://localhost:3001/webhook')
  RETURNING id, name
`;

console.log('Created test project:');
console.log(`  ID:   ${project.id}`);
console.log(`  Name: ${project.name}`);
console.log('');
console.log('Use this ID in your curl test:');
console.log(`  curl -X POST http://localhost:3000/api/ingest/${project.id} \\`);
console.log(`    -H "Content-Type: application/json" \\`);
console.log(`    -d \'{"event": "payment.succeeded", "amount": 4900}\'`);
```

Run it:

```bash
pnpm dlx tsx scripts/seed.ts
```

Copy the project ID from the output.

---

## Step 7 — Smoke test

With `pnpm dev` running in one terminal, run the following tests in order:

### Test 1 — Ingest responds instantly

```bash
curl -X POST http://localhost:3000/api/ingest/<YOUR_PROJECT_ID> \
  -H "Content-Type: application/json" \
  -d '{"event": "payment.succeeded", "amount": 4900, "currency": "usd"}' \
  -w "\nHTTP %{http_code} — Time: %{time_total}s\n"
```

**Expected:** `{"received":true}` with HTTP 200 in under 200ms.
The response must arrive before the consumer finishes — you will see the
consumer log appear in the terminal a moment after the curl returns.

### Test 2 — Event appears in Neon

Query the database to confirm the event was inserted:

```bash
pnpm dlx tsx -e "
import { neon } from '@neondatabase/serverless';
const db = neon(process.env.DATABASE_URL_UNPOOLED);
const rows = await db\`SELECT id, project_id, body, received_at FROM events ORDER BY received_at DESC LIMIT 3\`;
console.table(rows);
"
```

**Expected:** The row from the curl test appears with the correct `body` JSON
and `project_id`.

### Test 3 — Non-JSON body is handled correctly

```bash
curl -X POST http://localhost:3000/api/ingest/<YOUR_PROJECT_ID> \
  -H "Content-Type: text/plain" \
  -d 'this is a plain text webhook body'
```

Re-run the Neon query. The new row should have `body: null` and
`raw_body: 'this is a plain text webhook body'`.

### Test 4 — Unknown project is handled gracefully

```bash
curl -X POST http://localhost:3000/api/ingest/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Expected:** Still returns HTTP 200 (we never return errors to webhook providers).
The terminal log should show `[process] Unknown projectId: ...` and no row
should be inserted.

---

## Acceptance criteria — session is done when

- [ ] `POST /api/ingest/:projectId` returns 200 in under 200ms regardless of payload
- [ ] Events appear in the Neon `events` table after each curl
- [ ] Valid JSON payloads populate the `body` column AND `raw_body` column
- [ ] Non-JSON payloads set `body` to null and still populate `raw_body`
- [ ] Unknown project IDs return 200 without inserting a row
- [ ] The consumer logs each processed event with its UUID
- [ ] `pnpm dev` shows no TypeScript errors

---

## Hard rules — do not break these

- `req.json()` is banned in the ingest route — always use `req.text()`
- Never await a database write before returning 200 in the ingest route
- Never return a non-200 status from the ingest route (providers will retry)
- `raw_body` must always be populated — it is required for signature verification
- Use `DATABASE_URL` (pooled) for all runtime queries
- Use `DATABASE_URL_UNPOOLED` only in scripts that run outside of Next.js
- The `body` column is nullable — a failed JSON parse is not an error

---

## What comes next (do not build this now)

The next session builds the SSE endpoint and live dashboard. Do not start on:
- `app/api/events/stream/route.ts`
- Any dashboard pages
- Any component files
- Auth.js configuration

Those belong to Day 2.
