import { dev } from '$app/environment';
import type { Game, Platform, Genre, Tag } from '$lib/types/core';

interface SteamAppDetails {
  type: string;
  name: string;
  steam_appid: number;
  required_age: number;
  is_free: boolean;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  supported_languages: string;
  header_image: string;
  website?: string;
  pc_requirements: any;
  mac_requirements: any;
  linux_requirements: any;
  developers: string[];
  publishers: string[];
  price_overview?: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
  };
  packages: number[];
  package_groups: any[];
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  metacritic?: {
    score: number;
    url: string;
  };
  categories: Array<{
    id: number;
    description: string;
  }>;
  genres: Array<{
    id: string;
    description: string;
  }>;
  screenshots: Array<{
    id: number;
    path_thumbnail: string;
    path_full: string;
  }>;
  movies?: Array<{
    id: number;
    name: string;
    thumbnail: string;
    webm: {
      '480': string;
      max: string;
    };
    mp4: {
      '480': string;
      max: string;
    };
    highlight: boolean;
  }>;
  release_date: {
    coming_soon: boolean;
    date: string;
  };
}

interface SteamApiResponse {
  [appId: string]: {
    success: boolean;
    data?: SteamAppDetails;
  };
}

export class GameDataService {
  private static readonly STEAM_API_BASE = 'https://store.steampowered.com/api';
  private static readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests
  
  private static lastRequestTime = 0;

  /**
   * Fetch game details from Steam API
   */
  static async fetchSteamGameDetails(appId: string): Promise<Partial<Game> | null> {
    try {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
        await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest));
      }
      this.lastRequestTime = Date.now();

      const response = await fetch(
        `${this.STEAM_API_BASE}/appdetails?appids=${appId}&cc=us&l=en`,
        {
          headers: {
            'User-Agent': 'Rovora Game Catalog (https://rovora.com)'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Steam API responded with ${response.status}`);
      }

      const data: SteamApiResponse = await response.json();
      const gameData = data[appId];

      if (!gameData?.success || !gameData.data) {
        return null;
      }

      const steam = gameData.data;

      // Convert Steam data to our Game format
      const game: Partial<Game> = {
        title: steam.name,
        slug: this.generateSlug(steam.name),
        description: steam.detailed_description?.replace(/<[^>]*>/g, ''), // Strip HTML
        steam_app_id: appId,
        developer: steam.developers?.[0],
        publisher: steam.publishers?.[0],
        cover_image: steam.header_image,
        screenshots: steam.screenshots?.map(s => s.path_full) || [],
        metacritic_score: steam.metacritic?.score,
        release_date: steam.release_date?.date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return game;

    } catch (error) {
      console.error('Error fetching Steam game details:', error);
      return null;
    }
  }

  /**
   * Search for games on Steam
   */
  static async searchSteamGames(query: string, limit = 20): Promise<Array<{ appid: number; name: string; }>> {
    try {
      // Steam doesn't have a public search API, so we'll use the store search
      // This is a simplified approach - in production you'd want to use a proper API
      const response = await fetch(
        `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(query)}`,
        {
          headers: {
            'User-Agent': 'Rovora Game Catalog (https://rovora.com)'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Steam search failed with ${response.status}`);
      }

      const results = await response.json();
      
      return results.slice(0, limit).map((item: any) => ({
        appid: parseInt(item.appid),
        name: item.name
      }));

    } catch (error) {
      console.error('Error searching Steam games:', error);
      return [];
    }
  }

  /**
   * Fetch popular/featured games from Steam
   */
  static async fetchPopularSteamGames(limit = 50): Promise<Array<{ appid: number; name: string; }>> {
    try {
      // Use Steam's featured games endpoint
      const response = await fetch('https://store.steampowered.com/api/featured/', {
        headers: {
          'User-Agent': 'Rovora Game Catalog (https://rovora.com)'
        }
      });

      if (!response.ok) {
        throw new Error(`Steam featured API failed with ${response.status}`);
      }

      const data = await response.json();
      const games = [];

      // Extract games from featured categories
      if (data.featured_win) {
        games.push(...data.featured_win.slice(0, 10));
      }
      
      if (data.specials?.items) {
        games.push(...data.specials.items.slice(0, 20));
      }

      if (data.coming_soon?.items) {
        games.push(...data.coming_soon.items.slice(0, 10));
      }

      if (data.top_sellers?.items) {
        games.push(...data.top_sellers.items.slice(0, 10));
      }

      return games.slice(0, limit).map((item: any) => ({
        appid: item.id || item.appid,
        name: item.name
      }));

    } catch (error) {
      console.error('Error fetching popular Steam games:', error);
      return [];
    }
  }

  /**
   * Generate a URL-friendly slug from a game title
   */
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  /**
   * Map Steam genres to our genre system
   */
  private static mapSteamGenres(steamGenres: Array<{ id: string; description: string }>): Genre[] {
    const genreMap: Record<string, Partial<Genre>> = {
      '1': { name: 'Action', slug: 'action', color: '#FF6B6B' },
      '2': { name: 'Strategy', slug: 'strategy', color: '#4ECDC4' },
      '3': { name: 'RPG', slug: 'rpg', color: '#45B7D1' },
      '4': { name: 'Simulation', slug: 'simulation', color: '#96CEB4' },
      '5': { name: 'Sports', slug: 'sports', color: '#FFEAA7' },
      '6': { name: 'Racing', slug: 'racing', color: '#DDA0DD' },
      '9': { name: 'Adventure', slug: 'adventure', color: '#98D8C8' },
      '23': { name: 'Indie', slug: 'indie', color: '#F7DC6F' },
      '28': { name: 'Shooter', slug: 'shooter', color: '#EC7063' },
      '29': { name: 'Puzzle', slug: 'puzzle', color: '#BB8FCE' }
    };

    return steamGenres
      .map(steamGenre => {
        const mapped = genreMap[steamGenre.id];
        if (mapped) {
          return {
            id: `genre_${steamGenre.id}`,
            name: mapped.name!,
            slug: mapped.slug!,
            color: mapped.color
          } as Genre;
        }
        return {
          id: `genre_${steamGenre.id}`,
          name: steamGenre.description,
          slug: this.generateSlug(steamGenre.description),
          color: '#95A5A6'
        } as Genre;
      });
  }

  /**
   * Get default platforms based on Steam platform data
   */
  private static getSteamPlatforms(platformData: { windows: boolean; mac: boolean; linux: boolean }): Platform[] {
    const platforms: Platform[] = [];

    if (platformData.windows) {
      platforms.push({
        id: 'steam-windows',
        name: 'Steam (Windows)',
        slug: 'steam-windows',
        short_name: 'Steam PC',
        icon: 'i-mdi-steam',
        color: '#1b2838',
        category: 'pc'
      });
    }

    if (platformData.mac) {
      platforms.push({
        id: 'steam-mac',
        name: 'Steam (macOS)',
        slug: 'steam-mac',
        short_name: 'Steam Mac',
        icon: 'i-mdi-steam',
        color: '#1b2838',
        category: 'pc'
      });
    }

    if (platformData.linux) {
      platforms.push({
        id: 'steam-linux',
        name: 'Steam (Linux)',
        slug: 'steam-linux',
        short_name: 'Steam Linux',
        icon: 'i-mdi-steam',
        color: '#1b2838',
        category: 'pc'
      });
    }

    return platforms;
  }

  /**
   * Import a batch of games from external sources
   */
  static async importGamesFromSteam(appIds: string[]): Promise<Partial<Game>[]> {
    const games: Partial<Game>[] = [];
    
    if (dev) {
      console.log(`Importing ${appIds.length} games from Steam...`);
    }

    for (const appId of appIds) {
      try {
        const gameData = await this.fetchSteamGameDetails(appId);
        if (gameData) {
          games.push(gameData);
        }
        
        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY));
        
      } catch (error) {
        console.error(`Failed to import Steam game ${appId}:`, error);
      }
    }

    if (dev) {
      console.log(`Successfully imported ${games.length} games from Steam`);
    }

    return games;
  }

  /**
   * Validate and clean game data before saving to database
   */
  static validateGameData(gameData: Partial<Game>): boolean {
    if (!gameData.title || !gameData.slug) {
      return false;
    }

    // Ensure required fields have reasonable values
    if (gameData.title.length > 200) {
      gameData.title = gameData.title.substring(0, 200);
    }

    if (gameData.description && gameData.description.length > 5000) {
      gameData.description = gameData.description.substring(0, 5000) + '...';
    }

    return true;
  }
}
