# [APP_NAME] — Agent Team

## What We're Building

A real-time webhook ledger and replay engine. Developers swap one URL to point any third-party
service (Stripe, GitHub, Shopify) at [APP_NAME]. Every webhook is captured permanently, visible
live on a dashboard, and replayable with one click — original headers and payload intact.

---

## Locked Stack — No Debates

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js App Router | Full-stack, one repo, API routes |
| Database | Neon Postgres | Serverless Postgres, generous free tier |
| Auth | Auth.js v5 (NextAuth) | Self-hosted, no MAU limits, GitHub OAuth |
| Queue | Upstash Redis | Fast async ingestion buffer, free tier |
| Real-time | SSE — Server-Sent Events | One-directional, no WebSocket infra needed |
| Deployment | Vercel | Free hobby tier, native Next.js support |
| ORM | None — raw SQL via `@neondatabase/serverless` | Fewer abstractions, faster to build |

---

## Non-Negotiables

These rules exist because they caused real architectural pain. Never debate them:

- **Return 200 OK before doing anything.** The ingest route pushes to Redis and returns immediately.
  Processing happens in a separate consumer. Never process synchronously in the ingest route.
- **SSE endpoints use Edge Runtime.** Export `export const runtime = 'edge'` in every SSE route.
  Vercel free tier gives 30s on Edge; the EventSource API auto-reconnects — this is fine.
- **No WebSockets.** Data flows one way (server → client). SSE is the right tool.
- **Never drop headers.** Store raw webhook headers as JSONB. Providers embed signatures,
  event types, and idempotency keys in headers. All of it matters.
- **Store raw body AND parsed body.** `raw_body TEXT` for signature verification,
  `body JSONB` for search and display. Both columns on every event row.
- **No secrets in code.** All credentials via environment variables only.

---

## Team

### Backend Engineer
**Owns:** `app/api/ingest/`, `app/api/process/`, `app/api/replay/`, `lib/db.ts`, `lib/redis.ts`

Core responsibilities:
- Ingest route: accept POST, parse headers + raw body, push to Redis queue, return 200
- Queue consumer: pop from Redis, validate payload, write to Neon events table
- Replay engine: fetch event from Neon, POST to destination with original headers +
  `X-Webhook-Replay: true` header, store response in replays table
- Signature verification: support Stripe (HMAC-SHA256 via `stripe-signature` header)
  and GitHub (HMAC-SHA1 via `x-hub-signature` header)

Key constraint: the ingest route must be stateless and return under 50ms. All heavy work
goes to the queue consumer.

---

### Frontend Engineer
**Owns:** `app/dashboard/`, `components/`, `app/api/events/stream/`

Core responsibilities:
- Event feed: SSE client using `new EventSource('/api/events/stream')` — never fetch polling
- Handle `Last-Event-ID` on reconnect so no events are missed during the 30s edge timeout cycle
- JSON payload viewer with syntax highlighting and collapsible nodes
- Diff viewer between any two selected events (key insight: payload schema changes over time)
- Replay UI: button per event, shows response status + body inline
- All dashboard routes are server components by default; only make client components
  where interactivity requires it

---

### Auth Engineer
**Owns:** `auth.ts`, `middleware.ts`, Auth.js config

Core responsibilities:
- GitHub OAuth only — no email/password, no magic links (developer tool, everyone has GitHub)
- Auth.js v5 with Neon adapter (`@auth/pg-adapter`)
- Middleware protects all `/dashboard/**` routes
- `user_id` from session scopes every database query — never expose other users' projects or events

---

### DevOps
**Owns:** `vercel.json`, `.env.local` template, deployment pipeline

Required environment variables:
```
DATABASE_URL=               # Neon pooled connection string
DATABASE_URL_UNPOOLED=      # Neon direct connection (for migrations)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
AUTH_SECRET=                # openssl rand -base64 32
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
QSTASH_TOKEN=               # Upstash QStash — triggers queue consumer
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
```

---

## File Structure

```
/
├── app/
│   ├── api/
│   │   ├── ingest/[projectId]/
│   │   │   └── route.ts          # POST — webhook receiver
│   │   ├── process/
│   │   │   └── route.ts          # POST — queue consumer (called by QStash)
│   │   ├── events/
│   │   │   └── stream/
│   │   │       └── route.ts      # GET — SSE stream (Edge Runtime)
│   │   └── replay/
│   │       └── route.ts          # POST — replay engine
│   ├── dashboard/
│   │   ├── page.tsx              # Project list
│   │   └── [projectId]/
│   │       └── page.tsx          # Live event feed
│   └── api/auth/[...nextauth]/
│       └── route.ts
├── components/
│   ├── EventFeed.tsx             # 'use client' — SSE subscriber
│   ├── EventViewer.tsx           # JSON payload viewer
│   ├── DiffViewer.tsx            # Side-by-side payload diff
│   └── ReplayButton.tsx          # Replay trigger + response display
├── lib/
│   ├── db.ts                     # Neon client (pooled + direct)
│   ├── redis.ts                  # Upstash Redis client
│   └── verify.ts                 # Webhook signature helpers
├── auth.ts                       # Auth.js v5 config
├── middleware.ts                  # Route protection
└── schema.sql                    # Database schema reference
```

---

## Database Schema

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  destination_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'POST',
  headers JSONB NOT NULL,
  body JSONB,
  raw_body TEXT,
  source_ip TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  destination_url TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  replayed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Critical for SSE polling performance
CREATE INDEX ON events (project_id, received_at DESC);
CREATE INDEX ON events (received_at DESC);
```

---

## Key Patterns — Quick Reference

**Ingest route (always this shape):**
```typescript
export async function POST(req: Request, { params }) {
  const raw = await req.text();
  const headers = Object.fromEntries(req.headers.entries());
  await redis.lpush('webhook-queue', JSON.stringify({ projectId: params.projectId, headers, raw }));
  return Response.json({ received: true }, { status: 200 });
}
```

**SSE stream (always Edge Runtime):**
```typescript
export const runtime = 'edge';
export async function GET(req: Request) {
  const lastId = req.headers.get('last-event-id') ?? '0';
  const stream = new ReadableStream({ /* poll Neon every 2s */ });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
  });
}
```
