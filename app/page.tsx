import Link from 'next/link';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { LandingMockup } from '@/components/LandingMockup';
import { FeatureCard } from '@/components/FeatureCard';

const FEATURES = [
  {
    title: 'Interactive JSON Tree Viewer',
    description:
      'Fold nodes, expand nested objects, and copy specific payload path keys (e.g. body.data.customer) instantly instead of scanning monolithic text.',
    status: 'live' as const,
  },
  {
    title: 'Side-by-Side Payload Diffing',
    description:
      'Select any two events to compare payload schemas side-by-side with visual Git-style additions and deletions. Instantly spot breaking changes from webhook updates.',
    status: 'live' as const,
  },
  {
    title: 'Structured JSONB Search',
    description:
      'Query transaction logs by values nested deep inside headers or payloads. Search for email targets, IDs, or error codes without scanning the whole database.',
    status: 'live' as const,
  },
  {
    title: 'Latch CLI Proxy Tunnel',
    description:
      'Run a single line terminal command to forward webhooks straight to localhost:3000. Remove local tunneling service configuration completely.',
    status: 'coming-soon' as const,
  },
];

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center space-y-16">
        {/* Hero */}
        <section className="space-y-6 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Capture, Inspect, and Replay{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-500">
              Webhooks Instantly
            </span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            A developer-first, permanent webhook ledger. Connect Stripe, GitHub, Shopify, or any custom API in seconds. No tunnels, no lost events, infinite one-click replays.
          </p>
          <div className="pt-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 px-6 py-3 font-medium transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signin?callbackUrl=/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 px-6 py-3 font-medium transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                Get Started with GitHub
              </Link>
            )}
          </div>
        </section>

        {/* Live Mockup */}
        <section className="w-full max-w-4xl pt-4">
          <LandingMockup />
        </section>

        {/* Features */}
        <section className="w-full border-t border-zinc-900 pt-16 space-y-8">
          <div className="text-left space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Features</h2>
            <p className="text-sm text-zinc-400">Everything you need to capture, debug, and replay webhooks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-950 bg-zinc-950 px-6 py-8 text-xs text-zinc-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All systems operational</span>
          </div>
          <div>
            <span>Latch &copy; {new Date().getFullYear()}. Built for developer efficiency.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
