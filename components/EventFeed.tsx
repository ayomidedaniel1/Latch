'use client';

import { useEffect, useState } from 'react';
import { EventViewer } from './EventViewer';
import type { WebhookEvent } from '@/lib/types';

export function EventFeed({
  projectId,
  destinationUrl,
}: {
  projectId: string;
  destinationUrl?: string;
}) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/events/stream?projectId=${projectId}`);

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (e) => {
      if (e.data === 'connected') {
        setConnected(true);
        return;
      }
      const event: WebhookEvent = JSON.parse(e.data);
      setEvents((prev) => {
        if (prev.some((p) => p.id === event.id)) return prev;
        return [event, ...prev].slice(0, 200);
      });
    };

    return () => es.close();
  }, [projectId]);

  const selected = events.find((e) => e.id === selectedId) ?? events[0] ?? null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center gap-2 mb-4 text-sm text-zinc-400">
          <span className="relative flex h-2 w-2">
            {connected && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'
                }`}
            />
          </span>
          {connected ? 'Live' : 'Reconnecting…'}
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-zinc-500 leading-relaxed">
            No webhooks yet. Point a service at the URL above and they&apos;ll show
            up here in real time.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {events.map((event) => (
              <li key={event.id}>
                <button
                  onClick={() => setSelectedId(event.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${selected?.id === event.id
                      ? 'border-emerald-500/40 bg-zinc-900 text-zinc-100'
                      : 'border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                >
                  <div className="font-mono text-xs text-zinc-500">
                    {new Date(event.received_at).toLocaleTimeString()}
                  </div>
                  <div className="truncate">
                    {event.headers['content-type'] ?? 'unknown content-type'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>{selected && <EventViewer event={selected} destinationUrl={destinationUrl || ''} />}</div>
    </div>
  );
}
