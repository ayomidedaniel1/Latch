# Latch — Project Brief

Read this file at the start of every session. It defines what we are building,
why it exists, and every decision already made. Do not re-open these questions.

---

## What Latch is

Latch is a real-time webhook ledger and replay engine. Developers point any
third-party service — Stripe, GitHub, Shopify, Twilio — at a Latch endpoint
instead of directly at their application. Every webhook that arrives is captured
permanently, shown live on a dashboard, and replayable with one click to any
destination, with the original headers and payload preserved exactly.

One-line pitch: **every webhook your app ever receives, visible, searchable,
and replayable — for free.**

---

## The problem

When a Stripe payment succeeds, a GitHub commit lands, or a Shopify order ships,
a webhook fires a POST request at your server. If your server is down, slow,
or returning errors at that moment — the event is gone forever. The payment is
marked successful at Stripe but your database was never told. The order shipped
but your fulfilment system missed it. There is no retry mechanism, no record of
what arrived, and no way to recover without going back to the provider and hoping
they have a manual resend option.

During local development the problem compounds further. Without a tunnel tool
running constantly, webhooks cannot reach localhost at all. Every provider signs
payloads differently, formats headers differently, and has slightly different
retry behaviour. There is no single place to inspect what is coming in.

The failure mode is always silent. No alert fires. No error is thrown. The user
discovers the broken state before the developer does.

---

## Who this is built for

**Primary:** Solo founders and developers building payment or sync integrations.
People using Stripe, GitHub webhooks, or Shopify — the most common sources of
"why is my user's account broken?" incidents.

**Secondary:** Small engineering teams (2–6 developers) who need shared visibility
into what webhooks their production systems are receiving.

**Tertiary:** Developers building in public who want real infrastructure stories
to share — this project is itself built in public using the same philosophy.

---

## Why existing tools fall short

| Tool | The gap |
|---|---|
| webhook.site | Ephemeral inspection bins — events expire, no replay, no production use |
| ngrok | Solves local tunnelling only, not a production ledger, no replay |
| Hookdeck | Closest competitor — but $75/month, complex routing config, built for large teams |
| EventDock | Fast delivery acknowledgment — but no inspection, diff, or replay |
| RequestBin | Ephemeral, shut down original, now folded into Pipedream |

Most teams currently use two or three tools across different stages — ngrok for
local dev, webhook.site for quick inspection, and Hookdeck for production.
Latch replaces all three with one URL and one dashboard.

---

## Core features (in build order)

### 1. Webhook ingestion (Day 1 — COMPLETE)
A public endpoint at `/api/ingest/[projectId]` accepts POST requests from any
provider. It returns 200 OK in under 50ms regardless of payload size. The payload
is buffered to Redis and processed asynchronously so no webhook is ever held up
by a slow database write.

### 2. Live dashboard (Day 2)
A real-time event feed built on Server-Sent Events. The browser opens an
EventSource connection to `/api/events/stream`. As webhooks land, they stream
to the dashboard in real time without page refresh. Each event shows the source,
timestamp, HTTP method, and a JSON viewer for the full payload.

### 3. Replay engine (Day 3)
One-click replay of any stored event. The original headers and raw body are
forwarded to any configurable destination URL with an extra
`X-Webhook-Replay: true` header added. The response — status code, body,
and latency — is stored in the `replays` table and shown inline.

### 4. Authentication (Day 3)
GitHub OAuth via Auth.js v5. This is a developer tool — everyone in the target
audience has a GitHub account, so there is no password or email flow.
Sessions are stored in Neon using the pg adapter.

---

## Architecture (locked — do not reopen)

### Stack decisions

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript | Full-stack in one repo, Edge Runtime support |
| Database | Neon Postgres via `@neondatabase/serverless` | Generous free tier, serverless-native |
| Queue | Upstash Redis | Fast async buffer, 10k commands/day free |
| Queue trigger | Upstash QStash | Calls `/api/process` after each ingest |
| Auth | Auth.js v5 (NextAuth beta) + GitHub OAuth | Self-hosted, no MAU limits |
| Real-time | Server-Sent Events (SSE) | One-directional data flow, no WS infra needed |
| Deployment | Vercel free hobby tier | Native Next.js, Edge Runtime, zero config |
| ORM | None — raw SQL only | Fewer abstractions, faster to build and debug |

### Non-negotiable rules

**Rule 1 — Return 200 before processing.**
The ingest route pushes to Redis and returns immediately. It never writes to
the database. Processing happens in the queue consumer, triggered async.
Stripe and GitHub retry on non-200 responses. Breaking this rule causes
duplicate events and broken user state.

**Rule 2 — Never call req.json() in the ingest route.**
Always use req.text(). The raw body string is what providers sign against when
computing HMAC signatures. Calling .json() consumes the stream and makes
signature verification impossible.

**Rule 3 — SSE endpoints always use Edge Runtime.**
Export `export const runtime = 'edge'` in every SSE route file. Vercel free
tier gives 30 seconds on Edge functions. EventSource reconnects automatically
via Last-Event-ID when the connection closes — this is expected behaviour,
not a bug.

**Rule 4 — No WebSockets.**
Data flows one direction on the dashboard: server to client. SSE is the
correct tool. Do not introduce WebSocket infrastructure.

**Rule 5 — Store raw body AND parsed body.**
Every event row has both `raw_body TEXT` (for signature verification) and
`body JSONB` (for display and search). If JSON parsing fails, body is null —
the raw_body is always the source of truth.

**Rule 6 — Auth is always last.**
Build features fully before adding authentication. Auth failures create
debugging rabbit holes that kill momentum. Middleware is added on Day 3
after all features work.

**Rule 7 — DATABASE_URL_UNPOOLED for migrations only.**
Scripts that run outside of Next.js (migrations, seeds) must use the direct
connection string. All runtime queries use the pooled DATABASE_URL.

---

## Database schema

```sql
-- A project is a named webhook endpoint the user creates
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  destination_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- An event is a single captured webhook payload
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'POST',
  headers JSONB NOT NULL,
  body JSONB,           -- null if payload was not valid JSON
  raw_body TEXT,        -- always populated, used for signature verification
  source_ip TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- A replay is a forwarding attempt of a stored event
CREATE TABLE replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  destination_url TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  replayed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON events(project_id, received_at DESC);
CREATE INDEX ON events(received_at DESC);
```

---

## File structure

```
latch/
├── app/
│   ├── api/
│   │   ├── ingest/[projectId]/route.ts   ← webhook receiver (DONE)
│   │   ├── process/route.ts              ← queue consumer (DONE)
│   │   ├── events/stream/route.ts        ← SSE stream (Day 2)
│   │   ├── replay/route.ts              ← replay engine (Day 3)
│   │   ├── health/route.ts              ← connection check (DONE)
│   │   └── auth/[...nextauth]/route.ts  ← Auth.js handler (Day 3)
│   └── dashboard/
│       ├── page.tsx                      ← project list (Day 2)
│       └── [projectId]/page.tsx          ← event feed (Day 2)
├── components/
│   ├── EventFeed.tsx                     ← SSE client (Day 2)
│   ├── EventViewer.tsx                   ← JSON viewer (Day 2)
│   └── ReplayButton.tsx                  ← replay trigger (Day 3)
├── lib/
│   ├── db.ts                             ← Neon client (DONE)
│   ├── redis.ts                          ← Upstash client (DONE)
│   ├── verify.ts                         ← Stripe/GitHub HMAC (DONE)
│   └── schema.sql                        ← reference schema (DONE)
├── scripts/
│   ├── migrate.ts                        ← schema runner (DONE)
│   └── seed.ts                           ← test data (DONE)
├── auth.ts                               ← Auth.js config (Day 3)
└── middleware.ts                         ← route protection (Day 3)
```

---

## Build philosophy

This is built antigravity — no unnecessary architecture, no premature abstraction,
no tooling that does not directly serve the product. The goal is a working,
deployed product in three days of active building using an AI agent.

Every session prompt tells the agent exactly which files to create, the exact
patterns to use, and — critically — what not to build yet. Features are built
in dependency order: ingestion before UI, UI before auth, all features before
deployment.

This project is also built in public. Every architectural trade-off, every
latency benchmark, and every debugging story is shared as content. The build
is the portfolio.

---

## Environment variables

```
DATABASE_URL=                     # Neon pooled — all runtime queries
DATABASE_URL_UNPOOLED=            # Neon direct — migrations and seed scripts only
UPSTASH_REDIS_REST_URL=           # Upstash Redis REST endpoint
UPSTASH_REDIS_REST_TOKEN=         # Upstash Redis token
QSTASH_TOKEN=                     # QStash publish token
QSTASH_CURRENT_SIGNING_KEY=       # QStash request verification
QSTASH_NEXT_SIGNING_KEY=          # QStash request verification (rotation)
NEXT_PUBLIC_APP_URL=              # Full app URL (http://localhost:3000 in dev)
AUTH_SECRET=                      # openssl rand -base64 32
AUTH_GITHUB_ID=                   # GitHub OAuth App client ID
AUTH_GITHUB_SECRET=               # GitHub OAuth App client secret
```
