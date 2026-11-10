import test from 'node:test';
import assert from 'node:assert';
import {
  mockDbState,
  setMockSession,
  resetAllMocks,
} from './mock-helper';
import { authorizeProjectAccess, requireSession } from '@/lib/services/auth-check';

const PROJECT_ID = '3a6b8c12-e5f6-49a0-8b1c-2d3e4f5a6b7c';
const OTHER_PROJECT_ID = '8f1e2d3c-4b5a-4678-9012-3456789abcde';
const USER_ID = 'user-owner-456';
const OTHER_USER_ID = 'user-intruder-789';
const CLI_TOKEN = 'cli-token-secret-xyz';

test.beforeEach(() => {
  resetAllMocks();
});

// ─── Session-Based Authentication ────────────────────────────────────

test('auth-check: valid session with project ownership returns authorized=true, isCliRequest=false', async () => {
  setMockSession({ user: { id: USER_ID } });

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) {
      // verifyOwnership query matches project_id and user_id
      if (values[0] === PROJECT_ID && values[1] === USER_ID) {
        return [{ id: PROJECT_ID, user_id: USER_ID }];
      }
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`);
  const result = await authorizeProjectAccess(req, PROJECT_ID);

  assert.strictEqual(result.authorized, true);
  assert.strictEqual(result.isCliRequest, false);
  assert.strictEqual(result.userId, USER_ID);
});

test('auth-check: valid session but wrong project returns authorized=false', async () => {
  setMockSession({ user: { id: USER_ID } });

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('FROM projects')) {
      // User only owns PROJECT_ID, not OTHER_PROJECT_ID
      if (values[0] === PROJECT_ID && values[1] === USER_ID) {
        return [{ id: PROJECT_ID, user_id: USER_ID }];
      }
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${OTHER_PROJECT_ID}`);
  const result = await authorizeProjectAccess(req, OTHER_PROJECT_ID);

  assert.strictEqual(result.authorized, false);
  assert.strictEqual(result.isCliRequest, false);
  assert.strictEqual(result.userId, null);
});

test('auth-check: requireSession returns userId when session exists', async () => {
  setMockSession({ user: { id: USER_ID } });

  const session = await requireSession();
  assert.ok(session !== null);
  assert.strictEqual(session?.userId, USER_ID);
});

test('auth-check: requireSession returns null when unauthenticated', async () => {
  setMockSession(null);

  const session = await requireSession();
  assert.strictEqual(session, null);
});

// ─── CLI-Token-Based Authentication ──────────────────────────────────

test('auth-check: no session, valid Bearer token in Authorization header returns authorized=true, isCliRequest=true', async () => {
  setMockSession(null);

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('cli_token')) {
      if (values[0] === PROJECT_ID && values[1] === CLI_TOKEN) {
        return [{ id: PROJECT_ID, user_id: USER_ID, cli_token: CLI_TOKEN }];
      }
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/tunnel/connect?projectId=${PROJECT_ID}`, {
    headers: {
      'authorization': `Bearer ${CLI_TOKEN}`,
    },
  });
  const result = await authorizeProjectAccess(req, PROJECT_ID);

  assert.strictEqual(result.authorized, true);
  assert.strictEqual(result.isCliRequest, true);
  assert.strictEqual(result.userId, USER_ID);
});

test('auth-check: no session, valid query param token returns authorized=true, isCliRequest=true', async () => {
  setMockSession(null);

  mockDbState.queryHandler = (text, values) => {
    if (text.includes('cli_token')) {
      if (values[0] === PROJECT_ID && values[1] === CLI_TOKEN) {
        return [{ id: PROJECT_ID, user_id: USER_ID, cli_token: CLI_TOKEN }];
      }
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/events/detail?eventId=some-event&token=${CLI_TOKEN}`);
  const result = await authorizeProjectAccess(req, PROJECT_ID);

  assert.strictEqual(result.authorized, true);
  assert.strictEqual(result.isCliRequest, true);
  assert.strictEqual(result.userId, USER_ID);
});

test('auth-check: no session, invalid CLI token returns authorized=false', async () => {
  setMockSession(null);

  mockDbState.queryHandler = () => [];

  const req = new Request(`http://localhost:3000/api/tunnel/connect?projectId=${PROJECT_ID}`, {
    headers: {
      'authorization': 'Bearer invalid-token-value',
    },
  });
  const result = await authorizeProjectAccess(req, PROJECT_ID);

  assert.strictEqual(result.authorized, false);
  assert.strictEqual(result.isCliRequest, false);
  assert.strictEqual(result.userId, null);
});

test('auth-check: no session, no token returns authorized=false', async () => {
  setMockSession(null);

  const req = new Request(`http://localhost:3000/api/events/stream?projectId=${PROJECT_ID}`);
  const result = await authorizeProjectAccess(req, PROJECT_ID);

  assert.strictEqual(result.authorized, false);
  assert.strictEqual(result.isCliRequest, false);
  assert.strictEqual(result.userId, null);
});

// ─── Dual-Auth Fallback & Edge Cases ─────────────────────────────────

test('auth-check: session user does not own project, but valid CLI token works', async () => {
  setMockSession({ user: { id: OTHER_USER_ID } });

  mockDbState.queryHandler = (text, values) => {
    // Session check fails because OTHER_USER_ID does not own PROJECT_ID
    if (text.includes('FROM projects') && !text.includes('cli_token')) {
      return [];
    }
    // CLI token check succeeds
    if (text.includes('cli_token')) {
      if (values[0] === PROJECT_ID && values[1] === CLI_TOKEN) {
        return [{ id: PROJECT_ID, user_id: USER_ID, cli_token: CLI_TOKEN }];
      }
    }
    return [];
  };

  const req = new Request(`http://localhost:3000/api/tunnel/connect?projectId=${PROJECT_ID}`, {
    headers: {
      'authorization': `Bearer ${CLI_TOKEN}`,
    },
  });
  const result = await authorizeProjectAccess(req, PROJECT_ID);

  assert.strictEqual(result.authorized, true);
  assert.strictEqual(result.isCliRequest, true);
  assert.strictEqual(result.userId, USER_ID);
});

test('auth-check: Bearer prefix must be exact and case-sensitive', async () => {
  setMockSession(null);

  // "bearer" in lowercase should not match startsWith('Bearer ')
  const req = new Request(`http://localhost:3000/api/tunnel/connect?projectId=${PROJECT_ID}`, {
    headers: {
      'authorization': `bearer ${CLI_TOKEN}`,
    },
  });
  const result = await authorizeProjectAccess(req, PROJECT_ID);

  assert.strictEqual(result.authorized, false);
});
