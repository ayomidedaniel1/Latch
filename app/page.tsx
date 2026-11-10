import Link from 'next/link';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { LandingInspection } from '@/components/LandingInspection';
import { AccordionItem, AccordionGroup } from '@/components/AccordionItem';

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="min-h-screen bg-[#000000] text-[#e5e1e4] flex flex-col font-sans selection:bg-[#10b981]/20 selection:text-[#10b981]">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-16 md:py-24 flex flex-col items-center space-y-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-6 max-w-3xl pt-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 text-xs font-mono text-[#10b981]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>V2.0 IS LIVE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Webhook management that{' '}
            <span className="text-[#10b981]">just clicks.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed max-w-2xl">
            The ultimate ledger, tunnel, and replay engine for developers who ship. Monitor, inspect, and route your webhooks with zero friction.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded bg-[#10b981] hover:bg-[#059669] text-[#000000] px-5 py-2.5 text-xs font-semibold tracking-wide transition-all shadow-md glow-emerald cursor-pointer"
              >
                Go to Dashboard &rarr;
              </Link>
            ) : (
              <Link
                href="/signin"
                className="inline-flex items-center gap-2.5 rounded bg-[#10b981] hover:bg-[#059669] text-[#000000] px-5 py-2.5 text-xs font-semibold tracking-wide transition-all shadow-md glow-emerald cursor-pointer"
              >
                <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span>Get Started with GitHub</span>
              </Link>
            )}
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded border border-[#27272a] hover:border-[#3f3f46] bg-[#131315]/80 hover:bg-[#1c1b1d] text-white px-5 py-2.5 text-xs font-semibold tracking-wide transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Read Docs</span>
            </Link>
          </div>
        </section>

        {/* Section 1: The complete lifecycle */}
        <section id="features" className="w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              The complete lifecycle.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Create */}
            <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315]/80 p-6 space-y-3 hover:border-[#3f3f46] transition-all">
              <div className="h-9 w-9 rounded bg-[#1c1b1d] border border-[#27272a] flex items-center justify-center text-[#10b981]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Create</h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Generate secure endpoint URLs instantly. Configure routing rules, rate limits, and custom headers in seconds.
              </p>
            </div>

            {/* Point */}
            <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315]/80 p-6 space-y-3 hover:border-[#3f3f46] transition-all">
              <div className="h-9 w-9 rounded bg-[#1c1b1d] border border-[#27272a] flex items-center justify-center text-[#10b981]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Point</h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Direct your webhook providers to Latch. We securely tunnel payloads to your local environment or production services.
              </p>
            </div>

            {/* Replay */}
            <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315]/80 p-6 space-y-3 hover:border-[#3f3f46] transition-all">
              <div className="h-9 w-9 rounded bg-[#1c1b1d] border border-[#27272a] flex items-center justify-center text-[#10b981]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Replay</h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Missed a payload? Failed deployment? Resend any event with a single click or automate replays via our CLI.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Deep inspection capabilities */}
        <section className="w-full space-y-8">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Deep inspection capabilities.
            </h2>
          </div>

          <LandingInspection />
        </section>

        {/* Section 3: Frequently Asked Questions */}
        <section className="w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-4xl mx-auto w-full">
            <AccordionGroup className="space-y-3">
              <AccordionItem question="How does the Latch Tunnel compare to ngrok?" defaultOpen={true}>
                Latch Tunnel is purpose-built for webhooks. While ngrok is a general-purpose tunnel, Latch automatically parses webhook headers, validates schemas, and integrates directly with our ledger for replayability.
              </AccordionItem>
              <AccordionItem question="Can I verify signatures like Stripe-Signature?">
                Yes. Latch supports automated signature verification for major providers including Stripe, GitHub, and Twilio. You can also configure custom HMAC verification for your own endpoints.
              </AccordionItem>
              <AccordionItem question="Is there a limit to payload retention?">
                Free tier accounts retain payloads for 7 days (up to 10,000 events). Pro and Enterprise tiers offer customizable retention policies up to 365 days and infinite archiving to your own AWS S3 buckets.
              </AccordionItem>
              <AccordionItem question="How do one-click replays work?">
                When you click replay, Latch resends the exact original payload with identical headers to your configured destination. This is perfect for recovering from local development errors or temporary production outages.
              </AccordionItem>
            </AccordionGroup>
          </div>
        </section>
      </main>

      {/* Footer matching reference design */}
      <footer className="border-t border-[#27272a] bg-[#000000] py-8 text-xs text-[#71717a] mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono font-semibold tracking-wider text-[#9ca3af]">
            LATCH WEBHOOK LEDGER
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Status</Link>
            <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
          </div>
          <div className="font-mono text-[11px]">
            &copy; {new Date().getFullYear()} Latch Webhook Ledger. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
