import { db } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  const results: Record<string, string> = {};

  try {
    await db`SELECT 1`;
    results.neon = 'ok';
  } catch (err) {
    results.neon = `error: ${String(err)}`;
  }

  try {
    await redis.ping();
    results.redis = 'ok';
  } catch (err) {
    results.redis = `error: ${String(err)}`;
  }

  const healthy = Object.values(results).every(v => v === 'ok');
  return Response.json(results, { status: healthy ? 200 : 500 });
}
