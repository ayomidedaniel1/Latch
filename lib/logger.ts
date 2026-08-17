import pino from 'pino';

/**
 * Structured logger for Latch.
 *
 * - Development: pretty-printed, colorized output
 * - Production: JSON output for log aggregation
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info({ event: 'webhook_stored', eventId, projectId }, 'stored event');
 *   logger.error({ err }, 'queue processing failed');
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
});
