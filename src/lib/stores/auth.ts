import { writable } from 'svelte/store';
import type { User } from '$lib/types/user';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    setUser: (user: User | null) => {
      update(state => ({
        ...state,
        user,
        isAuthenticated: !!user,
        isLoading: false
      }));
    },
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },
    logout: () => {
      set({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
    },
    updateUser: (userData: Partial<User>) => {
      update(state => ({
        ...state,
        user: state.user ? { ...state.user, ...userData } : null
      }));
    }
  };
}

export const auth = createAuthStore();