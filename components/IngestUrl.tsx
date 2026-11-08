'use client';

import { useState } from 'react';
import { Tooltip } from './Tooltip';

export function IngestUrl({ projectId }: { projectId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/api/ingest/${projectId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        onClick={handleCopy}
        className="font-mono text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
        title="Copy ingest URL"
      >
        {copied ? '✓ Copied' : `/api/ingest/${projectId}`}
      </button>
      <Tooltip
        content="This is the URL your webhook provider should send events to. Copy it and paste it into your provider's webhook config: for Stripe, that's Developers → Webhooks → Add endpoint."
        position="bottom"
      >
        <svg className="h-3.5 w-3.5 text-zinc-600 hover:text-zinc-400 transition-colors cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </Tooltip>
    </span>
  );
}

