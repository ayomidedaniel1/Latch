'use client';

import { useState } from 'react';

export function DocsView() {
  const [activeSection, setActiveSection] = useState<'signature' | 'quickstart' | 'cli' | 'troubleshooting'>('signature');
  const [copiedCode, setCopiedCode] = useState(false);

  const codeSnippet = `const crypto = require('crypto');
const express = require('express');
const app = express();

const LATCH_SECRET = process.env.LATCH_SIGNING_SECRET;

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sigHeader = req.headers['latch-signature'];

  // Parse header elements
  const elements = sigHeader.split(',').reduce((acc, el) => {
    const [key, value] = el.split('=');
    acc[key] = value;
    return acc;
  }, {});

  const signedPayload = \`\${elements.t}.\${req.body.toString('utf8')}\`;

  const expectedSignature = crypto
    .createHmac('sha256', LATCH_SECRET)
    .update(signedPayload)
    .digest('hex');

  if (crypto.timingSafeEqual(Buffer.from(elements.v1), Buffer.from(expectedSignature))) {
    // Signature is valid
    res.status(200).send('OK');
  } else {
    res.status(400).send('Invalid signature');
  }
});`;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row border-t border-[#27272a]">
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 border-r border-[#27272a] bg-[#09090b] p-5 space-y-6 shrink-0">
        {/* Group 1: GETTING STARTED */}
        <div className="space-y-1.5">
          <span className="label-caps text-[#71717a] block px-2">Getting Started</span>
          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveSection('quickstart')}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                activeSection === 'quickstart'
                  ? 'bg-[#10b981]/15 text-[#10b981] font-semibold'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#131315]'
              }`}
            >
              Quickstart Guide
            </button>
            <button
              onClick={() => setActiveSection('quickstart')}
              className="w-full text-left px-2.5 py-1.5 rounded text-xs text-[#71717a] hover:text-white transition-colors"
            >
              Authentication
            </button>
          </nav>
        </div>

        {/* Group 2: WEBHOOKS */}
        <div className="space-y-1.5">
          <span className="label-caps text-[#71717a] block px-2">Webhooks</span>
          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveSection('signature')}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                activeSection === 'signature'
                  ? 'bg-[#10b981]/15 text-[#10b981] font-semibold border border-[#10b981]/30'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#131315]'
              }`}
            >
              Signature Verification
            </button>
            <button
              onClick={() => setActiveSection('quickstart')}
              className="w-full text-left px-2.5 py-1.5 rounded text-xs text-[#71717a] hover:text-white transition-colors"
            >
              Creating Endpoints
            </button>
            <button
              onClick={() => setActiveSection('troubleshooting')}
              className="w-full text-left px-2.5 py-1.5 rounded text-xs text-[#71717a] hover:text-white transition-colors"
            >
              Retries &amp; Failures
            </button>
          </nav>
        </div>

        {/* Group 3: TOOLS */}
        <div className="space-y-1.5">
          <span className="label-caps text-[#71717a] block px-2">Tools</span>
          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveSection('cli')}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                activeSection === 'cli'
                  ? 'bg-[#10b981]/15 text-[#10b981] font-semibold'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#131315]'
              }`}
            >
              CLI Tunnel
            </button>
            <button
              onClick={() => setActiveSection('troubleshooting')}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                activeSection === 'troubleshooting'
                  ? 'bg-[#10b981]/15 text-[#10b981] font-semibold'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#131315]'
              }`}
            >
              Troubleshooting
            </button>
          </nav>
        </div>
      </aside>

      {/* Center Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-4xl space-y-10 overflow-y-auto">
        {activeSection === 'signature' && (
          <div className="space-y-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#71717a]">
              <span>Docs</span>
              <span>&gt;</span>
              <span>Webhooks</span>
              <span>&gt;</span>
              <span className="text-white">Signature Verification</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2 border-b border-[#27272a] pb-6">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Signature Verification
              </h1>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                Secure your webhook endpoints by verifying that incoming requests originate from Latch. We use HMAC SHA-256 signatures for payload verification.
              </p>
            </div>

            {/* Section 1: The Latch-Signature Header */}
            <div id="signature-header" className="space-y-3">
              <h2 className="text-lg font-semibold text-white">The Latch-Signature Header</h2>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Every webhook request sent by Latch includes a Latch-Signature header. This header contains a timestamp and one or more signatures to prevent replay attacks and ensure data integrity.
              </p>

              <div className="rounded border border-[#10b981]/30 bg-[#10b981]/5 p-3 font-mono text-xs text-[#10b981] overflow-x-auto">
                Latch-Signature: t=1614556800,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
              </div>

              <ul className="text-xs text-[#9ca3af] space-y-1.5 list-disc list-inside">
                <li><strong className="text-white font-mono">t</strong>: The timestamp of the request.</li>
                <li><strong className="text-white font-mono">v1</strong>: The primary signature scheme (HMAC SHA-256).</li>
              </ul>
            </div>

            {/* Section 2: Implementation Example */}
            <div id="implementation-example" className="space-y-3 pt-4 border-t border-[#27272a]">
              <h2 className="text-lg font-semibold text-white">Implementation Example</h2>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                To verify the signature, you need your endpoint&apos;s signing secret. Extract the timestamp and signature from the header, compute the expected signature, and compare it.
              </p>

              <div className="glass-panel rounded-lg border border-[#27272a] bg-[#0e0e10] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272a] bg-[#161618]">
                  <span className="font-mono text-xs text-[#9ca3af]">Node.js (Express)</span>
                  <button
                    onClick={handleCopyCode}
                    className="text-xs font-mono text-[#71717a] hover:text-[#10b981] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? 'COPIED' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono leading-relaxed text-[#34d399] overflow-x-auto">
                  {codeSnippet}
                </pre>
              </div>
            </div>

            {/* Section 3: Recent Updates Timeline */}
            <div id="recent-updates" className="space-y-4 pt-6 border-t border-[#27272a]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-base font-bold text-white tracking-tight">Recent Updates</h2>
              </div>

              <div className="space-y-6 pl-2 border-l border-[#27272a] ml-2">
                <div className="relative pl-6 space-y-1.5">
                  <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#10b981]" />
                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#71717a]">
                    <span className="text-[#10b981] font-semibold">v1.2.0</span>
                    <span>October 12, 2024</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">Added Payload Diffing</h3>
                  <p className="text-xs text-[#9ca3af] leading-relaxed">
                    Introduced payload diffing in the replay engine. You can now visually compare the payload of a failed request with its successful replay to quickly identify discrepancies.
                  </p>
                  <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">Feature</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#1c1b1d] text-[#9ca3af] border border-[#27272a]">Replay Engine</span>
                  </div>
                </div>

                <div className="relative pl-6 space-y-1.5">
                  <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#71717a]" />
                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#71717a]">
                    <span className="text-[#9ca3af] font-semibold">v1.1.5</span>
                    <span>September 28, 2024</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">Improved Retry Backoff</h3>
                  <p className="text-xs text-[#9ca3af] leading-relaxed">
                    Adjusted the exponential backoff algorithm for failed webhook deliveries to prevent thundering herd problems on downstream services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'quickstart' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Quickstart Guide</h1>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Connect third-party webhook providers to Latch in under 2 minutes.
            </p>

            <div className="space-y-4">
              <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315] p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-white">
                  <span className="h-5 w-5 rounded bg-[#10b981]/20 text-[#10b981] flex items-center justify-center text-xs">1</span>
                  <span>Create a Project</span>
                </div>
                <p className="text-xs text-[#9ca3af]">
                  Go to the Dashboard and click &quot;Create New Project&quot;. Provide an optional destination URL for replays.
                </p>
              </div>

              <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315] p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-white">
                  <span className="h-5 w-5 rounded bg-[#10b981]/20 text-[#10b981] flex items-center justify-center text-xs">2</span>
                  <span>Copy your Ingest URL</span>
                </div>
                <p className="text-xs text-[#9ca3af]">
                  Paste the unique Ingest URL into Stripe, GitHub, or Shopify webhook delivery settings.
                </p>
              </div>

              <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315] p-4 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-white">
                  <span className="h-5 w-5 rounded bg-[#10b981]/20 text-[#10b981] flex items-center justify-center text-xs">3</span>
                  <span>Inspect &amp; Replay</span>
                </div>
                <p className="text-xs text-[#9ca3af]">
                  Watch events stream in real time. Inspect JSON payloads, compare versions, and replay with one click.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'cli' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Latch CLI Tunnel</h1>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Built-in SSE tunnel relay for local development. No ngrok or Cloudflare account required.
            </p>
            <div className="rounded border border-[#27272a] bg-[#0e0e10] p-4 font-mono text-xs text-[#34d399] leading-relaxed">
              npx @ayomidedaniel/latch-cli tunnel &lt;projectId&gt; --forward-to http://localhost:3000/api/webhook --token &lt;token&gt;
            </div>
          </div>
        )}

        {activeSection === 'troubleshooting' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Troubleshooting</h1>
            <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#10b981]">Events not showing up?</h3>
              <ul className="text-xs text-[#9ca3af] space-y-2 list-disc list-inside">
                <li>Verify that your webhook provider is sending HTTP POST requests to the full URL path: <code>/api/ingest/&#123;projectId&#125;</code></li>
                <li>Check if your provider requires a test event to be manually dispatched.</li>
                <li>Confirm that your Redis server and worker background process are running.</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar: On this page */}
      <aside className="hidden lg:block w-56 border-l border-[#27272a] bg-[#09090b] p-6 space-y-4 shrink-0">
        <span className="label-caps text-[#71717a] block">On this page</span>
        <nav className="space-y-2 text-xs">
          <a href="#signature-header" className="block text-[#10b981] font-medium hover:underline">
            The Latch-Signature Header
          </a>
          <a href="#implementation-example" className="block text-[#71717a] hover:text-white transition-colors">
            Implementation Example
          </a>
          <a href="#recent-updates" className="block text-[#71717a] hover:text-white transition-colors">
            Recent Updates
          </a>
        </nav>
      </aside>
    </div>
  );
}

