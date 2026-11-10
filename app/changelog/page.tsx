import Link from 'next/link';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Changelog — Latch',
  description: 'Release history and updates for the Latch Webhook Ledger & Tunnel Relay.',
};

const RELEASES = [
  {
    version: 'v2.0.0',
    date: 'November 2026',
    title: 'Command Center UI/UX & High-Performance Technical Glassmorphism',
    description:
      'Complete overhaul of Latch interface engineered for developers who value precision, speed, and technical clarity. Dark-first aesthetic, 4px baseline grid, OLED depth, and side-by-side payload diffing.',
    highlights: [
      '⚡ Precision Technical Console: High-contrast typography with Inter and JetBrains Mono.',
      '🔍 Deep Inspection Suite: Instant JSON tree folding, copy path shortcuts, and syntax-highlighted viewers.',
      '📊 Side-by-Side Diff Viewer: Real-time visual comparison of payload schema changes and breaking updates.',
      '🛡 Security Callout & Zero Password Architecture: Pure GitHub OAuth sessioning with pg-adapter.',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'August 2026',
    title: 'Built-in SSE Tunnel Relay & Sub-10ms Real-Time Delivery',
    description:
      'Major milestone release introducing zero-config local tunneling without ngrok, and sub-10ms pub/sub real-time streaming.',
    highlights: [
      '🚀 Built-in SSE Tunnel Relay: Forward webhooks to localhost without ngrok or Cloudflare.',
      '⚡ Sub-10ms Real-Time Delivery: Local Redis Pub/Sub streams incoming events to dashboard and CLI instantly.',
    ],
  },
  {
    version: 'v0.9.0',
    date: 'July 2026',
    title: 'Core Webhook Ledger Engine & Async Ingestion Pipeline',
    description:
      'Initial release of the core Latch webhook engine: permanent PostgreSQL event ledger, Redis queueing, and Auth.js integration.',
    highlights: [
      '⚡ Sub-50ms Async Ingestion: Immediate HTTP 200 return on ingest with background BLPOP worker draining.',
      '🔒 Security & Validation: Strict Zod parameter parsing, UUID checks, and cloud-mode SSRF protection.',
      '📊 Pino Structured Logging: High-performance JSON log aggregation for production readiness.',
      '🛡 Route Protection: Auth.js v5 route protection proxy for dashboard routes.',
    ],
  },
];

export default async function ChangelogPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e1e4] flex flex-col font-sans selection:bg-[#10b981]/20 selection:text-[#10b981]">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-3 border-b border-[#27272a] pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 text-[11px] font-mono text-[#10b981]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <span>Product Updates</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Changelog
          </h1>
          <p className="text-sm text-[#9ca3af] leading-relaxed max-w-2xl">
            Latest releases, feature enhancements, and architecture updates for Latch.
          </p>
        </div>

        {/* Releases List */}
        <div className="space-y-8">
          {RELEASES.map((release) => (
            <article
              key={release.version}
              className="glass-panel rounded-lg border border-[#27272a] bg-[#131315]/90 p-6 sm:p-7 space-y-5 shadow-xl hover:border-[#3f3f46] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272a]/80 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold font-mono text-[#10b981] px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/25">
                    {release.version}
                  </span>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {release.title}
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#71717a]">
                  {release.date}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
                {release.description}
              </p>

              <div className="space-y-2 pt-1">
                <h3 className="label-caps text-[#71717a]">
                  Highlights
                </h3>
                <ul className="grid grid-cols-1 gap-2 text-xs text-[#9ca3af]">
                  {release.highlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 rounded border border-[#27272a]/60 bg-[#0e0e10] px-3 py-2 text-xs"
                    >
                      <span className="text-white leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {/* Back Link */}
        <div className="pt-6 border-t border-[#27272a] flex justify-between items-center text-xs">
          <Link
            href="/docs"
            className="text-[#10b981] hover:underline transition-all font-mono"
          >
            &larr; Back to Documentation
          </Link>
          <span className="text-[#71717a] font-mono text-[11px]">Latch Engine v2.0.0</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#27272a] bg-[#000000] py-6 text-xs text-[#71717a] mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-[11px]">
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
