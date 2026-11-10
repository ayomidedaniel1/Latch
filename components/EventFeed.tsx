'use client';

import { useEffect, useState } from 'react';
import { EventViewer } from './EventViewer';
import { DiffViewer } from './DiffViewer';
import { SearchBar } from './SearchBar';
import { TunnelStatus } from './TunnelStatus';
import type { WebhookEvent } from '@/lib/types';

export function EventFeed({
  projectId,
  destinationUrl,
}: {
  projectId: string;
  destinationUrl?: string;
}) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [searchResults, setSearchResults] = useState<WebhookEvent[] | null>(null);
  const [connected, setConnected] = useState(false);
  const [cliConnected, setCliConnected] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<[string | null, string | null]>([null, null]);

  useEffect(() => {
    const es = new EventSource(`/api/events/stream?projectId=${projectId}`);

    es.onopen = () => setConnected(true);
    es.onerror = () => {
      setConnected(false);
      setCliConnected(false);
    };

    es.onmessage = (e) => {
      if (e.data === 'connected') {
        setConnected(true);
        return;
      }
      try {
        const parsed = JSON.parse(e.data);
        if (parsed && parsed.type === 'cli-status') {
          setCliConnected(parsed.active);
          return;
        }
        const event: WebhookEvent = parsed;
        setEvents((prev) => {
          if (prev.some((p) => p.id === event.id)) return prev;
          return [event, ...prev].slice(0, 200);
        });
      } catch (err) {
        console.error('Failed to parse incoming SSE message', err);
      }
    };

    return () => es.close();
  }, [projectId]);

  const displayedEvents = searchResults !== null ? searchResults : events;
  const selected = displayedEvents.find((e) => e.id === selectedId) ?? displayedEvents[0] ?? null;

  // Compare mode helpers
  const eventA = compareIds[0] ? displayedEvents.find((e) => e.id === compareIds[0]) ?? null : null;
  const eventB = compareIds[1] ? displayedEvents.find((e) => e.id === compareIds[1]) ?? null : null;
  const bothSelected = eventA !== null && eventB !== null;

  function handleCompareClick(eventId: string) {
    setCompareIds((prev) => {
      if (prev[0] === eventId) return [prev[1], null];
      if (prev[1] === eventId) return [prev[0], null];
      if (prev[0] === null) return [eventId, prev[1]];
      if (prev[1] === null) return [prev[0], eventId];
      return [prev[0], eventId];
    });
  }

  function toggleCompareMode() {
    setCompareMode((prev) => {
      if (prev) {
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

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const time = d.toTimeString().split(' ')[0];
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    return `${time}.${ms}`;
  }

  function getEventPath(event: WebhookEvent) {
    const method = event.method || 'POST';
    const custom =
      event.headers['stripe-event-type'] ||
      event.headers['x-github-event'] ||
      event.headers['x-event-type'] ||
      event.headers['x-event-name'];
    if (custom) return `${method} /${custom}`;

    if (event.body && typeof event.body === 'object') {
      const b = event.body as Record<string, unknown>;
      if (typeof b.type === 'string') return `${method} /${b.type}`;
      if (typeof b.event === 'string') return `${method} /${b.event}`;
    }
    return `${method} /webhook`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left Column: Event Stream & List (5 cols) */}
      <div className="lg:col-span-5 space-y-3">
        {/* Search Bar matching reference */}
        <SearchBar
          projectId={projectId}
          onResults={(results) => setSearchResults(results)}
          onClear={() => setSearchResults(null)}
        />

        {/* Toolbar Bar: Live Stream & Compare Toggle matching screend.png */}
        <div className="flex items-center justify-between px-1 py-1 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {connected && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75 animate-ping" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    connected ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                  }`}
                />
              </span>
              <span className="font-semibold text-white tracking-tight text-xs">
                Live Stream
              </span>
            </div>
            <div className="h-3 w-px bg-[#27272a]" />
            <TunnelStatus cliConnected={cliConnected} />
          </div>

          {/* Compare Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#71717a]">Compare</span>
            <button
              type="button"
              onClick={toggleCompareMode}
              className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer p-0.5 border ${
                compareMode
                  ? 'bg-[#10b981]/20 border-[#10b981]'
                  : 'bg-[#1c1b1d] border-[#27272a]'
              }`}
              title="Toggle payload comparison"
            >
              <div
                className={`w-3 h-3 rounded-full transition-transform ${
                  compareMode
                    ? 'translate-x-3.5 bg-[#10b981]'
                    : 'translate-x-0 bg-[#71717a]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Compare Mode Hint */}
        {compareMode && !bothSelected && (
          <div className="text-[11px] font-mono text-[#9ca3af] bg-[#131315] border border-[#27272a] rounded px-3 py-1.5 flex items-center justify-between">
            <span>Select 2 events to compare schemas</span>
            <span className="text-[#10b981]">{compareIds[0] ? '1/2 selected' : '0/2 selected'}</span>
          </div>
        )}

        {/* Event List */}
        {displayedEvents.length === 0 ? (
          <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315]/80 p-8 text-center space-y-3">
            {searchResults !== null ? (
              <p className="text-xs font-mono text-[#71717a]">
                No webhooks match the current JSONB filter.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-60 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                  </span>
                  <span className="text-xs font-semibold text-white">Listening for events...</span>
                </div>
                <p className="text-xs text-[#71717a] max-w-xs mx-auto leading-relaxed">
                  Send a webhook to this project&apos;s Ingest URL or run the Latch Tunnel CLI.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {displayedEvents.map((event) => {
              const badge = compareMode ? getCompareBadge(event.id) : null;
              const isSelected = !compareMode && selected?.id === event.id;

              return (
                <button
                  key={event.id}
                  onClick={() =>
                    compareMode
                      ? handleCompareClick(event.id)
                      : setSelectedId(event.id)
                  }
                  className={`w-full text-left rounded-md border p-3 transition-all cursor-pointer relative group ${
                    badge === 'A'
                      ? 'border-blue-500/60 bg-blue-500/10'
                      : badge === 'B'
                        ? 'border-purple-500/60 bg-purple-500/10'
                        : isSelected
                          ? 'border-[#10b981] bg-[#161618] shadow-md'
                          : 'border-[#27272a] bg-[#131315]/90 hover:border-[#3f3f46] hover:bg-[#18181b]'
                  }`}
                >
                  {/* Top row: Path & Status */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`font-mono text-xs font-semibold truncate ${
                      isSelected ? 'text-[#10b981]' : 'text-white group-hover:text-[#10b981]'
                    }`}>
                      {getEventPath(event)}
                    </span>
                    {badge ? (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono ${
                        badge === 'A'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                      }`}>
                        EVENT {badge}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 shrink-0">
                        200 OK
                      </span>
                    )}
                  </div>

                  {/* Bottom row: Request ID & Timestamp */}
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#71717a]">
                    <span className="truncate">req_{event.id.slice(0, 8)}</span>
                    <span className="shrink-0">{formatTime(event.received_at)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Event Inspector / Diff Viewer (7 cols) */}
      <div className="lg:col-span-7">
        {compareMode && bothSelected ? (
          <DiffViewer eventA={eventA} eventB={eventB} />
        ) : selected ? (
          <EventViewer
            event={selected}
            destinationUrl={destinationUrl || ''}
          />
        ) : (
          <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315] p-12 text-center text-[#71717a] text-xs font-mono">
            No event selected
          </div>
        )}
      </div>
    </div>
  );
}
