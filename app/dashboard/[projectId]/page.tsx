import * as projectsRepo from '@/lib/repositories/projects';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { ProjectWorkspace } from '@/components/ProjectWorkspace';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) notFound();

  const { projectId } = await params;

  const project = await projectsRepo.verifyOwnership(projectId, userId);
  if (!project) notFound();

  return <ProjectWorkspace project={project} />;
}
