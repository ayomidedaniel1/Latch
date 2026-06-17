import { neon, neonConfig } from '@neondatabase/serverless';
import { env } from '@/lib/env';

neonConfig.fetchConnectionCache = true;

export const db = neon(env.databaseUrl);
