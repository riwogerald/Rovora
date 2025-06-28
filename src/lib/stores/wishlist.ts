import { writable, derived } from 'svelte/store';
import type { Wishlist } from '$lib/types/user';
import { auth } from './auth';

interface WishlistState {
  items: Wishlist[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null
};

function createWishlistStore() {
  const { subscribe, set, update } = writable<WishlistState>(initialState);

  return {
    subscribe,
    setItems: (items: Wishlist[]) => {
      update(state => ({ ...state, items }));
    },
    addItem: (item: Wishlist) => {
      update(state => ({
        ...state,
        items: [...state.items, item]
      }));
    },
    removeItem: (gameId: string) => {
      update(state => ({
        ...state,
        items: state.items.filter(item => item.game_id !== gameId)
      }));
    },
    updateItem: (gameId: string, updates: Partial<Wishlist>) => {
      update(state => ({
        ...state,
        items: state.items.map(item =>
          item.game_id === gameId ? { ...item, ...updates } : item
        )
      }));
    },
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    clear: () => {
      set(initialState);
    }
  };
}

export const wishlist = createWishlistStore();

// Derived stores
export const wishlistGameIds = derived(wishlist, $wishlist => 
  new Set($wishlist.items.map(item => item.game_id))
);

export const wishlistCount = derived(wishlist, $wishlist => $wishlist.items.length);

export const isInWishlist = derived(wishlistGameIds, $gameIds => 
  (gameId: string) => $gameIds.has(gameId)
);

// Clear wishlist when user logs out
auth.subscribe($auth => {
  if (!$auth.isAuthenticated) {
    wishlist.clear();
  }
});