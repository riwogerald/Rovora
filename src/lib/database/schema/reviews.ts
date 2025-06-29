import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { games, platforms } from './games';
import { gameEntries } from './codex';

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  game_id: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  game_entry_id: text('game_entry_id').references(() => gameEntries.id, { onDelete: 'cascade' }),
  platform_id: text('platform_id').notNull().references(() => platforms.id),
  
  // Review content
  title: text('title').notNull(),
  content: text('content').notNull(),
  summary: text('summary'), // Short summary for previews
  
  // Ratings (1-5 controllers each)
  overall_rating: integer('overall_rating').notNull(),
  gameplay_rating: integer('gameplay_rating'),
  story_rating: integer('story_rating'),
  graphics_rating: integer('graphics_rating'),
  audio_rating: integer('audio_rating'),
  replayability_rating: integer('replayability_rating'),
  
  // Review context
  playtime_hours: integer('playtime_hours'),
  completion_percentage: integer('completion_percentage'),
  difficulty_played: text('difficulty_played'),
  
  // Review flags
  is_recommended: integer('is_recommended', { mode: 'boolean' }),
  contains_spoilers: integer('contains_spoilers', { mode: 'boolean' }).default(false),
  spoiler_level: text('spoiler_level', { enum: ['none', 'minor', 'major', 'ending'] }).default('none'),
  
  // Platform-specific review
  platform_performance: integer('platform_performance'), // 1-5 rating
  platform_notes: text('platform_notes'), // Platform-specific comments
  
  // Review status
  is_published: integer('is_published', { mode: 'boolean' }).default(true),
  is_featured: integer('is_featured', { mode: 'boolean' }).default(false),
  
  // Engagement metrics
  helpful_count: integer('helpful_count').default(0),
  unhelpful_count: integer('unhelpful_count').default(0),
  comments_count: integer('comments_count').default(0),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const reviewVotes = sqliteTable('review_votes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  review_id: text('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  
  // Vote type
  is_helpful: integer('is_helpful', { mode: 'boolean' }).notNull(),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const platformReviews = sqliteTable('platform_reviews', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  game_id: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  platform_id: text('platform_id').notNull().references(() => platforms.id),
  
  // Platform-specific ratings
  performance_rating: integer('performance_rating').notNull(), // 1-5
  controls_rating: integer('controls_rating'), // 1-5
  loading_times_rating: integer('loading_times_rating'), // 1-5
  stability_rating: integer('stability_rating'), // 1-5
  
  // Platform experience
  resolution_played: text('resolution_played'), // e.g., "1080p", "4K", "720p"
  framerate_experience: text('framerate_experience'), // e.g., "60fps", "30fps", "variable"
  input_method: text('input_method'), // e.g., "controller", "keyboard_mouse", "touch"
  
  // Technical notes
  technical_notes: text('technical_notes'),
  bugs_encountered: text('bugs_encountered'), // JSON array
  
  // Recommendations
  recommended_settings: text('recommended_settings'), // JSON object
  would_recommend_platform: integer('would_recommend_platform', { mode: 'boolean' }),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Steam review cache for external data
export const steamReviews = sqliteTable('steam_reviews', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  game_id: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  steam_app_id: text('steam_app_id').notNull(),
  
  // Steam review data
  review_score: integer('review_score'), // Steam review percentage
  review_score_desc: text('review_score_desc'), // e.g., "Very Positive"
  total_positive: integer('total_positive'),
  total_negative: integer('total_negative'),
  total_reviews: integer('total_reviews'),
  
  // Recent reviews
  recent_review_score: integer('recent_review_score'),
  recent_review_score_desc: text('recent_review_score_desc'),
  recent_positive: integer('recent_positive'),
  recent_negative: integer('recent_negative'),
  recent_total: integer('recent_total'),
  
  // Sync metadata
  last_synced: text('last_synced').default(sql`CURRENT_TIMESTAMP`),
  sync_status: text('sync_status', { enum: ['success', 'failed', 'pending'] }).default('pending'),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});