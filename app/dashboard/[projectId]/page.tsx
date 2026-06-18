import { db } from '@/lib/db';
import { EventFeed } from '@/components/EventFeed';
import { IngestUrl } from '@/components/IngestUrl';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) notFound();

  const { projectId } = await params;

  const rows = await db`
    SELECT id, name, destination_url FROM projects WHERE id = ${projectId} AND user_id = ${userId} LIMIT 1
  `;
  const project = rows[0];

  if (!project) notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-xl font-semibold mb-1">{project.name}</h1>
      <div className="mb-8">
        <IngestUrl projectId={project.id} />
      </div>
      <EventFeed projectId={project.id} destinationUrl={project.destination_url ?? ''} />
    </main>
  );
}
