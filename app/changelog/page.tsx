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
    title: 'Local-First Engine, Built-in Tunnel Relay & Structured Logging',
    description:
      'Major milestone release introducing zero-config local execution, native PostgreSQL TCP pooling, BLPOP Redis queue consumer, built-in SSE tunnel relay, and Pino structured logging.',
    highlights: [
      '🚀 Built-in SSE Tunnel Relay: Forward webhooks to localhost without ngrok or Cloudflare.',
      '⚡ Sub-50ms Async Ingestion: Immediate HTTP 200 return on ingest with background BLPOP worker draining.',
      '⚡ Sub-10ms Real-Time Delivery: Local Redis Pub/Sub streams incoming events to dashboard and CLI instantly.',
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
    <div className="min-h-screen bg-latch-bg text-latch-primary flex flex-col font-sans">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 space-y-12">
        {/* Header */}
        <div className="space-y-3 border-b border-latch-border pb-8">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-latch-mint-bg text-latch-mint border border-latch-mint-border px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Product Updates
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Changelog
          </h1>
          <p className="text-base text-latch-secondary leading-relaxed max-w-2xl">
            Latest releases, feature enhancements, and architecture updates for Latch.
          </p>
        </div>

        {/* Releases List */}
        <div className="space-y-12">
          {RELEASES.map((release) => (
            <article
              key={release.version}
              className="rounded-2xl border border-latch-border bg-latch-card p-6 md:p-8 space-y-6 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-latch-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold font-mono text-latch-mint">
                    {release.version}
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {release.title}
                  </h2>
                </div>
                <span className="text-xs font-mono text-latch-muted">
                  {release.date}
                </span>
              </div>

              <p className="text-sm text-latch-secondary leading-relaxed">
                {release.description}
              </p>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-latch-muted">
                  What&apos;s New
                </h3>
                <ul className="grid grid-cols-1 gap-2.5 text-xs text-latch-secondary">
                  {release.highlights.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 rounded-lg border border-latch-border/60 bg-latch-bg/50 px-3.5 py-2.5"
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
        <div className="pt-8 border-t border-latch-border flex justify-between items-center text-xs">
          <Link
            href="/docs"
            className="text-latch-mint hover:underline transition-all font-mono"
          >
            ← Back to Documentation
          </Link>
          <span className="text-latch-muted font-mono">Latch Engine v1.0.0</span>
        </div>
      </main>
    </div>
  );
}
