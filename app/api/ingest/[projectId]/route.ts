import { redis } from '@/lib/redis';
import { Client } from '@upstash/qstash';
import { env } from '@/lib/env';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; }>; }
) {
  const { projectId } = await params;

  // Always read raw body as text
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

  // Push to Redis queue
  await redis.lpush('webhook-queue', JSON.stringify(payload));

  // Return 200 immediately — payload is safely in Redis, never block on downstream calls
  const response = Response.json({ received: true }, { status: 200 });

  // Trigger the consumer (fire-and-forget — never await, never crash the ingest)
  if (env.isDev) {
    fetch(`${env.appUrl}/api/process`, { method: 'POST' }).catch(() => { });
  } else {
    const qstash = new Client({
      token: env.qstashToken,
      baseUrl: env.qstashUrl,
    });
    qstash.publish({
      url: `${env.appUrl}/api/process`,
      body: JSON.stringify({ source: 'ingest' }),
    }).catch((err) => {
      console.error('[ingest] QStash publish failed (payload is safe in Redis):', err);
    });
  }

  return response;
}
