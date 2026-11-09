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

// ─── Extended Nested Object Diffs ───────────────────────────────────

test('computeJsonDiff: recursively flattens deeply added nested objects', () => {
  const a = {
    user: {
      name: 'Alice',
    },
  };
  const b = {
    user: {
      name: 'Alice',
      profile: {
        theme: 'dark',
        notifications: {
          email: true,
          sms: false,
        },
      },
    },
  };

  const diff = computeJsonDiff(a, b);
  const added = diff.filter(e => e.type === 'added');
  assert.strictEqual(added.length, 3);

  const theme = added.find(e => e.path === 'user.profile.theme');
  assert.ok(theme);
  assert.strictEqual(theme.newValue, 'dark');
  assert.strictEqual(theme.key, 'theme');

  const email = added.find(e => e.path === 'user.profile.notifications.email');
  assert.ok(email);
  assert.strictEqual(email.newValue, true);
  assert.strictEqual(email.key, 'email');

  const sms = added.find(e => e.path === 'user.profile.notifications.sms');
  assert.ok(sms);
  assert.strictEqual(sms.newValue, false);
  assert.strictEqual(sms.key, 'sms');

  const unchanged = diff.filter(e => e.type === 'unchanged');
  assert.strictEqual(unchanged.length, 1);
  assert.strictEqual(unchanged[0].path, 'user.name');
});

test('computeJsonDiff: recursively flattens deeply removed nested objects', () => {
  const a = {
    user: {
      name: 'Alice',
      profile: {
        theme: 'dark',
        notifications: {
          email: true,
        },
      },
    },
  };
  const b = {
    user: {
      name: 'Alice',
    },
  };

  const diff = computeJsonDiff(a, b);
  const removed = diff.filter(e => e.type === 'removed');
  assert.strictEqual(removed.length, 2);

  const theme = removed.find(e => e.path === 'user.profile.theme');
  assert.ok(theme);
  assert.strictEqual(theme.oldValue, 'dark');

  const email = removed.find(e => e.path === 'user.profile.notifications.email');
  assert.ok(email);
  assert.strictEqual(email.oldValue, true);

  const unchanged = diff.filter(e => e.type === 'unchanged');
  assert.strictEqual(unchanged.length, 1);
  assert.strictEqual(unchanged[0].path, 'user.name');
});

test('computeJsonDiff: handles multiple nested sibling modifications while preserving unchanged keys', () => {
  const a = {
    billing: {
      address: {
        street: '1st Ave',
        city: 'New York',
        zip: '10001',
      },
      card: {
        last4: '4242',
        brand: 'visa',
        exp: '12/26',
      },
    },
  };
  const b = {
    billing: {
      address: {
        street: '2nd Ave',
        city: 'New York',
        zip: '10001',
      },
      card: {
        last4: '1111',
        brand: 'visa',
        exp: '12/28',
      },
    },
  };

  const diff = computeJsonDiff(a, b);
  const changed = diff.filter(e => e.type === 'changed');
  assert.strictEqual(changed.length, 3);

  const street = changed.find(e => e.path === 'billing.address.street');
  assert.ok(street);
  assert.strictEqual(street.oldValue, '1st Ave');
  assert.strictEqual(street.newValue, '2nd Ave');

  const last4 = changed.find(e => e.path === 'billing.card.last4');
  assert.ok(last4);
  assert.strictEqual(last4.oldValue, '4242');
  assert.strictEqual(last4.newValue, '1111');

  const exp = changed.find(e => e.path === 'billing.card.exp');
  assert.ok(exp);
  assert.strictEqual(exp.oldValue, '12/26');
  assert.strictEqual(exp.newValue, '12/28');

  const unchanged = diff.filter(e => e.type === 'unchanged');
  assert.strictEqual(unchanged.length, 3);
  const unchangedPaths = unchanged.map(e => e.path).sort();
  assert.deepStrictEqual(unchangedPaths, ['billing.address.city', 'billing.address.zip', 'billing.card.brand']);
});

// ─── Extended Array Length Mismatches ───────────────────────────────

test('computeJsonDiff: handles array shrinking with primitive values', () => {
  const a = { tags: ['alpha', 'beta', 'gamma', 'delta'] };
  const b = { tags: ['alpha', 'beta'] };

  const diff = computeJsonDiff(a, b);
  const removed = diff.filter(e => e.type === 'removed');
  assert.strictEqual(removed.length, 2);

  assert.strictEqual(removed[0].path, 'tags[2]');
  assert.strictEqual(removed[0].key, '[2]');
  assert.strictEqual(removed[0].oldValue, 'gamma');

  assert.strictEqual(removed[1].path, 'tags[3]');
  assert.strictEqual(removed[1].key, '[3]');
  assert.strictEqual(removed[1].oldValue, 'delta');

  const unchanged = diff.filter(e => e.type === 'unchanged');
  assert.strictEqual(unchanged.length, 2);
  assert.strictEqual(unchanged[0].path, 'tags[0]');
  assert.strictEqual(unchanged[1].path, 'tags[1]');
});

test('computeJsonDiff: handles array expanding with primitive values', () => {
  const a = { scores: [100] };
  const b = { scores: [100, 200, 300] };

  const diff = computeJsonDiff(a, b);
  const added = diff.filter(e => e.type === 'added');
  assert.strictEqual(added.length, 2);

  assert.strictEqual(added[0].path, 'scores[1]');
  assert.strictEqual(added[0].key, '[1]');
  assert.strictEqual(added[0].newValue, 200);

  assert.strictEqual(added[1].path, 'scores[2]');
  assert.strictEqual(added[1].key, '[2]');
  assert.strictEqual(added[1].newValue, 300);

  const unchanged = diff.filter(e => e.type === 'unchanged');
  assert.strictEqual(unchanged.length, 1);
  assert.strictEqual(unchanged[0].path, 'scores[0]');
});

test('computeJsonDiff: handles array of objects shrinking and flattens removed object keys', () => {
  const a = {
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  };
  const b = {
    users: [
      { id: 1, name: 'Alice' },
    ],
  };

  const diff = computeJsonDiff(a, b);
  const removed = diff.filter(e => e.type === 'removed');
  assert.strictEqual(removed.length, 2);

  const idRemoved = removed.find(e => e.path === 'users[1].id');
  assert.ok(idRemoved);
  assert.strictEqual(idRemoved.oldValue, 2);

  const nameRemoved = removed.find(e => e.path === 'users[1].name');
  assert.ok(nameRemoved);
  assert.strictEqual(nameRemoved.oldValue, 'Bob');

  const unchanged = diff.filter(e => e.type === 'unchanged');
  assert.strictEqual(unchanged.length, 2);
});

test('computeJsonDiff: handles array of objects expanding and flattens added object keys', () => {
  const a = {
    items: [
      { sku: 'A1', price: 10 },
    ],
  };
  const b = {
    items: [
      { sku: 'A1', price: 10 },
      { sku: 'B2', price: 25 },
    ],
  };

  const diff = computeJsonDiff(a, b);
  const added = diff.filter(e => e.type === 'added');
  assert.strictEqual(added.length, 2);

  const skuAdded = added.find(e => e.path === 'items[1].sku');
  assert.ok(skuAdded);
  assert.strictEqual(skuAdded.newValue, 'B2');

  const priceAdded = added.find(e => e.path === 'items[1].price');
  assert.ok(priceAdded);
  assert.strictEqual(priceAdded.newValue, 25);
});

test('computeJsonDiff: handles array length mismatch combined with item modifications', () => {
  const a = { list: [10, 20, 30] };
  const b = { list: [10, 99] };

  const diff = computeJsonDiff(a, b);

  const unchanged = diff.filter(e => e.type === 'unchanged');
  assert.strictEqual(unchanged.length, 1);
  assert.strictEqual(unchanged[0].path, 'list[0]');
  assert.strictEqual(unchanged[0].oldValue, 10);

  const changed = diff.filter(e => e.type === 'changed');
  assert.strictEqual(changed.length, 1);
  assert.strictEqual(changed[0].path, 'list[1]');
  assert.strictEqual(changed[0].oldValue, 20);
  assert.strictEqual(changed[0].newValue, 99);

  const removed = diff.filter(e => e.type === 'removed');
  assert.strictEqual(removed.length, 1);
  assert.strictEqual(removed[0].path, 'list[2]');
  assert.strictEqual(removed[0].oldValue, 30);
});

// ─── Extended Type Changes (String to Number & Cross-Type) ──────────

test('computeJsonDiff: detects type change from string to number on the same root key', () => {
  const a = { port: '8080' };
  const b = { port: 8080 };

  const diff = computeJsonDiff(a, b);
  assert.strictEqual(diff.length, 1);
  assert.strictEqual(diff[0].type, 'changed');
  assert.strictEqual(diff[0].path, 'port');
  assert.strictEqual(diff[0].key, 'port');
  assert.strictEqual(diff[0].oldValue, '8080');
  assert.strictEqual(diff[0].newValue, 8080);
});

test('computeJsonDiff: detects type change from number to string on the same key', () => {
  const a = { count: 42 };
  const b = { count: '42' };

  const diff = computeJsonDiff(a, b);
  assert.strictEqual(diff.length, 1);
  assert.strictEqual(diff[0].type, 'changed');
  assert.strictEqual(diff[0].path, 'count');
  assert.strictEqual(diff[0].key, 'count');
  assert.strictEqual(diff[0].oldValue, 42);
  assert.strictEqual(diff[0].newValue, '42');
});

test('computeJsonDiff: detects type change from string to number on nested object key', () => {
  const a = { server: { config: { maxRetries: '5' } } };
  const b = { server: { config: { maxRetries: 5 } } };

  const diff = computeJsonDiff(a, b);
  assert.strictEqual(diff.length, 1);
  assert.strictEqual(diff[0].type, 'changed');
  assert.strictEqual(diff[0].path, 'server.config.maxRetries');
  assert.strictEqual(diff[0].key, 'maxRetries');
  assert.strictEqual(diff[0].oldValue, '5');
  assert.strictEqual(diff[0].newValue, 5);
});

test('computeJsonDiff: detects type change from string to number within array elements', () => {
  const a = { coordinates: ['10', '20'] };
  const b = { coordinates: [10, 20] };

  const diff = computeJsonDiff(a, b);
  assert.strictEqual(diff.length, 2);

  assert.strictEqual(diff[0].type, 'changed');
  assert.strictEqual(diff[0].path, 'coordinates[0]');
  assert.strictEqual(diff[0].oldValue, '10');
  assert.strictEqual(diff[0].newValue, 10);

  assert.strictEqual(diff[1].type, 'changed');
  assert.strictEqual(diff[1].path, 'coordinates[1]');
  assert.strictEqual(diff[1].oldValue, '20');
  assert.strictEqual(diff[1].newValue, 20);
});

test('computeJsonDiff: detects type change within nested objects inside arrays', () => {
  const a = { users: [{ id: '1', active: true }] };
  const b = { users: [{ id: 1, active: true }] };

  const diff = computeJsonDiff(a, b);
  const changed = diff.filter(e => e.type === 'changed');
  assert.strictEqual(changed.length, 1);
  assert.strictEqual(changed[0].path, 'users[0].id');
  assert.strictEqual(changed[0].oldValue, '1');
  assert.strictEqual(changed[0].newValue, 1);

  const unchanged = diff.filter(e => e.type === 'unchanged');
  assert.strictEqual(unchanged.length, 1);
  assert.strictEqual(unchanged[0].path, 'users[0].active');
});
