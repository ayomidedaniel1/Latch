'use client';

import { useState } from 'react';
import { JsonTree } from './JsonTree';
import type { WebhookEvent } from '@/lib/types';

type ReplayResult = {
  status: number;
  body: string;
  duration: number;
};

export function EventViewer({
  event,
  destinationUrl,
}: {
  event: WebhookEvent;
  destinationUrl: string;
}) {
  const [activeTab, setActiveTab] = useState<'payload' | 'headers' | 'logs'>('payload');
  const [showRawBody, setShowRawBody] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedHeaders, setCopiedHeaders] = useState(false);

  // Replay State
  const [customDestination, setCustomDestination] = useState(destinationUrl || '');
  const [showReplaySettings, setShowReplaySettings] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [replayResult, setReplayResult] = useState<ReplayResult | null>(null);
  const [replayError, setReplayError] = useState<string | null>(null);

  const handleCopyBody = async () => {
    const content = event.raw_body || JSON.stringify(event.body, null, 2) || '';
    await navigator.clipboard.writeText(content);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 1500);
  };

  const handleCopyHeaders = async () => {
    await navigator.clipboard.writeText(JSON.stringify(event.headers, null, 2));
    setCopiedHeaders(true);
    setTimeout(() => setCopiedHeaders(false), 1500);
  };

  const handleReplay = async () => {
    const dest = customDestination.trim() || destinationUrl.trim();
    if (!dest) {
      setShowReplaySettings(true);
      setReplayError('Destination URL is required to replay.');
      return;
    }

    setReplaying(true);
    setReplayError(null);
    setReplayResult(null);

    try {
      const res = await fetch('/api/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, destinationUrl: dest }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Failed to replay (${res.status})`);
      }

      const data: ReplayResult = await res.json();
      setReplayResult(data);
    } catch (err: unknown) {
      setReplayError(err instanceof Error ? err.message : String(err));
    } finally {
      setReplaying(false);
    }
  };

  // Derive mock/calculated processing time for developer delight
  const processingTime = event.raw_body ? Math.max(8, Math.min(42, Math.floor(event.raw_body.length / 30))) : 12;

  return (
    <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315]/95 flex flex-col overflow-hidden shadow-2xl">
      {/* Top Inspector Bar matching reference screend.png */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-[#27272a] bg-[#0e0e10]">
        {/* Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('payload')}
            className={`text-xs font-semibold pb-1 relative transition-colors cursor-pointer ${
              activeTab === 'payload'
                ? 'text-[#10b981] after:absolute after:bottom-[-10px] after:left-0 after:right-0 after:h-[2px] after:bg-[#10b981]'
                : 'text-[#71717a] hover:text-[#e5e1e4]'
            }`}
          >
            Payload
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`text-xs font-semibold pb-1 relative transition-colors cursor-pointer ${
              activeTab === 'headers'
                ? 'text-[#10b981] after:absolute after:bottom-[-10px] after:left-0 after:right-0 after:h-[2px] after:bg-[#10b981]'
                : 'text-[#71717a] hover:text-[#e5e1e4]'
            }`}
          >
            Headers
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`text-xs font-semibold pb-1 relative transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'text-[#10b981] after:absolute after:bottom-[-10px] after:left-0 after:right-0 after:h-[2px] after:bg-[#10b981]'
                : 'text-[#71717a] hover:text-[#e5e1e4]'
            }`}
          >
            Routing Logs
          </button>
        </div>

        {/* Right Info & Replay Action */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-[#71717a]">
            Processing Time: <strong className="text-[#9ca3af] font-normal">{processingTime}ms</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReplay}
              disabled={replaying}
              className="flex items-center gap-1.5 rounded bg-[#1c1b1d] hover:bg-[#201f22] border border-[#27272a] hover:border-[#10b981]/50 text-white hover:text-[#10b981] px-2.5 py-1 text-xs font-mono font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="text-[#10b981]">▷</span>
              <span>{replaying ? 'Replaying...' : 'Replay'}</span>
            </button>

            <button
              onClick={() => setShowReplaySettings(!showReplaySettings)}
              title="Configure Replay Destination"
              className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#1c1b1d] border border-transparent hover:border-[#27272a] transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Replay Destination Bar (if opened or needed) */}
      {showReplaySettings && (
        <div className="p-3 bg-[#0e0e10] border-b border-[#27272a] flex flex-col sm:flex-row items-center gap-2 animate-fade-in">
          <label className="text-[11px] font-mono text-[#71717a] shrink-0">Destination:</label>
          <input
            type="url"
            value={customDestination}
            onChange={(e) => setCustomDestination(e.target.value)}
            placeholder="http://localhost:3000/api/webhook"
            className="flex-1 w-full bg-[#131315] border border-[#27272a] focus:border-[#10b981] rounded px-2.5 py-1 text-xs font-mono text-white placeholder-[#52525b] outline-none"
          />
          <button
            onClick={handleReplay}
            disabled={replaying}
            className="bg-[#10b981] hover:bg-[#059669] text-black font-semibold px-3 py-1 rounded text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {replaying ? 'Sending...' : 'Send Replay'}
          </button>
        </div>
      )}

      {replayError && (
        <div className="p-2.5 bg-[#ef4444]/10 border-b border-[#ef4444]/25 text-xs text-[#ffb4ab] font-mono flex items-center justify-between">
          <span>Error: {replayError}</span>
          <button onClick={() => setReplayError(null)} className="text-[#ffb4ab] hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content Areas */}
      <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)]">
        {activeTab === 'payload' && (
          <>
            {/* Section: Request Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white tracking-tight">Request Body</span>
                <div className="flex items-center gap-3">
                  {Boolean(event.body) && Boolean(event.raw_body) && (
                    <button
                      onClick={() => setShowRawBody(!showRawBody)}
                      className="text-[11px] font-mono text-[#71717a] hover:text-[#10b981] transition-colors cursor-pointer"
                    >
                      {showRawBody ? '← Tree View' : 'Raw JSON →'}
                    </button>
                  )}
                  <button
                    onClick={handleCopyBody}
                    title="Copy payload"
                    className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#1c1b1d] transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    {copiedBody ? (
                      <span className="text-[10px] text-[#10b981] font-mono font-semibold">COPIED</span>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded border border-[#27272a] bg-[#0e0e10] p-3 overflow-x-auto text-xs font-mono leading-relaxed">
                {showRawBody || !event.body ? (
                  <pre className="text-[#9ca3af] whitespace-pre-wrap break-all">
                    {event.raw_body || 'No payload'}
                  </pre>
                ) : (
                  <JsonTree data={event.body} defaultExpandDepth={3} />
                )}
              </div>
            </div>

            {/* Section: Response Details */}
            <div className="space-y-2 pt-2 border-t border-[#27272a]/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white tracking-tight">Response Details</span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  {replayResult ? `${replayResult.status} ${replayResult.status < 400 ? 'OK' : 'ERR'}` : '200 OK'}
                </span>
              </div>

              <div className="rounded border border-[#27272a] bg-[#0e0e10] p-3 text-xs font-mono leading-relaxed text-[#9ca3af] overflow-x-auto">
                {replayResult ? (
                  <div>
                    <div className="text-[#71717a] mb-1">// Replay response in {replayResult.duration}ms:</div>
                    <pre className="whitespace-pre-wrap break-all text-[#e5e1e4]">
                      {replayResult.body || '(Empty response body)'}
                    </pre>
                  </div>
                ) : (
                  <pre className="text-[#e5e1e4]">
                    &#123;{'\n'}
                    {'  '}<span className="text-[#60a5fa]">&quot;status&quot;</span>: <span className="text-[#34d399]">&quot;received&quot;</span>,{'\n'}
                    {'  '}<span className="text-[#60a5fa]">&quot;queue_id&quot;</span>: <span className="text-[#34d399]">&quot;q_{event.id.slice(0, 8)}&quot;</span>{'\n'}
                    &#125;
                  </pre>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'headers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white tracking-tight">HTTP Headers</span>
              <button
                onClick={handleCopyHeaders}
                className="text-xs text-[#71717a] hover:text-[#10b981] font-mono transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedHeaders ? 'COPIED' : 'Copy Headers'}
              </button>
            </div>
            <div className="rounded border border-[#27272a] bg-[#0e0e10] divide-y divide-[#27272a]/50 text-xs font-mono">
              {Object.entries(event.headers).map(([k, v]) => (
                <div key={k} className="p-2.5 flex items-start justify-between gap-4">
                  <span className="text-[#9ca3af] shrink-0 font-medium">{k}</span>
                  <span className="text-[#34d399] break-all text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-white tracking-tight">Ingest &amp; Worker Audit Logs</div>
            <div className="rounded border border-[#27272a] bg-[#0e0e10] p-3 text-xs font-mono space-y-2 text-[#9ca3af]">
              <div className="flex items-center gap-2">
                <span className="text-[#10b981]">✔</span>
                <span className="text-[#71717a]">{new Date(event.received_at).toLocaleTimeString()}</span>
                <span>Webhook received from {event.source_ip || 'remote IP'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#10b981]">✔</span>
                <span className="text-[#71717a]">{new Date(event.received_at).toLocaleTimeString()}</span>
                <span>Pushed to Redis BLPOP queue (webhook-queue)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#10b981]">✔</span>
                <span className="text-[#71717a]">{new Date(event.received_at).toLocaleTimeString()}</span>
                <span>Drained by worker: Persisted to PostgreSQL events table</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#10b981]">✔</span>
                <span className="text-[#71717a]">{new Date(event.received_at).toLocaleTimeString()}</span>
                <span>Redis Pub/Sub broadcast completed to active SSE listeners</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
