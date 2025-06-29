import { writable } from 'svelte/store';
import type { User } from '$lib/types/core';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: null
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    
    setUser: (user: User | null, token?: string) => {
      update(state => ({
        ...state,
        user,
        token: token || state.token,
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
        isAuthenticated: false,
        token: null
      });
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rovora_token');
        localStorage.removeItem('rovora_user');
      }
    },
    
    updateUser: (userData: Partial<User>) => {
      update(state => ({
        ...state,
        user: state.user ? { ...state.user, ...userData } : null
      }));
    },
    
    // Initialize auth from localStorage
    init: () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('rovora_token');
        const userStr = localStorage.getItem('rovora_user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            update(state => ({
              ...state,
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            }));
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
            set(initialState);
          }
        } else {
          update(state => ({ ...state, isLoading: false }));
        }
      }
    }
  };
}

export const auth = createAuthStore();