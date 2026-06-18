import { db } from '@/lib/db';
import Link from 'next/link';
import { createProject } from './actions';
import { IngestUrl } from '@/components/IngestUrl';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect('/signin');
  }

  const projects = await db`
    SELECT id, name, destination_url, created_at
    FROM projects
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      <Navbar isAuthenticated={true} user={session.user} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
        {/* Header & Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Developer Console</h1>
            <p className="text-xs text-zinc-400 mt-1">Create and manage webhooks endpoints for your local environment.</p>
          </div>
          <div className="flex items-center gap-6 bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 shadow-lg">
            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Total Projects</p>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{projects.length}</p>
            </div>
            <div className="h-8 w-px bg-zinc-900" />
            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-zinc-300 font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Project Creation Card */}
          <div className="lg:col-span-1 rounded-2xl border border-zinc-900 bg-zinc-950/40 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
            
            <h2 className="text-lg font-bold text-white mb-2">Create a New Project</h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Establish a permanent webhook proxy ledger. Swap your third-party webhook URL with Latch, and replay payloads at will.
            </p>

            <form action={createProject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">Project Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Stripe Checkout"
                  required
                  className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-800 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">Destination URL (optional)</label>
                <input
                  name="destinationUrl"
                  type="url"
                  placeholder="e.g. http://localhost:3001/webhook"
                  className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-800 transition-all font-mono"
                />
                <p className="text-[10px] text-zinc-500 leading-normal mt-1">
                  Local server endpoint where Latch will forward webhooks during Replay.
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 py-2.5 px-4 font-semibold text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.99]"
              >
                Create Project
              </button>
            </form>
          </div>

          {/* Right: Projects List Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-4">Your Webhook Tunnels</h2>

            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-900 p-12 text-center">
                <p className="text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">
                  You have not created any projects yet. Enter a name on the left to spawn your first webhook ledger and copy your proxy URLs.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 hover:border-zinc-800 transition-all shadow-md flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/dashboard/${project.id}`}
                          className="font-bold text-zinc-100 hover:text-emerald-400 transition-colors text-sm truncate block max-w-[80%]"
                        >
                          {project.name}
                        </Link>
                        <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded text-zinc-500">
                          {project.id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Ingress URL</p>
                          <IngestUrl projectId={project.id} />
                        </div>

                        {project.destination_url && (
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Forwards to</p>
                            <p className="text-xs font-mono text-zinc-400 truncate">{project.destination_url}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-900/60 mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/dashboard/${project.id}`}
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                      >
                        Open Ledger &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
