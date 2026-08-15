import test from 'node:test';
import assert from 'node:assert';

/**
 * Extracted from cli/src/index.ts for testability.
 * The original parseArgs reads process.argv; this version accepts args directly.
 */
function parseArgsFromArray(args: string[]) {
  let command = '';
  let projectId = '';
  let eventId = '';
  let forwardTo = '';
  let token = '';
  let apiUrl = 'http://localhost:3000';

  if (args.includes('-h') || args.includes('--help') || args.length === 0) {
    return { type: 'help' as const };
  }

  command = args[0] || '';
  if (command === 'tunnel' || command === 'listen') {
    projectId = args[1] || '';
  } else if (command === 'replay') {
    eventId = args[1] || '';
  } else {
    return { type: 'error' as const, message: `Unknown command '${command}'` };
  }

  const id = command === 'replay' ? eventId : projectId;
  const idType = command === 'replay' ? 'eventId' : 'projectId';

  if (!id) {
    return { type: 'error' as const, message: `Missing required argument '${idType}'` };
  }

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--forward-to' || arg === '-f') {
      forwardTo = args[i + 1] || '';
      i++;
    } else if (arg === '--token' || arg === '-t') {
      token = args[i + 1] || '';
      i++;
    } else if (arg === '--api-url' || arg === '-u') {
      apiUrl = args[i + 1] || '';
      i++;
    }
  }

  if (!forwardTo) {
    return { type: 'error' as const, message: "Missing required option '--forward-to' or '-f'" };
  }

  return { type: 'success' as const, command, projectId, eventId, forwardTo, token, apiUrl };
}

// ─── Tunnel Command ─────────────────────────────────────────────────

test('CLI parseArgs: tunnel command with all options', () => {
  const result = parseArgsFromArray([
    'tunnel', 'd3b07384-d113-4956-a5db-e1c725a34e32',
    '--forward-to', 'http://localhost:3000/webhook',
    '--token', 'my-token',
  ]);
  assert.strictEqual(result.type, 'success');
  if (result.type === 'success') {
    assert.strictEqual(result.command, 'tunnel');
    assert.strictEqual(result.projectId, 'd3b07384-d113-4956-a5db-e1c725a34e32');
    assert.strictEqual(result.forwardTo, 'http://localhost:3000/webhook');
    assert.strictEqual(result.token, 'my-token');
  }
});

// ─── Listen Command ────────────────────────────────────────────────

test('CLI parseArgs: listen command with short flags', () => {
  const result = parseArgsFromArray([
    'listen', 'abc-123',
    '-f', 'http://localhost:4000/hook',
    '-t', 'token123',
  ]);
  assert.strictEqual(result.type, 'success');
  if (result.type === 'success') {
    assert.strictEqual(result.command, 'listen');
    assert.strictEqual(result.projectId, 'abc-123');
    assert.strictEqual(result.forwardTo, 'http://localhost:4000/hook');
    assert.strictEqual(result.token, 'token123');
  }
});

// ─── Replay Command ────────────────────────────────────────────────

test('CLI parseArgs: replay command parses eventId', () => {
  const result = parseArgsFromArray([
    'replay', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    '-f', 'http://localhost:3000/webhook',
  ]);
  assert.strictEqual(result.type, 'success');
  if (result.type === 'success') {
    assert.strictEqual(result.command, 'replay');
    assert.strictEqual(result.eventId, 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');
    assert.strictEqual(result.projectId, '');
  }
});

// ─── Error: Unknown Command ────────────────────────────────────────

test('CLI parseArgs: unknown command returns error', () => {
  const result = parseArgsFromArray(['foobar']);
  assert.strictEqual(result.type, 'error');
  if (result.type === 'error') {
    assert.ok(result.message.includes("Unknown command 'foobar'"));
  }
});

// ─── Error: Missing --forward-to ────────────────────────────────────

test('CLI parseArgs: missing --forward-to returns error', () => {
  const result = parseArgsFromArray(['tunnel', 'some-project-id']);
  assert.strictEqual(result.type, 'error');
  if (result.type === 'error') {
    assert.ok(result.message.includes("--forward-to"));
  }
});

// ─── Error: Missing projectId ──────────────────────────────────────

test('CLI parseArgs: missing projectId returns error', () => {
  const result = parseArgsFromArray(['tunnel']);
  assert.strictEqual(result.type, 'error');
  if (result.type === 'error') {
    assert.ok(result.message.includes('projectId'));
  }
});

// ─── Error: Missing eventId ────────────────────────────────────────

test('CLI parseArgs: missing eventId returns error', () => {
  const result = parseArgsFromArray(['replay']);
  assert.strictEqual(result.type, 'error');
  if (result.type === 'error') {
    assert.ok(result.message.includes('eventId'));
  }
});

// ─── Help Flag ──────────────────────────────────────────────────────

test('CLI parseArgs: --help returns help type', () => {
  const result = parseArgsFromArray(['--help']);
  assert.strictEqual(result.type, 'help');
});

test('CLI parseArgs: -h returns help type', () => {
  const result = parseArgsFromArray(['-h']);
  assert.strictEqual(result.type, 'help');
});

test('CLI parseArgs: empty args returns help type', () => {
  const result = parseArgsFromArray([]);
  assert.strictEqual(result.type, 'help');
});

// ─── Custom API URL ────────────────────────────────────────────────

test('CLI parseArgs: --api-url overrides default', () => {
  const result = parseArgsFromArray([
    'tunnel', 'proj-id',
    '-f', 'http://localhost:3000/hook',
    '-u', 'https://latch.example.com',
  ]);
  assert.strictEqual(result.type, 'success');
  if (result.type === 'success') {
    assert.strictEqual(result.apiUrl, 'https://latch.example.com');
  }
});

test('CLI parseArgs: default apiUrl is http://localhost:3000', () => {
  const result = parseArgsFromArray([
    'listen', 'proj-id',
    '-f', 'http://localhost:3000/hook',
  ]);
  assert.strictEqual(result.type, 'success');
  if (result.type === 'success') {
    assert.strictEqual(result.apiUrl, 'http://localhost:3000');
  }
});
