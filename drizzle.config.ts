import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/database/schema.ts',
  out: './src/lib/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;