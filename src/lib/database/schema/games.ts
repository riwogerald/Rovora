import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';

export const games = sqliteTable('games', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  short_description: text('short_description'),
  
  // Release information
  release_date: text('release_date'),
  early_access_date: text('early_access_date'),
  is_early_access: integer('is_early_access', { mode: 'boolean' }).default(false),
  
  // Developer and publisher
  developer: text('developer'),
  publisher: text('publisher'),
  
  // Media
  cover_image: text('cover_image'),
  header_image: text('header_image'),
  screenshots: text('screenshots'), // JSON array of URLs
  videos: text('videos'), // JSON array of video data
  
  // External IDs
  steam_app_id: text('steam_app_id').unique(),
  igdb_id: text('igdb_id').unique(),
  metacritic_id: text('metacritic_id'),
  gog_id: text('gog_id'),
  epic_id: text('epic_id'),
  
  // Ratings and scores
  metacritic_score: integer('metacritic_score'),
  steam_score: integer('steam_score'), // Steam review percentage
  igdb_rating: integer('igdb_rating'), // IGDB rating * 10
  
  // Content flags
  is_nsfw: integer('is_nsfw', { mode: 'boolean' }).default(false),
  nsfw_level: text('nsfw_level', { enum: ['none', 'mild', 'moderate', 'mature', 'adult'] }).default('none'),
  content_warnings: text('content_warnings'), // JSON array
  
  // Game details
  estimated_playtime: integer('estimated_playtime'), // in minutes
  difficulty_level: text('difficulty_level', { enum: ['very_easy', 'easy', 'medium', 'hard', 'very_hard'] }),
  
  // Metadata
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  last_synced: text('last_synced'),
});

export const platforms = sqliteTable('platforms', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  short_name: text('short_name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  category: text('category', { enum: ['console', 'pc', 'mobile', 'handheld', 'vr', 'cloud'] }).notNull(),
  
  // Platform details
  manufacturer: text('manufacturer'),
  release_date: text('release_date'),
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const gamePlatforms = sqliteTable('game_platforms', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  game_id: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  platform_id: text('platform_id').notNull().references(() => platforms.id, { onDelete: 'cascade' }),
  
  // Platform-specific data
  release_date: text('release_date'),
  store_url: text('store_url'),
  price: integer('price'), // in cents
  is_free: integer('is_free', { mode: 'boolean' }).default(false),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const genres = sqliteTable('genres', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color'),
  icon: text('icon'),
  parent_id: text('parent_id').references(() => genres.id),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const gameGenres = sqliteTable('game_genres', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  game_id: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  genre_id: text('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  category: text('category', { 
    enum: ['mood', 'mechanic', 'theme', 'difficulty', 'length', 'multiplayer', 'custom'] 
  }).notNull(),
  color: text('color'),
  icon: text('icon'),
  
  // Usage statistics
  usage_count: integer('usage_count').default(0),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const gameTags = sqliteTable('game_tags', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  game_id: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  tag_id: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  
  // Tag relevance score (0-100)
  relevance_score: integer('relevance_score').default(100),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});