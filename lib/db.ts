import { neon } from '@neondatabase/serverless';
import { env } from '@/lib/env';

export const db = neon(env.databaseUrl);
