'use client';

import { useState, useEffect, useRef } from 'react';
import { JsonTree } from './JsonTree';

type MockEvent = {
  id: string;
  type: string;
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
};

const CLEAN_UNIVERSAL_EVENTS: MockEvent[] = [
  {
    id: 'evt-1',
    type: 'user.signup',
    timestamp: '10:05:01 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature-256': 'sha256=9f8e7d6c5b4a...',
      'user-agent': 'WebhookGateway/v1',
    },
    body: {
      event: 'user.signup',
      user_id: 'usr_99182',
      email: 'alex@company.com',
      plan: 'pro_tier',
    },
  },
  {
    id: 'evt-2',
    type: 'payment.succeeded',
    timestamp: '10:04:45 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature-256': 'sha256=a8f9c7b6e5d4...',
      'user-agent': 'WebhookGateway/v1',
    },
    body: {
      event: 'payment.succeeded',
      transaction_id: 'txn_3Mjj2WLkd',
      amount: 4900,
      currency: 'usd',
      status: 'completed',
    },
  },
  {
    id: 'evt-3',
    type: 'agent.completed',
    timestamp: '10:04:12 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature-256': 'sha256=c8e7f9a2b5d1...',
      'user-agent': 'AIEngine/v2',
    },
    body: {
      event: 'agent.completed',
      task_id: 'task_88192',
      tokens_processed: 1420,
      execution_ms: 380,
    },
  },
  {
    id: 'evt-4',
    type: 'order.dispatched',
    timestamp: '10:03:22 AM',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature-256': 'sha256=d8f9a0c1b2e3...',
      'user-agent': 'FulfillmentService/v1',
    },
    body: {
      event: 'order.dispatched',
      order_id: 'ord_990182',
      carrier: 'Express Logistics',
      status: 'in_transit',
    },
  },
];

export function LandingMockup() {
  const [selectedId, setSelectedId] = useState('evt-1');
  const [loading, setLoading] = useState(false);
  const [targetUrl, setTargetUrl] = useState('http://localhost:3000/api/webhook');
  const activeIndexRef = useRef(0);

  // Smooth, calm auto-cycle sequence
  useEffect(() => {
    const interval = setInterval(() => {
      activeIndexRef.current = (activeIndexRef.current + 1) % CLEAN_UNIVERSAL_EVENTS.length;
      const nextEvent = CLEAN_UNIVERSAL_EVENTS[activeIndexRef.current];
      setSelectedId(nextEvent.id);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const selectedEvent = CLEAN_UNIVERSAL_EVENTS.find((e) => e.id === selectedId) ?? CLEAN_UNIVERSAL_EVENTS[0];

  function handleMockReplay() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 350);
  }

  return (
    <div className="w-full rounded-2xl border border-latch-border bg-latch-card text-latch-secondary font-sans text-left shadow-xl overflow-hidden">
      {/* Sleek Minimal Header */}
      <div className="flex items-center justify-between border-b border-latch-border px-4 py-2.5 text-xs bg-latch-bg/40">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-latch-mint opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-latch-mint" />
          </span>
          <span className="text-latch-primary font-mono text-xs">live_webhook_stream</span>
        </div>

        <div className="text-latch-muted font-mono text-xs">
          connected: <span className="text-latch-primary">http://localhost:3000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-latch-border min-h-[340px]">
        {/* Left Side: Minimal Stream List */}
        <div className="p-3 space-y-2">
          {CLEAN_UNIVERSAL_EVENTS.map((event) => {
            const isSelected = selectedId === event.id;
            return (
              <button
                key={event.id}
                onClick={() => setSelectedId(event.id)}
                className={`w-full text-left rounded-xl border px-3.5 py-2.5 text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'border-latch-mint-border bg-latch-card-hover text-latch-primary'
                    : 'border-latch-border hover:border-latch-border-hover bg-latch-bg text-latch-secondary'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[11px] text-latch-muted">{event.timestamp}</span>
                  <span className="text-[10px] font-mono text-latch-mint font-semibold">200 OK</span>
                </div>
                <div className="font-mono font-medium text-xs text-latch-primary flex items-center justify-between">
                  <span>{event.type}</span>
                  {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-latch-mint" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Clean Event Inspector */}
        <div className="p-4 space-y-3.5 text-xs bg-latch-bg/20">
          <div className="flex justify-between items-center border-b border-latch-border pb-2.5">
            <span className="font-mono text-xs text-latch-muted">Payload Details</span>
            <span className="font-mono text-[10px] bg-latch-card-hover text-latch-mint px-2 py-0.5 rounded border border-latch-mint-border font-semibold">
              {selectedEvent.method}
            </span>
          </div>

          {/* Replay Action Area */}
          <div className="border border-latch-border bg-latch-bg rounded-xl p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                disabled={loading}
                className="flex-1 rounded-lg border border-latch-border px-3 py-1.5 text-xs font-mono bg-latch-card text-latch-primary focus:outline-none"
              />
              <button
                onClick={handleMockReplay}
                disabled={loading}
                className="rounded-lg bg-latch-mint hover:bg-latch-mint-hover text-latch-bg px-3.5 py-1.5 text-xs font-semibold font-mono transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Routing...' : 'Replay'}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-latch-mint pt-1">
              <span>✓ Delivered to Local Destination</span>
              <span className="text-latch-muted">14ms</span>
            </div>
          </div>

          {/* Collapsible Headers & Body */}
          <div className="max-h-28 overflow-y-auto rounded-lg border border-latch-border p-2 bg-latch-card">
            <JsonTree data={selectedEvent.headers} rootLabel="Headers" defaultExpandDepth={1} />
          </div>

          <div className="max-h-32 overflow-y-auto rounded-lg border border-latch-border p-2 bg-latch-card">
            <JsonTree data={selectedEvent.body} rootLabel="Payload Body" defaultExpandDepth={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
