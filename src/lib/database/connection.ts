import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { dev } from '$app/environment';

// Database connection configuration
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, {
  logger: dev
});

export type Database = typeof db;