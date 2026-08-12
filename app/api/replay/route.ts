import { requireSession } from '@/lib/services/auth-check';
import { replayEvent, ReplayError } from '@/lib/services/replay';
import { env } from '@/lib/env';
import { z } from 'zod';

const replaySchema = z.object({
  eventId: z.string().uuid('eventId must be a valid UUID'),
  destinationUrl: z.string().url('destinationUrl must be a valid URL').refine(
    (url) => {
      // In local mode, allow localhost — it's the primary workflow
      if (env.isLocalMode) return true;
      // In cloud mode, block internal/private addresses to prevent SSRF
      try {
        const parsed = new URL(url);
        const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
        return !blocked.some(h => parsed.hostname === h || parsed.hostname.endsWith('.internal'));
      } catch { return false; }
    },
    { message: 'Destination URL must not target internal/private addresses' }
  ),
});

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = replaySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { eventId, destinationUrl } = parsed.data;

  try {
    const result = await replayEvent(eventId, destinationUrl, session.userId);
    return Response.json(result);
  } catch (err) {
    if (err instanceof ReplayError) {
      return Response.json({ error: err.message }, { status: err.statusCode });
    }
    throw err;
  }
}
