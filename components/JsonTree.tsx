'use client';

import { useState, useCallback } from 'react';

/* -------------------------------------------------------
   JsonTree - Interactive Collapsible JSON Viewer
   ------------------------------------------------------- */

type JsonTreeProps = {
  data: unknown;
  rootLabel?: string;
  defaultExpandDepth?: number;
};

export function JsonTree({ data, rootLabel, defaultExpandDepth = 2 }: JsonTreeProps) {
  return (
    <div className="font-mono text-[12px] leading-[1.7] overflow-x-auto">
      {rootLabel && (
        <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold block mb-1">
          {rootLabel}
        </span>
      )}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3">
        <JsonNode value={data} path="" depth={0} defaultExpandDepth={defaultExpandDepth} />
      </div>
    </div>
  );
}

/* -- Recursive Node Renderer ----------------------------- */

type JsonNodeProps = {
  value: unknown;
  path: string;
  depth: number;
  defaultExpandDepth: number;
  keyName?: string;
  isLast?: boolean;
};

function JsonNode({ value, path, depth, defaultExpandDepth, keyName, isLast = true }: JsonNodeProps) {
  const isExpandable = value !== null && typeof value === 'object';
  const [expanded, setExpanded] = useState(depth < defaultExpandDepth);

  if (isExpandable) {
    const isArray = Array.isArray(value);
    const entries = isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as const)
      : Object.entries(value as Record<string, unknown>);
    const count = entries.length;
    const openBrace = isArray ? '[' : '{';
    const closeBrace = isArray ? ']' : '}';
    const preview = isArray ? `${count} item${count !== 1 ? 's' : ''}` : `${count} key${count !== 1 ? 's' : ''}`;

    return (
      <div>
        <span className="inline-flex items-center gap-1 group">
          {/* Expand/collapse toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-zinc-600 hover:text-zinc-300 transition-colors w-4 text-center shrink-0 cursor-pointer select-none"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▼' : '▶'}
          </button>

          {/* Key name (if this is a property, not root) */}
          {keyName !== undefined && (
            <>
              <KeyLabel keyName={keyName} path={path} isArrayIndex={isArray && keyName === String(Number(keyName))} parentIsArray={false} />
              <span className="text-zinc-600">:</span>
            </>
          )}

          {/* Opening brace */}
          <span className="text-zinc-500">{openBrace}</span>

          {/* Collapsed preview */}
          {!expanded && (
            <>
              <span className="text-zinc-600 italic text-[10px]">{preview}</span>
              <span className="text-zinc-500">{closeBrace}</span>
              {!isLast && <span className="text-zinc-600">,</span>}
            </>
          )}
        </span>

        {/* Expanded children */}
        {expanded && (
          <>
            <div className="ml-5 border-l border-zinc-800/60 pl-3">
              {entries.map(([childKey, childValue], idx) => {
                const childPath = isArray
                  ? `${path}[${childKey}]`
                  : path
                    ? `${path}.${childKey}`
                    : childKey;

                return (
                  <JsonNode
                    key={childKey}
                    keyName={childKey}
                    value={childValue}
                    path={childPath}
                    depth={depth + 1}
                    defaultExpandDepth={defaultExpandDepth}
                    isLast={idx === entries.length - 1}
                  />
                );
              })}
            </div>
            <span className="inline-flex items-center gap-1">
              <span className="w-4" />
              <span className="text-zinc-500">{closeBrace}</span>
              {!isLast && <span className="text-zinc-600">,</span>}
            </span>
          </>
        )}
      </div>
    );
  }

  // Primitive value
  return (
    <div className="inline-flex items-center gap-1 group w-full">
      <span className="w-4 shrink-0" />
      {keyName !== undefined && (
        <>
          <KeyLabel keyName={keyName} path={path} isArrayIndex={!isNaN(Number(keyName))} parentIsArray={!isNaN(Number(keyName))} />
          <span className="text-zinc-600">:</span>
        </>
      )}
      <ValueLabel value={value} />
      {!isLast && <span className="text-zinc-600">,</span>}
    </div>
  );
}

/* -- Key Label with Copy-Path ---------------------------- */

function KeyLabel({
  keyName,
  path,
  isArrayIndex,
}: {
  keyName: string;
  path: string;
  isArrayIndex: boolean;
  parentIsArray: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyPath = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard API may fail in insecure contexts
    }
  }, [path]);

  if (isArrayIndex) {
    return (
      <span className="inline-flex items-center gap-1 group/key">
        <span className="text-zinc-500">{keyName}</span>
        <CopyButton onClick={handleCopyPath} copied={copied} label={path} />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 group/key">
      <span className="text-zinc-300">&quot;{keyName}&quot;</span>
      <CopyButton onClick={handleCopyPath} copied={copied} label={path} />
    </span>
  );
}

/* -- Value Label with Copy-Value ------------------------- */

function ValueLabel({ value }: { value: unknown; }) {
  const [copied, setCopied] = useState(false);

  const handleCopyValue = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard API may fail in insecure contexts
    }
  }, [value]);

  let colorClass: string;
  let display: string;

  if (typeof value === 'string') {
    colorClass = 'text-emerald-400';
    display = `"${value}"`;
  } else if (typeof value === 'number') {
    colorClass = 'text-amber-400';
    display = String(value);
  } else if (typeof value === 'boolean') {
    colorClass = 'text-purple-400';
    display = String(value);
  } else if (value === null) {
    colorClass = 'text-red-400';
    display = 'null';
  } else if (value === undefined) {
    colorClass = 'text-red-400';
    display = 'undefined';
  } else {
    colorClass = 'text-zinc-400';
    display = String(value);
  }

  return (
    <span className="inline-flex items-center gap-1 group/val">
      <span className={colorClass}>{display}</span>
      <CopyButton onClick={handleCopyValue} copied={copied} label={String(value)} />
    </span>
  );
}

/* -- Copy Button ----------------------------------------- */

function CopyButton({
  onClick,
  copied,
  label,
}: {
  onClick: () => void;
  copied: boolean;
  label: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="opacity-0 group-hover/key:opacity-100 group-hover/val:opacity-100 transition-opacity text-zinc-600 hover:text-emerald-400 cursor-pointer shrink-0"
      title={copied ? 'Copied!' : `Copy: ${label}`}
      aria-label={copied ? 'Copied!' : `Copy ${label}`}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-emerald-400">
          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
          <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .439 1.061V9.5A1.5 1.5 0 0 1 12 11V8.621a3 3 0 0 0-.879-2.121L9 4.379A3 3 0 0 0 6.879 3.5H5.5Z" />
          <path d="M4 5a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 4 14h5a1.5 1.5 0 0 0 1.5-1.5V8.621a1.5 1.5 0 0 0-.44-1.06L7.94 5.439A1.5 1.5 0 0 0 6.878 5H4Z" />
        </svg>
      )}
    </button>
  );
}
