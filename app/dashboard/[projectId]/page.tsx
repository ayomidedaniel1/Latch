import { db } from '@/lib/db';
import { EventFeed } from '@/components/EventFeed';
import { IngestUrl } from '@/components/IngestUrl';
import { notFound } from 'next/navigation';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const rows = await db`
    SELECT id, name FROM projects WHERE id = ${projectId} LIMIT 1
  `;
  const project = rows[0];

  if (!project) notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-xl font-semibold mb-1">{project.name}</h1>
      <div className="mb-8">
        <IngestUrl projectId={project.id} />
      </div>
      <EventFeed projectId={project.id} />
    </main>
  );
}
