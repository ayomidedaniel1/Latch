import pg from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required for seeding');
  }

  const pool = new pg.Pool({ connectionString });
  const res = await pool.query(`
    INSERT INTO projects (user_id, name, destination_url)
    VALUES ('dev-user', 'Test Project', 'http://localhost:3001/webhook')
    RETURNING id, name
  `);

  const project = res.rows[0];

  console.log('Created test project:');
  console.log(`  ID:   ${project.id}`);
  console.log(`  Name: ${project.name}`);
  console.log('');
  console.log('Use this ID in your curl test:');
  console.log(`  curl -X POST http://localhost:3000/api/ingest/${project.id} \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"event": "payment.succeeded", "amount": 4900}'`);

  await pool.end();
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
