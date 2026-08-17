// Guard: server-only crashes outside Next.js (worker, scripts).
// In Next.js it prevents client-component imports of this module.
try { require('server-only'); } catch {}

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  NEXT_PUBLIC_APP_URL: z.string().url(),

  AUTH_SECRET: z.string().min(1),
  AUTH_GITHUB_ID: z.string().min(1),
  AUTH_GITHUB_SECRET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables - check .env.local against lib/env.ts');
}

export const env = {
  isLocalMode: !process.env.LATCH_MODE || process.env.LATCH_MODE === 'local',
  nodeEnv: parsed.data.NODE_ENV,
  isDev: parsed.data.NODE_ENV === 'development',

  databaseUrl: parsed.data.DATABASE_URL,
  redisUrl: parsed.data.REDIS_URL,
  appUrl: parsed.data.NEXT_PUBLIC_APP_URL,

  authSecret: parsed.data.AUTH_SECRET,
  authGithubId: parsed.data.AUTH_GITHUB_ID,
  authGithubSecret: parsed.data.AUTH_GITHUB_SECRET,
} as const;
