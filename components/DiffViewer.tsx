'use client';

import { useMemo, useState } from 'react';
import { computeJsonDiff } from '@/lib/json-diff';
import type { WebhookEvent, DiffEntry, DiffEntryType } from '@/lib/types';

type DiffViewerProps = {
  eventA: WebhookEvent;
  eventB: WebhookEvent;
};

export function DiffViewer({ eventA, eventB }: DiffViewerProps) {
  const [diffTarget, setDiffTarget] = useState<'body' | 'headers'>('body');

  const dataA = diffTarget === 'body' ? eventA.body : eventA.headers;
  const dataB = diffTarget === 'body' ? eventB.body : eventB.headers;

  const entries = useMemo(() => computeJsonDiff(dataA, dataB), [dataA, dataB]);

  const counts = useMemo(() => {
    const c = { added: 0, removed: 0, changed: 0, unchanged: 0 };
    for (const e of entries) {
      c[e.type]++;
    }
    return c;
  }, [entries]);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 text-sm space-y-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-4 text-xs">
          <EventBadge label="A" color="blue" event={eventA} />
          <span className="text-zinc-600">vs</span>
          <EventBadge label="B" color="purple" event={eventB} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDiffTarget('body')}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer ${
              diffTarget === 'body'
                ? 'bg-zinc-800 text-zinc-200'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Payload
          </button>
          <button
            onClick={() => setDiffTarget('headers')}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer ${
              diffTarget === 'headers'
                ? 'bg-zinc-800 text-zinc-200'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Headers
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <DiffSummary counts={counts} />

      {/* Diff Body */}
      <div className="max-h-[500px] overflow-y-auto">
        {entries.length === 0 ? (
          <div className="px-4 py-8 text-center text-zinc-500 text-xs">
            {dataA == null && dataB == null
              ? 'Both payloads are empty.'
              : 'No differences found. Payloads are identical.'}
          </div>
        ) : (
          <div className="font-mono text-[12px] leading-[1.8]">
            {entries.map((entry, i) => (
              <DiffLine key={`${entry.path}-${i}`} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -- Event Badge ------------------------------------------ */

function EventBadge({
  label,
  color,
  event,
}: {
  label: string;
  color: 'blue' | 'purple';
  event: WebhookEvent;
}) {
  const colorClasses =
    color === 'blue'
      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colorClasses}`}
      >
        {label}
      </span>
      <span className="text-zinc-400 font-mono text-[10px]">
        {new Date(event.received_at).toLocaleTimeString()}
      </span>
    </div>
  );
}

/* -- Summary Bar ------------------------------------------ */

function DiffSummary({
  counts,
}: {
  counts: Record<DiffEntryType, number>;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 text-[10px] font-mono">
      {counts.added > 0 && (
        <span className="text-emerald-400">+{counts.added} added</span>
      )}
      {counts.removed > 0 && (
        <span className="text-red-400">-{counts.removed} removed</span>
      )}
      {counts.changed > 0 && (
        <span className="text-amber-400">~{counts.changed} changed</span>
      )}
      <span className="text-zinc-600">{counts.unchanged} unchanged</span>
    </div>
  );
}

/* -- Diff Line -------------------------------------------- */

function DiffLine({ entry }: { entry: DiffEntry }) {
  const indent = entry.depth * 16;

  const bgClass = BG_CLASSES[entry.type];
  const borderClass = BORDER_CLASSES[entry.type];
  const iconChar = ICON_CHARS[entry.type];
  const iconColor = ICON_COLORS[entry.type];

  return (
    <div
      className={`flex items-start gap-2 px-4 py-0.5 ${bgClass} border-l-2 ${borderClass}`}
    >
      {/* Change indicator */}
      <span className={`shrink-0 w-3 text-center ${iconColor}`}>{iconChar}</span>

      {/* Content */}
      <div style={{ paddingLeft: indent }}>
        <span className="text-zinc-400">{entry.key}</span>
        <span className="text-zinc-600">: </span>
        <DiffValue entry={entry} />
      </div>
    </div>
  );
}

/* -- Diff Value Renderer ---------------------------------- */

function DiffValue({ entry }: { entry: DiffEntry }) {
  switch (entry.type) {
    case 'unchanged':
      return <FormattedValue value={entry.oldValue} className="text-zinc-500" />;

    case 'added':
      return <FormattedValue value={entry.newValue} className="text-emerald-400" />;

    case 'removed':
      return <FormattedValue value={entry.oldValue} className="text-red-400 line-through" />;

    case 'changed':
      return (
        <span className="inline-flex items-center gap-1.5">
          <FormattedValue value={entry.oldValue} className="text-red-400 line-through" />
          <span className="text-zinc-600">{'\u2192'}</span>
          <FormattedValue value={entry.newValue} className="text-emerald-400" />
        </span>
      );
  }
}

/* -- Formatted Value -------------------------------------- */

function FormattedValue({
  value,
  className,
}: {
  value: unknown;
  className: string;
}) {
  if (typeof value === 'string') {
    return <span className={className}>&quot;{value}&quot;</span>;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className={className}>{String(value)}</span>;
  }
  if (value === null) {
    return <span className={className}>null</span>;
  }
  if (typeof value === 'object') {
    return <span className={className}>{JSON.stringify(value)}</span>;
  }
  return <span className={className}>{String(value)}</span>;
}

/* -- Style Constants -------------------------------------- */

const BG_CLASSES: Record<DiffEntryType, string> = {
  added: 'bg-emerald-500/5',
  removed: 'bg-red-500/5',
  changed: 'bg-amber-500/5',
  unchanged: '',
};

const BORDER_CLASSES: Record<DiffEntryType, string> = {
  added: 'border-emerald-500/40',
  removed: 'border-red-500/40',
  changed: 'border-amber-500/40',
  unchanged: 'border-transparent',
};

const ICON_CHARS: Record<DiffEntryType, string> = {
  added: '+',
  removed: '-',
  changed: '~',
  unchanged: ' ',
};

const ICON_COLORS: Record<DiffEntryType, string> = {
  added: 'text-emerald-400',
  removed: 'text-red-400',
  changed: 'text-amber-400',
  unchanged: 'text-zinc-700',
};
