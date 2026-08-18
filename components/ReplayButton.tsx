'use client';

import { useState } from 'react';

type ReplayResult = {
  status: number;
  body: string;
  duration: number;
};

export function ReplayButton({
  eventId,
  initialDestinationUrl,
}: {
  eventId: string;
  initialDestinationUrl: string;
}) {
  const [destinationUrl, setDestinationUrl] = useState(initialDestinationUrl || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReplayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReplay() {
    if (!destinationUrl.trim()) {
      setError('Destination URL is required');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, destinationUrl }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Failed to replay (${res.status})`);
      }

      const data: ReplayResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-outline-variant rounded-xl p-3.5 bg-surface-container-low/70 space-y-3 shadow-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono font-semibold text-outline uppercase tracking-wider">
          Replay Destination URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="http://localhost:3000/api/process"
            disabled={loading}
            className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-mono text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all disabled:opacity-50"
          />
          <button
            onClick={handleReplay}
            disabled={loading}
            className="rounded-lg bg-primary-container text-on-primary-container hover:bg-primary-fixed px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50 active:scale-[0.98] shadow-sm"
          >
            {loading ? 'Replaying...' : 'Replay'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-error bg-error-container/20 border border-error/30 rounded-lg p-2 font-mono">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="border border-outline-variant rounded-lg bg-surface-container-lowest p-3 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-outline">Response Status</span>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  result.status >= 200 && result.status < 300
                    ? 'bg-primary-container/15 text-primary border border-primary-container/30'
                    : 'bg-error-container/20 text-error border border-error/30'
                }`}
              >
                {result.status} {result.status >= 200 && result.status < 300 ? 'OK' : 'ERR'}
              </span>
              <span className="text-outline font-mono text-[11px]">{result.duration}ms</span>
            </div>
          </div>
          {result.body && (
            <div>
              <span className="text-[9px] font-mono font-semibold text-outline uppercase tracking-wider block mb-1">
                Body
              </span>
              <pre className="bg-surface-container rounded-lg p-2 overflow-x-auto text-[11px] font-mono leading-normal text-on-surface-variant max-h-40 border border-outline-variant/40">
                {result.body}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
