import { db } from '@/lib/db';
import { EventFeed } from '@/components/EventFeed';
import { IngestUrl } from '@/components/IngestUrl';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { updateProject } from '../actions';
import { DeleteProjectButton } from '@/components/DeleteProjectButton';

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

  // Bind the action to the projectId
  const updateProjectWithId = updateProject.bind(null, project.id);

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
            <form action={updateProjectWithId} className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">Project Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={project.name}
                    required
                    className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-800 transition-all font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">Destination URL (optional)</label>
                  <input
                    name="destinationUrl"
                    type="url"
                    defaultValue={project.destination_url || ''}
                    placeholder="http://localhost:3001/webhook"
                    className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-800 transition-all font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </form>

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

        {/* Live event feed */}
        <div className="pt-2">
          <EventFeed projectId={project.id} destinationUrl={project.destination_url ?? ''} />
        </div>
      </main>
    </div>
  );
}
