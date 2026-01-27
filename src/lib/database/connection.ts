import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres connection
const connection = postgres(connectionString, {
  prepare: false, // Disable prepared statements for better compatibility
});

// Create drizzle instance
export const db = drizzle(connection, {
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Export schema for use in other files
export * from './schema';

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await connection`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Close database connection (useful for serverless functions)
export async function closeDatabaseConnection(): Promise<void> {
  await connection.end();
}