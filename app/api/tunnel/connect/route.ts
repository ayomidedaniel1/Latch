import { authorizeProjectAccess } from '@/lib/services/auth-check';
import { redis } from '@/lib/redis';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';


const MAX_CONNECTIONS_PER_PROJECT = 3;
const RATE_LIMIT_EVENTS_PER_MIN = 100;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  if (!projectId) return new Response('Missing projectId', { status: 400 });

  // Authenticate using CLI Token or session
  const { authorized } = await authorizeProjectAccess(req, projectId);
  if (!authorized) {
    return new Response('Unauthorized - invalid CLI token or session', { status: 401 });
  }

  // Connection limits check
  const activeConnKey = `tunnel:${projectId}:active-connections`;
  const connId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    const currentConnCount = await redis.scard(activeConnKey);
    if (currentConnCount >= MAX_CONNECTIONS_PER_PROJECT) {
      return new Response(
        `Rate limit exceeded: Maximum ${MAX_CONNECTIONS_PER_PROJECT} active tunnel connections allowed per project.`,
        { status: 429 }
      );
    }
    await redis.sadd(activeConnKey, connId);
    await redis.expire(activeConnKey, 60);
  } catch (err) {
    logger.error({ err, projectId }, 'tunnel connection limits check error');
  }

  const encoder = new TextEncoder();

  // Hoisted to outer scope so cancel() can clean up
  let subscriber: ReturnType<typeof redis.createSubscriber> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string, id?: string) => {
        try {
          const msg = id ? `id: ${id}\ndata: ${data}\n\n` : `data: ${data}\n\n`;
          controller.enqueue(encoder.encode(msg));
        } catch {
          // Controller might be closed
        }
      };

      send(JSON.stringify({ type: 'status', message: 'Tunnel connected successfully', connId }));

      // Keepalive & heartbeat loop
      let eventCountThisMinute = 0;
      let lastMinuteReset = Date.now();

      // If local mode, we can subscribe via Redis pubsub or poll tunnel queue
      if (env.isLocalMode) {
        try {
          subscriber = redis.createSubscriber();
          await subscriber.subscribe(`tunnel:${projectId}`);
          subscriber.on('message', (_channel, message) => {
            const now = Date.now();
            if (now - lastMinuteReset > 60000) {
              eventCountThisMinute = 0;
              lastMinuteReset = now;
            }

            if (eventCountThisMinute >= RATE_LIMIT_EVENTS_PER_MIN) {
              send(JSON.stringify({ type: 'warning', message: 'Rate limit exceeded (100 events/min max)' }));
              return;
            }

            eventCountThisMinute++;
            send(message);
          });
        } catch (err) {
          logger.error({ err, projectId }, 'tunnel subscriber error');
          subscriber = null;
        }
      }

      // Heartbeat loop for CLI connection tracking
      while (!req.signal.aborted) {
        try {
          // Touch connection key so active connection doesn't expire
          await redis.set(`project:${projectId}:cli-active`, 'true', { ex: 15 });
          await redis.expire(activeConnKey, 60);

          send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        } catch (err) {
          logger.error({ err, projectId }, 'tunnel heartbeat error');
        }

        await new Promise((r) => setTimeout(r, 5000));
      }
    },
    async cancel() {
      try {
        await redis.srem(activeConnKey, connId);
      } catch {
        // Ignored on cleanup
      }
      if (subscriber) {
        subscriber.unsubscribe().catch(() => {});
        subscriber.disconnect();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive',
    },
  });
}
