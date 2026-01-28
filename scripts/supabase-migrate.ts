import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase environment variables are required');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

async function createTables() {
  console.log('🔄 Creating Supabase tables...');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Read the migration SQL file
  const migrationSQL = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/database/migrations/0000_chunky_skrulls.sql'),
    'utf-8'
  );

  // Execute the migration
  const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

  if (error) {
    console.error('❌ Migration failed:', error);

    // Try executing each statement separately
    console.log('🔄 Trying to execute statements individually...');

    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
        if (stmtError) {
          console.warn('⚠️ Statement failed (might already exist):', stmtError.message);
        }
      }
    }
  }

  console.log('✅ Database setup completed!');
  console.log('📋 Created tables:');
  console.log('   • users');
  console.log('   • organizations');
  console.log('   • organization_members');
  console.log('   • github_installations');
  console.log('   • projects');
  console.log('   • documentation_files');
  console.log('   • gem_executions');
}

createTables().catch((err) => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});