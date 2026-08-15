import { enqueueWebhook } from '@/lib/services/ingest';
import { redis } from '@/lib/redis';
import { z } from 'zod';

const uuidSchema = z.string().uuid();
const RATE_LIMIT_PER_MINUTE = 100;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; }>; }
) {
  const { projectId } = await params;

  // Validate projectId is a valid UUID
  const parsed = uuidSchema.safeParse(projectId);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid projectId format' }, { status: 400 });
  }

  // Rate limit by source IP: 100 requests per minute
  const sourceIp = req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    'unknown';
  const rateLimitKey = `ratelimit:ingest:${sourceIp}`;
  try {
    const currentCount = await redis.incr(rateLimitKey);
    if (currentCount === 1) {
      await redis.expire(rateLimitKey, 60);
    }
    if (currentCount > RATE_LIMIT_PER_MINUTE) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
  } catch {
    // Non-fatal: if Redis is down, allow the request through
  }

  // Always read raw body as text
  const raw = await req.text();

  // Collect all headers into a plain object
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Enqueue and return 200 immediately (sourceIp already extracted above for rate limiting)
  await enqueueWebhook(projectId, headers, raw, sourceIp === 'unknown' ? null : sourceIp);

  return Response.json({ received: true }, { status: 200 });
}
