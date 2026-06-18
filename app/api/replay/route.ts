import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { eventId, destinationUrl } = await req.json();
  if (!eventId || !destinationUrl) {
    return Response.json({ error: 'Missing eventId or destinationUrl' }, { status: 400 });
  }

  // Fetch the original event using Neon's template literal syntax
  const rows = await db`
    SELECT id, project_id, method, headers, raw_body FROM events WHERE id = ${eventId} LIMIT 1
  `;
  if (rows.length === 0) {
    return Response.json({ error: 'Event not found' }, { status: 404 });
  }
  const event = rows[0];

  // Verify the event belongs to a project owned by this user
  const projectRows = await db`
    SELECT id FROM projects WHERE id = ${event.project_id} AND user_id = ${session.user.id} LIMIT 1
  `;
  if (projectRows.length === 0) {
    return Response.json({ error: 'Unauthorized: Project not owned by user' }, { status: 403 });
  }

  // Build replay headers (exclude host and content-length)
  const replayHeaders: Record<string, string> = { ...event.headers };
  delete replayHeaders['host'];
  delete replayHeaders['content-length'];
  replayHeaders['x-webhook-replay'] = 'true';
  replayHeaders['x-webhook-original-id'] = eventId;

  const start = Date.now();
  let responseStatus: number;
  let responseBody: string;

  try {
    const response = await fetch(destinationUrl, {
      method: event.method ?? 'POST',
      headers: replayHeaders,
      body: event.raw_body,
    });
    responseStatus = response.status;
    responseBody = await response.text();
  } catch (err: unknown) {
    responseStatus = 500;
    responseBody = err instanceof Error ? err.message : String(err);
  }
  const duration = Date.now() - start;

  // Insert the replay record
  await db`
    INSERT INTO replays (event_id, destination_url, response_status, response_body, duration_ms)
    VALUES (${eventId}, ${destinationUrl}, ${responseStatus}, ${responseBody.slice(0, 10000)}, ${duration})
  `;

  return Response.json({ status: responseStatus, body: responseBody, duration });
}
