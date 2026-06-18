'use client';

import { useState } from 'react';

export function IngestUrl({ projectId }: { projectId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/api/ingest/${projectId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      className="font-mono text-xs text-gray-500 hover:text-gray-900 transition-colors"
      title="Copy ingest URL"
    >
      {copied ? 'Copied' : `/api/ingest/${projectId}`}
    </button>
  );
}
