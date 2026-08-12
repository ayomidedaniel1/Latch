import { db } from '@/lib/db';

// ─── Queries ──────────────────────────────────────────────────────

export async function findByProject(
  projectId: string,
  options: {
    cursor?: string | null;
    limit?: number;
    order?: 'ASC' | 'DESC';
  } = {},
) {
  const { cursor = null, limit = 50, order = 'DESC' } = options;

  if (cursor) {
    if (order === 'ASC') {
      return db`
        SELECT id, method, headers, body, raw_body, received_at
        FROM events
        WHERE project_id = ${projectId} AND received_at > ${cursor}
        ORDER BY received_at ASC
        LIMIT ${limit}
      `;
    }
    return db`
      SELECT id, method, headers, body, raw_body, received_at
      FROM events
      WHERE project_id = ${projectId} AND received_at < ${cursor}
      ORDER BY received_at DESC
      LIMIT ${limit}
    `;
  }

  if (order === 'ASC') {
    return db`
      SELECT id, method, headers, body, raw_body, received_at
      FROM events
      WHERE project_id = ${projectId}
      ORDER BY received_at ASC
      LIMIT ${limit}
    `;
  }

  return db`
    SELECT id, method, headers, body, raw_body, received_at
    FROM events
    WHERE project_id = ${projectId}
    ORDER BY received_at DESC
    LIMIT ${limit}
  `;
}

export async function findById(eventId: string) {
  const rows = await db`
    SELECT id, project_id, method, headers, body, raw_body, received_at
    FROM events
    WHERE id = ${eventId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/**
 * Fetch the full event row with project_id for replay use.
 */
export async function findForReplay(eventId: string) {
  const rows = await db`
    SELECT id, project_id, method, headers, raw_body
    FROM events
    WHERE id = ${eventId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/**
 * Get the received_at timestamp for a given event ID.
 * Used by SSE stream for cursor resolution from Last-Event-ID.
 */
export async function getReceivedAt(eventId: string): Promise<string | null> {
  const rows = await db`
    SELECT received_at FROM events WHERE id = ${eventId} LIMIT 1
  `;
  return rows[0]?.received_at ?? null;
}

/**
 * Search events by text pattern across body, headers, and raw_body.
 * Supports JSON key-path matching when the query looks like a dot-separated path.
 */
export async function search(projectId: string, query: string) {
  const matchPattern = `%${query}%`;
  const isKeyPath = /^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*$/.test(query);

  if (isKeyPath && query.length > 0) {
    const jsonPath = `$.${query}`;
    return db`
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
  }

  return db`
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

// ─── Mutations ────────────────────────────────────────────────────

export async function insert(data: {
  projectId: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  rawBody: string;
  sourceIp: string | null;
  receivedAt: string;
}) {
  const rows = await db`
    INSERT INTO events (
      project_id,
      method,
      headers,
      body,
      raw_body,
      source_ip,
      received_at
    ) VALUES (
      ${data.projectId},
      ${data.method},
      ${JSON.stringify(data.headers)},
      ${data.body ? JSON.stringify(data.body) : null},
      ${data.rawBody},
      ${data.sourceIp},
      ${data.receivedAt}
    )
    RETURNING id, project_id, method, headers, body, raw_body, received_at
  `;
  return rows[0];
}
