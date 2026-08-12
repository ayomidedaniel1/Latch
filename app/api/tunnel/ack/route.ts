import { authorizeProjectAccess } from '@/lib/services/auth-check';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, projectId, status, durationMs } = body;

    if (!projectId || !eventId) {
      return Response.json({ error: 'Missing projectId or eventId' }, { status: 400 });
    }

    const { authorized } = await authorizeProjectAccess(req, projectId);
    if (!authorized) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Record last tunnel execution stats in Redis for dashboard status UI
    const ackData = {
      eventId,
      status: status ?? 200,
      durationMs: durationMs ?? 0,
      timestamp: new Date().toISOString(),
    };

    await redis.set(
      `project:${projectId}:last-tunnel-ack`,
      JSON.stringify(ackData),
      { ex: 86400 } // Keep for 24 hours
    );

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[tunnel/ack] Error processing tunnel acknowledgment:', err);
    return Response.json({ error: 'Failed to process acknowledgment' }, { status: 500 });
  }
}
