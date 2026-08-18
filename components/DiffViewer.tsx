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
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low/70 backdrop-blur-md text-sm space-y-0 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3 bg-surface-container/50">
        <div className="flex items-center gap-4 text-xs">
          <EventBadge label="A" color="blue" event={eventA} />
          <span className="text-outline font-semibold">vs</span>
          <EventBadge label="B" color="purple" event={eventB} />
        </div>
        <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant">
          <button
            onClick={() => setDiffTarget('body')}
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
              diffTarget === 'body'
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Payload
          </button>
          <button
            onClick={() => setDiffTarget('headers')}
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
              diffTarget === 'headers'
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Headers
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <DiffSummary counts={counts} />

      {/* Diff Body */}
      <div className="max-h-[520px] overflow-y-auto">
        {entries.length === 0 ? (
          <div className="px-4 py-8 text-center text-outline text-xs">
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
      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
      : 'bg-purple-500/10 text-purple-400 border-purple-500/30';

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${colorClasses}`}
      >
        {label}
      </span>
      <span className="text-on-surface-variant font-mono text-[11px]">
        {new Date(event.received_at).toLocaleTimeString()}
      </span>
    </div>
  );
}

function DiffSummary({
  counts,
}: {
  counts: Record<DiffEntryType, number>;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-outline-variant text-[11px] font-mono bg-surface-container-lowest/60">
      {counts.added > 0 && (
        <span className="text-primary font-semibold">+{counts.added} added</span>
      )}
      {counts.removed > 0 && (
        <span className="text-error font-semibold">-{counts.removed} removed</span>
      )}
      {counts.changed > 0 && (
        <span className="text-[#fc7c78] font-semibold">~{counts.changed} changed</span>
      )}
      <span className="text-outline">{counts.unchanged} unchanged</span>
    </div>
  );
}

function DiffLine({ entry }: { entry: DiffEntry }) {
  const indent = entry.depth * 16;

  const bgClass = BG_CLASSES[entry.type];
  const borderClass = BORDER_CLASSES[entry.type];
  const iconChar = ICON_CHARS[entry.type];
  const iconColor = ICON_COLORS[entry.type];

  return (
    <div
      className={`flex items-start gap-2 px-4 py-1 ${bgClass} border-l-2 ${borderClass} transition-colors`}
    >
      <span className={`shrink-0 w-3 text-center ${iconColor} font-bold`}>{iconChar}</span>

      <div style={{ paddingLeft: indent }}>
        <span className="text-on-surface-variant">{entry.key}</span>
        <span className="text-outline">: </span>
        <DiffValue entry={entry} />
      </div>
    </div>
  );
}

function DiffValue({ entry }: { entry: DiffEntry }) {
  switch (entry.type) {
    case 'unchanged':
      return <FormattedValue value={entry.oldValue} className="text-outline" />;

    case 'added':
      return <FormattedValue value={entry.newValue} className="text-primary font-semibold" />;

    case 'removed':
      return <FormattedValue value={entry.oldValue} className="text-error line-through opacity-80" />;

    case 'changed':
      return (
        <span className="inline-flex items-center gap-1.5">
          <FormattedValue value={entry.oldValue} className="text-error line-through opacity-80" />
          <span className="text-outline">{'\u2192'}</span>
          <FormattedValue value={entry.newValue} className="text-primary font-semibold" />
        </span>
      );
  }
}

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
  added: 'bg-primary-container/10',
  removed: 'bg-error-container/15',
  changed: 'bg-surface-container',
  unchanged: '',
};

const BORDER_CLASSES: Record<DiffEntryType, string> = {
  added: 'border-primary',
  removed: 'border-error',
  changed: 'border-[#fc7c78]',
  unchanged: 'border-transparent',
};

const ICON_CHARS: Record<DiffEntryType, string> = {
  added: '+',
  removed: '-',
  changed: '~',
  unchanged: ' ',
};

const ICON_COLORS: Record<DiffEntryType, string> = {
  added: 'text-primary',
  removed: 'text-error',
  changed: 'text-[#fc7c78]',
  unchanged: 'text-outline',
};
