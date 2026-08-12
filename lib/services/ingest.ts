import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import type { WebhookPayload } from '@/lib/types';

/**
 * Enqueue an incoming webhook into the local Redis queue and publish to tunnel relay.
 * Returns immediately — processing happens asynchronously via the BLPOP worker process.
 */
export async function enqueueWebhook(
  projectId: string,
  headers: Record<string, string>,
  rawBody: string,
  sourceIp: string | null,
): Promise<void> {
  const payload: WebhookPayload = {
    projectId,
    headers,
    raw: rawBody,
    receivedAt: new Date().toISOString(),
    sourceIp,
  };

  // Push to Redis queue for worker processing
  await redis.lpush('webhook-queue', JSON.stringify(payload));

  logger.info({ event: 'webhook_enqueued', projectId }, 'enqueued webhook');

  // Publish to tunnel channel so any connected CLI gets the event immediately
  await redis.publish(
    `tunnel:${projectId}`,
    JSON.stringify(payload),
  ).catch(() => {
    // Non-critical: if no tunnel subscribers exist, this is a no-op
  });
}
