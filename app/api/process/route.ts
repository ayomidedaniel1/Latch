import { drainQueue } from '@/lib/services/processor';
import { headers } from 'next/headers';

const MAX_BATCH_SIZE = 10;

export async function POST() {
  // Only allow calls from localhost (worker or dev scripts)
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const forwarded = headersList.get('x-forwarded-for') || '';
  const isLocalCall =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    forwarded === '127.0.0.1' ||
    forwarded === '::1';

  if (!isLocalCall) {
    return new Response('Forbidden', { status: 403 });
  }

  const processed = await drainQueue(MAX_BATCH_SIZE);
  return Response.json({ ok: true, processed });
}
