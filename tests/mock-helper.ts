import { createRequire } from 'node:module';
import path from 'node:path';

// ─── Environment Setup ────────────────────────────────────────────────
const envDict = process.env as Record<string, string | undefined>;
envDict.NODE_ENV = envDict.NODE_ENV || 'test';
envDict.DATABASE_URL = envDict.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/latch_test';
envDict.REDIS_URL = envDict.REDIS_URL || 'redis://localhost:6379';
envDict.NEXT_PUBLIC_APP_URL = envDict.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
envDict.AUTH_SECRET = envDict.AUTH_SECRET || 'test-secret-at-least-32-characters-long';
envDict.AUTH_GITHUB_ID = envDict.AUTH_GITHUB_ID || 'test-github-id';
envDict.AUTH_GITHUB_SECRET = envDict.AUTH_GITHUB_SECRET || 'test-github-secret';

const req = createRequire(path.resolve(process.cwd(), 'package.json'));

// ─── Mock Database Pool ──────────────────────────────────────────────
export interface MockDbQuery {
  text: string;
  values: unknown[];
}

export type DbQueryHandler = (text: string, values: unknown[]) => Record<string, unknown>[] | Promise<Record<string, unknown>[]>;

class MockDbState {
  queries: MockDbQuery[] = [];
  queryHandler: DbQueryHandler | null = null;
  defaultRows: Record<string, unknown>[] = [];

  reset() {
    this.queries = [];
    this.queryHandler = null;
    this.defaultRows = [];
  }
}

export const mockDbState = new MockDbState();

class MockPool {
  query = async (text: string, values: unknown[] = []): Promise<{ rows: Record<string, unknown>[] }> => {
    mockDbState.queries.push({ text, values });
    if (mockDbState.queryHandler) {
      const rows = await mockDbState.queryHandler(text, values);
      return { rows };
    }
    return { rows: mockDbState.defaultRows };
  };

  end = async (): Promise<void> => {};
  on = (): this => this;
}

const pgPath = req.resolve('pg');
req.cache[pgPath] = {
  exports: { Pool: MockPool, default: { Pool: MockPool } },
  loaded: true,
  id: pgPath,
  filename: pgPath,
  children: [],
  paths: [],
} as unknown as NodeModule;

// ─── Mock Redis Client ────────────────────────────────────────────────
export interface MockRedisCall {
  method: string;
  args: unknown[];
}

export interface MockPubSubListener {
  (channel: string, message: string): void;
}

class MockRedisState {
  calls: MockRedisCall[] = [];
  queue: string[] = [];
  storage: Map<string, string> = new Map();
  sets: Map<string, Set<string>> = new Map();
  counters: Map<string, number> = new Map();
  published: { channel: string; message: string }[] = [];
  subscribers: MockSubscriber[] = [];
  customHandlers: Map<string, (...args: unknown[]) => unknown> = new Map();

  reset() {
    this.calls = [];
    this.queue = [];
    this.storage.clear();
    this.sets.clear();
    this.counters.clear();
    this.published = [];
    this.subscribers = [];
    this.customHandlers.clear();
  }
}

export const mockRedisState = new MockRedisState();

class MockSubscriber {
  listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();
  subscribedChannels: Set<string> = new Set();

  on(event: string, callback: (...args: unknown[]) => void): this {
    const list = this.listeners.get(event) ?? [];
    list.push(callback);
    this.listeners.set(event, list);
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    const list = this.listeners.get(event) ?? [];
    for (const cb of list) {
      cb(...args);
    }
    return list.length > 0;
  }

  subscribe = async (channel: string): Promise<void> => {
    this.subscribedChannels.add(channel);
  };

  unsubscribe = async (channel?: string): Promise<void> => {
    if (channel) {
      this.subscribedChannels.delete(channel);
    } else {
      this.subscribedChannels.clear();
    }
  };

  disconnect = (): void => {
    this.subscribedChannels.clear();
    this.listeners.clear();
  };
}

class MockRedis extends MockSubscriber {
  constructor(..._args: unknown[]) {
    super();
    mockRedisState.subscribers.push(this);
  }

  lpush = async (key: string, ...values: string[]): Promise<number> => {
    mockRedisState.calls.push({ method: 'lpush', args: [key, ...values] });
    const handler = mockRedisState.customHandlers.get('lpush');
    if (handler) {
      return handler(key, ...values) as number;
    }
    mockRedisState.queue.unshift(...values);
    return mockRedisState.queue.length;
  };

  rpop = async (key: string): Promise<string | null> => {
    mockRedisState.calls.push({ method: 'rpop', args: [key] });
    const handler = mockRedisState.customHandlers.get('rpop');
    if (handler) {
      return handler(key) as string | null;
    }
    return mockRedisState.queue.pop() ?? null;
  };

  get = async (key: string): Promise<string | null> => {
    mockRedisState.calls.push({ method: 'get', args: [key] });
    const handler = mockRedisState.customHandlers.get('get');
    if (handler) {
      return handler(key) as string | null;
    }
    return mockRedisState.storage.get(key) ?? null;
  };

  set = async (key: string, value: string, ...args: unknown[]): Promise<string> => {
    mockRedisState.calls.push({ method: 'set', args: [key, value, ...args] });
    const handler = mockRedisState.customHandlers.get('set');
    if (handler) {
      return handler(key, value, ...args) as string;
    }
    mockRedisState.storage.set(key, value);
    return 'OK';
  };

  ping = async (): Promise<string> => {
    mockRedisState.calls.push({ method: 'ping', args: [] });
    return 'PONG';
  };

  publish = async (channel: string, message: string): Promise<number> => {
    mockRedisState.calls.push({ method: 'publish', args: [channel, message] });
    mockRedisState.published.push({ channel, message });
    // Notify local subscribers
    for (const sub of mockRedisState.subscribers) {
      if (sub.subscribedChannels.has(channel)) {
        sub.emit('message', channel, message);
      }
    }
    return 1;
  };

  createSubscriber = (): MockRedis => {
    mockRedisState.calls.push({ method: 'createSubscriber', args: [] });
    return new MockRedis();
  };

  incr = async (key: string): Promise<number> => {
    mockRedisState.calls.push({ method: 'incr', args: [key] });
    const handler = mockRedisState.customHandlers.get('incr');
    if (handler) {
      return handler(key) as number;
    }
    const current = (mockRedisState.counters.get(key) ?? 0) + 1;
    mockRedisState.counters.set(key, current);
    return current;
  };

  expire = async (key: string, seconds: number): Promise<number> => {
    mockRedisState.calls.push({ method: 'expire', args: [key, seconds] });
    return 1;
  };

  ttl = async (key: string): Promise<number> => {
    mockRedisState.calls.push({ method: 'ttl', args: [key] });
    return 60;
  };

  sadd = async (key: string, member: string): Promise<number> => {
    mockRedisState.calls.push({ method: 'sadd', args: [key, member] });
    let set = mockRedisState.sets.get(key);
    if (!set) {
      set = new Set();
      mockRedisState.sets.set(key, set);
    }
    set.add(member);
    return 1;
  };

  srem = async (key: string, member: string): Promise<number> => {
    mockRedisState.calls.push({ method: 'srem', args: [key, member] });
    const set = mockRedisState.sets.get(key);
    if (set) {
      set.delete(member);
    }
    return 1;
  };

  scard = async (key: string): Promise<number> => {
    mockRedisState.calls.push({ method: 'scard', args: [key] });
    const set = mockRedisState.sets.get(key);
    return set ? set.size : 0;
  };

  disconnect = (): void => {};
}
(MockRedis as unknown as { default: typeof MockRedis }).default = MockRedis;

const ioredisPath = req.resolve('ioredis');
req.cache[ioredisPath] = {
  exports: MockRedis,
  loaded: true,
  id: ioredisPath,
  filename: ioredisPath,
  children: [],
  paths: [],
} as unknown as NodeModule;

// ─── Mock next/headers ────────────────────────────────────────────────
let currentMockHeaders = new Headers();

export function setMockHeaders(headersMap: Record<string, string>): void {
  currentMockHeaders = new Headers(headersMap);
}

const nextHeadersPath = req.resolve('next/headers');
req.cache[nextHeadersPath] = {
  exports: {
    headers: async () => currentMockHeaders,
    cookies: async () => ({}),
    draftMode: async () => ({}),
  },
  loaded: true,
  id: nextHeadersPath,
  filename: nextHeadersPath,
  children: [],
  paths: [],
} as unknown as NodeModule;

// ─── Mock @auth/pg-adapter ───────────────────────────────────────────
const pgAdapterPath = path.resolve(process.cwd(), 'node_modules/@auth/pg-adapter/index.js');
const mockPgAdapter = () => ({});
req.cache[pgAdapterPath] = {
  exports: { default: mockPgAdapter, PostgresAdapter: mockPgAdapter },
  loaded: true,
  id: pgAdapterPath,
  filename: pgAdapterPath,
  children: [],
  paths: [],
} as unknown as NodeModule;

// ─── Mock @/auth ─────────────────────────────────────────────────────
export interface MockSession {
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

let currentMockSession: MockSession | null = { user: { id: 'test-user-id' } };

export function setMockSession(session: MockSession | null): void {
  currentMockSession = session;
}

const authPath = path.resolve(process.cwd(), 'auth.ts');
const mockAuth = async (): Promise<MockSession | null> => currentMockSession;
const mockAuthExports = {
  auth: mockAuth,
  handlers: {
    GET: () => new Response('OK'),
    POST: () => new Response('OK'),
  },
  signIn: async (): Promise<void> => {},
  signOut: async (): Promise<void> => {},
  default: mockAuth,
};
req.cache[authPath] = {
  exports: mockAuthExports,
  loaded: true,
  id: authPath,
  filename: authPath,
  children: [],
  paths: [],
} as unknown as NodeModule;

// ─── Mock Fetch Utility ──────────────────────────────────────────────
export interface MockFetchCall {
  url: string;
  init?: RequestInit;
}

class MockFetchState {
  calls: MockFetchCall[] = [];
  customHandler: ((url: string, init?: RequestInit) => Promise<Response>) | null = null;
  defaultResponse: { status: number; body: string; headers?: Record<string, string> } = {
    status: 200,
    body: 'OK',
  };

  reset() {
    this.calls = [];
    this.customHandler = null;
    this.defaultResponse = { status: 200, body: 'OK' };
  }
}

export const mockFetchState = new MockFetchState();

const originalFetch = globalThis.fetch;

export function setupMockFetch(): void {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    mockFetchState.calls.push({ url, init });

    if (mockFetchState.customHandler) {
      return mockFetchState.customHandler(url, init);
    }

    const { status, body, headers } = mockFetchState.defaultResponse;
    return new Response(body, {
      status,
      headers: headers ?? { 'content-type': 'text/plain' },
    });
  };
}

export function restoreFetch(): void {
  globalThis.fetch = originalFetch;
}

// ─── Reset All ────────────────────────────────────────────────────────
export function resetAllMocks(): void {
  mockDbState.reset();
  mockRedisState.reset();
  mockFetchState.reset();
  currentMockHeaders = new Headers();
  currentMockSession = { user: { id: 'test-user-id' } };
}
