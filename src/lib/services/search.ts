import { db } from '$lib/database/connection';
import { games, users, codexEntries, gameEntries } from '$lib/database/schema';
import { sql, like, or, and, eq, desc, asc } from 'drizzle-orm';
import type { Database } from '$lib/database/connection';

export interface SearchFilters {
  query?: string;
  category?: 'all' | 'games' | 'users' | 'entries';
  gameGenres?: string[];
  platforms?: string[];
  playStatus?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  rating?: {
    min: number;
    max: number;
  };
  sortBy?: 'relevance' | 'title' | 'date' | 'rating' | 'popularity';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  type: 'game' | 'user' | 'entry';
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  metadata: Record<string, any>;
  relevanceScore: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  facets: {
    genres: Array<{ name: string; count: number }>;
    platforms: Array<{ name: string; count: number }>;
    statuses: Array<{ name: string; count: number }>;
  };
  suggestions: string[];
}

export class SearchService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  async search(filters: SearchFilters): Promise<SearchResponse> {
    const {
      query = '',
      category = 'all',
      limit = 20,
      offset = 0,
      sortBy = 'relevance',
      sortDirection = 'desc'
    } = filters;

    const results: SearchResult[] = [];
    let totalCount = 0;

    // Search games
    if (category === 'all' || category === 'games') {
      const gameResults = await this.searchGames(query, filters);
      results.push(...gameResults.results);
      totalCount += gameResults.totalCount;
    }

    // Search users
    if (category === 'all' || category === 'users') {
      const userResults = await this.searchUsers(query, filters);
      results.push(...userResults.results);
      totalCount += userResults.totalCount;
    }

    // Search codex entries
    if (category === 'all' || category === 'entries') {
      const entryResults = await this.searchEntries(query, filters);
      results.push(...entryResults.results);
      totalCount += entryResults.totalCount;
    }

    // Sort results by relevance or other criteria
    const sortedResults = this.sortResults(results, sortBy, sortDirection);
    
    // Apply pagination
    const paginatedResults = sortedResults.slice(offset, offset + limit);

    // Get facets for filtering
    const facets = await this.getFacets(query, filters);

    // Get search suggestions
    const suggestions = await this.getSuggestions(query);

    return {
      results: paginatedResults,
      totalCount,
      facets,
      suggestions
    };
  }

  private async searchGames(query: string, filters: SearchFilters) {
    const conditions = [];
    
    if (query) {
      conditions.push(
        or(
          like(games.title, `%${query}%`),
          like(games.description, `%${query}%`),
          like(games.developer, `%${query}%`),
          like(games.publisher, `%${query}%`)
        )
      );
    }

    // Genre filtering would require a join with gameGenres table
    // if (filters.gameGenres?.length) {
    //   // Would need to join with game_genres and genres tables
    // }

    if (filters.rating) {
      conditions.push(
        and(
          sql`${games.metacritic_score} >= ${filters.rating.min * 10}`,
          sql`${games.metacritic_score} <= ${filters.rating.max * 10}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const gameResults = await this.db
      .select({
        id: games.id,
        title: games.title,
        description: games.description,
        cover_image: games.cover_image,
        developer: games.developer,
        publisher: games.publisher,
        release_date: games.release_date,
        metacritic_score: games.metacritic_score
      })
      .from(games)
      .where(whereClause)
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    const results: SearchResult[] = gameResults.map(game => ({
      type: 'game' as const,
      id: game.id,
      title: game.title,
      description: game.description || undefined,
      imageUrl: game.cover_image || undefined,
      metadata: {
        developer: game.developer,
        publisher: game.publisher,
        releaseDate: game.release_date,
        score: game.metacritic_score
      },
      relevanceScore: this.calculateRelevance(query, game.title, game.description || '')
    }));

    return {
      results,
      totalCount: gameResults.length
    };
  }

  private async searchUsers(query: string, filters: SearchFilters) {
    const conditions = [];
    
    if (query) {
      conditions.push(
        or(
          like(users.username, `%${query}%`),
          like(users.display_name, `%${query}%`),
          like(users.bio, `%${query}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const userResults = await this.db
      .select({
        id: users.id,
        username: users.username,
        display_name: users.display_name,
        bio: users.bio,
        avatar_url: users.avatar_url,
        is_verified: users.is_verified,
        created_at: users.created_at
      })
      .from(users)
      .where(whereClause)
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    const results: SearchResult[] = userResults.map(user => ({
      type: 'user' as const,
      id: user.id,
      title: user.display_name || user.username,
      description: user.bio || undefined,
      imageUrl: user.avatar_url || undefined,
      metadata: {
        username: user.username,
        displayName: user.display_name,
        isVerified: user.is_verified,
        joinDate: user.created_at
      },
      relevanceScore: this.calculateRelevance(
        query, 
        user.display_name || user.username, 
        user.bio || ''
      )
    }));

    return {
      results,
      totalCount: userResults.length
    };
  }

  private async searchEntries(query: string, filters: SearchFilters) {
    const conditions = [];
    
    if (query) {
      conditions.push(
        or(
          like(codexEntries.title, `%${query}%`),
          like(codexEntries.content, `%${query}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const entryResults = await this.db
      .select({
        id: codexEntries.id,
        title: codexEntries.title,
        content: codexEntries.content,
        entry_type: codexEntries.entry_type,
        game_id: codexEntries.game_id,
        user_id: codexEntries.user_id,
        created_at: codexEntries.created_at,
        // Join with game and user data
        game: {
          title: games.title,
          cover_image: games.cover_image
        },
        user: {
          username: users.username,
          display_name: users.display_name
        }
      })
      .from(codexEntries)
      .leftJoin(games, eq(codexEntries.game_id, games.id))
      .leftJoin(users, eq(codexEntries.user_id, users.id))
      .where(whereClause)
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    const results: SearchResult[] = entryResults.map(entry => ({
      type: 'entry' as const,
      id: entry.id,
      title: entry.title,
      description: entry.content?.substring(0, 200) + '...',
      imageUrl: entry.game?.cover_image || undefined,
      metadata: {
        entryType: entry.entry_type,
        gameId: entry.game_id,
        gameName: entry.game?.title,
        author: entry.user?.display_name || entry.user?.username,
        createdAt: entry.created_at
      },
      relevanceScore: this.calculateRelevance(query, entry.title, entry.content || '')
    }));

    return {
      results,
      totalCount: entryResults.length
    };
  }

  private calculateRelevance(query: string, title: string, content: string): number {
    if (!query) return 1;
    
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    let score = 0;
    
    // Exact title match gets highest score
    if (titleLower === queryLower) score += 100;
    // Title starts with query
    else if (titleLower.startsWith(queryLower)) score += 80;
    // Title contains query
    else if (titleLower.includes(queryLower)) score += 60;
    
    // Content contains query
    if (contentLower.includes(queryLower)) score += 20;
    
    // Boost for shorter titles (more specific)
    if (title.length < 50) score += 10;
    
    return score;
  }

  private sortResults(results: SearchResult[], sortBy: string, direction: string): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          const aDate = new Date(a.metadata.createdAt || a.metadata.releaseDate || 0);
          const bDate = new Date(b.metadata.createdAt || b.metadata.releaseDate || 0);  
          comparison = aDate.getTime() - bDate.getTime();
          break;
        case 'rating':
          comparison = (a.metadata.score || 0) - (b.metadata.score || 0);
          break;
        case 'relevance':
        default:
          comparison = b.relevanceScore - a.relevanceScore;
          break;
      }
      
      return direction === 'desc' ? -comparison : comparison;
    });
  }

  private async getFacets(query: string, filters: SearchFilters) {
    // This would typically involve complex aggregation queries
    // For now, return placeholder data
    return {
      genres: [
        { name: 'Action', count: 150 },
        { name: 'RPG', count: 120 },
        { name: 'Strategy', count: 80 }
      ],
      platforms: [
        { name: 'PC', count: 200 },
        { name: 'PlayStation', count: 180 },
        { name: 'Xbox', count: 160 }
      ],
      statuses: [
        { name: 'Playing', count: 45 },
        { name: 'Completed', count: 30 },
        { name: 'Wishlist', count: 25 }
      ]
    };
  }

  private async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];
    
    // Get popular game titles that match the query
    const gameMatches = await this.db
      .select({ title: games.title })
      .from(games)
      .where(like(games.title, `%${query}%`))  
      .limit(5);
    
    return gameMatches.map(g => g.title);
  }

  async getPopularSearches(): Promise<string[]> {
    // This would typically be stored in a separate table tracking search queries
    return [
      'The Witcher 3',
      'Cyberpunk 2077', 
      'Elden Ring',
      'God of War',
      'Spider-Man'
    ];
  }

  async autocomplete(query: string, limit = 10): Promise<Array<{
    text: string;
    type: 'game' | 'user' | 'suggestion';
    metadata?: any;
  }>> {
    if (!query || query.length < 2) return [];
    
    const results = [];
    
    // Game suggestions
    const gameMatches = await this.db
      .select({ 
        title: games.title,
        id: games.id,
        cover_image: games.cover_image 
      })
      .from(games)
      .where(like(games.title, `%${query}%`))
      .limit(5);
    
    results.push(...gameMatches.map(game => ({
      text: game.title,
      type: 'game' as const,
      metadata: { id: game.id, image: game.cover_image }
    })));
    
    // User suggestions  
    const userMatches = await this.db
      .select({ 
        username: users.username,
        display_name: users.display_name,
        avatar_url: users.avatar_url 
      })
      .from(users)
      .where(
        or(
          like(users.username, `%${query}%`),
          like(users.display_name, `%${query}%`)
        )
      )
      .limit(3);
    
    results.push(...userMatches.map(user => ({
      text: user.display_name || user.username,
      type: 'user' as const,
      metadata: { username: user.username, avatar: user.avatar_url }
    })));
    
    return results.slice(0, limit);
  }
}
