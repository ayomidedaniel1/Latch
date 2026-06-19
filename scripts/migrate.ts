import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

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

  const connectionString = process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) {
    throw new Error('DATABASE_URL_UNPOOLED is required for migrations');
  }

  const sql = neon(connectionString);
  const schema = readFileSync(join(process.cwd(), 'lib/schema.sql'), 'utf-8');

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    await sql.query(statement);
    console.log('Executed:', statement.slice(0, 60) + '...');
  }

  console.log('\nMigration complete.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
