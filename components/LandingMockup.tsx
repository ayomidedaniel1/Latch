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
    color: 'text-provider-stripe border-provider-stripe/30 bg-provider-stripe/10',
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
    color: 'text-provider-github border-provider-github/30 bg-provider-github/10',
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
    color: 'text-provider-shopify border-provider-shopify/30 bg-provider-shopify/10',
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
    <div className="w-full rounded-xl border border-latch-border bg-latch-card p-1 md:p-2 text-latch-secondary font-sans text-left">
      {/* Top Header Mock Bar */}
      <div className="flex items-center justify-between border-b border-latch-border px-4 py-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-latch-mint opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-latch-mint" />
          </span>
          <span className="text-latch-primary font-medium font-mono">live_webhook_stream</span>
        </div>
        <div className="text-latch-muted font-mono text-xs">connected: http://localhost:3000</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-latch-border min-h-[360px]">
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
                  ? 'border-latch-mint-border bg-latch-card-hover text-latch-primary'
                  : 'border-latch-border hover:border-latch-border-hover bg-latch-bg text-latch-secondary'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-mono text-xs text-latch-muted">{event.timestamp}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono border ${event.color}`}>
                  {event.provider}
                </span>
              </div>
              <div className="font-mono truncate font-medium text-xs text-latch-primary">{event.type}</div>
            </button>
          ))}
        </div>

        {/* Right Side: Mock Event Viewer */}
        <div className="p-4 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-latch-border pb-3">
            <div className="font-mono text-xs text-latch-muted">Selected Event Info</div>
            <span className="font-mono text-xs bg-latch-card-hover text-latch-primary px-2.5 py-0.5 rounded border border-latch-border">
              {selectedEvent.method}
            </span>
          </div>

          {/* Simulated Replay Tool */}
          <div className="border border-latch-border bg-latch-bg rounded-lg p-3 space-y-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-latch-muted uppercase tracking-wider">
                Simulated Forward Destination
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled={loading}
                  className="flex-1 rounded border border-latch-border px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-latch-border-hover bg-latch-card text-latch-primary"
                />
                <button
                  onClick={handleMockReplay}
                  disabled={loading}
                  className="rounded bg-latch-mint hover:bg-latch-mint-hover text-latch-bg px-3.5 py-1.5 text-xs font-semibold font-mono transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Replaying...' : 'Replay'}
                </button>
              </div>
            </div>

            {replayed && (
              <div className="border border-latch-mint-border bg-latch-mint-bg rounded p-2.5 text-xs font-mono flex items-center justify-between text-latch-mint">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-latch-mint-bg text-xs font-bold font-mono border border-latch-mint-border">
                    200 OK
                  </span>
                  <span>Payload delivered successfully</span>
                </div>
                <span className="text-latch-muted">18ms</span>
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
