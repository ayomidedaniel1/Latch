import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

async function main() {
  const envLocalPath = join(process.cwd(), '.env.local');
  if (existsSync(envLocalPath)) {
    const envConfig = readFileSync(envLocalPath, 'utf-8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required for migrations');
  }

  console.log('🚀 Running database migrations...');

  // Parse target DB name from connection string
  let targetDbName = 'postgres';
  try {
    const parsedUrl = new URL(connectionString);
    targetDbName = parsedUrl.pathname.replace(/^\//, '') || 'postgres';
  } catch {
    // fallback
  }

  // If targeting a custom DB name (like "latch"), ensure it exists first via default "postgres" DB
  if (targetDbName !== 'postgres') {
    try {
      const rootUrl = connectionString.replace(/\/[^/]+(\?.*)?$/, '/postgres$1');
      const rootClient = new pg.Client({ connectionString: rootUrl });
      await rootClient.connect();
      const checkDb = await rootClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDbName]);
      if (checkDb.rowCount === 0) {
        console.log(`Creating database "${targetDbName}"...`);
        await rootClient.query(`CREATE DATABASE "${targetDbName}"`);
      }
      await rootClient.end();
    } catch {
      // Non-fatal: if user lacks permissions or root connect fails, proceed directly
    }
  }

  const schema = readFileSync(join(process.cwd(), 'lib/schema.sql'), 'utf-8');
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const client = new pg.Client({ connectionString });
  await client.connect();

  try {
    for (const statement of statements) {
      await client.query(statement);
      console.log('Executed:', statement.slice(0, 60).replace(/\n/g, ' ') + '...');
    }
  } finally {
    await client.end();
  }

  console.log('\n✓ Migration complete.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
