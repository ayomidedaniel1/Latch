import Link from 'next/link';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { HeroConsole } from '@/components/HeroConsole';
import { HowItWorks } from '@/components/HowItWorks';
import { FeaturesGrid } from '@/components/FeaturesGrid';
import { AccordionItem, AccordionGroup } from '@/components/AccordionItem';

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e1e4] flex flex-col font-sans selection:bg-[#10b981]/20 selection:text-[#10b981]">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center space-y-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-6 max-w-3xl pt-2 sm:pt-4 w-full">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Capture, inspect, and replay{' '}
            <span className="text-[#10b981]">webhooks instantly.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            A developer-first, permanent webhook ledger. Connect any third-party service or custom API in seconds. Built-in tunnel, zero lost events, infinite one-click replays.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-black px-5 py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <span>&rarr;</span>
              </Link>
            ) : (
              <Link
                href="/signin"
                className="inline-flex items-center gap-2.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-black px-5 py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span>Get Started with GitHub</span>
              </Link>
            )}

            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-[#27272a] hover:border-[#3f3f46] bg-[#131315] hover:bg-[#1c1b1d] text-white px-5 py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Read Docs</span>
            </Link>
          </div>

          {/* Interactive Live Webhook Console Mockup */}
          <div className="w-full pt-6">
            <HeroConsole />
          </div>
        </section>

        {/* Section 1: How It Works */}
        <HowItWorks />

        {/* Section 2: Core Capabilities */}
        <FeaturesGrid />

        {/* Section 3: Frequently Asked Questions */}
        <section className="w-full space-y-8">
          <div className="text-left space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-400">
              Quick answers to the most common questions about Latch.
            </p>
          </div>

          <div className="w-full">
            <AccordionGroup className="space-y-3">
              <AccordionItem question="How does the Latch Tunnel compare to ngrok?" defaultOpen={true}>
                Latch Tunnel is purpose-built for webhooks. Instead of exposing your localhost port with a general-purpose reverse proxy, Latch uses an encrypted Server-Sent Events (SSE) relay. You run <code className="text-[#10b981] font-mono">latch tunnel --port 3000</code> to receive incoming webhooks directly from the permanent ledger without managing dynamic subdomains, custom auth tokens, or session timeouts.
              </AccordionItem>

              <AccordionItem question="How does Latch guarantee zero lost webhooks?">
                The ingest route is completely stateless and non-blocking. When an external provider POSTs to your ingest endpoint, Latch pushes the raw headers and payload string into an in-memory Redis queue and returns an immediate <code className="text-[#10b981] font-mono">200 OK</code> response in under 50ms. A dedicated background worker consumes from the queue and persists records into PostgreSQL. Even if your local server or database experiences brief downtime, webhooks are never lost.
              </AccordionItem>

              <AccordionItem question="Can I verify signatures like Stripe-Signature?">
                Yes. Provider signatures rely on the exact raw request bytes. Latch stores both <code className="text-[#10b981] font-mono">raw_body TEXT</code> for cryptographic signature verification and <code className="text-[#10b981] font-mono">body JSONB</code> for search and diffing. When you replay an event or route it to localhost, your local endpoint receives the exact original signature headers and raw payload to verify successfully.
              </AccordionItem>

              <AccordionItem question="Can I replay a webhook more than once?">
                Yes. You can replay any captured event as many times as you want. Each replay sends the exact original headers and raw body to whatever destination URL you choose, appending <code className="text-[#10b981] font-mono">X-Webhook-Replay: true</code> to avoid recursive loops.
              </AccordionItem>

              <AccordionItem question="Can I self-host Latch?">
                Yes. Latch is a standard Next.js application backed by PostgreSQL and Redis. Both run locally or in Docker with no mandatory cloud dependencies.
              </AccordionItem>
            </AccordionGroup>
          </div>

          <div className="pt-2 text-left">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-xs text-[#10b981] hover:underline font-mono font-semibold transition-colors"
            >
              <span>Read the full docs &rarr;</span>
            </Link>
          </div>
        </section>

        {/* Section 4: Bottom Call-to-Action Card */}
        <section className="w-full rounded-2xl border border-[#27272a] bg-[#131315] p-8 sm:p-12 text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white max-w-xl mx-auto">
            Ready to eliminate webhook blindspots?
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Get your dedicated ingest endpoint, stream events to localhost, and replay failed deliveries with confidence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signin"
              className="rounded-lg bg-[#10b981] hover:bg-[#059669] text-black px-5 py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
            >
              Get Started with GitHub &rarr;
            </Link>
            <Link
              href="/docs"
              className="rounded-lg border border-[#27272a] hover:border-[#3f3f46] bg-[#1c1b1d] text-white px-5 py-2.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
            >
              Read Documentation
            </Link>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="border-t border-[#27272a] bg-[#000000] py-8 text-xs text-zinc-500 mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-mono text-zinc-400">All systems operational</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] text-zinc-400">
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
            <a href="https://github.com/ayomidedaniel1/Latch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://github.com/ayomidedaniel1/Latch/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Support</a>
            <Link href="/docs" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Terms</Link>
          </div>

          <div className="font-mono text-[11px] text-zinc-600">
            Latch &copy; {new Date().getFullYear()}. Built for developer efficiency.
          </div>
        </div>
      </footer>
    </div>
  );
}
