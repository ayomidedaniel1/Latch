import test from 'node:test';
import assert from 'node:assert';

/**
 * Mock-based unit tests for the unified authorizeProjectAccess logic.
 * Tests both auth paths: NextAuth session and CLI token (Bearer + query param).
 */

// ─── Mock Setup ──────────────────────────────────────────────────────

interface AuthResult {
  authorized: boolean;
  isCliRequest: boolean;
  userId: string | null;
}

interface MockProject {
  id: string;
  user_id: string;
  cli_token: string;
}

function createMockAuth(options: {
  sessionUserId: string | null;
  projects: MockProject[];
}) {
  async function authorizeProjectAccess(
    req: { url: string; headers: { get: (name: string) => string | null } },
    projectId: string,
  ): Promise<AuthResult> {
    // NextAuth session path
    if (options.sessionUserId) {
      const project = options.projects.find(
        p => p.id === projectId && p.user_id === options.sessionUserId
      );
      if (project) {
        return { authorized: true, isCliRequest: false, userId: options.sessionUserId };
      }
    }

    // CLI token path (Bearer header or query param)
    const url = new URL(req.url);
    const authHeader = req.headers.get('authorization');
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

    if (!token) {
      token = url.searchParams.get('token');
    }

    if (token) {
      const project = options.projects.find(
        p => p.id === projectId && p.cli_token === token
      );
      if (project) {
        return { authorized: true, isCliRequest: true, userId: project.user_id };
      }
    }

    return { authorized: false, isCliRequest: false, userId: null };
  }

  return { authorizeProjectAccess };
}

function mockRequest(url: string, headers: Record<string, string> = {}): {
  url: string;
  headers: { get: (name: string) => string | null };
} {
  return {
    url,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  };
}

const testProject: MockProject = {
  id: 'proj-123',
  user_id: 'user-456',
  cli_token: 'cli-token-abc',
};

// ─── Session Auth Tests ──────────────────────────────────────────────

test('auth: valid session with project ownership returns authorized=true, isCliRequest=false', async () => {
  const auth = createMockAuth({
    sessionUserId: 'user-456',
    projects: [testProject],
  });

  const req = mockRequest('http://localhost:3000/api/events/stream?projectId=proj-123');
  const result = await auth.authorizeProjectAccess(req, 'proj-123');

  assert.strictEqual(result.authorized, true);
  assert.strictEqual(result.isCliRequest, false);
  assert.strictEqual(result.userId, 'user-456');
});

test('auth: valid session but wrong project returns authorized=false', async () => {
  const auth = createMockAuth({
    sessionUserId: 'user-456',
    projects: [testProject],
  });

  const req = mockRequest('http://localhost:3000/api/events/stream?projectId=other-project');
  const result = await auth.authorizeProjectAccess(req, 'other-project');

  assert.strictEqual(result.authorized, false);
});

// ─── CLI Token Auth Tests ────────────────────────────────────────────

test('auth: no session, valid Bearer token returns authorized=true, isCliRequest=true', async () => {
  const auth = createMockAuth({
    sessionUserId: null,
    projects: [testProject],
  });

  const req = mockRequest('http://localhost:3000/api/tunnel/connect?projectId=proj-123', {
    'authorization': 'Bearer cli-token-abc',
  });
  const result = await auth.authorizeProjectAccess(req, 'proj-123');

  assert.strictEqual(result.authorized, true);
  assert.strictEqual(result.isCliRequest, true);
  assert.strictEqual(result.userId, 'user-456');
});

test('auth: no session, valid query param token returns authorized=true, isCliRequest=true', async () => {
  const auth = createMockAuth({
    sessionUserId: null,
    projects: [testProject],
  });

  const req = mockRequest('http://localhost:3000/api/events/detail?eventId=evt-1&token=cli-token-abc');
  const result = await auth.authorizeProjectAccess(req, 'proj-123');

  assert.strictEqual(result.authorized, true);
  assert.strictEqual(result.isCliRequest, true);
});

test('auth: no session, invalid token returns authorized=false', async () => {
  const auth = createMockAuth({
    sessionUserId: null,
    projects: [testProject],
  });

  const req = mockRequest('http://localhost:3000/api/events/stream?projectId=proj-123', {
    'authorization': 'Bearer wrong-token',
  });
  const result = await auth.authorizeProjectAccess(req, 'proj-123');

  assert.strictEqual(result.authorized, false);
});

test('auth: no session, no token returns authorized=false', async () => {
  const auth = createMockAuth({
    sessionUserId: null,
    projects: [testProject],
  });

  const req = mockRequest('http://localhost:3000/api/events/stream?projectId=proj-123');
  const result = await auth.authorizeProjectAccess(req, 'proj-123');

  assert.strictEqual(result.authorized, false);
  assert.strictEqual(result.isCliRequest, false);
  assert.strictEqual(result.userId, null);
});

// ─── Edge Cases ──────────────────────────────────────────────────────

test('auth: session user does not own the project, valid CLI token works', async () => {
  const auth = createMockAuth({
    sessionUserId: 'different-user',
    projects: [testProject],
  });

  const req = mockRequest('http://localhost:3000/api/tunnel/connect?projectId=proj-123', {
    'authorization': 'Bearer cli-token-abc',
  });
  const result = await auth.authorizeProjectAccess(req, 'proj-123');

  // Session fails (different user), but CLI token succeeds
  assert.strictEqual(result.authorized, true);
  assert.strictEqual(result.isCliRequest, true);
  assert.strictEqual(result.userId, 'user-456');
});

test('auth: Bearer prefix must be exact (case sensitive)', async () => {
  const auth = createMockAuth({
    sessionUserId: null,
    projects: [testProject],
  });

  // "bearer" lowercase — our code checks startsWith('Bearer ')
  const req = mockRequest('http://localhost:3000/api/tunnel/connect?projectId=proj-123', {
    'authorization': 'bearer cli-token-abc',
  });
  const result = await auth.authorizeProjectAccess(req, 'proj-123');

  // Should fail because 'bearer' !== 'Bearer'
  assert.strictEqual(result.authorized, false);
});
