'use client';

import { useEffect, useState } from 'react';
import { EventViewer } from './EventViewer';
import { DiffViewer } from './DiffViewer';
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

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);

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

  // Compare mode helpers
  const eventA = compareIds[0] ? events.find((e) => e.id === compareIds[0]) ?? null : null;
  const eventB = compareIds[1] ? events.find((e) => e.id === compareIds[1]) ?? null : null;
  const bothSelected = eventA !== null && eventB !== null;

  function handleCompareClick(eventId: string) {
    setCompareIds((prev) => {
      // Already selected? Deselect it.
      if (prev[0] === eventId) return [prev[1], null];
      if (prev[1] === eventId) return [prev[0], null];
      // Fill first empty slot
      if (prev[0] === null) return [eventId, prev[1]];
      if (prev[1] === null) return [prev[0], eventId];
      // Both filled: replace B
      return [prev[0], eventId];
    });
  }

  function toggleCompareMode() {
    setCompareMode((prev) => {
      if (prev) {
        // Exiting compare mode: clear selections
        setCompareIds([null, null]);
      }
      return !prev;
    });
  }

  function getCompareBadge(eventId: string): 'A' | 'B' | null {
    if (compareIds[0] === eventId) return 'A';
    if (compareIds[1] === eventId) return 'B';
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sidebar */}
      <div>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <StatusIndicator connected={connected} />
            {connected ? 'Live' : 'Reconnecting\u2026'}
          </div>
          {events.length >= 2 && (
            <button
              onClick={toggleCompareMode}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                compareMode
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {compareMode ? 'Exit Compare' : 'Compare'}
            </button>
          )}
        </div>

        {/* Compare mode hint */}
        {compareMode && !bothSelected && (
          <div className="mb-3 text-[10px] text-zinc-500 font-mono bg-zinc-900/50 border border-zinc-800 rounded-md px-3 py-2">
            Select two events to compare their payloads.
          </div>
        )}

        {/* Event List */}
        {events.length === 0 ? (
          <p className="text-sm text-zinc-500 leading-relaxed">
            No webhooks yet. Point a service at the URL above and they&apos;ll show
            up here in real time.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {events.map((event) => {
              const badge = compareMode ? getCompareBadge(event.id) : null;
              const isSelected = !compareMode && selected?.id === event.id;

              return (
                <li key={event.id}>
                  <button
                    onClick={() =>
                      compareMode
                        ? handleCompareClick(event.id)
                        : setSelectedId(event.id)
                    }
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors relative ${
                      badge === 'A'
                        ? 'border-blue-500/40 bg-blue-500/5 text-zinc-100'
                        : badge === 'B'
                          ? 'border-purple-500/40 bg-purple-500/5 text-zinc-100'
                          : isSelected
                            ? 'border-emerald-500/40 bg-zinc-900 text-zinc-100'
                            : 'border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs text-zinc-500">
                        {new Date(event.received_at).toLocaleTimeString()}
                      </div>
                      {badge && <CompareBadge label={badge} />}
                    </div>
                    <div className="truncate">
                      {event.headers['content-type'] ?? 'unknown content-type'}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Right Panel */}
      <div>
        {compareMode && bothSelected ? (
          <DiffViewer eventA={eventA} eventB={eventB} />
        ) : (
          selected && (
            <EventViewer
              event={selected}
              destinationUrl={destinationUrl || ''}
            />
          )
        )}
      </div>
    </div>
  );
}

/* -- Status Indicator ------------------------------------- */

function StatusIndicator({ connected }: { connected: boolean }) {
  return (
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
  );
}

/* -- Compare Badge ---------------------------------------- */

function CompareBadge({ label }: { label: 'A' | 'B' }) {
  const colors =
    label === 'A'
      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

  return (
    <span
      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono ${colors}`}
    >
      {label}
    </span>
  );
}
