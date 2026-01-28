import { createClient } from '@supabase/supabase-js';
import * as schema from './schema';

// For now, we'll use a direct approach until we set up the proper Postgres connection
// You can use Supabase client for direct queries or set up DATABASE_URL later

export * from './schema';

// Supabase client for database operations
export const createSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are required');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};