import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';
import { AccordionItem, AccordionGroup } from '@/components/AccordionItem';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Docs | Latch',
  description:
    'Quickstart guide, CLI reference, and troubleshooting for Latch: the real-time webhook ledger and replay engine.',
};

export default async function DocsPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-background flex flex-col font-sans selection:bg-primary-container/30 selection:text-primary">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 md:py-16 space-y-16">
        {/* Page header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">Docs</h1>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            Everything you need to get webhooks flowing through Latch.
          </p>
          <div className="sticky top-[53px] z-40 bg-surface-container-lowest/90 backdrop-blur-xl py-3 border-b border-outline-variant shadow-2xl -mx-6 px-6 mt-6">
            <nav className="flex items-center gap-x-3 gap-y-2 text-xs text-on-surface-variant overflow-x-auto whitespace-nowrap scrollbar-none font-medium">
              <a href="#what-is-latch" className="hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-container">What is Latch?</a>
              <span className="text-outline">·</span>
              <a href="#quickstart" className="hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-container">Quickstart</a>
              <span className="text-outline">·</span>
              <a href="#events" className="hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-container">Event Feed</a>
              <span className="text-outline">·</span>
              <a href="#replay" className="hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-container">Replay</a>
              <span className="text-outline">·</span>
              <a href="#cli" className="hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-container">CLI</a>
              <span className="text-outline">·</span>
              <a href="#security" className="hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-container">Security</a>
              <span className="text-outline">·</span>
              <a href="#troubleshooting" className="hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-surface-container">Troubleshooting</a>
            </nav>
          </div>
        </div>

        {/* ─── What is Latch? ─── */}
        <section id="what-is-latch" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">What is Latch?</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            A webhook is an HTTP request that a third-party service sends to your server when something happens: a payment succeeds in Stripe, a push lands on GitHub, an order is placed in Shopify.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Latch sits between those services and your application. You point the provider at a Latch URL instead of your own server, and Latch captures every incoming webhook: headers, body, raw bytes, all of it. You can then inspect payloads in a live feed, compare any two events side-by-side, replay them to your local dev server, or forward them in real time using the CLI. Nothing gets lost, and you can re-send any event whenever you need to.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            It&apos;s built for developers who work with webhooks regularly and are tired of losing events, writing throwaway test scripts, or setting up ngrok tunnels just to debug a payload.
          </p>
        </section>

        <hr className="border-outline-variant" />

        {/* ─── Quickstart ─── */}
        <section id="quickstart" className="space-y-6 scroll-mt-24">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Quickstart</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary text-xs font-bold font-mono shrink-0">1</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-on-surface">Sign in with GitHub</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Go to the homepage and click &quot;Get Started with GitHub&quot;. Latch only asks for your public profile and email (no repo access).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary text-xs font-bold font-mono shrink-0">2</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-on-surface">Create a project</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  On the dashboard, give your project a name (e.g. &quot;Stripe Checkout&quot;) and optionally set a Destination URL: that&apos;s where Replay will send events. You can change both later.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary text-xs font-bold font-mono shrink-0">3</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-on-surface">Copy your Ingest URL</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Each project gets a unique URL that looks like <code className="text-primary bg-surface-container border border-outline-variant px-1.5 py-0.5 rounded-md text-[11px] font-mono">https://your-domain/api/ingest/&#123;projectId&#125;</code>. Click it to copy.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary-container/15 border border-primary-container/30 text-primary text-xs font-bold font-mono shrink-0">4</span>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-on-surface">Paste it into your provider</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Go to your webhook provider&apos;s settings and add the Ingest URL as the endpoint. Here&apos;s where to find it in a few common services:
                </p>
                <ul className="text-xs text-on-surface-variant leading-relaxed space-y-1 list-disc list-inside">
                  <li><span className="text-on-surface font-semibold">Stripe</span>: Dashboard → Developers → Webhooks → Add endpoint</li>
                  <li><span className="text-on-surface font-semibold">GitHub</span>: Repository → Settings → Webhooks → Add webhook</li>
                  <li><span className="text-on-surface font-semibold">Shopify</span>: Settings → Notifications → Webhooks → Create webhook</li>
                </ul>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Any service that sends an HTTP POST to a URL will work; the ones above are just the most common.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-outline leading-relaxed">
            Once your provider sends its first event, it&apos;ll appear on the project&apos;s live feed within a couple of seconds.
          </p>
        </section>

        <hr className="border-outline-variant" />

        {/* ─── Event Feed ─── */}
        <section id="events" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Live Event Feed</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            When you open a project, you see a real-time feed of incoming webhooks on the left and a detail panel on the right.
          </p>
          <ul className="text-xs text-on-surface-variant leading-relaxed space-y-2 list-disc list-inside">
            <li>The <span className="text-primary font-semibold">green dot</span> at the top means the SSE connection is active. If it turns <span className="text-error font-semibold">red</span>, the browser is reconnecting: events you miss during that gap are backfilled automatically.</li>
            <li><span className="text-on-surface font-semibold">Search</span> searches across headers and payload values. Type any substring (an email, an event ID, an error code) and matching events filter instantly.</li>
            <li><span className="text-on-surface font-semibold">Compare mode</span> lets you select any two events and see a side-by-side diff of their payloads, with additions and deletions highlighted. Useful for spotting schema changes between webhook versions.</li>
            <li>Click any event to expand it. The detail panel shows received timestamp, headers (collapsible JSON tree), payload (collapsible JSON tree or raw view), and the Replay tool.</li>
          </ul>
        </section>

        <hr className="border-outline-variant" />

        {/* ─── Replay ─── */}
        <section id="replay" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Replay</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Replay re-sends a captured webhook to a URL you choose, typically your local dev server.
          </p>
          <ul className="text-xs text-on-surface-variant leading-relaxed space-y-2 list-disc list-inside">
            <li>It uses the <span className="text-on-surface font-semibold">original headers and body</span> from when the webhook was first received, so your application processes the exact same payload.</li>
            <li>Latch adds one extra header: <code className="text-primary bg-surface-container border border-outline-variant px-1.5 py-0.5 rounded-md text-[11px] font-mono">X-Webhook-Replay: true</code>. Your code can check for this if you need to distinguish replayed events from live ones.</li>
            <li>After replaying, the response panel shows the HTTP status code your server returned, the response body, and how long it took.</li>
            <li>The Destination URL defaults to whatever you set on the project, but you can override it per-replay.</li>
          </ul>
        </section>

        <hr className="border-outline-variant" />

        {/* ─── CLI ─── */}
        <section id="cli" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">CLI</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            The CLI forwards webhooks from Latch to your local machine in real time. It&apos;s optional: you can use the dashboard without it.
          </p>

          <h3 className="text-sm font-bold text-on-surface pt-2">Running it</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            No install needed. Run it directly with <code className="text-primary bg-surface-container border border-outline-variant px-1.5 py-0.5 rounded-md text-[11px] font-mono">npx</code>:
          </p>
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3.5 font-mono text-[11px] text-on-surface-variant overflow-x-auto whitespace-pre">
{`npx @ayomidedaniel/latch-cli listen <projectId> \\
  --forward-to http://localhost:3000/api/webhook \\
  --token <your-cli-token>`}
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Copy the full command (with your project ID and token pre-filled) from the project page on the dashboard.
          </p>

          <h3 className="text-sm font-bold text-on-surface pt-4">Commands</h3>
          <div className="rounded-xl border border-outline-variant overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container text-outline uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-2.5 font-bold">Command</th>
                  <th className="px-4 py-2.5 font-bold">What it does</th>
                </tr>
              </thead>
              <tbody className="text-on-surface-variant divide-y divide-outline-variant bg-surface-container-lowest">
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-primary">tunnel &lt;projectId&gt;</td>
                  <td className="px-4 py-2.5">Opens a persistent tunnel connection and forwards webhooks to your local URL in real time. Built-in alternative to ngrok.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-primary">listen &lt;projectId&gt;</td>
                  <td className="px-4 py-2.5">Connects to the project&apos;s event stream and forwards each incoming webhook to your local URL.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-primary">replay &lt;eventId&gt;</td>
                  <td className="px-4 py-2.5">Fetches a single event by ID and forwards it to your local URL once. Useful for re-testing a specific payload.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-bold text-on-surface pt-4">Flags</h3>
          <div className="rounded-xl border border-outline-variant overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container text-outline uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-2.5 font-bold">Flag</th>
                  <th className="px-4 py-2.5 font-bold">Short</th>
                  <th className="px-4 py-2.5 font-bold">Description</th>
                </tr>
              </thead>
              <tbody className="text-on-surface-variant divide-y divide-outline-variant bg-surface-container-lowest">
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-primary">--forward-to</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-secondary">-f</td>
                  <td className="px-4 py-2.5">The local URL to send webhooks to. Required.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-primary">--token</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-secondary">-t</td>
                  <td className="px-4 py-2.5">Your project&apos;s CLI token. Falls back to the <code className="bg-surface-container px-1 py-0.5 rounded text-on-surface">LATCH_TOKEN</code> env var if not set.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-primary">--api-url</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-secondary">-u</td>
                  <td className="px-4 py-2.5">The Latch server URL. Defaults to <code className="bg-surface-container px-1 py-0.5 rounded text-on-surface">http://localhost:3000</code>. Set this to your deployed URL in production.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-bold text-on-surface pt-4">Token rotation</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Each project has its own CLI token. You can rotate it from the project page on the dashboard: click &quot;Rotate Token&quot;. After rotating, any running CLI instance using the old token will fail on its next reconnection. Copy the new token and restart the CLI.
          </p>
        </section>

        <hr className="border-outline-variant" />

        {/* ─── Security ─── */}
        <section id="security" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Security</h2>
          <ul className="text-xs text-on-surface-variant leading-relaxed space-y-2 list-disc list-inside">
            <li><span className="text-on-surface font-semibold">GitHub OAuth scopes</span>: Latch requests your public profile and email. It does not request access to your repositories or organizations.</li>
            <li><span className="text-on-surface font-semibold">Project isolation</span>: every database query is scoped to your user ID. You can only see your own projects and events.</li>
            <li><span className="text-on-surface font-semibold">CLI tokens</span>: each project has a unique token for CLI authentication. Tokens can be rotated at any time from the dashboard. Latch does not store your webhook provider&apos;s signing secrets.</li>
            <li><span className="text-on-surface font-semibold">Headers are preserved</span>: Latch stores the exact headers your provider sent, including signature headers. This means you can still verify webhook signatures in your own application code after a replay.</li>
          </ul>
        </section>

        <hr className="border-outline-variant" />

        {/* ─── Troubleshooting ─── */}
        <section id="troubleshooting" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Troubleshooting</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Common questions and how to fix them.
          </p>

          <AccordionGroup className="space-y-3 stagger-children">
            <AccordionItem question="My events aren't showing up">
              <p className="mb-2">Make sure you pasted the full Ingest URL into your provider (including the <code className="text-primary bg-surface-container px-1.5 py-0.5 rounded text-[11px] font-mono">/api/ingest/&#123;projectId&#125;</code> part).</p>
              <p className="mb-2">If you did, try sending a test event manually to confirm the connection works:</p>
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-mono text-[11px] text-on-surface-variant overflow-x-auto whitespace-pre my-2">
{`curl -X POST https://your-domain/api/ingest/<projectId> \\
  -H "Content-Type: application/json" \\
  -d '{"test": true}'`}
              </div>
              <p className="pt-1">Some providers also won&apos;t send real events until you click a &quot;send test&quot; button in their dashboard (Stripe, for example).</p>
            </AccordionItem>

            <AccordionItem question="The CLI says Unauthorized">
              <p>Your CLI token was probably rotated. Go to the project page on the dashboard, click &quot;Show Token&quot;, and copy the current one. Then restart the CLI with the new token.</p>
            </AccordionItem>

            <AccordionItem question="Replay failed or returned an error">
              <p>Check that your Destination URL is correct and that your local server is actually running on that port. The response body in the error panel usually tells you what went wrong on your server&apos;s side.</p>
            </AccordionItem>

            <AccordionItem question="What providers work with Latch?">
              <p>Anything that sends an HTTP POST request to a URL. Stripe, GitHub, Shopify, Twilio, Clerk, custom services. If it sends webhooks, Latch can capture them.</p>
            </AccordionItem>

            <AccordionItem question="Do I need the CLI?">
              <p>No. The CLI is for forwarding events to localhost in real time. If you just want to capture, inspect, search, and replay webhooks, the dashboard does all of that on its own.</p>
            </AccordionItem>

            <AccordionItem question="How do I delete a project and its data?">
              <p>Open the project, expand &quot;Project Settings &amp; Danger Zone&quot;, and click Delete. This is permanent: all events and replays for that project are gone.</p>
            </AccordionItem>
          </AccordionGroup>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant bg-surface-dim px-6 py-8 text-xs text-outline mt-auto">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span>Latch &copy; {new Date().getFullYear()}</span>
          <a
            href="https://github.com/ayomidedaniel1/Latch"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
