import type { DiffEntry } from './types';

/**
 * Recursively compares two JSON values and produces a flat array of diff entries.
 * Each entry describes whether a key/value was added, removed, changed, or unchanged.
 */
export function computeJsonDiff(
  a: unknown,
  b: unknown,
  path = '',
  depth = 0
): DiffEntry[] {
  // Both null/undefined
  if (a === b) {
    if (isPrimitive(a)) {
      return path
        ? [{ type: 'unchanged', path, key: lastSegment(path), depth, oldValue: a, newValue: b }]
        : [];
    }
  }

  const aIsObj = isObject(a);
  const bIsObj = isObject(b);
  const aIsArr = Array.isArray(a);
  const bIsArr = Array.isArray(b);

  // Both are plain objects (not arrays)
  if (aIsObj && bIsObj && !aIsArr && !bIsArr) {
    return diffObjects(
      a as Record<string, unknown>,
      b as Record<string, unknown>,
      path,
      depth
    );
  }

  // Both are arrays
  if (aIsArr && bIsArr) {
    return diffArrays(a as unknown[], b as unknown[], path, depth);
  }

  // Type mismatch or primitive comparison
  if (a === b) {
    return path
      ? [{ type: 'unchanged', path, key: lastSegment(path), depth, oldValue: a, newValue: b }]
      : [];
  }

  return path
    ? [{ type: 'changed', path, key: lastSegment(path), depth, oldValue: a, newValue: b }]
    : // Root-level mismatch: wrap both in a synthetic comparison
      [{ type: 'changed', path: '(root)', key: '(root)', depth: 0, oldValue: a, newValue: b }];
}

function diffObjects(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
  parentPath: string,
  parentDepth: number
): DiffEntry[] {
  const entries: DiffEntry[] = [];
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const depth = parentDepth + (parentPath ? 1 : 0);

  for (const key of allKeys) {
    const childPath = parentPath ? `${parentPath}.${key}` : key;
    const inA = key in a;
    const inB = key in b;

    if (inA && !inB) {
      // Key removed
      entries.push(...flattenRemoved(a[key], childPath, key, depth));
    } else if (!inA && inB) {
      // Key added
      entries.push(...flattenAdded(b[key], childPath, key, depth));
    } else {
      // Key in both - recurse
      entries.push(...computeJsonDiff(a[key], b[key], childPath, depth));
    }
  }

  return entries;
}

function diffArrays(
  a: unknown[],
  b: unknown[],
  parentPath: string,
  parentDepth: number
): DiffEntry[] {
  const entries: DiffEntry[] = [];
  const maxLen = Math.max(a.length, b.length);
  const depth = parentDepth + (parentPath ? 1 : 0);

  for (let i = 0; i < maxLen; i++) {
    const childPath = `${parentPath}[${i}]`;

    if (i >= a.length) {
      entries.push(...flattenAdded(b[i], childPath, `[${i}]`, depth));
    } else if (i >= b.length) {
      entries.push(...flattenRemoved(a[i], childPath, `[${i}]`, depth));
    } else {
      entries.push(...computeJsonDiff(a[i], b[i], childPath, depth));
    }
  }

  return entries;
}

/**
 * Flatten a removed value into diff entries.
 * If it's an object/array, recursively mark all children as removed.
 */
function flattenRemoved(
  value: unknown,
  path: string,
  key: string,
  depth: number
): DiffEntry[] {
  if (isObject(value) && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const entries: DiffEntry[] = [];
    for (const childKey of Object.keys(obj)) {
      entries.push(
        ...flattenRemoved(obj[childKey], `${path}.${childKey}`, childKey, depth + 1)
      );
    }
    return entries.length > 0
      ? entries
      : [{ type: 'removed', path, key, depth, oldValue: value }];
  }

  if (Array.isArray(value)) {
    const entries: DiffEntry[] = [];
    for (let i = 0; i < value.length; i++) {
      entries.push(
        ...flattenRemoved(value[i], `${path}[${i}]`, `[${i}]`, depth + 1)
      );
    }
    return entries.length > 0
      ? entries
      : [{ type: 'removed', path, key, depth, oldValue: value }];
  }

  return [{ type: 'removed', path, key, depth, oldValue: value }];
}

/**
 * Flatten an added value into diff entries.
 * If it's an object/array, recursively mark all children as added.
 */
function flattenAdded(
  value: unknown,
  path: string,
  key: string,
  depth: number
): DiffEntry[] {
  if (isObject(value) && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const entries: DiffEntry[] = [];
    for (const childKey of Object.keys(obj)) {
      entries.push(
        ...flattenAdded(obj[childKey], `${path}.${childKey}`, childKey, depth + 1)
      );
    }
    return entries.length > 0
      ? entries
      : [{ type: 'added', path, key, depth, newValue: value }];
  }

  if (Array.isArray(value)) {
    const entries: DiffEntry[] = [];
    for (let i = 0; i < value.length; i++) {
      entries.push(
        ...flattenAdded(value[i], `${path}[${i}]`, `[${i}]`, depth + 1)
      );
    }
    return entries.length > 0
      ? entries
      : [{ type: 'added', path, key, depth, newValue: value }];
  }

  return [{ type: 'added', path, key, depth, newValue: value }];
}

function isPrimitive(v: unknown): boolean {
  return v === null || typeof v !== 'object';
}

function isObject(v: unknown): boolean {
  return v !== null && typeof v === 'object';
}

function lastSegment(path: string): string {
  // Handle array notation: "foo.bar[0]" -> "[0]"
  const bracketMatch = path.match(/\[(\d+)\]$/);
  if (bracketMatch) return `[${bracketMatch[1]}]`;
  // Handle dot notation: "foo.bar.baz" -> "baz"
  const parts = path.split('.');
  return parts[parts.length - 1];
}
