import { API_BASE_URL, API_KEY } from '$lib/utils/constants';
import type { GameFilters, GameSearchResult, Game } from '$lib/types/game';
import type { Genre, Platform, Developer, Publisher } from '$lib/types/game';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    url.searchParams.set('key', this.apiKey);

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new APIError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    return response.json();
  }

  // Games API
  async getGames(filters: GameFilters = {}): Promise<GameSearchResult> {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.genres?.length) params.set('genres', filters.genres.join(','));
    if (filters.platforms?.length) params.set('platforms', filters.platforms.join(','));
    if (filters.tags?.length) params.set('tags', filters.tags.join(','));
    if (filters.developers?.length) params.set('developers', filters.developers.join(','));
    if (filters.publishers?.length) params.set('publishers', filters.publishers.join(','));
    if (filters.rating_min) params.set('rating_min', filters.rating_min.toString());
    if (filters.rating_max) params.set('rating_max', filters.rating_max.toString());
    if (filters.metacritic_min) params.set('metacritic_min', filters.metacritic_min.toString());
    if (filters.metacritic_max) params.set('metacritic_max', filters.metacritic_max.toString());
    if (filters.released_min) params.set('dates', `${filters.released_min},${filters.released_max || ''}`);
    if (filters.ordering) params.set('ordering', filters.ordering);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.page_size) params.set('page_size', filters.page_size.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/games?${queryString}` : '/games';
    
    return this.request<GameSearchResult>(endpoint);
  }

  async getGame(id: string): Promise<Game> {
    return this.request<Game>(`/games/${id}`);
  }

  async getGameScreenshots(id: string): Promise<{ results: Array<{ id: number; image: string }> }> {
    return this.request(`/games/${id}/screenshots`);
  }

  async getTrendingGames(): Promise<GameSearchResult> {
    return this.request<GameSearchResult>('/games?ordering=-added&page_size=20');
  }

  async getFeaturedGames(): Promise<GameSearchResult> {
    return this.request<GameSearchResult>('/games?metacritic=80,100&ordering=-rating&page_size=20');
  }

  // Metadata API
  async getGenres(): Promise<{ results: Genre[] }> {
    return this.request<{ results: Genre[] }>('/genres');
  }

  async getPlatforms(): Promise<{ results: Platform[] }> {
    return this.request<{ results: Platform[] }>('/platforms');
  }

  async getDevelopers(): Promise<{ results: Developer[] }> {
    return this.request<{ results: Developer[] }>('/developers');
  }

  async getPublishers(): Promise<{ results: Publisher[] }> {
    return this.request<{ results: Publisher[] }>('/publishers');
  }

  // Search suggestions
  async getSearchSuggestions(query: string): Promise<GameSearchResult> {
    return this.request<GameSearchResult>(`/games?search=${encodeURIComponent(query)}&page_size=5`);
  }
}

// Create singleton instance
export const apiClient = new APIClient(API_BASE_URL, API_KEY);

// Convenience functions
export const gamesAPI = {
  getGames: (filters?: GameFilters) => apiClient.getGames(filters),
  getGame: (id: string) => apiClient.getGame(id),
  getGameScreenshots: (id: string) => apiClient.getGameScreenshots(id),
  getTrending: () => apiClient.getTrendingGames(),
  getFeatured: () => apiClient.getFeaturedGames(),
  searchSuggestions: (query: string) => apiClient.getSearchSuggestions(query)
};

export const metadataAPI = {
  getGenres: () => apiClient.getGenres(),
  getPlatforms: () => apiClient.getPlatforms(),
  getDevelopers: () => apiClient.getDevelopers(),
  getPublishers: () => apiClient.getPublishers()
};