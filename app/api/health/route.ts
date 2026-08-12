import { db } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  const results: Record<string, string> = {};

  try {
    await db`SELECT 1`;
    results.postgres = 'ok';
  } catch {
    results.postgres = 'error';
  }

  try {
    await redis.ping();
    results.redis = 'ok';
  } catch {
    results.redis = 'error';
  }

  const healthy = Object.values(results).every(v => v === 'ok');
  return Response.json(results, { status: healthy ? 200 : 503 });
}
