import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { users } from './auth';

export const privacySettings = sqliteTable('privacy_settings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Profile privacy level
  privacy_level: text('privacy_level', { enum: ['public', 'friends', 'private'] }).default('public'),
  
  // Content visibility settings
  show_playtime: integer('show_playtime', { mode: 'boolean' }).default(true),
  show_achievements: integer('show_achievements', { mode: 'boolean' }).default(true),
  show_activity: integer('show_activity', { mode: 'boolean' }).default(true),
  show_wishlist: integer('show_wishlist', { mode: 'boolean' }).default(true),
  show_reviews: integer('show_reviews', { mode: 'boolean' }).default(true),
  show_library: integer('show_library', { mode: 'boolean' }).default(true),
  show_codex: integer('show_codex', { mode: 'boolean' }).default(true),
  show_stats: integer('show_stats', { mode: 'boolean' }).default(true),
  show_gaming_accounts: integer('show_gaming_accounts', { mode: 'boolean' }).default(true),
  
  // Social interaction settings
  allow_friend_requests: integer('allow_friend_requests', { mode: 'boolean' }).default(true),
  show_online_status: integer('show_online_status', { mode: 'boolean' }).default(true),
  
  // Search and indexing
  indexable_profile: integer('indexable_profile', { mode: 'boolean' }).default(true),
  
  // Activity feed privacy
  activity_visibility: text('activity_visibility', { enum: ['public', 'friends', 'private'] }).default('public'),
  
  // Who can see specific activities
  show_game_additions: integer('show_game_additions', { mode: 'boolean' }).default(true),
  show_completions: integer('show_completions', { mode: 'boolean' }).default(true),
  show_ratings: integer('show_ratings', { mode: 'boolean' }).default(true),
  show_codex_entries: integer('show_codex_entries', { mode: 'boolean' }).default(true),
  show_achievements_activity: integer('show_achievements_activity', { mode: 'boolean' }).default(true),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const blockedUsers = sqliteTable('blocked_users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  blocker_id: text('blocker_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  blocked_id: text('blocked_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  reason: text('reason'), // Optional reason for blocking
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const profileViews = sqliteTable('profile_views', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  profile_owner_id: text('profile_owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  viewer_id: text('viewer_id').references(() => users.id, { onDelete: 'cascade' }), // null for anonymous views
  
  // View metadata
  ip_address: text('ip_address'), // For anonymous tracking
  user_agent: text('user_agent'),
  referrer: text('referrer'),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const contentReports = sqliteTable('content_reports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  reporter_id: text('reporter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reported_user_id: text('reported_user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  // What's being reported
  content_type: text('content_type', { 
    enum: ['profile', 'codex_entry', 'review', 'comment', 'activity'] 
  }).notNull(),
  content_id: text('content_id').notNull(),
  
  // Report details
  reason: text('reason', {
    enum: ['spam', 'harassment', 'inappropriate_content', 'copyright', 'other']
  }).notNull(),
  description: text('description'),
  
  // Report status
  status: text('status', { enum: ['pending', 'reviewed', 'resolved', 'dismissed'] }).default('pending'),
  moderator_id: text('moderator_id').references(() => users.id),
  moderator_notes: text('moderator_notes'),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});