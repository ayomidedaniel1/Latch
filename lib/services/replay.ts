import * as eventsRepo from '@/lib/repositories/events';
import * as projectsRepo from '@/lib/repositories/projects';
import * as replaysRepo from '@/lib/repositories/replays';

export interface ReplayResult {
  status: number;
  body: string;
  duration: number;
}

/**
 * Replay a stored webhook event to a destination URL.
 * Verifies ownership, rebuilds the original request, and stores the response.
 */
export async function replayEvent(
  eventId: string,
  destinationUrl: string,
  userId: string,
): Promise<ReplayResult> {
  // Fetch the original event
  const event = await eventsRepo.findForReplay(eventId);
  if (!event) {
    throw new ReplayError('Event not found', 404);
  }

  // Verify the event belongs to a project owned by this user
  const project = await projectsRepo.verifyOwnership(event.project_id, userId);
  if (!project) {
    throw new ReplayError('Unauthorized: Project not owned by user', 403);
  }

  // Build replay headers (exclude hop-by-hop headers)
  const replayHeaders: Record<string, string> = { ...event.headers };
  delete replayHeaders['host'];
  delete replayHeaders['content-length'];
  replayHeaders['x-webhook-replay'] = 'true';
  replayHeaders['x-webhook-original-id'] = eventId;

  const start = Date.now();
  let responseStatus: number;
  let responseBody: string;

  try {
    const response = await fetch(destinationUrl, {
      method: event.method ?? 'POST',
      headers: replayHeaders,
      body: event.raw_body,
    });
    responseStatus = response.status;
    responseBody = await response.text();
  } catch (err: unknown) {
    responseStatus = 500;
    responseBody = err instanceof Error ? err.message : String(err);
  }

  const duration = Date.now() - start;

  // Persist the replay record
  await replaysRepo.insert({
    eventId,
    destinationUrl,
    responseStatus,
    responseBody,
    durationMs: duration,
  });

  return { status: responseStatus, body: responseBody, duration };
}

/**
 * Custom error with HTTP status code for replay failures.
 */
export class ReplayError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'ReplayError';
  }
}
