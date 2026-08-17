import { authorizeProjectAccess } from '@/lib/services/auth-check';
import * as eventsRepo from '@/lib/repositories/events';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const eventId = url.searchParams.get('eventId');
  if (!eventId) {
    return new Response('Missing eventId', { status: 400 });
  }

  // Fetch the event
  const event = await eventsRepo.findById(eventId);
  if (!event) {
    return new Response('Event not found', { status: 404 });
  }

  // Authorize via unified auth check (session OR CLI token)
  const { authorized } = await authorizeProjectAccess(req, event.project_id);
  if (!authorized) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(event);
}
