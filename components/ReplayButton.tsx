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
    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 space-y-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">Replay Destination URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="http://localhost:3000/api/process"
            disabled={loading}
            className="flex-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
          />
          <button
            onClick={handleReplay}
            disabled={loading}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:bg-gray-400 transition-colors shrink-0"
          >
            {loading ? 'Replaying...' : 'Replay'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2 font-mono">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="border border-gray-200 rounded bg-white p-3 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-gray-500">Response Status</span>
            <div className="flex items-center gap-2">
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  result.status >= 200 && result.status < 300
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {result.status}
              </span>
              <span className="text-gray-400 font-mono">{result.duration}ms</span>
            </div>
          </div>
          {result.body && (
            <div>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                Body
              </span>
              <pre className="bg-gray-50 rounded p-2 overflow-x-auto text-[11px] font-mono leading-normal text-gray-700 max-h-40">
                {result.body}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
