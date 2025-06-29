import { writable, derived } from 'svelte/store';
import type { Game, GameEntry, SearchFilters, PaginatedResponse } from '$lib/types/core';

interface GamesState {
  games: Game[];
  userGames: GameEntry[];
  currentGame: Game | null;
  searchResults: PaginatedResponse<Game> | null;
  filters: SearchFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: GamesState = {
  games: [],
  userGames: [],
  currentGame: null,
  searchResults: null,
  filters: {
    sort_by: 'title',
    sort_order: 'asc'
  },
  isLoading: false,
  error: null
};

function createGamesStore() {
  const { subscribe, set, update } = writable<GamesState>(initialState);

  return {
    subscribe,
    
    setGames: (games: Game[]) => {
      update(state => ({ ...state, games }));
    },
    
    setUserGames: (userGames: GameEntry[]) => {
      update(state => ({ ...state, userGames }));
    },
    
    setCurrentGame: (game: Game | null) => {
      update(state => ({ ...state, currentGame: game }));
    },
    
    setSearchResults: (results: PaginatedResponse<Game> | null) => {
      update(state => ({ ...state, searchResults: results }));
    },
    
    setFilters: (filters: Partial<SearchFilters>) => {
      update(state => ({
        ...state,
        filters: { ...state.filters, ...filters }
      }));
    },
    
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },
    
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    
    addUserGame: (gameEntry: GameEntry) => {
      update(state => ({
        ...state,
        userGames: [...state.userGames, gameEntry]
      }));
    },
    
    updateUserGame: (gameId: string, updates: Partial<GameEntry>) => {
      update(state => ({
        ...state,
        userGames: state.userGames.map(game =>
          game.id === gameId ? { ...game, ...updates } : game
        )
      }));
    },
    
    removeUserGame: (gameId: string) => {
      update(state => ({
        ...state,
        userGames: state.userGames.filter(game => game.id !== gameId)
      }));
    },
    
    clearFilters: () => {
      update(state => ({
        ...state,
        filters: {
          sort_by: 'title',
          sort_order: 'asc'
        }
      }));
    }
  };
}

export const games = createGamesStore();

// Derived stores
export const userGamesByStatus = derived(games, $games => {
  const gamesByStatus = {
    playing: [],
    completed: [],
    dropped: [],
    backlog: [],
    wishlist: [],
    on_hold: []
  } as Record<string, GameEntry[]>;

  $games.userGames.forEach(game => {
    if (gamesByStatus[game.status]) {
      gamesByStatus[game.status].push(game);
    }
  });

  return gamesByStatus;
});

export const userStats = derived(games, $games => {
  const stats = {
    total_games: $games.userGames.length,
    playing: $games.userGames.filter(g => g.status === 'playing').length,
    completed: $games.userGames.filter(g => g.status === 'completed').length,
    dropped: $games.userGames.filter(g => g.status === 'dropped').length,
    backlog: $games.userGames.filter(g => g.status === 'backlog').length,
    wishlist: $games.userGames.filter(g => g.status === 'wishlist').length,
    total_playtime: $games.userGames.reduce((total, game) => total + (game.playtime_hours || 0), 0),
    average_rating: 0
  };

  const ratedGames = $games.userGames.filter(g => g.rating?.value);
  if (ratedGames.length > 0) {
    stats.average_rating = ratedGames.reduce((sum, game) => sum + (game.rating?.value || 0), 0) / ratedGames.length;
  }

  return stats;
});