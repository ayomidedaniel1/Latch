'use client';

import { useState } from 'react';

type WebhookEvent = {
  id: string;
  provider: 'Stripe' | 'GitHub' | 'Shopify' | 'Clerk';
  event: string;
  status: number;
  time: string;
  duration: string;
  badge: string;
  headers: Record<string, string>;
  signatureVerified: boolean;
  signatureType: string;
  body: Record<string, unknown>;
  diff: {
    oldLine: string;
    newLine: string;
    note: string;
  };
};

const SAMPLE_EVENTS: WebhookEvent[] = [
  {
    id: 'evt_stripe_9921',
    provider: 'Stripe',
    event: 'payment_intent.succeeded',
    status: 200,
    time: '12:41:04',
    duration: '14ms',
    badge: '$49.00 USD',
    signatureVerified: true,
    signatureType: 'HMAC-SHA256 (stripe-signature)',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': 't=1690000000,v1=9fa8b7c6d5e4f3a2b1c0,v0=6ff2...',
      'idempotency-key': 'idemp_live_9901827462',
      'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
      'x-request-id': 'req_89f0a1b2c3d4e5',
    },
    body: {
      id: 'pi_3Mtw8wLkdIwHu7ix28a3tqPa',
      object: 'payment_intent',
      amount: 4900,
      amount_received: 4900,
      currency: 'usd',
      customer: 'cus_N9Xv82aLkd91',
      status: 'succeeded',
      payment_method_types: ['card'],
      metadata: {
        order_ref: 'ord_99182',
        tier: 'pro_monthly',
      },
    },
    diff: {
      oldLine: '- "amount": 2900, "plan": "legacy_starter"',
      newLine: '+ "amount": 4900, "plan": "pro_monthly", "tax_behavior": "exclusive"',
      note: 'Stripe API v2: price bump and explicit tax behavior added',
    },
  },
  {
    id: 'evt_github_4812',
    provider: 'GitHub',
    event: 'push',
    status: 200,
    time: '12:40:48',
    duration: '22ms',
    badge: 'main @ 8f9b2a1',
    signatureVerified: true,
    signatureType: 'HMAC-SHA256 (x-hub-signature-256)',
    headers: {
      'content-type': 'application/json',
      'x-github-event': 'push',
      'x-github-delivery': '7d8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b',
      'x-hub-signature-256': 'sha256=48a2f9b1c0d3e5f7a9b1c3d5e7f9a1b3',
      'user-agent': 'GitHub-Hookshot/7d8f9a0',
    },
    body: {
      ref: 'refs/heads/main',
      before: 'a1b2c3d4e5f6a7b8c9d0',
      after: '8f9b2a1c0d3e5f7a9b1c',
      repository: {
        id: 98120394,
        name: 'latch-core',
        full_name: 'acme/latch-core',
        private: true,
      },
      sender: {
        login: 'octocat',
        id: 583231,
      },
      head_commit: {
        id: '8f9b2a1c0d3e5f7a9b1c',
        message: 'feat(replay): add X-Webhook-Replay header forwarding',
      },
    },
    diff: {
      oldLine: '- "message": "fix: tunnel connection edge timeout"',
      newLine: '+ "message": "feat(replay): add X-Webhook-Replay header forwarding"',
      note: 'Commit author pushed to default branch',
    },
  },
  {
    id: 'evt_shopify_1029',
    provider: 'Shopify',
    event: 'orders/create',
    status: 200,
    time: '12:39:15',
    duration: '18ms',
    badge: '#1049 • $149.00',
    signatureVerified: true,
    signatureType: 'HMAC-SHA256 (x-shopify-hmac-sha256)',
    headers: {
      'content-type': 'application/json',
      'x-shopify-topic': 'orders/create',
      'x-shopify-shop-domain': 'acme-store.myshopify.com',
      'x-shopify-hmac-sha256': 'a8c1f0b9d8e7c6b5a4f3e2d1c0b9a8f7',
      'user-agent': 'Shopify-Webhook/2026-01',
    },
    body: {
      id: 8291039482,
      order_number: 1049,
      total_price: '149.00',
      currency: 'USD',
      financial_status: 'paid',
      line_items: [
        {
          id: 1928374,
          title: 'Mechanical Keychron Keyboard',
          quantity: 1,
          price: '149.00',
        },
      ],
      customer: {
        id: 671829,
        email: 'dev@company.com',
      },
    },
    diff: {
      oldLine: '- "financial_status": "pending"',
      newLine: '+ "financial_status": "paid", "fulfillment_status": "unfulfilled"',
      note: 'Payment gateway captured transaction funds',
    },
  },
  {
    id: 'evt_clerk_8910',
    provider: 'Clerk',
    event: 'user.created',
    status: 200,
    time: '12:38:02',
    duration: '11ms',
    badge: 'usr_2NqP8...',
    signatureVerified: true,
    signatureType: 'HMAC-SHA256 (svix-signature)',
    headers: {
      'content-type': 'application/json',
      'svix-id': 'msg_2NqP8zK1Y4w9X2v0',
      'svix-timestamp': '1690000000',
      'svix-signature': 'v1,g0h1i2j3k4l5m6n7o8p9q0r1s2t3u4v5',
      'user-agent': 'Svix-Webhooks/1.4',
    },
    body: {
      data: {
        id: 'user_2NqP8zK1Y4w9X2v0',
        first_name: 'Ayomide',
        last_name: 'Daniel',
        email_addresses: [
          {
            email_address: 'ayomidedans@gmail.com',
            verification: { status: 'verified' },
          },
        ],
        created_at: 1690000000,
      },
      object: 'event',
      type: 'user.created',
    },
    diff: {
      oldLine: '- "verification": { "status": "unverified" }',
      newLine: '+ "verification": { "status": "verified" }, "two_factor": true',
      note: 'User passed OAuth email verification',
    },
  },
];

type TabType = 'payload' | 'headers' | 'replay' | 'diff';

export function HeroConsole() {
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_EVENTS[0].id);
  const [activeTab, setActiveTab] = useState<TabType>('payload');
  const [targetUrl, setTargetUrl] = useState<string>('http://localhost:3000/api/webhook');
  const [replaying, setReplaying] = useState<boolean>(false);
  const [replaySuccess, setReplaySuccess] = useState<boolean>(false);
  const [replayLatency, setReplayLatency] = useState<number>(14);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const activeEvent = SAMPLE_EVENTS.find((e) => e.id === selectedId) ?? SAMPLE_EVENTS[0];

  function handleReplay() {
    setReplaying(true);
    setReplaySuccess(false);
    const latency = Math.floor(Math.random() * 8) + 12; // 12-19ms
    setTimeout(() => {
      setReplayLatency(latency);
      setReplaying(false);
      setReplaySuccess(true);
    }, 400);
  }

  function handleCopyJson() {
    navigator.clipboard.writeText(JSON.stringify(activeEvent.body, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  }

  return (
    <div className="w-full max-w-5xl rounded-2xl border border-white/[0.08] bg-[#0c0d10] shadow-2xl overflow-hidden transition-all duration-300 relative">
      {/* macOS / IDE Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#08080a] px-4 py-3 text-xs">
        {/* Left: Window Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]/90 border border-[#e0443e]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]/90 border border-[#dea123]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]/90 border border-[#1aab29]" />
          </div>
          <span className="text-zinc-600 font-mono text-[11px] ml-2 hidden sm:inline">
            latch // production-ledger // live
          </span>
        </div>

        {/* Center: Live stream beacon */}
        <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[11px] font-mono text-[#10b981]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
          </span>
          <span className="font-semibold tracking-wide">LIVE SSE STREAM</span>
        </div>

        {/* Right: Tunnel & Ingest Info */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="hidden md:flex items-center gap-1.5 text-zinc-400">
            <span className="text-[#10b981]">⚡</span>
            <span>relay:</span>
            <span className="text-zinc-200 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
              localhost:3000
            </span>
          </div>
          <span className="text-zinc-500 hidden sm:inline">|</span>
          <span className="text-[#10b981] font-semibold">{activeEvent.duration}</span>
        </div>
      </div>

      {/* Main Console Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06] min-h-[460px]">
        {/* LEFT COLUMN: Live Event Feed (5 cols) */}
        <div className="lg:col-span-5 p-3 sm:p-4 bg-[#090a0d]/60 flex flex-col space-y-2.5">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Incoming Webhooks
            </span>
            <span className="text-[10px] font-mono bg-white/[0.06] text-zinc-300 px-2 py-0.5 rounded-full">
              4 active
            </span>
          </div>

          <div className="space-y-2 flex-1">
            {SAMPLE_EVENTS.map((evt) => {
              const isSelected = selectedId === evt.id;
              return (
                <button
                  key={evt.id}
                  onClick={() => setSelectedId(evt.id)}
                  className={`w-full text-left rounded-xl p-3 text-xs transition-all cursor-pointer relative group/btn border ${
                    isSelected
                      ? 'border-[#10b981]/40 bg-[#10b981]/[0.08] text-white shadow-lg shadow-[#10b981]/5'
                      : 'border-white/[0.04] hover:border-white/[0.1] bg-[#121317]/70 text-zinc-300 hover:bg-[#16171d]'
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="absolute left-0 inset-y-2 w-1 bg-[#10b981] rounded-r-full" />
                  )}

                  <div className="flex items-center justify-between mb-1.5 pl-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                          evt.provider === 'Stripe'
                            ? 'bg-[#635bff]/20 text-[#8f88ff] border border-[#635bff]/30'
                            : evt.provider === 'GitHub'
                            ? 'bg-[#58a6ff]/20 text-[#79b8ff] border border-[#58a6ff]/30'
                            : evt.provider === 'Shopify'
                            ? 'bg-[#96bf48]/20 text-[#aedb57] border border-[#96bf48]/30'
                            : 'bg-[#6c47ff]/20 text-[#a08aff] border border-[#6c47ff]/30'
                        }`}
                      >
                        {evt.provider}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-500">{evt.time}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.2 rounded border border-[#10b981]/20">
                        {evt.status} OK
                      </span>
                    </div>
                  </div>

                  <div className="pl-1 flex items-center justify-between">
                    <span className="font-mono font-semibold text-xs text-white truncate max-w-[200px]">
                      {evt.event}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400 truncate">
                      {evt.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feed Footer Banner */}
          <div className="pt-2 px-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              Queue: Redis BLPOP (0 backlogged)
            </span>
            <span className="text-zinc-400">100% Captured</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Deep Event Inspector (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#0b0c10]/90">
          {/* Inspector Tab Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 bg-[#0d0e13]">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'payload', label: 'JSON Payload' },
                  { id: 'headers', label: 'Headers & Signature' },
                  { id: 'replay', label: '1-Click Replay' },
                  { id: 'diff', label: 'Schema Diff' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white/[0.08] text-white border border-white/[0.12] shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'payload' && (
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer border border-white/[0.06]"
              >
                {copiedJson ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[#10b981]">Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* TAB 1: JSON PAYLOAD VIEW */}
          {activeTab === 'payload' && (
            <div className="p-4 flex-1 font-mono text-xs overflow-y-auto max-h-[390px] leading-relaxed text-zinc-300">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-[11px]">EVENT ID:</span>
                  <span className="text-white bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.06]">
                    {activeEvent.id}
                  </span>
                </div>
                <span className="text-zinc-500 text-[11px]">POST • application/json</span>
              </div>

              <pre className="text-zinc-300 bg-[#07080a] p-3.5 rounded-xl border border-white/[0.04] overflow-x-auto">
                <span className="text-zinc-500">&#123;</span>
                {Object.entries(activeEvent.body).map(([key, val], idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  const isObj = typeof val === 'object' && val !== null;
                  return (
                    <div key={key} className="pl-4">
                      <span className="text-[#60a5fa]">&quot;{key}&quot;</span>
                      <span className="text-zinc-500">: </span>
                      {isObj ? (
                        <span>
                          {JSON.stringify(val, null, 2).replace(/\n/g, '\n  ')}
                        </span>
                      ) : typeof val === 'string' ? (
                        <span className="text-[#34d399]">&quot;{val}&quot;</span>
                      ) : typeof val === 'number' ? (
                        <span className="text-[#f59e0b]">{val}</span>
                      ) : (
                        <span className="text-[#a78bfa]">{String(val)}</span>
                      )}
                      {!isLast && <span className="text-zinc-500">,</span>}
                    </div>
                  );
                })}
                <span className="text-zinc-500">&#125;</span>
              </pre>
            </div>
          )}

          {/* TAB 2: HEADERS & AUTHENTICATION */}
          {activeTab === 'headers' && (
            <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[390px]">
              {/* Verification Chip */}
              <div className="rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-[#10b981]/20 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Cryptographic Signature Verified</h4>
                    <p className="text-[11px] font-mono text-[#10b981]">{activeEvent.signatureType}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#10b981] text-black font-mono text-[10px] font-bold">
                  VALID
                </span>
              </div>

              {/* Raw Headers Table */}
              <div className="rounded-xl border border-white/[0.06] bg-[#07080a] overflow-hidden">
                <div className="px-3.5 py-2 border-b border-white/[0.06] bg-white/[0.02] flex justify-between items-center text-[11px] font-mono text-zinc-400">
                  <span>HEADER NAME</span>
                  <span>PRESERVED VALUE</span>
                </div>
                <div className="divide-y divide-white/[0.04] font-mono text-xs">
                  {Object.entries(activeEvent.headers).map(([key, val]) => (
                    <div key={key} className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-white/[0.02]">
                      <span className="text-[#60a5fa] text-[11px] font-semibold">{key}</span>
                      <span className="text-zinc-300 text-[11px] truncate max-w-xs">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 font-mono">
                ℹ Latch stores raw headers and raw request text untouched to guarantee HMAC signature verification on replay.
              </p>
            </div>
          )}

          {/* TAB 3: 1-CLICK REPLAY SIMULATOR */}
          {activeTab === 'replay' && (
            <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[390px]">
              <div className="rounded-xl border border-white/[0.06] bg-[#07080a] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-zinc-300">
                    Target Destination
                  </span>
                  <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/25">
                    X-Webhook-Replay: true
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-white/[0.1] bg-[#121317] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#10b981]"
                  />
                  <button
                    onClick={handleReplay}
                    disabled={replaying}
                    className="rounded-lg bg-[#10b981] hover:bg-[#059669] text-black font-semibold text-xs px-4 py-2 transition-all cursor-pointer disabled:opacity-50 font-mono flex items-center justify-center gap-2 shrink-0 shadow-md glow-emerald"
                  >
                    {replaying ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-black" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Replaying...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Replay Webhook</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Delivery Receipt */}
              {replaySuccess && (
                <div className="rounded-xl border border-[#10b981]/30 bg-[#10b981]/[0.08] p-4 space-y-2 animate-fade-in-up">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-[#10b981] font-semibold">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Delivered to Destination
                    </span>
                    <span className="text-zinc-400">Response: 200 OK ({replayLatency}ms)</span>
                  </div>
                  <pre className="bg-[#050608] p-2.5 rounded-lg border border-white/[0.04] text-[11px] font-mono text-zinc-300">
                    &#123; &quot;received&quot;: true, &quot;handled_at&quot;: &quot;{new Date().toISOString()}&quot; &#125;
                  </pre>
                </div>
              )}

              <div className="rounded-xl border border-white/[0.04] bg-[#07080a] p-3 text-xs text-zinc-400 space-y-1">
                <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider block">
                  Deterministic Replay Guarantee
                </span>
                <p className="text-[11px] leading-relaxed">
                  Replays inject the exact original HTTP method, raw payload bytes, and provider headers (including HMAC signatures), appending only <code className="text-[#10b981] font-mono">X-Webhook-Replay: true</code> to avoid recursive loops.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SCHEMA DIFF VIEW */}
          {activeTab === 'diff' && (
            <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[390px] font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Payload Schema Comparison</span>
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
                    -1 deletion
                  </span>
                  <span className="text-[10px] bg-[#10b981]/20 text-[#10b981] px-1.5 py-0.5 rounded border border-[#10b981]/30">
                    +1 addition
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500">v1 vs v2</span>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#07080a] p-3.5 space-y-2">
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-red-300 leading-relaxed overflow-x-auto">
                  {activeEvent.diff.oldLine}
                </div>
                <div className="rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 p-2.5 text-[#34d399] leading-relaxed overflow-x-auto">
                  {activeEvent.diff.newLine}
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.04]">
                <span className="text-[#10b981] font-semibold">Change Note: </span>
                {activeEvent.diff.note}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

