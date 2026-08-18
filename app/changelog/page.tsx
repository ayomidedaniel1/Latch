import Link from 'next/link';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Changelog — Latch',
  description: 'Release history and updates for the Latch Webhook Ledger & Tunnel Relay.',
};

const RELEASES = [
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
      '🛡 Route Protection: Auth.js v5 route protection middleware for dashboard routes.',
    ],
  },
];

export default async function ChangelogPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background flex flex-col font-sans selection:bg-primary-container/30 selection:text-primary">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-16 space-y-12">
        {/* Header */}
        <div className="space-y-3 border-b border-outline-variant pb-8">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-primary-container/15 text-primary border border-primary-container/30 px-3 py-1 rounded-full uppercase tracking-wider">
              Product Updates
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
            Changelog
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-2xl">
            Latest releases, feature enhancements, and architecture updates for Latch.
          </p>
        </div>

        {/* Releases List */}
        <div className="space-y-8">
          {RELEASES.map((release) => (
            <article
              key={release.version}
              className="rounded-2xl border border-outline-variant bg-surface-container-low/70 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-xl glow-hover transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold font-mono text-primary">
                    {release.version}
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-on-surface tracking-tight">
                    {release.title}
                  </h2>
                </div>
                <span className="text-xs font-mono text-outline">
                  {release.date}
                </span>
              </div>

              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                {release.description}
              </p>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-outline">
                  What&apos;s New
                </h3>
                <ul className="grid grid-cols-1 gap-2.5 text-xs text-on-surface-variant">
                  {release.highlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3"
                    >
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {/* Back Link */}
        <div className="pt-8 border-t border-outline-variant flex justify-between items-center text-xs">
          <Link
            href="/docs"
            className="text-primary hover:underline transition-all font-mono font-semibold"
          >
            ← Back to Documentation
          </Link>
          <span className="text-outline font-mono">Latch Engine v1.0.0</span>
        </div>
      </main>
    </div>
  );
}
