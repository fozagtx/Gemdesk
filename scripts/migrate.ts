import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('Please set DATABASE_URL in your .env.local file');
  console.error('Example: DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres');
  process.exit(1);
}

async function main() {
  console.log('🔄 Running database migrations...');

  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: 'src/lib/database/migrations' });

  console.log('✅ Database migrations completed successfully!');

  await sql.end();
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});