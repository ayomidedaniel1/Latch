import { db } from '@/lib/db';
import { auth } from '@/auth';
import { redis } from '@/lib/redis';

export const runtime = 'edge';

const POLL_INTERVAL_MS = 2000;
const INITIAL_BATCH_SIZE = 50;
const PER_POLL_LIMIT = 20;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  if (!projectId) return new Response('Missing projectId', { status: 400 });

  let authorized = false;

  const session = await auth();
  if (session?.user?.id) {
    const projectRows = await db`
      SELECT id FROM projects WHERE id = ${projectId} AND user_id = ${session.user.id} LIMIT 1
    `;
    if (projectRows.length > 0) {
      authorized = true;
    }
  } else {
    // Check Authorization: Bearer <cli_token> for Latch CLI
    const authHeader = req.headers.get('authorization');
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

    if (!token) {
      token = url.searchParams.get('token');
    }

    if (token) {
      const projectRows = await db`
        SELECT id FROM projects WHERE id = ${projectId} AND cli_token = ${token} LIMIT 1
      `;
      if (projectRows.length > 0) {
        authorized = true;
      }
    }
  }

  if (!authorized) {
    return new Response('Unauthorized', { status: 401 });
  }

  const isCliRequest = !session?.user?.id;
  const lastEventId = req.headers.get('last-event-id');
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string, id?: string) => {
        const msg = id ? `id: ${id}\ndata: ${data}\n\n` : `data: ${data}\n\n`;
        controller.enqueue(encoder.encode(msg));
      };

      send('connected');

      let cursorTimestamp: string | null = null;
      let lastRedisCheck = 0;
      let lastCliStatus: boolean | null = null;

      if (lastEventId) {
        const rows = await db`
          SELECT received_at FROM events WHERE id = ${lastEventId} LIMIT 1
        `;
        cursorTimestamp = rows[0]?.received_at ?? null;
      }

      if (!cursorTimestamp) {
        const initial = await db`
          SELECT id, method, headers, body, raw_body, received_at
          FROM events
          WHERE project_id = ${projectId}
          ORDER BY received_at DESC
          LIMIT ${INITIAL_BATCH_SIZE}
        `;
        for (const row of initial.reverse()) {
          send(JSON.stringify(row), row.id);
          cursorTimestamp = row.received_at;
        }
      }

      while (true) {
        try {
          if (isCliRequest) {
            // set CLI as active for 10 seconds
            await redis.set(`project:${projectId}:cli-active`, 'true', { ex: 10 });
          } else {
            // Browser: check if CLI is active every 6 seconds
            const now = Date.now();
            if (now - lastRedisCheck > 6000) {
              const redisVal = await redis.get(`project:${projectId}:cli-active`);
              const active = redisVal === 'true' || redisVal === true;
              lastRedisCheck = now;

              if (active !== lastCliStatus) {
                lastCliStatus = active;
                send(JSON.stringify({ type: 'cli-status', active }));
              }
            }
          }

          const rows = cursorTimestamp
            ? await db`
                SELECT id, method, headers, body, raw_body, received_at
                FROM events
                WHERE project_id = ${projectId} AND received_at > ${cursorTimestamp}
                ORDER BY received_at ASC
                LIMIT ${PER_POLL_LIMIT}
              `
            : await db`
                SELECT id, method, headers, body, raw_body, received_at
                FROM events
                WHERE project_id = ${projectId}
                ORDER BY received_at ASC
                LIMIT ${PER_POLL_LIMIT}
              `;

          for (const row of rows) {
            send(JSON.stringify(row), row.id);
            cursorTimestamp = row.received_at;
          }
        } catch (err) {
          console.error('[stream] poll failed', err);
        }

        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
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
