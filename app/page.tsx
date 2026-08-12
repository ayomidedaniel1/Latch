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
    <div className="min-h-screen bg-latch-bg text-latch-primary flex flex-col font-sans selection:bg-latch-mint-bg selection:text-latch-mint">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center space-y-16">
        {/* Hero */}
        <section className="space-y-6 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-latch-primary leading-[1.1]">
            Capture, Inspect, and Replay{' '}
            <span className="text-latch-mint">
              Webhooks Instantly
            </span>
          </h1>
          <p className="text-base md:text-lg text-latch-secondary leading-relaxed max-w-2xl mx-auto">
            A developer-first, permanent webhook ledger. Connect any third-party service or custom API in seconds. Built-in tunnel, zero lost events, infinite one-click replays.
          </p>
          <div className="pt-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-latch-mint text-latch-bg hover:bg-latch-mint-hover px-6 py-3 font-semibold transition-all cursor-pointer"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signin?callbackUrl=/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-latch-mint text-latch-bg hover:bg-latch-mint-hover px-6 py-3 font-semibold transition-all cursor-pointer cta-glow"
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

        {/* How It Works */}
        <HowItWorks />

        {/* Features */}
        <section className="w-full border-t border-latch-border pt-16 space-y-8">
          <div className="text-left space-y-2">
            <h2 className="text-2xl font-bold text-latch-primary tracking-tight">Features</h2>
            <p className="text-sm text-latch-secondary">Everything you need to capture, debug, and replay webhooks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full border-t border-latch-border pt-16 space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-latch-primary tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm md:text-base text-latch-secondary">Quick answers to the most common questions about Latch.</p>
          </div>

          <AccordionGroup className="space-y-3 max-w-3xl mx-auto stagger-children text-left">
            <AccordionItem question="What is a webhook?">
              A webhook is an HTTP request a third-party service sends to your server when something happens: a payment goes through, a commit is pushed, an order is placed. Latch captures those requests so you can inspect and replay them.
            </AccordionItem>

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
              <Link href="/docs#self-host" className="text-latch-mint hover:underline transition-colors">
                self-hosting docs
              </Link>{' '}
              for the full setup.
            </AccordionItem>
          </AccordionGroup>

          <div className="pt-4 text-center">
            <Link href="/docs" className="text-sm text-latch-mint hover:underline font-semibold transition-colors">
              Read the full docs &rarr;
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-latch-border bg-latch-bg px-6 py-8 text-sm text-latch-muted mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-latch-mint animate-pulse"></span>
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

