'use client';

import { useState } from 'react';
import { ReplayButton } from './ReplayButton';
import { JsonTree } from './JsonTree';
import type { WebhookEvent } from '@/lib/types';

export function EventViewer({
  event,
  destinationUrl,
}: {
  event: WebhookEvent;
  destinationUrl: string;
}) {
  const [activeTab, setActiveTab] = useState<'payload' | 'headers' | 'raw'>('payload');

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low/70 backdrop-blur-md text-sm space-y-4 overflow-hidden shadow-xl p-5">
      {/* Top Meta info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/60">
        <div>
          <span className="text-[10px] font-mono font-semibold text-outline uppercase tracking-wider">
            Received At
          </span>
          <div className="font-mono text-xs font-semibold text-on-surface mt-0.5">
            {new Date(event.received_at).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant font-medium">
            IP: {event.source_ip || 'unknown'}
          </span>
        </div>
      </div>

      {/* Replay action bar */}
      <ReplayButton eventId={event.id} initialDestinationUrl={destinationUrl} />

      {/* Tabbed Inspector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-outline-variant">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('payload')}
              className={`px-3 py-2 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'payload'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Payload
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-2 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'headers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Headers
            </button>
            {Boolean(event.raw_body) && (
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-2 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'raw'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Raw Body
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'payload' && (
          <div>
            {event.body ? (
              <JsonTree data={event.body} defaultExpandDepth={3} />
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                <pre className="overflow-x-auto text-[12px] font-mono leading-relaxed text-on-surface-variant whitespace-pre-wrap break-all">
                  {event.raw_body || 'No payload'}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'headers' && (
          <JsonTree data={event.headers} defaultExpandDepth={2} />
        )}

        {activeTab === 'raw' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
            <pre className="overflow-x-auto text-[12px] font-mono leading-relaxed text-on-surface-variant whitespace-pre-wrap break-all">
              {event.raw_body || 'No raw payload'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
