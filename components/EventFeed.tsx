'use client';

import { useEffect, useState } from 'react';
import { EventViewer } from './EventViewer';

type WebhookEvent = {
  id: string;
  headers: Record<string, string>;
  body: unknown;
  raw_body: string;
  received_at: string;
};

export function EventFeed({ projectId }: { projectId: string }) {
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
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <span className="relative flex h-2 w-2">
            {connected && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                connected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
          </span>
          {connected ? 'Live' : 'Reconnecting…'}
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-gray-500 leading-relaxed">
            No webhooks yet. Point a service at the URL above and they'll show
            up here in real time.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {events.map((event) => (
              <li key={event.id}>
                <button
                  onClick={() => setSelectedId(event.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selected?.id === event.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-mono text-xs text-gray-500">
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

      <div>{selected && <EventViewer event={selected} />}</div>
    </div>
  );
}
