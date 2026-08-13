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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
      <Navbar isAuthenticated={isAuthenticated} user={session?.user} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 md:py-20 space-y-16">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Docs</h1>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Everything you need to get webhooks flowing through Latch.
          </p>
          <div className="sticky top-[53px] z-40 bg-zinc-950/95 backdrop-blur-md py-3 border-b border-zinc-900/80 shadow-2xl -mx-6 px-6 mt-6">
            <nav className="flex items-center gap-x-3 gap-y-2 text-xs text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-none font-medium">
              <a href="#what-is-latch" className="hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-zinc-900">What is Latch?</a>
              <span className="text-zinc-800">·</span>
              <a href="#quickstart" className="hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-zinc-900">Quickstart</a>
              <span className="text-zinc-800">·</span>
              <a href="#events" className="hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-zinc-900">Event Feed</a>
              <span className="text-zinc-800">·</span>
              <a href="#replay" className="hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-zinc-900">Replay</a>
              <span className="text-zinc-800">·</span>
              <a href="#cli" className="hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-zinc-900">CLI</a>
              <span className="text-zinc-800">·</span>
              <a href="#security" className="hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-zinc-900">Security</a>
              <span className="text-zinc-800">·</span>
              <a href="#troubleshooting" className="hover:text-emerald-400 transition-colors px-2 py-1 rounded hover:bg-zinc-900">Troubleshooting</a>
            </nav>
          </div>
        </div>

        {/* ─── What is Latch? ─── */}
        <section id="what-is-latch" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-white">What is Latch?</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            A webhook is an HTTP request that a third-party service sends to your server when something happens: a payment succeeds in Stripe, a push lands on GitHub, an order is placed in Shopify.
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Latch sits between those services and your application. You point the provider at a Latch URL instead of your own server, and Latch captures every incoming webhook: headers, body, raw bytes, all of it. You can then inspect payloads in a live feed, compare any two events side-by-side, replay them to your local dev server, or forward them in real time using the CLI. Nothing gets lost, and you can re-send any event whenever you need to.
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            It&apos;s built for developers who work with webhooks regularly and are tired of losing events, writing throwaway test scripts, or setting up ngrok tunnels just to debug a payload.
          </p>
        </section>

        <hr className="border-zinc-900" />

        {/* ─── Quickstart ─── */}
        <section id="quickstart" className="space-y-6 scroll-mt-24">
          <h2 className="text-xl font-bold text-white">Quickstart</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono shrink-0">1</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-white">Sign in with GitHub</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Go to the homepage and click &quot;Get Started with GitHub&quot;. Latch only asks for your public profile and email (no repo access).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono shrink-0">2</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-white">Create a project</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  On the dashboard, give your project a name (e.g. &quot;Stripe Checkout&quot;) and optionally set a Destination URL: that&apos;s where Replay will send events. You can change both later.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono shrink-0">3</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-white">Copy your Ingest URL</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Each project gets a unique URL that looks like <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-[11px]">https://your-domain/api/ingest/&#123;projectId&#125;</code>. Click it to copy.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono shrink-0">4</span>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">Paste it into your provider</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Go to your webhook provider&apos;s settings and add the Ingest URL as the endpoint. Here&apos;s where to find it in a few common services:
                </p>
                <ul className="text-xs text-zinc-500 leading-relaxed space-y-1 list-disc list-inside">
                  <li><span className="text-zinc-300">Stripe</span>: Dashboard → Developers → Webhooks → Add endpoint</li>
                  <li><span className="text-zinc-300">GitHub</span>: Repository → Settings → Webhooks → Add webhook</li>
                  <li><span className="text-zinc-300">Shopify</span>: Settings → Notifications → Webhooks → Create webhook</li>
                </ul>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Any service that sends an HTTP POST to a URL will work; the ones above are just the most common.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Once your provider sends its first event, it&apos;ll appear on the project&apos;s live feed within a couple of seconds.
          </p>
        </section>

        <hr className="border-zinc-900" />

        {/* ─── Event Feed ─── */}
        <section id="events" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-white">Live Event Feed</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            When you open a project, you see a real-time feed of incoming webhooks on the left and a detail panel on the right.
          </p>
          <ul className="text-xs text-zinc-400 leading-relaxed space-y-2 list-disc list-inside">
            <li>The <span className="text-emerald-400">green dot</span> at the top means the SSE connection is active. If it turns <span className="text-red-400">red</span>, the browser is reconnecting: events you miss during that gap are backfilled automatically.</li>
            <li><span className="text-zinc-300">Search</span> searches across headers and payload values. Type any substring (an email, an event ID, an error code) and matching events filter instantly.</li>
            <li><span className="text-zinc-300">Compare mode</span> lets you select any two events and see a side-by-side diff of their payloads, with additions and deletions highlighted. Useful for spotting schema changes between webhook versions.</li>
            <li>Click any event to expand it. The detail panel shows received timestamp, headers (collapsible JSON tree), payload (collapsible JSON tree or raw view), and the Replay tool.</li>
          </ul>
        </section>

        <hr className="border-zinc-900" />

        {/* ─── Replay ─── */}
        <section id="replay" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-white">Replay</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Replay re-sends a captured webhook to a URL you choose, typically your local dev server.
          </p>
          <ul className="text-xs text-zinc-400 leading-relaxed space-y-2 list-disc list-inside">
            <li>It uses the <span className="text-zinc-300">original headers and body</span> from when the webhook was first received, so your application processes the exact same payload.</li>
            <li>Latch adds one extra header: <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-[11px]">X-Webhook-Replay: true</code>. Your code can check for this if you need to distinguish replayed events from live ones.</li>
            <li>After replaying, the response panel shows the HTTP status code your server returned, the response body, and how long it took.</li>
            <li>The Destination URL defaults to whatever you set on the project, but you can override it per-replay.</li>
          </ul>
        </section>

        <hr className="border-zinc-900" />

        {/* ─── CLI ─── */}
        <section id="cli" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-white">CLI</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The CLI forwards webhooks from Latch to your local machine in real time. It&apos;s optional: you can use the dashboard without it.
          </p>

          <h3 className="text-sm font-semibold text-zinc-300 pt-2">Running it</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            No install needed. Run it directly with <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded text-[11px]">npx</code>:
          </p>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-400 overflow-x-auto whitespace-pre">
{`npx @ayomidedaniel/latch-cli listen <projectId> \\
  --forward-to http://localhost:3000/api/webhook \\
  --token <your-cli-token>`}
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Copy the full command (with your project ID and token pre-filled) from the project page on the dashboard.
          </p>

          <h3 className="text-sm font-semibold text-zinc-300 pt-4">Commands</h3>
          <div className="rounded-lg border border-zinc-800 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/50 text-zinc-500 uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-2 font-semibold">Command</th>
                  <th className="px-4 py-2 font-semibold">What it does</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400 divide-y divide-zinc-900">
                <tr>
                  <td className="px-4 py-2 font-mono text-[11px] text-zinc-300">tunnel &lt;projectId&gt;</td>
                  <td className="px-4 py-2">Opens a persistent tunnel connection and forwards webhooks to your local URL in real time. Built-in alternative to ngrok.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-[11px] text-zinc-300">listen &lt;projectId&gt;</td>
                  <td className="px-4 py-2">Connects to the project&apos;s event stream and forwards each incoming webhook to your local URL.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-[11px] text-zinc-300">replay &lt;eventId&gt;</td>
                  <td className="px-4 py-2">Fetches a single event by ID and forwards it to your local URL once. Useful for re-testing a specific payload.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-semibold text-zinc-300 pt-4">Flags</h3>
          <div className="rounded-lg border border-zinc-800 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/50 text-zinc-500 uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-2 font-semibold">Flag</th>
                  <th className="px-4 py-2 font-semibold">Short</th>
                  <th className="px-4 py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400 divide-y divide-zinc-900">
                <tr>
                  <td className="px-4 py-2 font-mono text-[11px] text-zinc-300">--forward-to</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-zinc-300">-f</td>
                  <td className="px-4 py-2">The local URL to send webhooks to. Required.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-[11px] text-zinc-300">--token</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-zinc-300">-t</td>
                  <td className="px-4 py-2">Your project&apos;s CLI token. Falls back to the <code className="bg-zinc-900 px-1 rounded">LATCH_TOKEN</code> env var if not set.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-[11px] text-zinc-300">--api-url</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-zinc-300">-u</td>
                  <td className="px-4 py-2">The Latch server URL. Defaults to <code className="bg-zinc-900 px-1 rounded">http://localhost:3000</code>. Set this to your deployed URL in production.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-sm font-semibold text-zinc-300 pt-4">Token rotation</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Each project has its own CLI token. You can rotate it from the project page on the dashboard: click &quot;Rotate Token&quot;. After rotating, any running CLI instance using the old token will fail on its next reconnection. Copy the new token and restart the CLI.
          </p>
        </section>

        <hr className="border-zinc-900" />

        {/* ─── Security ─── */}
        <section id="security" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-white">Security</h2>
          <ul className="text-xs text-zinc-400 leading-relaxed space-y-2 list-disc list-inside">
            <li><span className="text-zinc-300">GitHub OAuth scopes</span>: Latch requests your public profile and email. It does not request access to your repositories or organizations.</li>
            <li><span className="text-zinc-300">Project isolation</span>: every database query is scoped to your user ID. You can only see your own projects and events.</li>
            <li><span className="text-zinc-300">CLI tokens</span>: each project has a unique token for CLI authentication. Tokens can be rotated at any time from the dashboard. Latch does not store your webhook provider&apos;s signing secrets.</li>
            <li><span className="text-zinc-300">Headers are preserved</span>: Latch stores the exact headers your provider sent, including signature headers. This means you can still verify webhook signatures in your own application code after a replay.</li>
          </ul>
        </section>

        <hr className="border-zinc-900" />

        {/* ─── Troubleshooting ─── */}
        <section id="troubleshooting" className="space-y-4 scroll-mt-24">
          <h2 className="text-xl font-bold text-white">Troubleshooting</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Common questions and how to fix them.
          </p>

          <AccordionGroup className="space-y-3 stagger-children">
            <AccordionItem question="My events aren't showing up">
              <p className="mb-2">Make sure you pasted the full Ingest URL into your provider (including the <code className="text-zinc-300 bg-zinc-900 px-1 rounded">/api/ingest/&#123;projectId&#125;</code> part).</p>
              <p className="mb-2">If you did, try sending a test event manually to confirm the connection works:</p>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-[11px] text-zinc-400 overflow-x-auto whitespace-pre my-2">
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
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-8 text-xs text-zinc-500 mt-auto">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span>Latch &copy; {new Date().getFullYear()}</span>
          <a
            href="https://github.com/ayomidedaniel1/Latch"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

