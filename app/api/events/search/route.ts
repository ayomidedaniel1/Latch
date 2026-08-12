import { requireSession } from '@/lib/services/auth-check';
import * as projectsRepo from '@/lib/repositories/projects';
import * as eventsRepo from '@/lib/repositories/events';

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  if (!projectId) {
    return new Response('Missing projectId', { status: 400 });
  }

  const query = url.searchParams.get('q') || '';
  if (query.length > 500) {
    return Response.json({ error: 'Query too long (max 500 chars)' }, { status: 400 });
  }

  // Verify the project belongs to the user
  const project = await projectsRepo.verifyOwnership(projectId, session.userId);
  if (!project) {
    return new Response('Unauthorized', { status: 401 });
  }

  const rows = await eventsRepo.search(projectId, query);
  return Response.json(rows);
}
