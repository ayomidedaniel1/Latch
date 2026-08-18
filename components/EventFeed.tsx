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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Event Stream Column */}
      <div className="lg:col-span-5 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            {searchResults !== null ? (
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Search Results
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <StatusIndicator connected={connected} />
                  <span className="text-xs font-semibold text-on-surface">{connected ? 'Live' : 'Reconnecting\u2026'}</span>
                </div>
                <div className="h-3 w-px bg-outline-variant" />
                <TunnelStatus cliConnected={cliConnected} />
              </div>
            )}
          </div>
          {displayedEvents.length >= 2 && (
            <button
              onClick={toggleCompareMode}
              className={`text-[11px] font-mono px-3 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                compareMode
                  ? 'bg-primary-container text-on-primary-container border-primary shadow-sm'
                  : 'border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/50'
              }`}
            >
              {compareMode ? 'Exit Compare' : 'Compare'}
            </button>
          )}
        </div>

        {/* Search Bar */}
        <SearchBar
          projectId={projectId}
          onResults={(results) => setSearchResults(results)}
          onClear={() => setSearchResults(null)}
        />

        {/* Compare mode hint */}
        {compareMode && !bothSelected && (
          <div className="text-[11px] text-on-surface-variant font-mono bg-surface-container-low border border-outline-variant rounded-xl p-3 shadow-sm">
            Select two events from the list below to compare their schemas.
          </div>
        )}

        {/* Event List */}
        {displayedEvents.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low/70 backdrop-blur-md p-8 space-y-4 text-center">
            {searchResults !== null ? (
              <p className="text-xs text-on-surface-variant">No matching webhooks found for this search query.</p>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-50 animate-ping" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                  </span>
                  <h3 className="text-sm font-bold text-on-surface">No events yet</h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm mx-auto">
                  Events will show up here as soon as your webhook provider sends one to your Ingest URL.
                </p>
                <a href="/docs#troubleshooting" className="inline-block text-xs text-primary hover:underline font-semibold transition-colors mt-2">
                  Check troubleshooting guide &rarr;
                </a>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {displayedEvents.map((event) => {
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
                    className={`w-full text-left rounded-xl border p-3.5 text-xs transition-all relative overflow-hidden cursor-pointer ${
                      badge === 'A'
                        ? 'border-cyan-500/60 bg-cyan-500/10 text-on-surface shadow-md'
                        : badge === 'B'
                          ? 'border-purple-500/60 bg-purple-500/10 text-on-surface shadow-md'
                          : isSelected
                            ? 'border-primary bg-surface-container text-on-surface glow-active'
                            : 'border-outline-variant bg-surface-container-low hover:border-primary/50 text-on-surface-variant'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    )}
                    <div className="flex items-center justify-between mb-1 pl-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary text-[11px]">
                          {event.method || 'POST'}
                        </span>
                        <span className="font-mono text-on-surface truncate max-w-[150px]">
                          {event.headers['x-event-type'] || event.headers['stripe-event'] || '/webhook'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {badge && <CompareBadge label={badge} />}
                        <span className="font-mono text-[10px] text-primary px-1.5 py-0.5 rounded bg-primary-container/10 border border-primary-container/20">
                          200 OK
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-outline pl-1 mt-1.5">
                      <span>{event.id.slice(0, 8)}</span>
                      <span>{new Date(event.received_at).toLocaleTimeString()}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Right Detailed Panel Column */}
      <div className="lg:col-span-7">
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

function StatusIndicator({ connected }: { connected: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {connected && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping-emerald" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          connected ? 'bg-primary' : 'bg-error'
        }`}
      />
    </span>
  );
}

function CompareBadge({ label }: { label: 'A' | 'B' }) {
  const colors =
    label === 'A'
      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
      : 'bg-purple-500/15 text-purple-400 border-purple-500/30';

  return (
    <span
      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono ${colors}`}
    >
      {label}
    </span>
  );
}
