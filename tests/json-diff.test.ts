import test from 'node:test';
import assert from 'node:assert';
import { computeJsonDiff } from '../lib/json-diff';

// ─── Identical Objects ──────────────────────────────────────────────

test('computeJsonDiff: identical objects produce unchanged entries', () => {
  const a = { name: 'Alice', age: 30 };
  const b = { name: 'Alice', age: 30 };
  const diff = computeJsonDiff(a, b);
  assert.ok(diff.every(e => e.type === 'unchanged'), 'All entries should be unchanged');
  assert.strictEqual(diff.length, 2);
});

test('computeJsonDiff: identical nested objects produce unchanged entries', () => {
  const a = { user: { name: 'Alice', address: { city: 'NYC' } } };
  const b = { user: { name: 'Alice', address: { city: 'NYC' } } };
  const diff = computeJsonDiff(a, b);
  assert.ok(diff.every(e => e.type === 'unchanged'));
});

// ─── Added Keys ─────────────────────────────────────────────────────

test('computeJsonDiff: detects added keys', () => {
  const a = { name: 'Alice' };
  const b = { name: 'Alice', age: 30 };
  const diff = computeJsonDiff(a, b);
  const added = diff.filter(e => e.type === 'added');
  assert.strictEqual(added.length, 1);
  assert.strictEqual(added[0].key, 'age');
  assert.strictEqual(added[0].newValue, 30);
});

// ─── Removed Keys ───────────────────────────────────────────────────

test('computeJsonDiff: detects removed keys', () => {
  const a = { name: 'Alice', age: 30 };
  const b = { name: 'Alice' };
  const diff = computeJsonDiff(a, b);
  const removed = diff.filter(e => e.type === 'removed');
  assert.strictEqual(removed.length, 1);
  assert.strictEqual(removed[0].key, 'age');
  assert.strictEqual(removed[0].oldValue, 30);
});

// ─── Changed Values ────────────────────────────────────────────────

test('computeJsonDiff: detects changed primitive values', () => {
  const a = { name: 'Alice', age: 30 };
  const b = { name: 'Bob', age: 30 };
  const diff = computeJsonDiff(a, b);
  const changed = diff.filter(e => e.type === 'changed');
  assert.strictEqual(changed.length, 1);
  assert.strictEqual(changed[0].key, 'name');
  assert.strictEqual(changed[0].oldValue, 'Alice');
  assert.strictEqual(changed[0].newValue, 'Bob');
});

// ─── Nested Object Diff ────────────────────────────────────────────

test('computeJsonDiff: detects changes in nested objects (2+ levels)', () => {
  const a = { user: { profile: { city: 'NYC', zip: '10001' } } };
  const b = { user: { profile: { city: 'LA', zip: '10001' } } };
  const diff = computeJsonDiff(a, b);
  const changed = diff.filter(e => e.type === 'changed');
  assert.strictEqual(changed.length, 1);
  assert.strictEqual(changed[0].path, 'user.profile.city');
  assert.strictEqual(changed[0].oldValue, 'NYC');
  assert.strictEqual(changed[0].newValue, 'LA');
});

// ─── Array Diffs ────────────────────────────────────────────────────

test('computeJsonDiff: detects added array elements', () => {
  const a = { items: ['a', 'b'] };
  const b = { items: ['a', 'b', 'c'] };
  const diff = computeJsonDiff(a, b);
  const added = diff.filter(e => e.type === 'added');
  assert.strictEqual(added.length, 1);
  assert.strictEqual(added[0].newValue, 'c');
});

test('computeJsonDiff: detects removed array elements', () => {
  const a = { items: ['a', 'b', 'c'] };
  const b = { items: ['a', 'b'] };
  const diff = computeJsonDiff(a, b);
  const removed = diff.filter(e => e.type === 'removed');
  assert.strictEqual(removed.length, 1);
  assert.strictEqual(removed[0].oldValue, 'c');
});

test('computeJsonDiff: detects changed array elements', () => {
  const a = { items: ['a', 'b'] };
  const b = { items: ['a', 'x'] };
  const diff = computeJsonDiff(a, b);
  const changed = diff.filter(e => e.type === 'changed');
  assert.strictEqual(changed.length, 1);
  assert.strictEqual(changed[0].oldValue, 'b');
  assert.strictEqual(changed[0].newValue, 'x');
});

// ─── Type Mismatch ─────────────────────────────────────────────────

test('computeJsonDiff: detects type mismatch (object → array)', () => {
  const a = { data: { key: 'value' } };
  const b = { data: [1, 2, 3] };
  const diff = computeJsonDiff(a, b);
  const changed = diff.filter(e => e.type === 'changed');
  assert.ok(changed.length >= 1, 'Should detect at least one change');
});

test('computeJsonDiff: detects type mismatch (string → number)', () => {
  const a = { count: '5' };
  const b = { count: 5 };
  const diff = computeJsonDiff(a, b);
  const changed = diff.filter(e => e.type === 'changed');
  assert.strictEqual(changed.length, 1);
  assert.strictEqual(changed[0].oldValue, '5');
  assert.strictEqual(changed[0].newValue, 5);
});

// ─── Empty Objects/Arrays ───────────────────────────────────────────

test('computeJsonDiff: empty objects produce no entries', () => {
  const diff = computeJsonDiff({}, {});
  assert.strictEqual(diff.length, 0);
});

test('computeJsonDiff: empty arrays produce no entries', () => {
  const a = { items: [] as unknown[] };
  const b = { items: [] as unknown[] };
  const diff = computeJsonDiff(a, b);
  // Empty arrays are equal — should produce unchanged or nothing
  assert.ok(diff.every(e => e.type === 'unchanged'));
});

// ─── Root-Level Primitives ──────────────────────────────────────────

test('computeJsonDiff: root-level primitive mismatch produces changed entry', () => {
  const diff = computeJsonDiff('hello', 'world');
  assert.strictEqual(diff.length, 1);
  assert.strictEqual(diff[0].type, 'changed');
  assert.strictEqual(diff[0].oldValue, 'hello');
  assert.strictEqual(diff[0].newValue, 'world');
});

// ─── Null Handling ──────────────────────────────────────────────────

test('computeJsonDiff: handles null → value', () => {
  const a = { value: null };
  const b = { value: 42 };
  const diff = computeJsonDiff(a, b);
  const changed = diff.filter(e => e.type === 'changed');
  assert.strictEqual(changed.length, 1);
  assert.strictEqual(changed[0].oldValue, null);
  assert.strictEqual(changed[0].newValue, 42);
});

test('computeJsonDiff: handles value → null', () => {
  const a = { value: 'hello' };
  const b = { value: null };
  const diff = computeJsonDiff(a, b);
  const changed = diff.filter(e => e.type === 'changed');
  assert.strictEqual(changed.length, 1);
  assert.strictEqual(changed[0].oldValue, 'hello');
  assert.strictEqual(changed[0].newValue, null);
});

test('computeJsonDiff: null === null produces no entries', () => {
  const diff = computeJsonDiff(null, null);
  assert.strictEqual(diff.length, 0);
});

// ─── Depth Tracking ────────────────────────────────────────────────

test('computeJsonDiff: depth is correctly tracked for nested keys', () => {
  const a = { level1: { level2: { level3: 'old' } } };
  const b = { level1: { level2: { level3: 'new' } } };
  const diff = computeJsonDiff(a, b);
  const changed = diff.find(e => e.type === 'changed');
  assert.ok(changed);
  assert.strictEqual(changed.path, 'level1.level2.level3');
  assert.ok(changed.depth >= 2, `Expected depth >= 2, got ${changed.depth}`);
});
