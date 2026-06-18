'use client';

import { useState } from 'react';
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

const MOCK_EVENTS: MockEvent[] = [
  {
    id: 'stripe-1',
    provider: 'stripe',
    type: 'payment_intent.succeeded',
    color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
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
    id: 'github-1',
    provider: 'github',
    type: 'push',
    color: 'text-zinc-300 border-zinc-500/20 bg-zinc-500/5',
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
        full_name: 'developer/latch',
      },
    },
  },
  {
    id: 'shopify-1',
    provider: 'shopify',
    type: 'orders/create',
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    timestamp: '09:58:30 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-shopify-topic': 'orders/create',
      'x-shopify-hmac-sha256': 'd8f9a...',
    },
    body: {
      id: 827391827,
      email: 'customer@latch.dev',
      total_price: '120.00',
      currency: 'USD',
      line_items: [
        {
          title: 'Premium Subscription Plan',
          quantity: 1,
        },
      ],
    },
  },
];

export function LandingMockup() {
  const [selectedId, setSelectedId] = useState('stripe-1');
  const [loading, setLoading] = useState(false);
  const [replayed, setReplayed] = useState(false);
  const [targetUrl, setTargetUrl] = useState('http://localhost:3000/api/webhook');

  const selectedEvent = MOCK_EVENTS.find((e) => e.id === selectedId) ?? MOCK_EVENTS[0];

  function handleMockReplay() {
    setLoading(true);
    setReplayed(false);
    setTimeout(() => {
      setLoading(false);
      setReplayed(true);
    }, 800);
  }

  return (
    <div className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-1 md:p-2 text-zinc-400 font-sans shadow-2xl text-left">
      {/* Top Header Mock Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-zinc-200 font-medium font-mono">live_webhook_stream</span>
        </div>
        <div className="text-zinc-500 font-mono text-[10px]">connected: http://localhost:3000</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 min-h-[360px]">
        {/* Left Side: Mock Events List */}
        <div className="p-3 space-y-2">
          {MOCK_EVENTS.map((event) => (
            <button
              key={event.id}
              onClick={() => {
                setSelectedId(event.id);
                setReplayed(false);
              }}
              className={`w-full text-left rounded-lg border p-3 text-xs transition-all cursor-pointer ${
                selectedId === event.id
                  ? 'border-zinc-500 bg-zinc-900 text-zinc-100'
                  : 'border-zinc-800/50 hover:border-zinc-700 bg-zinc-950 text-zinc-400'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[10px] text-zinc-500">{event.timestamp}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${event.color}`}>
                  {event.provider}
                </span>
              </div>
              <div className="font-mono truncate font-medium">{event.type}</div>
            </button>
          ))}
        </div>

        {/* Right Side: Mock Event Viewer */}
        <div className="p-4 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div className="font-mono text-[10px] text-zinc-500">Selected Event Info</div>
            <span className="font-mono text-[10px] bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded">
              {selectedEvent.method}
            </span>
          </div>

          {/* Simulated Replay Tool */}
          <div className="border border-zinc-800 bg-zinc-900/40 rounded-lg p-3 space-y-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Simulated Forward Destination
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled={loading}
                  className="flex-1 rounded border border-zinc-800 px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-zinc-600 bg-zinc-950 text-zinc-200"
                />
                <button
                  onClick={handleMockReplay}
                  disabled={loading}
                  className="rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Replaying...' : 'Replay'}
                </button>
              </div>
            </div>

            {replayed && (
              <div className="border border-emerald-950 bg-emerald-500/5 rounded p-2 text-[10px] font-mono flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-0.2 rounded bg-emerald-500/10 text-[9px] border border-emerald-500/20 font-bold font-mono">
                    200 OK
                  </span>
                  <span>Payload delivered successfully</span>
                </div>
                <span className="text-zinc-500">18ms</span>
              </div>
            )}
          </div>

          {/* Interactive JSON Tree - Headers */}
          <div className="max-h-28 overflow-y-auto">
            <JsonTree data={selectedEvent.headers} rootLabel="Headers" defaultExpandDepth={1} />
          </div>

          {/* Interactive JSON Tree - Payload */}
          <div className="max-h-40 overflow-y-auto">
            <JsonTree data={selectedEvent.body} rootLabel="Payload Body" defaultExpandDepth={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
