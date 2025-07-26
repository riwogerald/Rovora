#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { config } from 'dotenv';

// Load environment variables
config();

const runMigrations = async () => {
  if (!process.env.TURSO_DATABASE_URL) {
    console.error('❌ TURSO_DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('🚀 Starting database migrations...');

  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const db = drizzle(client);

    await migrate(db, { migrationsFolder: './src/lib/database/migrations' });

    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
