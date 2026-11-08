import * as projectsRepo from '@/lib/repositories/projects';
import { EventFeed } from '@/components/EventFeed';
import { IngestUrl } from '@/components/IngestUrl';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { UpdateProjectForm } from '@/components/UpdateProjectForm';
import { DeleteProjectButton } from '@/components/DeleteProjectButton';
import { CLIInstructions } from '@/components/CLIInstructions';

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      <Navbar isAuthenticated={true} user={session.user} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Subheader & Back navigation */}
        <div className="flex flex-col gap-2 pb-4 border-b border-zinc-900">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1 w-fit"
          >
            &larr; Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{project.name}</h1>
              <div className="mt-1">
                <IngestUrl projectId={project.id} />
              </div>
            </div>
            {project.destination_url && (
              <div className="text-right">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Destination</p>
                <p className="text-xs font-mono text-zinc-350 mt-0.5 truncate max-w-md">{project.destination_url}</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Settings */}
        <details className="group border border-zinc-900 bg-zinc-950/40 rounded-xl p-4 transition-all">
          <summary className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-widest cursor-pointer select-none flex items-center justify-between">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-zinc-500 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Project Settings & Danger Zone
            </span>
            <span className="text-[10px] text-zinc-500 font-normal normal-case group-open:hidden">Click to expand</span>
            <span className="text-[10px] text-zinc-500 font-normal normal-case hidden group-open:inline">Click to collapse</span>
          </summary>
          <div className="mt-4 pt-4 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Update form */}
            <UpdateProjectForm
              projectId={project.id}
              initialName={project.name}
              initialDestinationUrl={project.destination_url}
            />

            {/* Danger Zone */}
            <div className="md:col-span-1 rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-red-400 font-mono">Danger Zone</h4>
                <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                  Deleting this project is permanent and will purge all webhook records, history, and active tunnels.
                </p>
              </div>
              <DeleteProjectButton projectId={project.id} />
            </div>
          </div>
        </details>

        {/* CLI Instructions Card */}
        <CLIInstructions
          projectId={project.id}
          cliToken={project.cli_token}
          destinationUrl={project.destination_url}
        />

        {/* Live event feed */}
        <div className="pt-2">
          <EventFeed projectId={project.id} destinationUrl={project.destination_url ?? ''} />
        </div>
      </main>
    </div>
  );
}
