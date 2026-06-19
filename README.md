# Latch | Real-time Webhook Ledger & Replay Engine

**Latch** is a developer-focused, real-time webhook ledger and replay utility. By swapping a third-party service's endpoint URL (e.g. Stripe, GitHub, Shopify) to point at Latch, developers can capture incoming events permanently, inspect payload states live, verify cryptographic signatures, and replay transactions with a single click, keeping the original headers and body structure completely intact.

---

## Features

- **Async Ingestion**: Queues payloads and responds in under 50ms.
- **Header Preservation**: Stores exact headers and raw text for signatures.
- **Live Feed**: Streams events real-time using Server-Sent Events.
- **Local CLI Tunnel**: Outbound proxy tunneling without needing ngrok.
- **Interactive Viewer**: Collapsible JSON tree with one-click path copying.
- **Payload Diffing**: Side-by-side structural comparison of any two events.
- **JSONB Search**: Fast substring and deep JSON path querying.
- **Single-Click Replay**: Re-dispatch webhooks with original intact payloads.
- **Developer Auth**: Secure dashboard access via GitHub OAuth.

---

## Locked Tech Stack

| Layer             | Technology                                 | Purpose                                            |
| :---------------- | :----------------------------------------- | :------------------------------------------------- |
| **Framework**     | Next.js 16 (App Router, TypeScript)        | Full-stack architecture, Turbopack, Server Actions |
| **Database**      | Neon Postgres (`@neondatabase/serverless`) | Fast serverless PostgreSQL                         |
| **Queue**         | Upstash Redis (`@upstash/redis`)           | Async stateless buffer queue                       |
| **Queue Trigger** | Upstash QStash (`@upstash/qstash`)         | Serverless consumer trigger callbacks              |
| **Auth**          | Auth.js v5 + Neon Adapter                  | Developer logins and project isolation             |
| **Styling**       | Tailwind CSS v4                            | Sleek, glassmorphic dark-mode aesthetics           |
| **ORM**           | Raw SQL Queries                            | Speed, simplicity, and query execution efficiency  |

---

## Getting Started

### 1. Requirements & Dependencies

First, ensure you have dependencies installed:

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and add your database and Redis credentials:

```env
# Neon Postgres Connection Strings
DATABASE_URL=postgres://...neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgres://...neon.tech/neondb?sslmode=require

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Upstash QStash
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=sig_...
QSTASH_NEXT_SIGNING_KEY=sig_...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth.js (GitHub provider)
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

### 3. Run Database Migrations

Deploy the tables (`projects`, `events`, `replays`) and GIN indexes onto your Neon database using the unpooled direct connection string:

```bash
pnpm dlx tsx --env-file=.env.local scripts/migrate.ts
```

### 4. Run the Development Server

Start the Next.js local server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to inspect the application.

### 5. Validate Connections

Verify that your database and cache services are connected properly by making a request to the health-check route:

```bash
curl http://localhost:3000/api/health
```

A successful connection should return status `200 OK` with:

```json
{
  "neon": "ok",
  "redis": "ok"
}
```

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── health/route.ts       # GET - Neon + Redis live health status
│   │   ├── ingest/[projectId]/   # POST - Receives webhooks & enqueues to Redis
│   │   ├── process/route.ts      # POST - Queue consumer (triggered by QStash)
│   │   ├── events/stream/        # GET - Real-time event stream (SSE Edge route)
│   │   ├── events/search/        # GET - GIN-indexed Postgres search query router
│   │   └── replay/route.ts       # POST - Forwards captured events to destinations
│   └── dashboard/                # Project views & live event logs
│       ├── page.tsx              # Project list & creation
│       └── [projectId]/
│           └── page.tsx          # Real-time dashboard stream & filter hub
├── components/                   # Real-time event feeds and interactive widgets
│   ├── JsonTree.tsx              # Collapsible key-path interactive tree
│   ├── DiffViewer.tsx            # Comparative diff highlighting engine
│   ├── SearchBar.tsx             # Debounced query filter field
│   ├── ConfirmationModal.tsx     # Portaled viewport modal overlay
│   ├── ProfileDropdown.tsx       # User session drawer & logout handler
│   ├── Navbar.tsx                # Universal dark header layout
│   └── DeleteProjectButton.tsx   # Danger-zone deletion trigger
├── lib/
│   ├── db.ts                     # Neon serverless client setup
│   ├── redis.ts                  # Upstash Redis client setup
│   ├── verify.ts                 # Crypto signature verification (Stripe / GitHub)
│   └── schema.sql                # SQL database table and index structures
├── proxy.ts                      # Route protection middleware
└── scripts/
    └── migrate.ts                # DDL database schema runner
```
