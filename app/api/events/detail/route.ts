import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const eventId = url.searchParams.get('eventId');
  if (!eventId) {
    return new Response('Missing eventId', { status: 400 });
  }

  // Fetch the event
  const eventRows = await db`
    SELECT id, project_id, method, headers, body, raw_body, received_at 
    FROM events 
    WHERE id = ${eventId} 
    LIMIT 1
  `;
  if (eventRows.length === 0) {
    return new Response('Event not found', { status: 404 });
  }
  const event = eventRows[0];

  let authorized = false;

  // 1. Authenticate via NextAuth User Session (for browser clients if needed)
  const session = await auth();
  if (session?.user?.id) {
    const projectRows = await db`
      SELECT id FROM projects WHERE id = ${event.project_id} AND user_id = ${session.user.id} LIMIT 1
    `;
    if (projectRows.length > 0) {
      authorized = true;
    }
  }

  // 2. Authenticate via Project CLI Token (for CLI client calls)
  if (!authorized) {
    const authHeader = req.headers.get('authorization');
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

    if (!token) {
      token = url.searchParams.get('token');
    }

    if (token) {
      const projectRows = await db`
        SELECT id FROM projects WHERE id = ${event.project_id} AND cli_token = ${token} LIMIT 1
      `;
      if (projectRows.length > 0) {
        authorized = true;
      }
    }
  }

  if (!authorized) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(event);
}
