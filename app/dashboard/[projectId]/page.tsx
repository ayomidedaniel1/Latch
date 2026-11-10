import * as projectsRepo from '@/lib/repositories/projects';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { ProjectDashboardView } from '@/components/ProjectDashboardView';

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

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e1e4] flex flex-col font-sans selection:bg-[#10b981]/20 selection:text-[#10b981]">
      <Navbar isAuthenticated={true} user={session.user} />
      <ProjectDashboardView project={project} />
    </div>
  );
}
