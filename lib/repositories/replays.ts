import { db } from '@/lib/db';

// ─── Mutations ────────────────────────────────────────────────────

export async function insert(data: {
  eventId: string;
  destinationUrl: string;
  responseStatus: number;
  responseBody: string;
  durationMs: number;
}) {
  const rows = await db`
    INSERT INTO replays (event_id, destination_url, response_status, response_body, duration_ms)
    VALUES (
      ${data.eventId},
      ${data.destinationUrl},
      ${data.responseStatus},
      ${data.responseBody.slice(0, 10000)},
      ${data.durationMs}
    )
    RETURNING id, event_id, destination_url, response_status, response_body, duration_ms, replayed_at
  `;
  return rows[0];
}

// ─── Queries ──────────────────────────────────────────────────────

export async function findByEvent(eventId: string) {
  return db`
    SELECT id, event_id, destination_url, response_status, response_body, duration_ms, replayed_at
    FROM replays
    WHERE event_id = ${eventId}
    ORDER BY replayed_at DESC
  `;
}
