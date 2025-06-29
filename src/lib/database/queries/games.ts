import { eq, and, desc, asc, like, inArray, count, sql } from 'drizzle-orm';
import { db } from '../connection';
import { 
  games, platforms, genres, tags,
  gamePlatforms, gameGenres, gameTags,
  gameEntries, gameRatings
} from '../schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type Game = InferSelectModel<typeof games>;
export type Platform = InferSelectModel<typeof platforms>;
export type Genre = InferSelectModel<typeof genres>;
export type Tag = InferSelectModel<typeof tags>;
export type GameEntry = InferSelectModel<typeof gameEntries>;

export interface GameWithDetails extends Game {
  platforms: Platform[];
  genres: Genre[];
  tags: Tag[];
}

export interface SearchFilters {
  query?: string;
  genres?: string[];
  platforms?: string[];
  tags?: string[];
  releaseYear?: number;
  metacriticMin?: number;
  metacriticMax?: number;
  sortBy?: 'title' | 'release_date' | 'metacritic_score' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export class GameQueries {
  // Get game by ID with all related data
  static async getGameById(gameId: string): Promise<GameWithDetails | null> {
    const gameResult = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (!gameResult[0]) return null;

    const game = gameResult[0];

    // Get platforms
    const platformsResult = await db
      .select({ platform: platforms })
      .from(gamePlatforms)
      .innerJoin(platforms, eq(gamePlatforms.platform_id, platforms.id))
      .where(eq(gamePlatforms.game_id, gameId));

    // Get genres
    const genresResult = await db
      .select({ genre: genres })
      .from(gameGenres)
      .innerJoin(genres, eq(gameGenres.genre_id, genres.id))
      .where(eq(gameGenres.game_id, gameId));

    // Get tags
    const tagsResult = await db
      .select({ tag: tags })
      .from(gameTags)
      .innerJoin(tags, eq(gameTags.tag_id, tags.id))
      .where(eq(gameTags.game_id, gameId));

    return {
      ...game,
      platforms: platformsResult.map(r => r.platform),
      genres: genresResult.map(r => r.genre),
      tags: tagsResult.map(r => r.tag)
    };
  }

  // Get game by slug
  static async getGameBySlug(slug: string): Promise<GameWithDetails | null> {
    const gameResult = await db
      .select()
      .from(games)
      .where(eq(games.slug, slug))
      .limit(1);

    if (!gameResult[0]) return null;

    return this.getGameById(gameResult[0].id);
  }

  // Search games with filters
  static async searchGames(filters: SearchFilters, limit = 20, offset = 0) {
    let query = db.select().from(games);

    // Apply filters
    const conditions = [];

    if (filters.query) {
      conditions.push(like(games.title, `%${filters.query}%`));
    }

    if (filters.releaseYear) {
      conditions.push(like(games.release_date, `${filters.releaseYear}%`));
    }

    if (filters.metacriticMin) {
      conditions.push(sql`${games.metacritic_score} >= ${filters.metacriticMin}`);
    }

    if (filters.metacriticMax) {
      conditions.push(sql`${games.metacritic_score} <= ${filters.metacriticMax}`);
    }

    // Apply WHERE conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(games[sortBy]));
    } else {
      query = query.orderBy(desc(games[sortBy]));
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(games)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      games: results,
      total: totalResult[0].count,
      hasMore: offset + limit < totalResult[0].count
    };
  }

  // Get user's game library
  static async getUserGameLibrary(userId: string, status?: string, limit = 20, offset = 0) {
    let query = db
      .select({
        gameEntry: gameEntries,
        game: games,
        platform: platforms,
        rating: gameRatings
      })
      .from(gameEntries)
      .innerJoin(games, eq(gameEntries.game_id, games.id))
      .innerJoin(platforms, eq(gameEntries.platform_id, platforms.id))
      .leftJoin(gameRatings, eq(gameEntries.id, gameRatings.game_entry_id))
      .where(eq(gameEntries.user_id, userId));

    if (status) {
      query = query.where(
        and(
          eq(gameEntries.user_id, userId),
          eq(gameEntries.status, status)
        )
      );
    }

    return await query
      .orderBy(desc(gameEntries.updated_at))
      .limit(limit)
      .offset(offset);
  }

  // Add game to user's library
  static async addGameToLibrary(
    userId: string, 
    gameId: string, 
    platformId: string, 
    status: string = 'backlog'
  ) {
    return await db.transaction(async (tx) => {
      // Check if entry already exists
      const existing = await tx
        .select()
        .from(gameEntries)
        .where(
          and(
            eq(gameEntries.user_id, userId),
            eq(gameEntries.game_id, gameId),
            eq(gameEntries.platform_id, platformId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new Error('Game already in library for this platform');
      }

      // Insert new game entry
      const [gameEntry] = await tx
        .insert(gameEntries)
        .values({
          user_id: userId,
          game_id: gameId,
          platform_id: platformId,
          status
        })
        .returning();

      // Update user stats
      await tx
        .update(userStats)
        .set({
          total_games: sql`${userStats.total_games} + 1`,
          [`games_${status}`]: sql`games_${status} + 1`
        })
        .where(eq(userStats.user_id, userId));

      return gameEntry;
    });
  }

  // Update game entry status
  static async updateGameEntryStatus(entryId: string, status: string, userId: string) {
    return await db.transaction(async (tx) => {
      // Get current entry
      const [currentEntry] = await tx
        .select()
        .from(gameEntries)
        .where(
          and(
            eq(gameEntries.id, entryId),
            eq(gameEntries.user_id, userId)
          )
        )
        .limit(1);

      if (!currentEntry) {
        throw new Error('Game entry not found');
      }

      // Update entry
      const [updatedEntry] = await tx
        .update(gameEntries)
        .set({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'completed' && !currentEntry.completed_date ? 
            { completed_date: new Date().toISOString() } : {}),
          ...(status === 'playing' && !currentEntry.started_date ? 
            { started_date: new Date().toISOString() } : {})
        })
        .where(eq(gameEntries.id, entryId))
        .returning();

      // Update user stats (decrement old status, increment new status)
      if (currentEntry.status !== status) {
        await tx
          .update(userStats)
          .set({
            [`games_${currentEntry.status}`]: sql`games_${currentEntry.status} - 1`,
            [`games_${status}`]: sql`games_${status} + 1`,
            ...(status === 'completed' ? { games_completed: sql`games_completed + 1` } : {})
          })
          .where(eq(userStats.user_id, userId));
      }

      return updatedEntry;
    });
  }

  // Get all platforms
  static async getAllPlatforms() {
    return await db
      .select()
      .from(platforms)
      .where(eq(platforms.is_active, true))
      .orderBy(asc(platforms.name));
  }

  // Get all genres
  static async getAllGenres() {
    return await db
      .select()
      .from(genres)
      .orderBy(asc(genres.name));
  }

  // Get all tags by category
  static async getTagsByCategory(category?: string) {
    let query = db.select().from(tags);
    
    if (category) {
      query = query.where(eq(tags.category, category));
    }
    
    return await query.orderBy(desc(tags.usage_count), asc(tags.name));
  }

  // Get popular games (most added to libraries)
  static async getPopularGames(limit = 20) {
    return await db
      .select({
        game: games,
        entryCount: count(gameEntries.id)
      })
      .from(games)
      .leftJoin(gameEntries, eq(games.id, gameEntries.game_id))
      .groupBy(games.id)
      .orderBy(desc(count(gameEntries.id)))
      .limit(limit);
  }

  // Get recently added games
  static async getRecentGames(limit = 20) {
    return await db
      .select()
      .from(games)
      .orderBy(desc(games.created_at))
      .limit(limit);
  }
}