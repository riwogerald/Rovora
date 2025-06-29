import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  display_name: text('display_name'),
  avatar_url: text('avatar_url'),
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  steam_id: text('steam_id').unique(),
  xbox_gamertag: text('xbox_gamertag'),
  psn_id: text('psn_id'),
  nintendo_friend_code: text('nintendo_friend_code'),
  epic_username: text('epic_username'),
  gog_username: text('gog_username'),
  
  // Account status
  is_verified: integer('is_verified', { mode: 'boolean' }).default(false),
  is_private: integer('is_private', { mode: 'boolean' }).default(false),
  is_banned: integer('is_banned', { mode: 'boolean' }).default(false),
  
  // Timestamps
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  last_login: text('last_login'),
  email_verified_at: text('email_verified_at'),
});

export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Theme and display
  theme: text('theme', { enum: ['light', 'dark', 'system'] }).default('dark'),
  language: text('language').default('en'),
  timezone: text('timezone').default('UTC'),
  
  // Privacy settings
  privacy_level: text('privacy_level', { enum: ['public', 'friends', 'private'] }).default('public'),
  show_playtime: integer('show_playtime', { mode: 'boolean' }).default(true),
  show_achievements: integer('show_achievements', { mode: 'boolean' }).default(true),
  show_activity: integer('show_activity', { mode: 'boolean' }).default(true),
  show_wishlist: integer('show_wishlist', { mode: 'boolean' }).default(true),
  show_reviews: integer('show_reviews', { mode: 'boolean' }).default(true),
  
  // Gaming preferences
  default_platform_id: text('default_platform_id'),
  auto_import_steam: integer('auto_import_steam', { mode: 'boolean' }).default(false),
  preferred_rating_system: text('preferred_rating_system', { enum: ['controller', 'stars', 'numeric'] }).default('controller'),
  
  // Notification settings
  email_notifications: integer('email_notifications', { mode: 'boolean' }).default(true),
  push_notifications: integer('push_notifications', { mode: 'boolean' }).default(true),
  friend_requests: integer('friend_requests', { mode: 'boolean' }).default(true),
  game_updates: integer('game_updates', { mode: 'boolean' }).default(true),
  social_activity: integer('social_activity', { mode: 'boolean' }).default(true),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const userStats = sqliteTable('user_stats', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Game statistics
  total_games: integer('total_games').default(0),
  total_playtime: integer('total_playtime').default(0), // in minutes
  games_completed: integer('games_completed').default(0),
  games_playing: integer('games_playing').default(0),
  games_backlog: integer('games_backlog').default(0),
  games_dropped: integer('games_dropped').default(0),
  games_wishlist: integer('games_wishlist').default(0),
  
  // Rating statistics
  average_rating: integer('average_rating').default(0), // stored as integer (rating * 100)
  total_ratings: integer('total_ratings').default(0),
  
  // Social statistics
  followers_count: integer('followers_count').default(0),
  following_count: integer('following_count').default(0),
  
  // Content statistics
  codex_entries: integer('codex_entries').default(0),
  reviews_written: integer('reviews_written').default(0),
  lists_created: integer('lists_created').default(0),
  
  // Gamification
  level: integer('level').default(1),
  experience_points: integer('experience_points').default(0),
  
  // Achievements
  achievements_unlocked: integer('achievements_unlocked').default(0),
  perfect_games: integer('perfect_games').default(0), // 100% completion
  
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});