import * as projectsRepo from '@/lib/repositories/projects';
import Link from 'next/link';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { redirect } from 'next/navigation';
import { DashboardProjectGrid } from '@/components/DashboardProjectGrid';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect('/signin');
  }

  const projects = await projectsRepo.findByUserId(userId);

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e1e4] flex flex-col font-sans selection:bg-[#10b981]/20 selection:text-[#10b981]">
      <Navbar isAuthenticated={true} user={session.user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Bar matching reference screen (2).png */}
        <div className="space-y-4 pb-4 border-b border-[#27272a]">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#9ca3af]">
              Total Projects: <strong className="text-white font-semibold">{projects.length}</strong>
            </span>
            <span className="text-[#3f3f46]">·</span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 text-[11px] font-mono text-[#10b981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>Systems Ready</span>
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="pt-2">
          <DashboardProjectGrid projects={projects} />
        </div>
      </main>

      {/* Footer matching reference */}
      <footer className="border-t border-[#27272a] bg-[#000000] py-6 text-xs text-[#71717a] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono font-bold tracking-wider text-[#9ca3af]">
            LATCH
          </div>
          <div className="font-mono text-[11px] text-[#71717a]">
            &copy; {new Date().getFullYear()} Latch Webhook Ledger. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/docs" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Status</Link>
            <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
