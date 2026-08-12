import Redis from 'ioredis';
import { processQueueItem } from './services/processor';
import type { WebhookPayload } from './types';

/**
 * Local queue worker.
 *
 * Uses BLPOP on 'webhook-queue' to block until an item arrives (zero polling).
 * Delegates actual processing to the shared service layer (processQueueItem).
 *
 * This is the local-mode replacement for QStash → /api/process.
 */

const redisUrl = process.env.LOCAL_REDIS_URL || 'redis://localhost:6379';
const redisClient = new Redis(redisUrl);

let running = true;

async function consume() {
  console.log('[worker] 🚀 Queue worker started, listening for webhook-queue items...');

  while (running) {
    try {
      // BLPOP blocks until an item is available (timeout 0 = wait forever)
      const result = await redisClient.blpop('webhook-queue', 0);
      if (!result) continue;

      const [, rawItem] = result;
      const payload: WebhookPayload = JSON.parse(rawItem);

      const eventId = await processQueueItem(payload);
      if (eventId) {
        console.log(`[worker] ✓ Processed event ${eventId}`);
      }
    } catch (err) {
      if (!running) break; // Graceful shutdown interrupted the BLPOP
      console.error('[worker] Error processing item:', err);
      // Brief pause before retrying to avoid tight error loops
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────

function shutdown(signal: string) {
  console.log(`\n[worker] Received ${signal}, shutting down gracefully...`);
  running = false;
  redisClient.disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ─── Start ────────────────────────────────────────────────────────

consume().catch((err) => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});
