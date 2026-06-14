---
name: webhook-core
description: >
  Activate when building or modifying: the ingest API route, the queue consumer,
  the SSE stream endpoint, the replay engine, webhook signature verification,
  or Auth.js GitHub OAuth setup. This skill enforces the async ingestion pattern,
  prevents synchronous processing in the ingest route, and ensures the SSE
  endpoint uses Edge Runtime correctly.
triggers:
  - ingest route
  - webhook receiver
  - queue consumer
  - SSE endpoint
  - event stream
  - replay
  - signature verification
  - Auth.js
  - NextAuth
  - GitHub OAuth
---

# Webhook Core Patterns

This project is a webhook ledger. Events must never be lost. Speed of acknowledgment
is the top priority in the ingest path. Everything else can be slow.

---

## Pattern 1 — Async Ingest (The Core Rule)

The ingest route has one job: accept the payload, buffer it, return 200.
Never do database writes in the ingest route. Never call external services.
Never validate signatures in the ingest route (that happens in the consumer).

```typescript
// app/api/ingest/[projectId]/route.ts
import { redis } from '@/lib/redis';

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const raw = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  await redis.lpush(
    'webhook-queue',
    JSON.stringify({
      projectId: params.projectId,
      headers,
      raw,
      receivedAt: new Date().toISOString(),
    })
  );

  return Response.json({ received: true }, { status: 200 });
}
```

**Why:** Stripe and GitHub retry on non-200 responses. Slow database writes under load
will cause retries, duplicates, and broken user states. The queue is the safety net.

---

## Pattern 2 — Queue Consumer (Called by Upstash QStash)

The consumer is a POST endpoint that QStash calls after every enqueue.
It reads from Redis, writes to Neon, and handles errors without crashing.

```typescript
// app/api/process/route.ts
import { redis } from '@/lib/redis';
import { db } from '@/lib/db';
import { verifyQStashSignature } from '@upstash/qstash/nextjs';

export const POST = verifyQStashSignature(async (req: Request) => {
  const item = await redis.rpop('webhook-queue');
  if (!item) return Response.json({ ok: true });

  const { projectId, headers, raw, receivedAt } = JSON.parse(item);

  let body: unknown = null;
  try { body = JSON.parse(raw); } catch { /* raw_body is the source of truth */ }

  await db.query(
    `INSERT INTO events (project_id, headers, body, raw_body, source_ip, received_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      projectId,
      JSON.stringify(headers),
      body ? JSON.stringify(body) : null,
      raw,
      headers['x-forwarded-for'] ?? null,
      receivedAt,
    ]
  );

  return Response.json({ ok: true });
});
```

---

## Pattern 3 — SSE Stream Endpoint (Edge Runtime Required)

The SSE endpoint polls Neon every 2 seconds for events newer than `Last-Event-ID`.
It MUST use Edge Runtime. Without `export const runtime = 'edge'`, Vercel serverless
functions time out at 10 seconds and kill the connection too fast for any useful streaming.

```typescript
// app/api/events/stream/route.ts
import { db } from '@/lib/db';
import { auth } from '@/auth';

export const runtime = 'edge';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  const lastId = req.headers.get('last-event-id') ?? '0';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string, id?: string) => {
        const msg = id ? `id: ${id}\ndata: ${data}\n\n` : `data: ${data}\n\n`;
        controller.enqueue(encoder.encode(msg));
      };

      // Send a heartbeat immediately to confirm connection
      send('connected');

      let cursor = lastId;

      while (true) {
        const { rows } = await db.query(
          `SELECT id, headers, body, raw_body, received_at
           FROM events
           WHERE project_id = $1
             AND received_at > (
               SELECT received_at FROM events WHERE id = $2 LIMIT 1
             )
           ORDER BY received_at ASC
           LIMIT 20`,
          [projectId, cursor === '0' ? '00000000-0000-0000-0000-000000000000' : cursor]
        );

        for (const row of rows) {
          send(JSON.stringify(row), row.id);
          cursor = row.id;
        }

        await new Promise(r => setTimeout(r, 2000));
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
```

**Edge Runtime limit:** Vercel free hobby gives 30s max on Edge functions.
The EventSource API automatically reconnects on close, sending `Last-Event-ID`
so the stream resumes without gaps. This is intentional, not a bug.

---

## Pattern 4 — EventSource Client Component

```typescript
// components/EventFeed.tsx
'use client';
import { useEffect, useState } from 'react';

type WebhookEvent = {
  id: string;
  headers: Record<string, string>;
  body: unknown;
  received_at: string;
};

export function EventFeed({ projectId }: { projectId: string }) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);

  useEffect(() => {
    const es = new EventSource(`/api/events/stream?projectId=${projectId}`);

    es.onmessage = (e) => {
      if (e.data === 'connected') return;
      const event = JSON.parse(e.data);
      setEvents(prev => [event, ...prev].slice(0, 200)); // cap at 200 in memory
    };

    return () => es.close();
  }, [projectId]);

  return (
    <div>
      {events.map(event => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  );
}
```

---

## Pattern 5 — Replay Engine

Replay fetches the original event and forwards it to a destination URL.
The original headers are preserved exactly. `X-Webhook-Replay: true` is appended.
The source IP is NOT forwarded (it was this server's IP, not the original sender).

```typescript
// app/api/replay/route.ts
import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { eventId, destinationUrl } = await req.json();

  const { rows } = await db.query(
    'SELECT * FROM events WHERE id = $1',
    [eventId]
  );
  if (!rows.length) return Response.json({ error: 'Event not found' }, { status: 404 });

  const event = rows[0];

  // Build headers: original headers minus hop-by-hop, plus replay marker
  const replayHeaders = { ...event.headers };
  delete replayHeaders['host'];
  delete replayHeaders['content-length'];
  replayHeaders['x-webhook-replay'] = 'true';
  replayHeaders['x-webhook-original-id'] = eventId;

  const start = Date.now();
  const response = await fetch(destinationUrl, {
    method: event.method ?? 'POST',
    headers: replayHeaders,
    body: event.raw_body,
  });
  const duration = Date.now() - start;
  const responseBody = await response.text();

  await db.query(
    `INSERT INTO replays (event_id, destination_url, response_status, response_body, duration_ms)
     VALUES ($1, $2, $3, $4, $5)`,
    [eventId, destinationUrl, response.status, responseBody.slice(0, 10000), duration]
  );

  return Response.json({ status: response.status, body: responseBody, duration });
}
```

---

## Pattern 6 — Auth.js v5 GitHub OAuth

```typescript
// auth.ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import PostgresAdapter from '@auth/pg-adapter';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED });

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [GitHub],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
```

```typescript
// middleware.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url));
  }
});

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

**Auth.js v5 uses the unpooled connection string** for the adapter.
The pooled connection string (`DATABASE_URL`) is for all other queries.

---

## Pattern 7 — Webhook Signature Verification

Run this in the queue consumer after popping from Redis, before inserting to Neon.
Log failures but do not drop the event — dropped events are worse than unverified ones.

```typescript
// lib/verify.ts
import { createHmac, timingSafeEqual } from 'crypto';

export function verifyStripe(payload: string, header: string, secret: string): boolean {
  const timestamp = header.split(',').find(p => p.startsWith('t='))?.slice(2);
  const sig = header.split(',').find(p => p.startsWith('v1='))?.slice(3);
  if (!timestamp || !sig) return false;

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export function verifyGitHub(payload: string, header: string, secret: string): boolean {
  const sig = header.replace('sha1=', '');
  const expected = createHmac('sha1', secret).update(payload).digest('hex');
  return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
}
```

---

## Neon Client Setup

```typescript
// lib/db.ts
import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

export const db = neon(process.env.DATABASE_URL!);
```

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();
```

---

## Common Mistakes to Avoid

- Do not use `@vercel/postgres` — use `@neondatabase/serverless` directly
- Do not use Prisma or Drizzle — raw SQL only in this project
- Do not use `fetch` in the SSE stream without a try/catch — unhandled errors close the stream silently
- Do not store `content-length` or `host` headers in the events table — they change on replay
- Do not use `req.json()` in the ingest route — use `req.text()` to preserve raw body for signature verification
- Do not run migrations with the pooled connection string — use `DATABASE_URL_UNPOOLED`
