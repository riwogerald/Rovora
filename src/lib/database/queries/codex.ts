import { eq, and, desc, asc, like, inArray, count, sql } from 'drizzle-orm';
import { db } from '../connection';
import { 
  codexEntries, codexEntryTags, gameEntries, gameRatings,
  games, users, tags
} from '../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type CodexEntry = InferSelectModel<typeof codexEntries>;
export type CodexEntryInsert = InferInsertModel<typeof codexEntries>;
export type GameRating = InferSelectModel<typeof gameRatings>;

export interface CodexEntryWithDetails extends CodexEntry {
  user: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  game: {
    id: string;
    title: string;
    slug: string;
    cover_image?: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    color?: string;
  }>;
  rating?: GameRating;
}

export interface CodexFilters {
  userId?: string;
  gameId?: string;
  entryType?: string;
  spoilerLevel?: string;
  isPublic?: boolean;
  tags?: string[];
  mood?: string;
  sortBy?: 'created_at' | 'updated_at' | 'likes_count' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export class CodexQueries {
  // Create a new codex entry
  static async createCodexEntry(data: CodexEntryInsert): Promise<CodexEntry> {
    const [entry] = await db
      .insert(codexEntries)
      .values({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .returning();

    return entry;
  }

  // Get codex entry by ID with full details
  static async getCodexEntryById(entryId: string): Promise<CodexEntryWithDetails | null> {
    const entryResult = await db
      .select({
        entry: codexEntries,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        },
        game: {
          id: games.id,
          title: games.title,
          slug: games.slug,
          cover_image: games.cover_image
        }
      })
      .from(codexEntries)
      .innerJoin(users, eq(codexEntries.user_id, users.id))
      .innerJoin(games, eq(codexEntries.game_id, games.id))
      .where(eq(codexEntries.id, entryId))
      .limit(1);

    if (!entryResult[0]) return null;

    const { entry, user, game } = entryResult[0];

    // Get tags
    const tagsResult = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        category: tags.category,
        color: tags.color
      })
      .from(codexEntryTags)
      .innerJoin(tags, eq(codexEntryTags.tag_id, tags.id))
      .where(eq(codexEntryTags.codex_entry_id, entryId));

    // Get rating if entry has game_entry_id
    let rating: GameRating | undefined;
    if (entry.game_entry_id) {
      const ratingResult = await db
        .select()
        .from(gameRatings)
        .where(eq(gameRatings.game_entry_id, entry.game_entry_id))
        .limit(1);
      
      rating = ratingResult[0];
    }

    return {
      ...entry,
      user,
      game,
      tags: tagsResult,
      rating
    };
  }

  // Get codex entries with filters and pagination
  static async getCodexEntries(
    filters: CodexFilters,
    limit = 20,
    offset = 0
  ) {
    let query = db
      .select({
        entry: codexEntries,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        },
        game: {
          id: games.id,
          title: games.title,
          slug: games.slug,
          cover_image: games.cover_image
        }
      })
      .from(codexEntries)
      .innerJoin(users, eq(codexEntries.user_id, users.id))
      .innerJoin(games, eq(codexEntries.game_id, games.id));

    // Apply filters
    const conditions = [];

    if (filters.userId) {
      conditions.push(eq(codexEntries.user_id, filters.userId));
    }

    if (filters.gameId) {
      conditions.push(eq(codexEntries.game_id, filters.gameId));
    }

    if (filters.entryType) {
      conditions.push(eq(codexEntries.entry_type, filters.entryType));
    }

    if (filters.spoilerLevel) {
      conditions.push(eq(codexEntries.spoiler_level, filters.spoilerLevel));
    }

    if (filters.isPublic !== undefined) {
      conditions.push(eq(codexEntries.is_public, filters.isPublic));
    }

    if (filters.mood) {
      conditions.push(eq(codexEntries.mood, filters.mood));
    }

    // Apply WHERE conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(codexEntries[sortBy]));
    } else {
      query = query.orderBy(desc(codexEntries[sortBy]));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    // Get total count for pagination
    let countQuery = db.select({ count: count() }).from(codexEntries);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    
    const totalResult = await countQuery;

    return {
      entries: results.map(({ entry, user, game }) => ({ ...entry, user, game })),
      total: totalResult[0].count,
      hasMore: offset + limit < totalResult[0].count
    };
  }

  // Get user's codex entries by game
  static async getUserCodexForGame(
    userId: string, 
    gameId: string, 
    limit = 20, 
    offset = 0
  ) {
    const results = await db
      .select({
        entry: codexEntries,
        rating: gameRatings
      })
      .from(codexEntries)
      .leftJoin(gameRatings, eq(codexEntries.game_entry_id, gameRatings.game_entry_id))
      .where(
        and(
          eq(codexEntries.user_id, userId),
          eq(codexEntries.game_id, gameId)
        )
      )
      .orderBy(desc(codexEntries.created_at))
      .limit(limit)
      .offset(offset);

    return results.map(({ entry, rating }) => ({ ...entry, rating }));
  }

  // Update codex entry
  static async updateCodexEntry(
    entryId: string, 
    userId: string, 
    updates: Partial<CodexEntryInsert>
  ): Promise<CodexEntry | null> {
    const [updatedEntry] = await db
      .update(codexEntries)
      .set({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .where(
        and(
          eq(codexEntries.id, entryId),
          eq(codexEntries.user_id, userId)
        )
      )
      .returning();

    return updatedEntry || null;
  }

  // Delete codex entry
  static async deleteCodexEntry(entryId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(codexEntries)
      .where(
        and(
          eq(codexEntries.id, entryId),
          eq(codexEntries.user_id, userId)
        )
      );

    return result.changes > 0;
  }

  // Add tags to codex entry
  static async addTagsToEntry(entryId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;

    const values = tagIds.map(tagId => ({
      codex_entry_id: entryId,
      tag_id: tagId,
      created_at: new Date().toISOString()
    }));

    await db.insert(codexEntryTags).values(values);
  }

  // Remove tags from codex entry
  static async removeTagsFromEntry(entryId: string, tagIds?: string[]): Promise<void> {
    let deleteQuery = db
      .delete(codexEntryTags)
      .where(eq(codexEntryTags.codex_entry_id, entryId));

    if (tagIds && tagIds.length > 0) {
      deleteQuery = deleteQuery.where(inArray(codexEntryTags.tag_id, tagIds));
    }

    await deleteQuery;
  }

  // Create or update game rating
  static async upsertGameRating(
    gameEntryId: string, 
    ratingData: Omit<InferInsertModel<typeof gameRatings>, 'id' | 'game_entry_id' | 'created_at' | 'updated_at'>
  ): Promise<GameRating> {
    // Check if rating exists
    const existingRating = await db
      .select()
      .from(gameRatings)
      .where(eq(gameRatings.game_entry_id, gameEntryId))
      .limit(1);

    if (existingRating[0]) {
      // Update existing rating
      const [updatedRating] = await db
        .update(gameRatings)
        .set({
          ...ratingData,
          updated_at: new Date().toISOString()
        })
        .where(eq(gameRatings.game_entry_id, gameEntryId))
        .returning();

      return updatedRating;
    } else {
      // Create new rating
      const [newRating] = await db
        .insert(gameRatings)
        .values({
          game_entry_id: gameEntryId,
          ...ratingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .returning();

      return newRating;
    }
  }

  // Get featured codex entries
  static async getFeaturedEntries(limit = 10) {
    return await db
      .select({
        entry: codexEntries,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        },
        game: {
          id: games.id,
          title: games.title,
          slug: games.slug,
          cover_image: games.cover_image
        }
      })
      .from(codexEntries)
      .innerJoin(users, eq(codexEntries.user_id, users.id))
      .innerJoin(games, eq(codexEntries.game_id, games.id))
      .where(
        and(
          eq(codexEntries.is_featured, true),
          eq(codexEntries.is_public, true)
        )
      )
      .orderBy(desc(codexEntries.likes_count), desc(codexEntries.created_at))
      .limit(limit);
  }

  // Get popular codex entries
  static async getPopularEntries(timeframe: 'day' | 'week' | 'month' = 'week', limit = 20) {
    let dateFilter = sql`datetime('now', '-7 days')`;
    
    if (timeframe === 'day') {
      dateFilter = sql`datetime('now', '-1 day')`;
    } else if (timeframe === 'month') {
      dateFilter = sql`datetime('now', '-30 days')`;
    }

    return await db
      .select({
        entry: codexEntries,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        },
        game: {
          id: games.id,
          title: games.title,
          slug: games.slug,
          cover_image: games.cover_image
        }
      })
      .from(codexEntries)
      .innerJoin(users, eq(codexEntries.user_id, users.id))
      .innerJoin(games, eq(codexEntries.game_id, games.id))
      .where(
        and(
          eq(codexEntries.is_public, true),
          sql`${codexEntries.created_at} >= ${dateFilter}`
        )
      )
      .orderBy(desc(codexEntries.likes_count), desc(codexEntries.comments_count))
      .limit(limit);
  }

  // Search codex entries
  static async searchCodexEntries(
    query: string,
    filters: Partial<CodexFilters> = {},
    limit = 20,
    offset = 0
  ) {
    let searchQuery = db
      .select({
        entry: codexEntries,
        user: {
          id: users.id,
          username: users.username,
          display_name: users.display_name,
          avatar_url: users.avatar_url
        },
        game: {
          id: games.id,
          title: games.title,
          slug: games.slug,
          cover_image: games.cover_image
        }
      })
      .from(codexEntries)
      .innerJoin(users, eq(codexEntries.user_id, users.id))
      .innerJoin(games, eq(codexEntries.game_id, games.id));

    const conditions = [
      eq(codexEntries.is_public, true),
      sql`(${codexEntries.title} LIKE ${'%' + query + '%'} OR ${codexEntries.content} LIKE ${'%' + query + '%'})`
    ];

    // Apply additional filters
    if (filters.entryType) {
      conditions.push(eq(codexEntries.entry_type, filters.entryType));
    }

    if (filters.gameId) {
      conditions.push(eq(codexEntries.game_id, filters.gameId));
    }

    searchQuery = searchQuery.where(and(...conditions));

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    
    if (sortOrder === 'asc') {
      searchQuery = searchQuery.orderBy(asc(codexEntries[sortBy]));
    } else {
      searchQuery = searchQuery.orderBy(desc(codexEntries[sortBy]));
    }

    const results = await searchQuery.limit(limit).offset(offset);

    return {
      entries: results.map(({ entry, user, game }) => ({ ...entry, user, game })),
      total: results.length, // TODO: Implement proper count query
      hasMore: results.length === limit
    };
  }
}
