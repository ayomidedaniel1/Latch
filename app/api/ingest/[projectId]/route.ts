import { enqueueWebhook } from '@/lib/services/ingest';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; }>; }
) {
  const { projectId } = await params;

  // Validate projectId is a valid UUID
  const parsed = uuidSchema.safeParse(projectId);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid projectId format' }, { status: 400 });
  }

  // Always read raw body as text
  const raw = await req.text();

  // Collect all headers into a plain object
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const sourceIp = req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    null;

  // Enqueue and return 200 immediately
  await enqueueWebhook(projectId, headers, raw, sourceIp);

  return Response.json({ received: true }, { status: 200 });
}
