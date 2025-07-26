<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import SearchBar from '$lib/components/search/SearchBar.svelte';
  import SearchResults from '$lib/components/search/SearchResults.svelte';
  import Icon from '@iconify/svelte';
  import type { SearchResult, SearchResponse } from '$lib/services/search';

  // Search state
  let searchQuery = '';
  let searchCategory: 'all' | 'games' | 'users' | 'entries' = 'all';
  let isLoading = false;
  let searchResults: SearchResult[] = [];
  let totalCount = 0;
  let facets: SearchResponse['facets'] = { genres: [], platforms: [], statuses: [] };
  let suggestions: string[] = [];
  
  // Filters
  let selectedGenres: string[] = [];
  let selectedPlatforms: string[] = [];
  let selectedStatuses: string[] = [];
  let sortBy = 'relevance';
  let sortDirection = 'desc';
  let showFilters = false;

  // Pagination
  let currentOffset = 0;
  const pageSize = 20;

  // Initialize from URL params
  onMount(() => {
    const params = $page.url.searchParams;
    searchQuery = params.get('q') || '';
    searchCategory = (params.get('category') as any) || 'all';
    
    if (searchQuery) {
      performSearch();
    }
  });

  async function performSearch(reset = true) {
    if (reset) {
      currentOffset = 0;
      searchResults = [];
    }

    isLoading = true;

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        category: searchCategory,
        sortBy,
        sortDirection,
        limit: pageSize.toString(),
        offset: currentOffset.toString()
      });

      // Add filters
      if (selectedGenres.length > 0) {
        params.set('genres', selectedGenres.join(','));
      }
      if (selectedPlatforms.length > 0) {
        params.set('platforms', selectedPlatforms.join(','));
      }
      if (selectedStatuses.length > 0) {
        params.set('status', selectedStatuses.join(','));
      }

      const response = await fetch(`/api/search?${params}`);
      const data: SearchResponse = await response.json();

      if (reset) {
        searchResults = data.results;
      } else {
        searchResults = [...searchResults, ...data.results];
      }
      
      totalCount = data.totalCount;
      facets = data.facets;
      suggestions = data.suggestions;

      // Update URL
      const url = new URL($page.url);
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('category', searchCategory);
      goto(url, { replaceState: true, noScroll: true });

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      isLoading = false;
    }
  }

  function handleSearch(event: CustomEvent<{ query: string; category: string }>) {
    searchQuery = event.detail.query;
    searchCategory = event.detail.category as any;
    performSearch(true);
  }

  function handleSelect(event: CustomEvent<{ type: string; id: string; text: string }>) {
    const { type, id } = event.detail;
    
    // Navigate to the selected item
    switch (type) {
      case 'game':
        goto(`/games/${id}`);
        break;
      case 'user':
        goto(`/profile/${id}`);
        break;
      case 'entry':
        goto(`/codex/${id}`);
        break;
    }
  }

  function handleResultSelect(event: CustomEvent<{ result: SearchResult }>) {
    const { result } = event.detail;
    
    switch (result.type) {
      case 'game':
        goto(`/games/${result.id}`);
        break;
      case 'user':
        goto(`/profile/${result.metadata.username || result.id}`);
        break;
      case 'entry':
        goto(`/codex/${result.id}`);
        break;
    }
  }

  function handleLoadMore() {
    currentOffset += pageSize;
    performSearch(false);
  }

  function handleSuggestion(event: CustomEvent<{ suggestion: string }>) {
    searchQuery = event.detail.suggestion;
    performSearch(true);
  }

  function handleFilterChange() {
    performSearch(true);
  }

  function clearFilters() {
    selectedGenres = [];
    selectedPlatforms = [];
    selectedStatuses = [];
    handleFilterChange();
  }

  function handleSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    sortBy = target.value;
    performSearch(true);
  }

  $: hasActiveFilters = selectedGenres.length > 0 || selectedPlatforms.length > 0 || selectedStatuses.length > 0;
</script>

<svelte:head>
  <title>Search - Rovora</title>
  <meta name="description" content="Search for games, users, and entries on Rovora" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-6xl mx-auto">
    <!-- Search Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900-50-token mb-4">
        Search Rovora
      </h1>
      
      <!-- Search Bar -->
      <SearchBar 
        bind:value={searchQuery}
        bind:category={searchCategory}
        on:search={handleSearch}
        on:select={handleSelect}
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Filters Sidebar -->
      <div class="lg:col-span-1">
        <div class="card p-6 sticky top-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-surface-900-50-token">
              Filters
            </h3>
            <button
              class="btn btn-sm variant-ghost-surface lg:hidden"
              on:click={() => showFilters = !showFilters}
            >
              <Icon icon="lucide:filter" class="w-4 h-4" />
            </button>
          </div>

          <div class="space-y-6" class:hidden={!showFilters} class:lg:block={true}>
            <!-- Sort Options -->
            <div>
              <label class="label mb-2">
                <span class="text-sm font-medium">Sort by</span>
              </label>
              <select 
                class="select w-full"
                bind:value={sortBy}
                on:change={handleSortChange}
              >
                <option value="relevance">Relevance</option>
                <option value="title">Title</option>
                <option value="date">Date</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <!-- Genre Filter -->
            {#if facets.genres.length > 0}
              <div>
                <label class="label mb-2">
                  <span class="text-sm font-medium">Genres</span>
                </label>
                <div class="space-y-2 max-h-40 overflow-y-auto">
                  {#each facets.genres as genre}
                    <label class="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        class="checkbox"
                        bind:group={selectedGenres}
                        value={genre.name}
                        on:change={handleFilterChange}
                      />
                      <span class="text-sm">
                        {genre.name} ({genre.count})
                      </span>
                    </label>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Platform Filter -->
            {#if facets.platforms.length > 0}
              <div>
                <label class="label mb-2">
                  <span class="text-sm font-medium">Platforms</span>
                </label>
                <div class="space-y-2 max-h-40 overflow-y-auto">
                  {#each facets.platforms as platform}
                    <label class="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        class="checkbox"
                        bind:group={selectedPlatforms}
                        value={platform.name}
                        on:change={handleFilterChange}
                      />
                      <span class="text-sm">
                        {platform.name} ({platform.count})
                      </span>
                    </label>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Status Filter -->
            {#if facets.statuses.length > 0}
              <div>
                <label class="label mb-2">
                  <span class="text-sm font-medium">Play Status</span>
                </label>
                <div class="space-y-2">
                  {#each facets.statuses as status}
                    <label class="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        class="checkbox"
                        bind:group={selectedStatuses}
                        value={status.name}
                        on:change={handleFilterChange}
                      />
                      <span class="text-sm capitalize">
                        {status.name} ({status.count})
                      </span>
                    </label>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Clear Filters -->
            {#if hasActiveFilters}
              <button
                class="btn variant-ghost-surface w-full"
                on:click={clearFilters}
              >
                <Icon icon="lucide:x" class="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            {/if}
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div class="lg:col-span-3">
        <SearchResults
          results={searchResults}
          {totalCount}
          {isLoading}
          {facets}
          {suggestions}
          query={searchQuery}
          on:selectResult={handleResultSelect}
          on:loadMore={handleLoadMore}
          on:applySuggestion={handleSuggestion}
        />
      </div>
    </div>
  </div>
</div>
