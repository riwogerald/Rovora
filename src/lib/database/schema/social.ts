import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { games } from './games';
import { codexEntries, gameEntries } from './codex';

export const follows = sqliteTable('follows', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  follower_id: text('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  following_id: text('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Follow type
  follow_type: text('follow_type', { enum: ['follow', 'close_friend', 'blocked'] }).default('follow'),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const activities = sqliteTable('activities', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Activity details
  type: text('type', { 
    enum: [
      'game_added', 'game_completed', 'game_rated', 'game_started',
      'codex_entry_created', 'achievement_unlocked', 'milestone_reached',
      'user_followed', 'list_created', 'list_updated', 'review_posted'
    ] 
  }).notNull(),
  
  // Related entities
  game_id: text('game_id').references(() => games.id, { onDelete: 'cascade' }),
  game_entry_id: text('game_entry_id').references(() => gameEntries.id, { onDelete: 'cascade' }),
  codex_entry_id: text('codex_entry_id').references(() => codexEntries.id, { onDelete: 'cascade' }),
  target_user_id: text('target_user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  // Activity data (JSON)
  data: text('data'), // Additional context data
  
  // Visibility
  is_public: integer('is_public', { mode: 'boolean' }).default(true),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const likes = sqliteTable('likes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Likeable entities
  codex_entry_id: text('codex_entry_id').references(() => codexEntries.id, { onDelete: 'cascade' }),
  comment_id: text('comment_id'), // Will reference comments table
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Commentable entities
  codex_entry_id: text('codex_entry_id').references(() => codexEntries.id, { onDelete: 'cascade' }),
  parent_comment_id: text('parent_comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  
  // Comment content
  content: text('content').notNull(),
  is_edited: integer('is_edited', { mode: 'boolean' }).default(false),
  
  // Engagement
  likes_count: integer('likes_count').default(0),
  replies_count: integer('replies_count').default(0),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const gameLists = sqliteTable('game_lists', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // List details
  title: text('title').notNull(),
  description: text('description'),
  cover_image: text('cover_image'),
  
  // List settings
  is_public: integer('is_public', { mode: 'boolean' }).default(true),
  is_collaborative: integer('is_collaborative', { mode: 'boolean' }).default(false),
  is_ranked: integer('is_ranked', { mode: 'boolean' }).default(false),
  
  // Content filtering
  nsfw_filter: text('nsfw_filter', { enum: ['none', 'mild', 'strict'] }).default('none'),
  
  // Engagement
  likes_count: integer('likes_count').default(0),
  followers_count: integer('followers_count').default(0),
  games_count: integer('games_count').default(0),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const gameListEntries = sqliteTable('game_list_entries', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  list_id: text('list_id').notNull().references(() => gameLists.id, { onDelete: 'cascade' }),
  game_id: text('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  added_by_user_id: text('added_by_user_id').notNull().references(() => users.id),
  
  // List entry details
  position: integer('position'), // For ranked lists
  notes: text('notes'),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const listFollows = sqliteTable('list_follows', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  list_id: text('list_id').notNull().references(() => gameLists.id, { onDelete: 'cascade' }),
  
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});