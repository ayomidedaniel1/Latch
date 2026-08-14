# Latch | Real-time Webhook Ledger & Replay Engine

**Latch** is a developer-focused, real-time webhook ledger and replay utility. By swapping a third-party service's endpoint URL (e.g. Stripe, GitHub, Shopify) to point at Latch, developers can capture incoming events permanently, inspect payload states live, verify cryptographic signatures, and replay transactions with a single click, keeping the original headers and body structure completely intact.

---

## Features

- **Async Ingestion**: Queues payloads and responds in under 50ms.
- **Header Preservation**: Stores exact headers and raw text for signatures.
- **Live Feed**: Streams events real-time using Server-Sent Events.
- **Built-in Tunnel**: Forward webhooks to localhost without ngrok or Cloudflare.
- **Interactive Viewer**: Collapsible JSON tree with one-click path copying.
- **Payload Diffing**: Side-by-side structural comparison of any two events.
- **JSONB Search**: Fast substring and deep JSON path querying.
- **Single-Click Replay**: Re-dispatch webhooks with original intact payloads.
- **Developer Auth**: Secure dashboard access via GitHub OAuth.

---

## Tech Stack

| Layer             | Technology                                 | Purpose                                            |
| :---------------- | :----------------------------------------- | :------------------------------------------------- |
| **Framework**     | Next.js 16 (App Router, TypeScript)        | Full-stack architecture, Turbopack, Server Actions |
| **Database**      | PostgreSQL (`pg`)                          | Native TCP connection pool                         |
| **Queue**         | Redis (`ioredis`)                          | BLPOP-based async ingestion queue                  |
| **Real-time**     | Redis Pub/Sub + SSE                        | Sub-10ms event delivery to dashboard and CLI       |
| **Auth**          | Auth.js v5 + PostgreSQL Adapter            | Developer logins and project isolation             |
| **Tunnel**        | Built-in Latch Tunnel Relay                | SSE-based webhook forwarding to localhost          |
| **Styling**       | Tailwind CSS v4                            | Sleek, glassmorphic dark-mode aesthetics           |
| **ORM**           | Raw SQL Queries                            | Speed, simplicity, and query execution efficiency  |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** running locally (default: `localhost:5432`)
- **Redis** running locally (default: `localhost:6379`)
- **GitHub OAuth App** (for authentication)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

```env
# Local PostgreSQL connection string
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/latch

# Local Redis connection string
REDIS_URL=redis://localhost:6379

# App URL (your local dev server)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth.js secret (generate with: openssl rand -base64 32)
AUTH_SECRET=

# GitHub OAuth App credentials
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

> **GitHub OAuth App**: Create one at [github.com/settings/developers](https://github.com/settings/developers). Set the callback URL to `http://localhost:3000/api/auth/callback/github`.

### 3. Run Database Migrations

Create the `projects`, `events`, `replays` tables and indexes:

```bash
pnpm migrate
```

### 4. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

### 5. Start the Queue Worker

In a **separate terminal**, start the background queue consumer:

```bash
pnpm worker
```

The worker uses Redis `BLPOP` to process incoming webhooks from the queue and persist them to PostgreSQL.

### 6. Validate Connections

Verify your database and Redis are connected:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "postgres": "ok",
  "redis": "ok"
}
```

---

## Usage Guide

### 1. Create a Project
- Sign in at your deployed URL with GitHub.
- Click **"Create New Project"**, enter a name, and specify your optional local destination URL.
- Latch will instantly generate your unique Ingest URL: `https://<your-domain>/api/ingest/<projectId>`.

### 2. Configure Your Webhook Provider
- Copy your unique Ingest URL from the dashboard.
- Paste it into your provider's webhook settings:
  - **Stripe:** Developers &rarr; Webhooks &rarr; Add endpoint
  - **GitHub:** Repository &rarr; Settings &rarr; Webhooks &rarr; Add webhook
  - **Shopify:** Settings &rarr; Notifications &rarr; Webhooks &rarr; Create webhook

### 3. Forward Webhooks Locally with the CLI

Use the **built-in tunnel** to forward webhooks directly to your local dev server:

```bash
npx @ayomidedaniel/latch-cli tunnel <projectId> \
  --forward-to http://localhost:3000/api/webhook \
  --token <your-cli-token>
```

Or use **listen mode** to subscribe to the event stream:

```bash
npx @ayomidedaniel/latch-cli listen <projectId> \
  --forward-to http://localhost:3000/api/webhook \
  --token <your-cli-token>
```

Copy the full command (with your project ID and token pre-filled) directly from the project dashboard.

### 4. Inspect & Replay
- Incoming events stream onto the dashboard in real-time.
- Expand any event to inspect its payload using the interactive JSON tree viewer.
- Select any two events to compare their payload schemas side-by-side with visual Git-style differences.
- Click **"Replay"** on any event to re-dispatch the webhook to your destination URL with original headers and payload intact.

---

## Project Structure

```text
├── app/
│   ├── api/          # Webhook ingestion, streaming, replay, tunnel, and health check
│   ├── dashboard/    # Frontend UI for webhook inspection and project management
│   └── docs/         # Documentation page
├── cli/              # The Latch Node.js CLI (tunnel + listen + replay commands)
├── components/       # Reusable React components (JSON tree, diff viewer, feeds)
├── lib/
│   ├── repositories/ # Raw SQL query layer (projects, events, replays)
│   ├── services/     # Business logic layer (ingest, processor, replay, auth-check)
│   ├── db-local.ts   # PostgreSQL connection pool (pg)
│   ├── redis-local.ts# Redis client with pub/sub support (ioredis)
│   └── worker.ts     # BLPOP queue consumer process
├── proxy.ts          # Route protection middleware (Auth.js)
└── scripts/          # Database migration tools
```
