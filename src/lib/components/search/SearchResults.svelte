<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';
  import type { SearchResult, SearchResponse } from '$lib/services/search';

  export let results: SearchResult[] = [];
  export let totalCount = 0;
  export let isLoading = false;
  export let facets: SearchResponse['facets'] = { genres: [], platforms: [], statuses: [] };
  export let suggestions: string[] = [];
  export let query = '';

  const dispatch = createEventDispatcher<{
    selectResult: { result: SearchResult };
    loadMore: void;
    applySuggestion: { suggestion: string };
  }>();

  function handleResultClick(result: SearchResult) {
    dispatch('selectResult', { result });
  }

  function handleLoadMore() {
    dispatch('loadMore');
  }

  function handleSuggestionClick(suggestion: string) {
    dispatch('applySuggestion', { suggestion });
  }

  function getResultIcon(type: string): string {
    switch (type) {
      case 'game': return 'lucide:gamepad-2';
      case 'user': return 'lucide:user';
      case 'entry': return 'lucide:book-open';
      default: return 'lucide:file';
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }
</script>

<div class="search-results space-y-6">
  <!-- Search Summary -->
  {#if query && !isLoading}
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-surface-900-50-token">
          Search Results for "{query}"
        </h2>
        <p class="text-sm text-surface-500-400-token">
          {totalCount} {totalCount === 1 ? 'result' : 'results'} found
        </p>
      </div>
      
      <!-- Sort Options -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-surface-500-400-token">Sort by:</span>
        <select class="select select-sm">
          <option value="relevance">Relevance</option>
          <option value="title">Title</option>
          <option value="date">Date</option>
          <option value="rating">Rating</option>
        </select>
      </div>
    </div>
  {/if}

  <!-- Loading State -->
  {#if isLoading}
    <div class="space-y-4">
      {#each Array(5) as _}
        <div class="card p-4 animate-pulse">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 bg-surface-300-600-token rounded"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-surface-300-600-token rounded w-3/4"></div>
              <div class="h-3 bg-surface-200-700-token rounded w-1/2"></div>
              <div class="h-3 bg-surface-200-700-token rounded w-full"></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if results.length > 0}
    <!-- Results List -->
    <div class="space-y-4">
      {#each results as result}
        <div 
          class="card p-4 hover:shadow-md transition-shadow cursor-pointer"
          on:click={() => handleResultClick(result)}
          on:keydown={(e) => e.key === 'Enter' && handleResultClick(result)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-start gap-4">
            <!-- Result Image/Icon -->
            <div class="flex-shrink-0">
              {#if result.imageUrl}
                <img 
                  src={result.imageUrl} 
                  alt={result.title}
                  class="w-16 h-16 object-cover rounded-lg"
                />
              {:else}
                <div class="w-16 h-16 bg-surface-200-700-token rounded-lg flex items-center justify-center">
                  <Icon 
                    icon={getResultIcon(result.type)} 
                    class="w-8 h-8 text-surface-500-400-token"
                  />
                </div>
              {/if}
            </div>
            
            <!-- Result Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <!-- Title and Type -->
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold text-surface-900-50-token truncate">
                      {result.title}
                    </h3>
                    <span class="text-xs px-2 py-1 bg-surface-200-700-token rounded-full text-surface-600-300-token capitalize">
                      {result.type}
                    </span>
                  </div>
                  
                  <!-- Description -->
                  {#if result.description}
                    <p class="text-sm text-surface-600-300-token line-clamp-2 mb-2">
                      {truncateText(result.description, 150)}
                    </p>
                  {/if}
                  
                  <!-- Metadata -->
                  <div class="flex flex-wrap items-center gap-4 text-xs text-surface-500-400-token">
                    {#if result.type === 'game'}
                      {#if result.metadata.developer}
                        <span class="flex items-center gap-1">
                          <Icon icon="lucide:users" class="w-3 h-3" />
                          {result.metadata.developer}
                        </span>
                      {/if}
                      {#if result.metadata.releaseDate}
                        <span class="flex items-center gap-1">
                          <Icon icon="lucide:calendar" class="w-3 h-3" />
                          {formatDate(result.metadata.releaseDate)}
                        </span>
                      {/if}
                      {#if result.metadata.score}
                        <span class="flex items-center gap-1">
                          <Icon icon="lucide:star" class="w-3 h-3" />
                          {result.metadata.score}/100
                        </span>
                      {/if}
                    {:else if result.type === 'user'}
                      {#if result.metadata.username}
                        <span>@{result.metadata.username}</span>
                      {/if}
                      {#if result.metadata.joinDate}
                        <span class="flex items-center gap-1">
                          <Icon icon="lucide:calendar" class="w-3 h-3" />
                          Joined {formatDate(result.metadata.joinDate)}
                        </span>
                      {/if}
                      {#if result.metadata.isVerified}
                        <span class="flex items-center gap-1 text-primary-500">
                          <Icon icon="lucide:check-circle" class="w-3 h-3" />
                          Verified
                        </span>
                      {/if}
                    {:else if result.type === 'entry'}
                      {#if result.metadata.author}
                        <span class="flex items-center gap-1">
                          <Icon icon="lucide:user" class="w-3 h-3" />
                          {result.metadata.author}
                        </span>
                      {/if}
                      {#if result.metadata.gameName}
                        <span class="flex items-center gap-1">
                          <Icon icon="lucide:gamepad-2" class="w-3 h-3" />
                          {result.metadata.gameName}
                        </span>
                      {/if}
                      {#if result.metadata.createdAt}
                        <span class="flex items-center gap-1">
                          <Icon icon="lucide:calendar" class="w-3 h-3" />
                          {formatDate(result.metadata.createdAt)}
                        </span>
                      {/if}
                    {/if}
                  </div>
                </div>
                
                <!-- Relevance Score (for debugging) -->
                {#if result.relevanceScore > 0}
                  <div class="text-xs text-surface-400-500-token">
                    {Math.round(result.relevanceScore)}% match
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Load More Button -->
    {#if results.length < totalCount}
      <div class="text-center">
        <button 
          class="btn variant-ghost-surface"
          on:click={handleLoadMore}
        >
          <Icon icon="lucide:chevron-down" class="w-4 h-4 mr-2" />
          Load More Results
        </button>
      </div>
    {/if}
  {:else if !isLoading && query}
    <!-- No Results -->
    <div class="text-center py-12">
      <Icon icon="lucide:search-x" class="w-16 h-16 text-surface-400-500-token mx-auto mb-4" />
      <h3 class="text-lg font-medium text-surface-900-50-token mb-2">
        No results found for "{query}"
      </h3>
      <p class="text-surface-500-400-token mb-6">
        Try adjusting your search or browse our suggestions below.
      </p>
      
      <!-- Search Suggestions -->
      {#if suggestions.length > 0}
        <div class="max-w-md mx-auto">
          <h4 class="text-sm font-medium text-surface-700-200-token mb-3">
            Try searching for:
          </h4>
          <div class="flex flex-wrap gap-2 justify-center">
            {#each suggestions as suggestion}
              <button
                class="btn btn-sm variant-ghost-surface"
                on:click={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else if !query}
    <!-- Empty State -->
    <div class="text-center py-12">
      <Icon icon="lucide:search" class="w-16 h-16 text-surface-400-500-token mx-auto mb-4" />
      <h3 class="text-lg font-medium text-surface-900-50-token mb-2">
        Start searching
      </h3>
      <p class="text-surface-500-400-token">
        Search for games, users, or entries to get started.
      </p>
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
