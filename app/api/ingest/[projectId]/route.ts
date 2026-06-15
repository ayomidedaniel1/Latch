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
