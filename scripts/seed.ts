import { neon } from '@neondatabase/serverless';

async function main() {
  if (!process.env.DATABASE_URL_UNPOOLED) {
    throw new Error('DATABASE_URL_UNPOOLED is required for seeding');
  }

  const sql = neon(process.env.DATABASE_URL_UNPOOLED);

  const [project] = await sql`
    INSERT INTO projects (user_id, name, destination_url)
    VALUES ('dev-user', 'Test Project', 'http://localhost:3001/webhook')
    RETURNING id, name
  `;

  console.log('Created test project:');
  console.log(`  ID:   ${project.id}`);
  console.log(`  Name: ${project.name}`);
  console.log('');
  console.log('Use this ID in your curl test:');
  console.log(`  curl -X POST http://localhost:3000/api/ingest/${project.id} \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"event": "payment.succeeded", "amount": 4900}'`);
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
