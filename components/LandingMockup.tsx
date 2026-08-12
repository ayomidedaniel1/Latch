'use client';

import { useState, useEffect, useRef } from 'react';
import { JsonTree } from './JsonTree';

type MockEvent = {
  id: string;
  provider: string;
  type: string;
  color: string;
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
};

const DIVERSE_MOCK_EVENTS: MockEvent[] = [
  {
    id: 'clerk-1',
    provider: 'clerk',
    type: 'user.created',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    timestamp: '10:05:01 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'svix-id': 'msg_2NkJ8XLkdG4vNVV',
      'svix-timestamp': '1672531201',
      'svix-signature': 'v1,g9e8f7a6b5c4d3...',
    },
    body: {
      data: {
        id: 'user_2NkJ8XLkd',
        email_addresses: [{ email_address: 'alex@latch.dev', id: 'idn_1928' }],
        first_name: 'Alex',
        last_name: 'Developer',
      },
      object: 'event',
      type: 'user.created',
    },
  },
  {
    id: 'ai-agent-1',
    provider: 'openai-agent',
    type: 'workflow.completed',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    timestamp: '10:04:45 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature-sha256': 'sha256=9f8e7d6c5b4a...',
      'user-agent': 'AI-Workflow-Engine/v2',
    },
    body: {
      job_id: 'job_ai_99182',
      model: 'gpt-4o-mini',
      status: 'completed',
      tokens_used: 1240,
      output: {
        summary: 'Webhook payload processed and signature verified.',
      },
    },
  },
  {
    id: 'resend-1',
    provider: 'resend',
    type: 'email.delivered',
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    timestamp: '10:04:30 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'svix-signature': 'v1,a8f9c7b6e5d4...',
      'user-agent': 'Resend-Webhooks/1.0',
    },
    body: {
      type: 'email.delivered',
      created_at: '2026-08-13T00:04:30.000Z',
      data: {
        email_id: 'msg_resend_88192',
        to: ['dev@company.com'],
        subject: 'Your Latch API Key',
      },
    },
  },
  {
    id: 'stripe-1',
    provider: 'stripe',
    type: 'payment_intent.succeeded',
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    timestamp: '10:04:12 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': 't=1672531199,v1=g9e8f...',
      'user-agent': 'Stripe/v1 Webhooks',
    },
    body: {
      id: 'evt_1Mjj2XLkdG4vNVV',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_3Mjj2WLkdG4vNVV',
          amount: 4900,
          currency: 'usd',
          status: 'succeeded',
        },
      },
    },
  },
  {
    id: 'custom-api-1',
    provider: 'microservice',
    type: 'order.dispatched',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    timestamp: '10:03:22 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-internal-auth': 'Bearer sec_token_99182',
      'x-service-name': 'fulfillment-engine',
    },
    body: {
      order_id: 'ord_990182',
      tracking_number: '1Z9999999999999999',
      carrier: 'UPS Express',
      destination: 'San Francisco, CA',
    },
  },
  {
    id: 'github-1',
    provider: 'github',
    type: 'push',
    color: 'text-zinc-300 border-zinc-700 bg-zinc-800/40',
    timestamp: '10:02:45 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-github-event': 'push',
      'x-hub-signature-256': 'sha256=a8f9c...',
    },
    body: {
      ref: 'refs/heads/main',
      before: 'a2f9b8c...',
      after: 'c8e7f9a...',
      repository: {
        name: 'latch',
        full_name: 'ayomidedaniel1/Latch',
      },
    },
  },
];

export function LandingMockup() {
  const [selectedId, setSelectedId] = useState('clerk-1');
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(false);
  const [replayed, setReplayed] = useState(true);
  const [targetUrl, setTargetUrl] = useState('http://localhost:3000/api/webhook');

  const activeIndexRef = useRef(0);

  // Auto-play stream sequence
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      activeIndexRef.current = (activeIndexRef.current + 1) % DIVERSE_MOCK_EVENTS.length;
      const nextEvent = DIVERSE_MOCK_EVENTS[activeIndexRef.current];
      setSelectedId(nextEvent.id);
      setReplayed(true);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const selectedEvent = DIVERSE_MOCK_EVENTS.find((e) => e.id === selectedId) ?? DIVERSE_MOCK_EVENTS[0];

  function handleMockReplay() {
    setLoading(true);
    setReplayed(false);
    setTimeout(() => {
      setLoading(false);
      setReplayed(true);
    }, 400);
  }

  return (
    <div className="w-full rounded-2xl border border-latch-border bg-latch-card p-1 md:p-2 text-latch-secondary font-sans text-left shadow-2xl relative overflow-hidden group">
      {/* Top Header Mock Bar */}
      <div className="flex items-center justify-between border-b border-latch-border px-4 py-3 text-xs bg-latch-bg/50">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-latch-mint opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-latch-mint" />
          </span>
          <span className="text-latch-primary font-medium font-mono text-xs tracking-wide">live_webhook_stream</span>
          <span className="text-[10px] bg-latch-mint-bg text-latch-mint border border-latch-mint-border px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">
            Sub-10ms Pub/Sub
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-[11px] font-mono text-latch-muted hover:text-latch-primary transition-colors flex items-center gap-1.5 bg-latch-card-hover px-2.5 py-1 rounded border border-latch-border cursor-pointer"
          >
            <span>{isPlaying ? '⏸ Pause Demo' : '▶ Auto-Play Stream'}</span>
          </button>
          <div className="text-latch-muted font-mono text-xs hidden sm:block">
            connected: <span className="text-latch-primary">http://localhost:3000</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-latch-border min-h-[380px]">
        {/* Left Side: Animated Mock Events Stream */}
        <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
          <div className="text-[11px] font-mono text-latch-muted px-1 pb-1 flex items-center justify-between">
            <span>Incoming Traffic Stream</span>
            <span className="text-[10px] text-latch-mint font-mono">Any HTTP POST</span>
          </div>

          {DIVERSE_MOCK_EVENTS.map((event) => {
            const isSelected = selectedId === event.id;
            return (
              <button
                key={event.id}
                onClick={() => {
                  setIsPlaying(false);
                  setSelectedId(event.id);
                  setReplayed(true);
                }}
                className={`w-full text-left rounded-xl border p-3 text-xs transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'border-latch-mint-border bg-latch-card-hover text-latch-primary shadow-lg shadow-latch-mint-bg/20 scale-[1.01]'
                    : 'border-latch-border hover:border-latch-border-hover bg-latch-bg/80 text-latch-secondary opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono text-[11px] text-latch-muted">{event.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono border uppercase tracking-wider font-semibold ${event.color}`}>
                    {event.provider}
                  </span>
                </div>
                <div className="font-mono truncate font-semibold text-xs text-latch-primary flex items-center justify-between">
                  <span>{event.type}</span>
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-latch-mint animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Mock Event Viewer & Live Forwarding */}
        <div className="p-4 space-y-4 text-xs bg-latch-bg/30">
          <div className="flex justify-between items-center border-b border-latch-border pb-3">
            <div className="font-mono text-xs text-latch-muted">Selected Payload Info</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] bg-latch-card-hover text-latch-mint px-2 py-0.5 rounded border border-latch-mint-border font-bold">
                {selectedEvent.method}
              </span>
            </div>
          </div>

          {/* Simulated Replay Tool */}
          <div className="border border-latch-border bg-latch-bg rounded-xl p-3.5 space-y-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-latch-muted uppercase tracking-wider font-semibold">
                  Local Server Forward Destination
                </label>
                <span className="text-[10px] font-mono text-latch-mint font-bold">Latch Tunnel Active</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-latch-border px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-latch-mint bg-latch-card text-latch-primary"
                />
                <button
                  onClick={handleMockReplay}
                  disabled={loading}
                  className="rounded-lg bg-latch-mint hover:bg-latch-mint-hover text-latch-bg px-4 py-1.5 text-xs font-semibold font-mono transition-all cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {loading ? 'Routing...' : 'Replay'}
                </button>
              </div>
            </div>

            {replayed && (
              <div className="border border-latch-mint-border bg-latch-mint-bg/80 rounded-lg p-2.5 text-xs font-mono flex items-center justify-between text-latch-mint animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-latch-mint-bg text-xs font-bold font-mono border border-latch-mint-border">
                    200 OK
                  </span>
                  <span className="text-xs">Original Headers & Payload Delivered</span>
                </div>
                <span className="text-latch-muted text-xs font-mono">14ms</span>
              </div>
            )}
          </div>

          {/* Interactive JSON Tree - Headers */}
          <div className="max-h-28 overflow-y-auto border border-latch-border/60 rounded-lg p-2 bg-latch-card/60">
            <JsonTree data={selectedEvent.headers} rootLabel="Headers (Preserved)" defaultExpandDepth={1} />
          </div>

          {/* Interactive JSON Tree - Payload */}
          <div className="max-h-36 overflow-y-auto border border-latch-border/60 rounded-lg p-2 bg-latch-card/60">
            <JsonTree data={selectedEvent.body} rootLabel="Payload Body" defaultExpandDepth={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
