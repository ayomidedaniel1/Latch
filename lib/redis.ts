import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

export const redis = new Redis({
  url: env.redisUrl,
  token: env.redisToken,
});
