import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { DocsView } from '@/components/DocsView';
import Link from 'next/link';

export const metadata = {
  title: 'Docs — Latch',
  description: 'Signature verification, quickstart guide, and CLI tunnel documentation for Latch.',
};

export default async function DocsPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e1e4] flex flex-col font-sans selection:bg-[#10b981]/20 selection:text-[#10b981]">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />
      <DocsView />
      {/* Footer */}
      <footer className="border-t border-[#27272a] bg-[#000000] py-6 text-xs text-[#71717a] mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} Latch Webhook Ledger. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
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
