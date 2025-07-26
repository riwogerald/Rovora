import { writable, derived } from 'svelte/store';
import type { CodexEntryWithDetails, CodexFilters } from '$lib/database/queries/codex';
import type { PaginatedResponse } from '$lib/types/core';

interface CodexState {
  entries: CodexEntryWithDetails[];
  currentEntry: CodexEntryWithDetails | null;
  featuredEntries: CodexEntryWithDetails[];
  popularEntries: CodexEntryWithDetails[];
  userEntries: CodexEntryWithDetails[];
  searchResults: PaginatedResponse<CodexEntryWithDetails> | null;
  filters: CodexFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: CodexState = {
  entries: [],
  currentEntry: null,
  featuredEntries: [],
  popularEntries: [],
  userEntries: [],
  searchResults: null,
  filters: {
    sortBy: 'created_at',
    sortOrder: 'desc',
    isPublic: true
  },
  isLoading: false,
  error: null
};

function createCodexStore() {
  const { subscribe, set, update } = writable<CodexState>(initialState);

  return {
    subscribe,
    
    // Set entries
    setEntries: (entries: CodexEntryWithDetails[]) => {
      update(state => ({ ...state, entries }));
    },
    
    // Add entry
    addEntry: (entry: CodexEntryWithDetails) => {
      update(state => ({
        ...state,
        entries: [entry, ...state.entries],
        userEntries: entry.user_id === getCurrentUserId() 
          ? [entry, ...state.userEntries] 
          : state.userEntries
      }));
    },
    
    // Update entry
    updateEntry: (entryId: string, updates: Partial<CodexEntryWithDetails>) => {
      update(state => {
        const updateEntryInArray = (entries: CodexEntryWithDetails[]) =>
          entries.map(entry => 
            entry.id === entryId ? { ...entry, ...updates } : entry
          );

        return {
          ...state,
          entries: updateEntryInArray(state.entries),
          userEntries: updateEntryInArray(state.userEntries),
          featuredEntries: updateEntryInArray(state.featuredEntries),
          popularEntries: updateEntryInArray(state.popularEntries),
          currentEntry: state.currentEntry?.id === entryId 
            ? { ...state.currentEntry, ...updates }
            : state.currentEntry
        };
      });
    },
    
    // Remove entry
    removeEntry: (entryId: string) => {
      update(state => {
        const filterEntries = (entries: CodexEntryWithDetails[]) =>
          entries.filter(entry => entry.id !== entryId);

        return {
          ...state,
          entries: filterEntries(state.entries),
          userEntries: filterEntries(state.userEntries),
          featuredEntries: filterEntries(state.featuredEntries),
          popularEntries: filterEntries(state.popularEntries),
          currentEntry: state.currentEntry?.id === entryId ? null : state.currentEntry
        };
      });
    },
    
    // Set current entry
    setCurrentEntry: (entry: CodexEntryWithDetails | null) => {
      update(state => ({ ...state, currentEntry: entry }));
    },
    
    // Set featured entries
    setFeaturedEntries: (entries: CodexEntryWithDetails[]) => {
      update(state => ({ ...state, featuredEntries: entries }));
    },
    
    // Set popular entries
    setPopularEntries: (entries: CodexEntryWithDetails[]) => {
      update(state => ({ ...state, popularEntries: entries }));
    },
    
    // Set user entries
    setUserEntries: (entries: CodexEntryWithDetails[]) => {
      update(state => ({ ...state, userEntries: entries }));
    },
    
    // Set search results
    setSearchResults: (results: PaginatedResponse<CodexEntryWithDetails> | null) => {
      update(state => ({ ...state, searchResults: results }));
    },
    
    // Update filters
    setFilters: (filters: Partial<CodexFilters>) => {
      update(state => ({
        ...state,
        filters: { ...state.filters, ...filters }
      }));
    },
    
    // Clear filters
    clearFilters: () => {
      update(state => ({
        ...state,
        filters: {
          sortBy: 'created_at',
          sortOrder: 'desc',
          isPublic: true
        }
      }));
    },
    
    // Loading state
    setLoading: (isLoading: boolean) => {
      update(state => ({ ...state, isLoading }));
    },
    
    // Error state
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    
    // Increment engagement counts
    incrementLikes: (entryId: string) => {
      update(state => {
        const incrementInArray = (entries: CodexEntryWithDetails[]) =>
          entries.map(entry => 
            entry.id === entryId 
              ? { ...entry, likes_count: (entry.likes_count || 0) + 1 }
              : entry
          );

        return {
          ...state,
          entries: incrementInArray(state.entries),
          userEntries: incrementInArray(state.userEntries),
          featuredEntries: incrementInArray(state.featuredEntries),
          popularEntries: incrementInArray(state.popularEntries),
          currentEntry: state.currentEntry?.id === entryId 
            ? { ...state.currentEntry, likes_count: (state.currentEntry.likes_count || 0) + 1 }
            : state.currentEntry
        };
      });
    },
    
    incrementComments: (entryId: string) => {
      update(state => {
        const incrementInArray = (entries: CodexEntryWithDetails[]) =>
          entries.map(entry => 
            entry.id === entryId 
              ? { ...entry, comments_count: (entry.comments_count || 0) + 1 }
              : entry
          );

        return {
          ...state,
          entries: incrementInArray(state.entries),
          userEntries: incrementInArray(state.userEntries),
          featuredEntries: incrementInArray(state.featuredEntries),
          popularEntries: incrementInArray(state.popularEntries),
          currentEntry: state.currentEntry?.id === entryId 
            ? { ...state.currentEntry, comments_count: (state.currentEntry.comments_count || 0) + 1 }
            : state.currentEntry
        };
      });
    },
    
    incrementShares: (entryId: string) => {
      update(state => {
        const incrementInArray = (entries: CodexEntryWithDetails[]) =>
          entries.map(entry => 
            entry.id === entryId 
              ? { ...entry, shares_count: (entry.shares_count || 0) + 1 }
              : entry
          );

        return {
          ...state,
          entries: incrementInArray(state.entries),
          userEntries: incrementInArray(state.userEntries),
          featuredEntries: incrementInArray(state.featuredEntries),
          popularEntries: incrementInArray(state.popularEntries),
          currentEntry: state.currentEntry?.id === entryId 
            ? { ...state.currentEntry, shares_count: (state.currentEntry.shares_count || 0) + 1 }
            : state.currentEntry
        };
      });
    }
  };
}

// Helper function to get current user ID
// This should be replaced with actual session management
function getCurrentUserId(): string | null {
  // TODO: Get from session store or context
  return null;
}

export const codex = createCodexStore();

// Derived stores
export const entriesByType = derived(codex, $codex => {
  const entriesByType: Record<string, CodexEntryWithDetails[]> = {};
  
  $codex.entries.forEach(entry => {
    if (!entriesByType[entry.entry_type]) {
      entriesByType[entry.entry_type] = [];
    }
    entriesByType[entry.entry_type].push(entry);
  });
  
  return entriesByType;
});

export const entriesByGame = derived(codex, $codex => {
  const entriesByGame: Record<string, CodexEntryWithDetails[]> = {};
  
  $codex.entries.forEach(entry => {
    if (!entriesByGame[entry.game_id]) {
      entriesByGame[entry.game_id] = [];
    }
    entriesByGame[entry.game_id].push(entry);
  });
  
  return entriesByGame;
});

export const recentEntries = derived(codex, $codex => {
  return [...$codex.entries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
});

export const topRatedEntries = derived(codex, $codex => {
  return [...$codex.entries]
    .filter(entry => entry.rating && entry.rating.overall_rating >= 4)
    .sort((a, b) => (b.rating?.overall_rating || 0) - (a.rating?.overall_rating || 0))
    .slice(0, 10);
});

export const codexStats = derived(codex, $codex => {
  const stats = {
    totalEntries: $codex.entries.length,
    publicEntries: $codex.entries.filter(e => e.is_public).length,
    privateEntries: $codex.entries.filter(e => !e.is_public).length,
    totalLikes: $codex.entries.reduce((sum, e) => sum + (e.likes_count || 0), 0),
    totalComments: $codex.entries.reduce((sum, e) => sum + (e.comments_count || 0), 0),
    entriesByType: {} as Record<string, number>
  };

  // Count entries by type
  $codex.entries.forEach(entry => {
    stats.entriesByType[entry.entry_type] = (stats.entriesByType[entry.entry_type] || 0) + 1;
  });

  return stats;
});
