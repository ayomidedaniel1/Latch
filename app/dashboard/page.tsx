import * as projectsRepo from '@/lib/repositories/projects';
import Link from 'next/link';
import { CreateProjectForm } from '@/components/CreateProjectForm';
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

  const projects = await projectsRepo.findByUserId(userId);

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background flex flex-col font-sans selection:bg-primary-container/30 selection:text-primary">
      <Navbar isAuthenticated={true} user={session.user} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Header & Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">Developer Console</h1>
            <p className="text-xs md:text-sm text-on-surface-variant mt-1">Create and manage webhooks endpoints for your local environment.</p>
          </div>
          <div className="flex items-center gap-6 glass-card rounded-2xl p-4 shadow-lg">
            <div>
              <p className="text-[10px] uppercase font-mono text-outline tracking-wider font-semibold">Total Projects</p>
              <p className="text-2xl font-bold text-primary font-mono mt-0.5">{projects.length}</p>
            </div>
            <div className="h-8 w-px bg-outline-variant" />
            <div>
              <p className="text-[10px] uppercase font-mono text-outline tracking-wider font-semibold">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping-emerald" />
                <span className="text-xs text-on-surface font-semibold">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Banner: shown only when user has no projects */}
        {projects.length === 0 && (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low/70 backdrop-blur-md p-6 relative overflow-hidden glow-hover">
            <h2 className="text-lg font-bold text-on-surface mb-4">Get started</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex gap-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary text-xs font-bold font-mono shrink-0">1</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">Create a project below. Pick any name (you can change it later).</p>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary text-xs font-bold font-mono shrink-0">2</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">Copy the Ingest URL that Latch gives you. Paste it into your webhook provider&apos;s settings (Stripe, GitHub, Shopify, or anything that sends HTTP POST requests).</p>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary text-xs font-bold font-mono shrink-0">3</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">That&apos;s it. Webhooks show up here in real time. You can inspect payloads, compare events, or replay them to your local server.</p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-outline-variant/50">
              <Link href="/docs" className="text-xs text-primary hover:underline font-bold transition-colors">
                Read the full guide &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Project Creation Card */}
          <div className="lg:col-span-1 rounded-2xl glass-card p-6 shadow-2xl relative overflow-hidden">
            <h2 className="text-lg font-bold text-on-surface mb-2 tracking-tight">Create a New Project</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
              Each project gets its own Ingest URL. Point a webhook provider at it and Latch captures everything.
            </p>

            <CreateProjectForm />
          </div>

          {/* Right: Projects List Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-mono font-semibold text-outline uppercase tracking-widest mb-4">Your Webhook Tunnels</h2>

            {projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant p-12 text-center space-y-3 bg-surface-container-lowest/50">
                <svg className="mx-auto h-8 w-8 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
                  No projects yet. Create one using the form on the left to get your Ingest URL.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group rounded-2xl border border-outline-variant bg-surface-container-low/70 backdrop-blur-md p-5 hover:border-primary/50 transition-all shadow-md flex flex-col justify-between min-h-[170px] glow-hover"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/dashboard/${project.id}`}
                          className="font-bold text-on-surface hover:text-primary transition-colors text-sm truncate block max-w-[80%] tracking-tight"
                        >
                          {project.name}
                        </Link>
                        <span className="text-[10px] font-mono bg-surface-container border border-outline-variant px-2 py-0.5 rounded-full text-on-surface-variant font-medium">
                          {project.id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-mono text-outline uppercase tracking-wider font-semibold">Ingress URL</p>
                          <IngestUrl projectId={project.id} />
                        </div>

                        {project.destination_url && (
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-mono text-outline uppercase tracking-wider font-semibold">Forwards to</p>
                            <p className="text-xs font-mono text-on-surface-variant truncate">{project.destination_url}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-outline-variant/40 mt-4 flex items-center justify-between">
                      <span className="text-[10px] text-outline font-mono">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/dashboard/${project.id}`}
                        className="text-xs font-bold text-primary hover:text-primary-fixed transition-colors flex items-center gap-1"
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
