import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { users } from './auth';
import { games, platforms, tags } from './games';

export const gameEntries = sqliteTable('game_entries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  game_id: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  platform_id: text('platform_id').notNull().references(() => platforms.id),
  
  // Game status
  status: text('status', { 
    enum: ['playing', 'completed', 'dropped', 'backlog', 'wishlist', 'on_hold', 'not_started'] 
  }).notNull().default('backlog'),
  
  // Progress tracking
  playtime_hours: integer('playtime_hours').default(0),
  completion_percentage: integer('completion_percentage').default(0),
  
  // Dates
  started_date: text('started_date'),
  completed_date: text('completed_date'),
  last_played: text('last_played'),
  
  // User flags
  is_favorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  is_private: integer('is_private', { mode: 'boolean' }).default(false),
  is_replay: integer('is_replay', { mode: 'boolean' }).default(false),
  replay_count: integer('replay_count').default(0),
  
  // Purchase information
  purchase_date: text('purchase_date'),
  purchase_price: integer('purchase_price'), // in cents
  is_gift: integer('is_gift', { mode: 'boolean' }).default(false),
  
  // Notes
  notes: text('notes'),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const gameRatings = sqliteTable('game_ratings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  game_entry_id: text('game_entry_id').notNull().references(() => gameEntries.id, { onDelete: 'cascade' }).unique(),
  
  // Overall rating (1-5 controllers)
  overall_rating: integer('overall_rating').notNull(),
  
  // Detailed ratings (1-5 each)
  gameplay_rating: integer('gameplay_rating'),
  story_rating: integer('story_rating'),
  graphics_rating: integer('graphics_rating'),
  audio_rating: integer('audio_rating'),
  replayability_rating: integer('replayability_rating'),
  difficulty_rating: integer('difficulty_rating'),
  
  // Platform-specific rating
  platform_rating: integer('platform_rating'), // How well it runs on this platform
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const codexEntries = sqliteTable('codex_entries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  game_id: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  game_entry_id: text('game_entry_id').references(() => gameEntries.id, { onDelete: 'cascade' }),
  
  // Entry content
  title: text('title').notNull(),
  content: text('content').notNull(),
  entry_type: text('entry_type', { 
    enum: ['review', 'journal', 'screenshot', 'achievement', 'milestone', 'thought', 'tip', 'bug_report'] 
  }).notNull(),
  
  // Context
  mood: text('mood'), // User's mood while playing
  playtime_at_entry: integer('playtime_at_entry'), // Playtime when entry was created
  completion_at_entry: integer('completion_at_entry'), // Completion % when entry was created
  
  // Content flags
  spoiler_level: text('spoiler_level', { enum: ['none', 'minor', 'major', 'ending'] }).default('none'),
  is_public: integer('is_public', { mode: 'boolean' }).default(true),
  is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
  
  // Media
  screenshots: text('screenshots'), // JSON array of URLs
  videos: text('videos'), // JSON array of video data
  
  // Engagement
  likes_count: integer('likes_count').default(0),
  comments_count: integer('comments_count').default(0),
  shares_count: integer('shares_count').default(0),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const codexEntryTags = sqliteTable('codex_entry_tags', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  codex_entry_id: text('codex_entry_id').notNull().references(() => codexEntries.id, { onDelete: 'cascade' }),
  tag_id: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  game_id: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  
  // Achievement details
  name: text('name').notNull(),
  description: text('description'),
  icon_url: text('icon_url'),
  
  // External IDs
  steam_achievement_id: text('steam_achievement_id'),
  xbox_achievement_id: text('xbox_achievement_id'),
  psn_trophy_id: text('psn_trophy_id'),
  
  // Achievement metadata
  rarity: text('rarity', { enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] }),
  points: integer('points').default(0),
  is_hidden: integer('is_hidden', { mode: 'boolean' }).default(false),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const userAchievements = sqliteTable('user_achievements', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievement_id: text('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  game_entry_id: text('game_entry_id').references(() => gameEntries.id, { onDelete: 'cascade' }),
  
  // Achievement progress
  progress: integer('progress').default(0), // 0-100
  is_unlocked: integer('is_unlocked', { mode: 'boolean' }).default(false),
  unlocked_at: text('unlocked_at'),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});