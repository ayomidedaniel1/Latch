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
  const [showRawBody, setShowRawBody] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm space-y-4">
      <div>
        <div className="text-xs text-zinc-500 mb-1">Received</div>
        <div className="font-mono text-xs text-zinc-300">
          {new Date(event.received_at).toLocaleString()}
        </div>
      </div>

      <ReplayButton eventId={event.id} initialDestinationUrl={destinationUrl} />

      {/* Headers */}
      <JsonTree data={event.headers} rootLabel="Headers" defaultExpandDepth={1} />

      {/* Payload */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold font-mono">
            Payload
          </span>
          {Boolean(event.body) && Boolean(event.raw_body) && (
            <button
              onClick={() => setShowRawBody(!showRawBody)}
              className="text-[10px] text-zinc-600 hover:text-zinc-300 font-mono transition-colors cursor-pointer"
            >
              {showRawBody ? '← Tree View' : 'Raw →'}
            </button>
          )}
        </div>

        {showRawBody || !event.body ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
            <pre className="overflow-x-auto text-[12px] font-mono leading-relaxed text-zinc-400 whitespace-pre-wrap break-all">
              {event.raw_body || 'No payload'}
            </pre>
          </div>
        ) : (
          <JsonTree data={event.body} defaultExpandDepth={3} />
        )}
      </div>
    </div>
  );
}
