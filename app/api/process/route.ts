import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { env } from '@/lib/env';

interface WebhookPayload {
  projectId: string;
  headers: Record<string, string>;
  raw: string;
  receivedAt: string;
  sourceIp: string | null;
}

// Core processing logic extracted so it can be called directly in dev
async function processNextItem(): Promise<Response> {
  const item = await redis.rpop<WebhookPayload | string>('webhook-queue');

  if (!item) {
    // Queue is empty - normal, return 200
    return Response.json({ ok: true, message: 'Queue empty' });
  }

  // Handle cases where the client automatically deserializes the JSON string
  const payload: WebhookPayload = typeof item === 'string' ? JSON.parse(item) : item;
  const { projectId, headers, raw, receivedAt, sourceIp } = payload;

  const projectRows = await db`
    SELECT id FROM projects WHERE id = ${projectId} LIMIT 1
  `;

  if (projectRows.length === 0) {
    console.warn(`[process] Unknown projectId: ${projectId}`);
    return Response.json({ ok: true, message: 'Unknown project, skipped' });
  }

  // Try to parse raw body as JSON - fall back to null if it is not valid JSON
  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    // Not JSON - raw_body is the source of truth, body column stays null
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

const productionHandler = verifySignatureAppRouter(
  async () => processNextItem()
);

export async function POST(req: Request) {
  if (env.isDev) {
    // Skip signature verification in dev
    return processNextItem();
  }
  return productionHandler(req);
}
