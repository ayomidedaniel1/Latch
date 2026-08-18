import Link from 'next/link';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { LandingMockup } from '@/components/LandingMockup';
import { HowItWorks } from '@/components/HowItWorks';
import { FeatureCard } from '@/components/FeatureCard';
import { AccordionItem, AccordionGroup } from '@/components/AccordionItem';

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
      'Sign in, create a project, and run a single line terminal command to forward webhooks straight to localhost:3000.',
    status: 'live' as const,
  },
];

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background flex flex-col font-sans selection:bg-primary-container/30 selection:text-primary">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center space-y-20">
        {/* Hero */}
        <section className="space-y-6 max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-container/30 bg-primary-container/10 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span className="font-mono text-xs uppercase tracking-wider font-semibold">v2.0 is Live</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-on-background leading-[1.1]">
            Capture, Inspect, and Replay{' '}
            <span className="text-primary drop-shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              Webhooks Instantly
            </span>
          </h1>

          <p className="text-base md:text-lg text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            A developer-first, permanent webhook ledger. Connect any third-party service or custom API in seconds. Built-in tunnel, zero lost events, infinite one-click replays.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary-fixed px-6 py-3 font-bold transition-all shadow-lg shadow-primary-container/20 active:scale-[0.98] cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            ) : (
              <Link
                href="/signin?callbackUrl=/dashboard"
                className="inline-flex items-center gap-2.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary-fixed px-6 py-3 font-bold transition-all shadow-lg shadow-primary-container/20 active:scale-[0.98] cursor-pointer cta-glow"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.24 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>Get Started with GitHub</span>
              </Link>
            )}

            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-xl bg-surface-container border border-outline-variant hover:border-primary px-5 py-3 text-sm font-semibold text-on-surface hover:text-primary transition-all"
            >
              <span>Read Documentation</span>
            </Link>
          </div>
        </section>

        {/* Live Mockup */}
        <section className="w-full max-w-4xl pt-2">
          <LandingMockup />
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Features */}
        <section className="w-full border-t border-outline-variant pt-16 space-y-8">
          <div className="text-left space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Features</h2>
            <p className="text-sm text-on-surface-variant">Everything you need to capture, debug, and replay webhooks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full border-t border-outline-variant pt-16 space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm md:text-base text-on-surface-variant">Quick answers to the most common questions about Latch.</p>
          </div>

          <AccordionGroup className="space-y-3 max-w-3xl mx-auto stagger-children text-left w-full">
            <AccordionItem question="What providers work with Latch?">
              Anything that sends an HTTP POST to a URL. Stripe, GitHub, Shopify, Twilio, Clerk, custom backends. If it sends webhooks, Latch can capture them.
            </AccordionItem>

            <AccordionItem question="Do I need the CLI?">
              No. The CLI is optional. It forwards webhooks to your localhost in real time, like a lightweight ngrok. If you just want to capture and inspect events, the dashboard handles everything on its own.
            </AccordionItem>

            <AccordionItem question="Is my data secure?">
              Latch uses GitHub OAuth (public profile + email only) and scopes every query to your user ID. Your projects, events, and CLI tokens are isolated. Latch does not store your provider&apos;s signing secrets.
            </AccordionItem>

            <AccordionItem question="Can I replay a webhook more than once?">
              Yes. You can replay any captured event as many times as you want. Each replay sends the original headers and body to whatever destination URL you choose.
            </AccordionItem>

            <AccordionItem question="Can I self-host Latch?">
              Yes. It&apos;s a standard Next.js app backed by PostgreSQL and Redis &mdash; both run locally, no cloud accounts needed. Check the{' '}
              <Link href="/docs#self-host" className="text-primary hover:underline transition-colors font-medium">
                self-hosting docs
              </Link>{' '}
              for the full setup.
            </AccordionItem>
          </AccordionGroup>

          <div className="pt-4 text-center">
            <Link href="/docs" className="text-sm text-primary hover:underline font-semibold transition-colors">
              Read the full docs &rarr;
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant bg-surface-dim px-6 py-8 text-xs text-on-surface-variant mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-on-surface font-medium">All systems operational</span>
          </div>
          <div>
            <span>Latch &copy; {new Date().getFullYear()}. Built for developer efficiency.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
