#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🚀 Setting up Rovora development environment...\n');

// Check if .env exists
if (!existsSync('.env')) {
  console.log('📝 Creating .env file from .env.example...');
  try {
    const envExample = require('fs').readFileSync('.env.example', 'utf8');
    writeFileSync('.env', envExample);
    console.log('✅ .env file created! Please update it with your actual values.\n');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Generate database schema
console.log('🗄️  Generating database schema...');
try {
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('✅ Database schema generated!\n');
} catch (error) {
  console.warn('⚠️  Warning: Could not generate database schema. This is normal if you haven\'t set up your database yet.\n');
}

// Create local database (if using local SQLite)
if (!process.env.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL.includes('file:')) {
  console.log('🗄️  Setting up local database...');
  try {
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log('✅ Local database created!\n');
  } catch (error) {
    console.warn('⚠️  Warning: Could not create local database. You may need to configure your environment variables first.\n');
  }
}

console.log('🎉 Development environment setup complete!\n');
console.log('📋 Next steps:');
console.log('   1. Update your .env file with actual values');
console.log('   2. Run "npm run dev" to start the development server');
console.log('   3. Visit http://localhost:5173 to see your app');
console.log('   4. Run "npm run db:studio" to explore your database\n');

console.log('📚 Useful commands:');
console.log('   npm run dev          - Start development server');
console.log('   npm run build        - Build for production');
console.log('   npm run db:studio    - Open database studio');
console.log('   npm run db:seed      - Seed database with sample data');
console.log('   npm run db:reset     - Reset and reseed database\n');

console.log('🔗 Documentation:');
console.log('   https://kit.svelte.dev/docs - SvelteKit docs');
console.log('   https://orm.drizzle.team/docs - Drizzle ORM docs');
console.log('   https://authjs.dev/reference/sveltekit - Auth.js docs\n');

console.log('Happy coding! 🎮✨');
