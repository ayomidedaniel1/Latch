import * as eventsRepo from '@/lib/repositories/events';
import * as projectsRepo from '@/lib/repositories/projects';
import * as replaysRepo from '@/lib/repositories/replays';
import { ReplayError } from '@/lib/services/replay';
import { env } from '@/lib/env';

export { ReplayError };

export interface BatchReplayItemResult {
  eventId: string;
  success: boolean;
  status: number;
  body: string;
  duration: number;
  durationMs: number;
  error?: string;
}

export interface BatchReplaySummary {
  total: number;
  totalCount: number;
  succeeded: number;
  succeededCount: number;
  failed: number;
  failedCount: number;
  duration: number;
  durationMs: number;
  totalDuration: number;
  destinationUrl: string;
  results: BatchReplayItemResult[];
  outcomes: BatchReplayItemResult[];
}

export interface BatchReplayOptions {
  projectId: string;
  eventIds: string[];
  userId: string;
  destinationUrl?: string | null;
  concurrencyLimit?: number | null;
  concurrency?: number | null;
}

interface EventReplayRow {
  id: string;
  project_id: string;
  method: string;
  headers: Record<string, string>;
  raw_body: string | null;
}

interface ProjectOwnershipRow {
  id: string;
  name: string;
  destination_url: string | null;
  cli_token: string;
  created_at: string;
}

const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'content-length',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
]);

const DEFAULT_CONCURRENCY = 5;
const MIN_CONCURRENCY = 1;
const MAX_CONCURRENCY = 10;

function validateDestinationUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ReplayError('destinationUrl must be a valid URL', 400);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new ReplayError('destinationUrl must use http or https protocol', 400);
  }

  if (parsed.pathname.startsWith('/api/ingest')) {
    throw new ReplayError('Destination URL cannot target the Latch ingest endpoint (replay loop prevention)', 400);
  }

  if (!env.isLocalMode) {
    const cleanHostname = parsed.hostname.replace(/^\[|\]$/g, '');
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
    if (blocked.some((h) => cleanHostname === h || cleanHostname.endsWith('.internal'))) {
      throw new ReplayError('Destination URL must not target internal/private addresses', 400);
    }
  }

  return parsed;
}

/**
 * Replay multiple webhook events to a destination URL with controlled concurrency.
 * Verifies project ownership, resolves destination URL with project fallback,
 * preserves original headers & body, audits attempts in replays table,
 * and returns summary with per-event outcomes.
 */
export async function batchReplay(
  options: BatchReplayOptions,
): Promise<BatchReplaySummary>;
export async function batchReplay(
  projectId: string,
  eventIds: string[],
  userId: string,
  destinationUrl?: string | null,
  concurrencyLimit?: number | null,
): Promise<BatchReplaySummary>;
export async function batchReplay(
  optionsOrProjectId: BatchReplayOptions | string,
  eventIdsParam?: string[],
  userIdParam?: string,
  destinationUrlParam?: string | null,
  concurrencyLimitParam?: number | null,
): Promise<BatchReplaySummary> {
  const options: BatchReplayOptions =
    typeof optionsOrProjectId === 'string'
      ? {
          projectId: optionsOrProjectId,
          eventIds: eventIdsParam ?? [],
          userId: userIdParam ?? '',
          destinationUrl: destinationUrlParam,
          concurrencyLimit: concurrencyLimitParam,
        }
      : optionsOrProjectId;

  const { projectId, eventIds, userId, destinationUrl, concurrencyLimit, concurrency: concurrencyOpt } = options;

  if (!projectId || typeof projectId !== 'string') {
    throw new ReplayError('projectId must be provided', 400);
  }

  if (!userId || typeof userId !== 'string') {
    throw new ReplayError('Unauthorized', 401);
  }

  if (!Array.isArray(eventIds) || eventIds.length === 0) {
    throw new ReplayError('eventIds must be a non-empty array of event IDs', 400);
  }

  if (eventIds.length > 50) {
    throw new ReplayError('eventIds cannot exceed 50 events per batch', 400);
  }

  // Multi-tenant project verification
  const project = (await projectsRepo.verifyOwnership(projectId, userId)) as ProjectOwnershipRow | null;
  if (!project) {
    const projectExists = await projectsRepo.exists(projectId);
    if (!projectExists) {
      throw new ReplayError('Project not found', 404);
    }
    throw new ReplayError('Unauthorized: Project not owned by user', 403);
  }

  // Resolve destination URL: override takes precedence, fallback to project.destination_url
  const targetDestination = (destinationUrl?.trim() || project.destination_url)?.trim();
  if (!targetDestination) {
    throw new ReplayError('No destination URL provided and project has no default destination_url', 400);
  }

  const resolvedDestination: string = targetDestination;

  // Validate destination URL format, SSRF, and loop prevention
  validateDestinationUrl(resolvedDestination);

  const rawConcurrency = concurrencyOpt ?? concurrencyLimit;
  const concurrency =
    typeof rawConcurrency === 'number' && Number.isFinite(rawConcurrency) && rawConcurrency > 0
      ? Math.min(Math.max(MIN_CONCURRENCY, Math.floor(rawConcurrency)), MAX_CONCURRENCY)
      : DEFAULT_CONCURRENCY;

  const batchStart = Date.now();
  const results: BatchReplayItemResult[] = new Array(eventIds.length);
  let nextIndex = 0;

  async function replaySingleItem(eventId: string): Promise<BatchReplayItemResult> {
    const event = (await eventsRepo.findForReplay(eventId)) as EventReplayRow | null;

    if (!event || event.project_id !== projectId) {
      const reason = !event
        ? 'Event not found'
        : 'Event does not belong to project';
      return {
        eventId,
        success: false,
        status: 404,
        body: reason,
        duration: 0,
        durationMs: 0,
        error: reason,
      };
    }

    // Build headers conforming to forwarding standards & preventing loops
    const replayHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(event.headers || {})) {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        replayHeaders[key] = value;
      }
    }
    delete replayHeaders['host'];
    delete replayHeaders['content-length'];
    delete replayHeaders['Host'];
    delete replayHeaders['Content-Length'];
    replayHeaders['x-webhook-replay'] = 'true';
    replayHeaders['x-webhook-original-id'] = event.id;

    const itemStart = Date.now();
    let responseStatus: number;
    let responseBody: string;
    let itemError: string | undefined;

    try {
      const method = event.method ?? 'POST';
      const hasBody = method !== 'GET' && method !== 'HEAD';
      const response = await fetch(resolvedDestination, {
        method,
        headers: replayHeaders,
        body: hasBody ? event.raw_body : undefined,
      });
      responseStatus = response.status;
      responseBody = await response.text();
    } catch (err: unknown) {
      responseStatus = 500;
      responseBody = err instanceof Error ? err.message : String(err);
      itemError = responseBody;
    }

    const itemDuration = Date.now() - itemStart;

    // Persist replay record in replays table for auditing & dashboard (bounded to 10,000 chars)
    try {
      await replaysRepo.insert({
        eventId: event.id,
        destinationUrl: resolvedDestination,
        responseStatus,
        responseBody: responseBody.slice(0, 10000),
        durationMs: itemDuration,
      });
    } catch (dbErr: unknown) {
      console.error(`Failed to record replay for event ${eventId}:`, dbErr);
    }

    const isSuccess = responseStatus >= 200 && responseStatus < 300;
    if (!isSuccess && !itemError) {
      itemError = `Destination returned status ${responseStatus}`;
    }

    return {
      eventId: event.id,
      success: isSuccess,
      status: responseStatus,
      body: responseBody,
      duration: itemDuration,
      durationMs: itemDuration,
      ...(itemError ? { error: itemError } : {}),
    };
  }

  async function worker(): Promise<void> {
    while (true) {
      const idx = nextIndex++;
      if (idx >= eventIds.length) break;
      results[idx] = await replaySingleItem(eventIds[idx]);
    }
  }

  const workerCount = Math.min(concurrency, eventIds.length);
  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  const totalDuration = Date.now() - batchStart;
  let succeeded = 0;
  let failed = 0;

  for (const item of results) {
    if (item.success) {
      succeeded++;
    } else {
      failed++;
    }
  }

  return {
    total: eventIds.length,
    totalCount: eventIds.length,
    succeeded,
    succeededCount: succeeded,
    failed,
    failedCount: failed,
    duration: totalDuration,
    durationMs: totalDuration,
    totalDuration,
    destinationUrl: resolvedDestination,
    results,
    outcomes: results,
  };
}

export const batchReplayEvents = batchReplay;
