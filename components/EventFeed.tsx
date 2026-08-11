'use client';

import { useEffect, useState } from 'react';
import { EventViewer } from './EventViewer';
import { DiffViewer } from './DiffViewer';
import { SearchBar } from './SearchBar';
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
            {searchResults !== null ? (
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Search Results
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <StatusIndicator connected={connected} />
                  <span>{connected ? 'Live' : 'Reconnecting\u2026'}</span>
                </div>
                <div className="h-3 w-px bg-zinc-800" />
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    {cliConnected && (
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    )}
                    <span
                      className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                        cliConnected ? 'bg-emerald-500' : 'bg-zinc-600'
                      }`}
                    />
                  </span>
                  <span className={`text-xs font-mono tracking-tight transition-colors duration-200 ${cliConnected ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}`}>
                    {cliConnected ? 'CLI Connected' : 'CLI Offline'}
                  </span>
                </div>
              </div>
            )}
          </div>
          {displayedEvents.length >= 2 && (
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

        {/* Search Bar */}
        <SearchBar
          projectId={projectId}
          onResults={(results) => setSearchResults(results)}
          onClear={() => setSearchResults(null)}
        />

        {/* Compare mode hint */}
        {compareMode && !bothSelected && (
          <div className="mb-3 text-[10px] text-zinc-500 font-mono bg-zinc-900/50 border border-zinc-800 rounded-md px-3 py-2">
            Select two events to compare their payloads.
          </div>
        )}

        {/* Event List */}
        {displayedEvents.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
            {searchResults !== null ? (
              <p className="text-sm text-zinc-500">No matching webhooks found for this search query.</p>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-500 opacity-50 animate-ping" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-zinc-600" />
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-300">No events yet</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Events will show up here as soon as your webhook provider sends one to your Ingest URL.
                </p>
                <details className="group">
                  <summary className="text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors font-medium select-none">
                    Not seeing anything?
                  </summary>
                  <div className="mt-3 space-y-2 text-xs text-zinc-500 leading-relaxed pl-1">
                    <p>Check that you pasted the full Ingest URL (including <code className="text-zinc-400 bg-zinc-900 px-1 rounded">/api/ingest/{projectId}</code>) into your provider&apos;s webhook settings.</p>
                    <p>Some providers won&apos;t send anything until you trigger a test event manually (Stripe has a &quot;Send test webhook&quot; button, for example).</p>
                    <p>You can also test it yourself:</p>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-400 overflow-x-auto whitespace-pre">{`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain'}/api/ingest/${projectId} \\
  -H "Content-Type: application/json" \\
  -d '{"test": true}'`}</div>
                  </div>
                </details>
                <a href="/docs#troubleshooting" className="inline-block text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors mt-1">
                  Stuck? Check the troubleshooting guide &rarr;
                </a>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-1.5">
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
                    <div className="truncate font-mono text-xs">
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
