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
    <div className="glass-panel rounded-lg border border-[#27272a] bg-[#131315] text-sm overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] px-4 py-2.5 bg-[#0e0e10]">
        <div className="flex items-center gap-3 text-xs">
          <EventBadge label="A" color="blue" event={eventA} />
          <span className="text-[#71717a] font-mono text-[10px]">vs</span>
          <EventBadge label="B" color="purple" event={eventB} />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDiffTarget('body')}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer ${
              diffTarget === 'body'
                ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-semibold'
                : 'text-[#71717a] hover:text-[#e5e1e4]'
            }`}
          >
            Payload
          </button>
          <button
            onClick={() => setDiffTarget('headers')}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors cursor-pointer ${
              diffTarget === 'headers'
                ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-semibold'
                : 'text-[#71717a] hover:text-[#e5e1e4]'
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
          <div className="px-4 py-8 text-center text-[#71717a] text-xs font-mono">
            {dataA == null && dataB == null
              ? 'Both payloads are empty.'
              : 'No differences found. Payloads are identical.'}
          </div>
        ) : (
          <div className="font-mono text-[12px] leading-[1.8] py-1">
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
      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      : 'bg-purple-500/10 text-purple-400 border-purple-500/30';

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${colorClasses}`}
      >
        {label}
      </span>
      <span className="text-[#9ca3af] font-mono text-[11px]">
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
    <div className="flex items-center gap-3 px-4 py-1.5 border-b border-[#27272a] text-[10px] font-mono bg-[#161618]">
      {counts.added > 0 && (
        <span className="text-[#10b981]">+{counts.added} added</span>
      )}
      {counts.removed > 0 && (
        <span className="text-[#ef4444]">-{counts.removed} removed</span>
      )}
      {counts.changed > 0 && (
        <span className="text-[#f59e0b]">~{counts.changed} changed</span>
      )}
      <span className="text-[#71717a]">{counts.unchanged} unchanged</span>
    </div>
  );
}

/* -- Diff Line -------------------------------------------- */

function DiffLine({ entry }: { entry: DiffEntry }) {
  const indent = entry.depth * 14;

  const bgClass = BG_CLASSES[entry.type];
  const borderClass = BORDER_CLASSES[entry.type];
  const iconChar = ICON_CHARS[entry.type];
  const iconColor = ICON_COLORS[entry.type];

  return (
    <div
      className={`flex items-start gap-2 px-4 py-0.5 ${bgClass} border-l-2 ${borderClass}`}
    >
      <span className={`shrink-0 w-3 text-center ${iconColor}`}>{iconChar}</span>

      <div style={{ paddingLeft: indent }}>
        <span className="text-[#9ca3af]">{entry.key}</span>
        <span className="text-[#71717a]">: </span>
        <DiffValue entry={entry} />
      </div>
    </div>
  );
}

/* -- Diff Value Renderer ---------------------------------- */

function DiffValue({ entry }: { entry: DiffEntry }) {
  switch (entry.type) {
    case 'unchanged':
      return <FormattedValue value={entry.oldValue} className="text-[#71717a]" />;

    case 'added':
      return <FormattedValue value={entry.newValue} className="text-[#10b981]" />;

    case 'removed':
      return <FormattedValue value={entry.oldValue} className="text-[#ef4444] line-through" />;

    case 'changed':
      return (
        <span className="inline-flex items-center gap-1.5">
          <FormattedValue value={entry.oldValue} className="text-[#ef4444] line-through" />
          <span className="text-[#71717a]">{'\u2192'}</span>
          <FormattedValue value={entry.newValue} className="text-[#10b981]" />
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

const BG_CLASSES: Record<DiffEntryType, string> = {
  added: 'bg-[#10b981]/5',
  removed: 'bg-[#ef4444]/5',
  changed: 'bg-[#f59e0b]/5',
  unchanged: '',
};

const BORDER_CLASSES: Record<DiffEntryType, string> = {
  added: 'border-[#10b981]',
  removed: 'border-[#ef4444]',
  changed: 'border-[#f59e0b]',
  unchanged: 'border-transparent',
};

const ICON_CHARS: Record<DiffEntryType, string> = {
  added: '+',
  removed: '-',
  changed: '~',
  unchanged: ' ',
};

const ICON_COLORS: Record<DiffEntryType, string> = {
  added: 'text-[#10b981]',
  removed: 'text-[#ef4444]',
  changed: 'text-[#f59e0b]',
  unchanged: 'text-[#71717a]',
};
