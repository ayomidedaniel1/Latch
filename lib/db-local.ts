import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Graceful shutdown (Node.js runtime only)
if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('SIGTERM', () => pool.end());
  process.on('SIGINT', () => pool.end());
}

/**
 * Tagged template literal query interface that matches Neon's `neon()` API.
 *
 * This allows all repository code to work unchanged regardless of
 * whether the app is running in cloud mode (Neon) or local mode (pg).
 */
function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  // Build a parameterized query: "SELECT * FROM projects WHERE id = $1"
  let text = '';
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      text += `$${i + 1}`;
    }
  }

  return pool.query(text, values).then((result) => result.rows);
}

export { sql as db, pool };
