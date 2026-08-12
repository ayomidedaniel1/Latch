import { db } from '@/lib/db';

// ─── Queries ──────────────────────────────────────────────────────

export async function findByUserId(userId: string) {
  return db`
    SELECT id, name, destination_url, cli_token, created_at
    FROM projects
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
}

export async function findById(projectId: string) {
  const rows = await db`
    SELECT id, name, destination_url, cli_token, user_id, created_at
    FROM projects
    WHERE id = ${projectId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/**
 * Verify that a project exists and is owned by the given user.
 * Returns the project row if owned, null otherwise.
 */
export async function verifyOwnership(projectId: string, userId: string) {
  const rows = await db`
    SELECT id, name, destination_url, cli_token, created_at
    FROM projects
    WHERE id = ${projectId} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/**
 * Check whether a project exists (regardless of owner).
 * Lightweight existence check used by the queue consumer.
 */
export async function exists(projectId: string): Promise<boolean> {
  const rows = await db`
    SELECT id FROM projects WHERE id = ${projectId} LIMIT 1
  `;
  return rows.length > 0;
}

/**
 * Verify a CLI token matches a project. Used for CLI/tunnel auth.
 */
export async function findByCliToken(projectId: string, token: string) {
  const rows = await db`
    SELECT id, name, destination_url, cli_token, user_id, created_at
    FROM projects
    WHERE id = ${projectId} AND cli_token = ${token}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

// ─── Mutations ────────────────────────────────────────────────────

export async function create(
  userId: string,
  name: string,
  destinationUrl: string | null,
) {
  const rows = await db`
    INSERT INTO projects (user_id, name, destination_url)
    VALUES (${userId}, ${name}, ${destinationUrl})
    RETURNING id, name, destination_url, cli_token, created_at
  `;
  return rows[0];
}

export async function update(
  projectId: string,
  name: string,
  destinationUrl: string | null,
) {
  await db`
    UPDATE projects
    SET name = ${name}, destination_url = ${destinationUrl}
    WHERE id = ${projectId}
  `;
}

export async function remove(projectId: string) {
  await db`
    DELETE FROM projects WHERE id = ${projectId}
  `;
}

export async function regenerateCliToken(projectId: string) {
  await db`
    UPDATE projects
    SET cli_token = gen_random_uuid()
    WHERE id = ${projectId}
  `;
}
