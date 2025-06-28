import { writable, derived } from 'svelte/store';
import type { Game, GameFilters, GameSearchResult } from '$lib/types/game';

interface GamesState {
  games: Game[];
  featured: Game[];
  trending: Game[];
  isLoading: boolean;
  error: string | null;
  filters: GameFilters;
  searchResult: GameSearchResult | null;
}

const initialState: GamesState = {
  games: [],
  featured: [],
  trending: [],
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    page_size: 20,
    ordering: '-rating'
  },
  searchResult: null
};

function createGamesStore() {
  const { subscribe, set, update } = writable<GamesState>(initialState);

  return {
    subscribe,
    setGames: (games: Game[]) => {
      update(state => ({ ...state, games }));
    },
    setFeatured: (featured: Game[]) => {
      update(state => ({ ...state, featured }));
    },
    setTrending: (trending: Game[]) => {
      update(state => ({ ...state, trending }));
    },
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    setFilters: (filters: Partial<GameFilters>) => {
      update(state => ({
        ...state,
        filters: { ...state.filters, ...filters }
      }));
    },
    setSearchResult: (searchResult: GameSearchResult | null) => {
      update(state => ({ ...state, searchResult }));
    },
    clearFilters: () => {
      update(state => ({
        ...state,
        filters: {
          page: 1,
          page_size: 20,
          ordering: '-rating'
        }
      }));
    }
  };
}

export const games = createGamesStore();

// Derived stores
export const filteredGames = derived(games, $games => $games.searchResult?.results || $games.games);
export const hasMoreGames = derived(games, $games => !!$games.searchResult?.next);
export const totalGames = derived(games, $games => $games.searchResult?.count || 0);