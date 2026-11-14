import { requireSession } from '@/lib/services/auth-check';
import { batchReplay, ReplayError } from '@/lib/services/batch-replay';
import { env } from '@/lib/env';
import { z } from 'zod';

const batchReplaySchema = z.object({
  projectId: z.string().uuid('projectId must be a valid UUID'),
  eventIds: z
    .array(z.string().uuid('Each eventId must be a valid UUID'))
    .min(1, 'eventIds must contain at least one event ID')
    .max(50, 'eventIds cannot exceed 50 events per batch'),
  destinationUrl: z
    .string()
    .transform((val) => val.trim())
    .refine(
      (val) => {
        if (val === '') return true;
        try {
          const parsed = new URL(val);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'destinationUrl must be a valid HTTP or HTTPS URL' },
    )
    .refine(
      (val) => {
        if (val === '') return true;
        if (env.isLocalMode) return true;
        try {
          const parsed = new URL(val);
          const cleanHostname = parsed.hostname.replace(/^\[|\]$/g, '');
          const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
          return !blocked.some((h) => cleanHostname === h || cleanHostname.endsWith('.internal'));
        } catch {
          return false;
        }
      },
      { message: 'Destination URL must not target internal/private addresses' },
    )
    .transform((val) => (val === '' ? undefined : val))
    .optional()
    .nullable(),
  concurrency: z
    .number()
    .int('concurrency must be an integer')
    .min(1, 'concurrency must be between 1 and 10')
    .max(10, 'concurrency must be between 1 and 10')
    .optional()
    .nullable(),
  concurrencyLimit: z
    .number()
    .int('concurrencyLimit must be an integer')
    .min(1, 'concurrencyLimit must be between 1 and 10')
    .max(10, 'concurrencyLimit must be between 1 and 10')
    .optional()
    .nullable(),
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

  const parsed = batchReplaySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { projectId, eventIds, destinationUrl, concurrency, concurrencyLimit } = parsed.data;
  const effectiveConcurrency = concurrency ?? concurrencyLimit ?? undefined;

  try {
    const result = await batchReplay({
      projectId,
      eventIds,
      userId: session.userId,
      destinationUrl: destinationUrl ?? undefined,
      concurrency: effectiveConcurrency,
      concurrencyLimit: effectiveConcurrency,
    });
    return Response.json(result);
  } catch (err: unknown) {
    if (err instanceof ReplayError) {
      return Response.json({ error: err.message }, { status: err.statusCode });
    }
    console.error('Batch replay unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

