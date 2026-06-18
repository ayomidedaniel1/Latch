import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');
  if (!projectId) {
    return new Response('Missing projectId', { status: 400 });
  }

  const query = url.searchParams.get('q') || '';

  // Verify the project belongs to the user
  const projectRows = await db`
    SELECT id FROM projects WHERE id = ${projectId} AND user_id = ${session.user.id} LIMIT 1
  `;
  if (projectRows.length === 0) {
    return new Response('Unauthorized', { status: 401 });
  }

  const matchPattern = `%${query}%`;
  const isKeyPath = /^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*$/.test(query);

  let rows;
  if (isKeyPath && query.length > 0) {
    const jsonPath = `$.${query}`;
    rows = await db`
      SELECT id, method, headers, body, raw_body, received_at
      FROM events
      WHERE project_id = ${projectId}
        AND (
          body::text ILIKE ${matchPattern}
          OR headers::text ILIKE ${matchPattern}
          OR raw_body ILIKE ${matchPattern}
          OR (body IS NOT NULL AND jsonb_path_exists(body, ${jsonPath}))
        )
      ORDER BY received_at DESC
      LIMIT 50
    `;
  } else {
    rows = await db`
      SELECT id, method, headers, body, raw_body, received_at
      FROM events
      WHERE project_id = ${projectId}
        AND (
          body::text ILIKE ${matchPattern}
          OR headers::text ILIKE ${matchPattern}
          OR raw_body ILIKE ${matchPattern}
        )
      ORDER BY received_at DESC
      LIMIT 50
    `;
  }

  return Response.json(rows);
}
