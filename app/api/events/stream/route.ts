import { authorizeProjectAccess } from '@/lib/services/auth-check';
import * as eventsRepo from '@/lib/repositories/events';
import { redis } from '@/lib/redis';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';


const POLL_INTERVAL_MS = 2000;
const INITIAL_BATCH_SIZE = 50;
const PER_POLL_LIMIT = 20;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  if (!projectId) return new Response('Missing projectId', { status: 400 });

  // Unified auth check (session OR CLI token)
  const { authorized, isCliRequest } = await authorizeProjectAccess(req, projectId);
  if (!authorized) {
    return new Response('Unauthorized', { status: 401 });
  }

  const lastEventId = req.headers.get('last-event-id');
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

      send('connected');

      let cursorTimestamp: string | null = null;
      let lastRedisCheck = 0;
      let lastCliStatus: boolean | null = null;

      // Resolve cursor from Last-Event-ID header
      if (lastEventId) {
        cursorTimestamp = await eventsRepo.getReceivedAt(lastEventId);
      }

      // Send initial batch
      if (!cursorTimestamp) {
        const initial = await eventsRepo.findByProject(projectId, {
          limit: INITIAL_BATCH_SIZE,
          order: 'DESC',
        });
        for (const row of initial.reverse()) {
          send(JSON.stringify(row), row.id);
          cursorTimestamp = row.received_at;
        }
      }

      // In local mode, subscribe to Redis Pub/Sub for sub-10ms updates
      if (env.isLocalMode) {
        try {
          subscriber = redis.createSubscriber();
          await subscriber.subscribe(`events:${projectId}`);
          subscriber.on('message', (_channel, message) => {
            try {
              const event = JSON.parse(message);
              if (event && event.id) {
                send(JSON.stringify(event), event.id);
                cursorTimestamp = event.received_at;
              }
            } catch (err) {
              logger.error({ err }, 'stream pubsub parse error');
            }
          });
        } catch (err) {
          logger.error({ err }, 'failed to create redis subscriber');
          subscriber = null;
        }
      }

      // Main loop for CLI heartbeats, status checks, and polling fallback
      while (!req.signal.aborted) {
        try {
          if (isCliRequest) {
            // Set CLI as active for 10 seconds
            await redis.set(`project:${projectId}:cli-active`, 'true', { ex: 10 });
          } else {
            // Browser: check if CLI is active every 6 seconds
            const now = Date.now();
            if (now - lastRedisCheck > 6000) {
              const redisVal = await redis.get(`project:${projectId}:cli-active`);
              const active = redisVal === 'true';
              lastRedisCheck = now;

              if (active !== lastCliStatus) {
                lastCliStatus = active;
                send(JSON.stringify({ type: 'cli-status', active }));
              }
            }
          }

          // Polling check (always active in cloud mode; backup in local mode)
          const rows = await eventsRepo.findByProject(projectId, {
            cursor: cursorTimestamp,
            limit: PER_POLL_LIMIT,
            order: 'ASC',
          });

          for (const row of rows) {
            send(JSON.stringify(row), row.id);
            cursorTimestamp = row.received_at;
          }
        } catch (err) {
          logger.error({ err }, 'stream poll failed');
        }

        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
      }
    },
    cancel() {
      if (subscriber) {
        subscriber.unsubscribe().catch(() => {});
        subscriber.disconnect();
      }
    }
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
