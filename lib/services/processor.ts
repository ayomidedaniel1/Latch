import * as eventsRepo from '@/lib/repositories/events';
import * as projectsRepo from '@/lib/repositories/projects';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import type { WebhookPayload } from '@/lib/types';

/**
 * Process a single queue item: validate, parse, persist to Postgres.
 * Shared between the API route (cloud mode) and the BLPOP worker (local mode).
 *
 * Returns the new event ID on success, null if skipped (unknown project).
 */
export async function processQueueItem(
  payload: WebhookPayload,
): Promise<string | null> {
  const { projectId, headers, raw, receivedAt, sourceIp } = payload;

  // Validate that the project exists
  const projectExists = await projectsRepo.exists(projectId);
  if (!projectExists) {
    logger.warn({ projectId }, 'unknown projectId, skipping');
    return null;
  }

  // Try to parse raw body as JSON — fall back to null if not valid JSON
  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    // Not JSON — raw_body is the source of truth, body column stays null
  }

  // Insert the event
  const event = await eventsRepo.insert({
    projectId,
    method: 'POST',
    headers,
    body,
    rawBody: raw,
    sourceIp,
    receivedAt,
  });

  logger.info({ event: 'event_stored', eventId: event.id, projectId }, 'stored event');

  // Publish to Redis Pub/Sub for instant SSE delivery (used in local mode)
  await redis.publish(
    `events:${projectId}`,
    JSON.stringify(event),
  ).catch(() => {
    // Non-critical: if no SSE subscribers exist, this is a no-op
  });

  return event.id;
}

/**
 * Drain up to `maxItems` from the Redis queue, processing each in sequence.
 * Returns the number of items processed.
 */
export async function drainQueue(maxItems: number = 10): Promise<number> {
  let processed = 0;

  while (processed < maxItems) {
    const item = await redis.rpop<WebhookPayload | string>('webhook-queue');
    if (!item) break; // queue empty

    const payload: WebhookPayload = typeof item === 'string'
      ? JSON.parse(item)
      : item;

    await processQueueItem(payload);
    processed++;
  }

  return processed;
}
