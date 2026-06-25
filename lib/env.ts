import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().url(),
  DATABASE_URL_UNPOOLED: z.string().url(),

  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  QSTASH_TOKEN: z.string().min(1),
  QSTASH_URL: z.string().url(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
  QSTASH_NEXT_SIGNING_KEY: z.string().min(1),

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
  nodeEnv: parsed.data.NODE_ENV,
  isDev: parsed.data.NODE_ENV === 'development',

  databaseUrl: parsed.data.DATABASE_URL,
  databaseUrlUnpooled: parsed.data.DATABASE_URL_UNPOOLED,

  redisUrl: parsed.data.UPSTASH_REDIS_REST_URL,
  redisToken: parsed.data.UPSTASH_REDIS_REST_TOKEN,

  qstashToken: parsed.data.QSTASH_TOKEN,
  qstashUrl: parsed.data.QSTASH_URL,

  appUrl: parsed.data.NEXT_PUBLIC_APP_URL,

  authSecret: parsed.data.AUTH_SECRET,
  authGithubId: parsed.data.AUTH_GITHUB_ID,
  authGithubSecret: parsed.data.AUTH_GITHUB_SECRET,
} as const;
