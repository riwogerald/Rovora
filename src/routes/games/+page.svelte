<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { games } from '$lib/stores/games';
  import { gamesAPI } from '$lib/api/client';
  import GameCard from '$lib/components/games/GameCard.svelte';
  import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Pagination from '$lib/components/ui/Pagination.svelte';
  import Icon from '@iconify/svelte';
  import type { GameFilters } from '$lib/types/game';
  
  let searchQuery = '';
  let currentPage = 1;
  let isLoading = false;
  let showFilters = false;
  
  // Filter state
  let selectedGenres: number[] = [];
  let selectedPlatforms: number[] = [];
  let ratingMin = 0;
  let ratingMax = 5;
  let sortBy = '-rating';
  
  // Mock filter options
  const genres = [
    { id: 4, name: 'Action' },
    { id: 51, name: 'Indie' },
    { id: 3, name: 'Adventure' },
    { id: 5, name: 'RPG' },
    { id: 10, name: 'Strategy' },
    { id: 2, name: 'Shooter' },
    { id: 40, name: 'Casual' },
    { id: 14, name: 'Simulation' },
    { id: 7, name: 'Puzzle' },
    { id: 11, name: 'Arcade' }
  ];
  
  const platforms = [
    { id: 4, name: 'PC' },
    { id: 187, name: 'PlayStation 5' },
    { id: 1, name: 'Xbox One' },
    { id: 7, name: 'Nintendo Switch' },
    { id: 3, name: 'iOS' },
    { id: 21, name: 'Android' }
  ];
  
  const sortOptions = [
    { value: '-rating', label: 'Highest Rated' },
    { value: 'rating', label: 'Lowest Rated' },
    { value: '-released', label: 'Newest' },
    { value: 'released', label: 'Oldest' },
    { value: '-added', label: 'Most Popular' },
    { value: 'name', label: 'A-Z' },
    { value: '-name', label: 'Z-A' }
  ];
  
  async function loadGames() {
    isLoading = true;
    games.setLoading(true);
    
    try {
      const filters: GameFilters = {
        search: searchQuery || undefined,
        genres: selectedGenres.length ? selectedGenres : undefined,
        platforms: selectedPlatforms.length ? selectedPlatforms : undefined,
        rating_min: ratingMin > 0 ? ratingMin : undefined,
        rating_max: ratingMax < 5 ? ratingMax : undefined,
        ordering: sortBy,
        page: currentPage,
        page_size: 20
      };
      
      const result = await gamesAPI.getGames(filters);
      games.setSearchResult(result);
    } catch (error) {
      console.error('Failed to load games:', error);
      games.setError('Failed to load games. Please try again.');
    } finally {
      isLoading = false;
      games.setLoading(false);
    }
  }
  
  function handleSearch() {
    currentPage = 1;
    updateURL();
    loadGames();
  }
  
  function handleFilterChange() {
    currentPage = 1;
    updateURL();
    loadGames();
  }
  
  function handlePageChange(event: CustomEvent<{ page: number }>) {
    currentPage = event.detail.page;
    updateURL();
    loadGames();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  function updateURL() {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedGenres.length) params.set('genres', selectedGenres.join(','));
    if (selectedPlatforms.length) params.set('platforms', selectedPlatforms.join(','));
    if (ratingMin > 0) params.set('rating_min', ratingMin.toString());
    if (ratingMax < 5) params.set('rating_max', ratingMax.toString());
    if (sortBy !== '-rating') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const url = params.toString() ? `/games?${params.toString()}` : '/games';
    goto(url, { replaceState: true, noScroll: true });
  }
  
  function clearFilters() {
    searchQuery = '';
    selectedGenres = [];
    selectedPlatforms = [];
    ratingMin = 0;
    ratingMax = 5;
    sortBy = '-rating';
    currentPage = 1;
    updateURL();
    loadGames();
  }
  
  function toggleGenre(genreId: number) {
    if (selectedGenres.includes(genreId)) {
      selectedGenres = selectedGenres.filter(id => id !== genreId);
    } else {
      selectedGenres = [...selectedGenres, genreId];
    }
    handleFilterChange();
  }
  
  function togglePlatform(platformId: number) {
    if (selectedPlatforms.includes(platformId)) {
      selectedPlatforms = selectedPlatforms.filter(id => id !== platformId);
    } else {
      selectedPlatforms = [...selectedPlatforms, platformId];
    }
    handleFilterChange();
  }
  
  // Initialize from URL params
  onMount(() => {
    const urlParams = new URLSearchParams($page.url.search);
    
    searchQuery = urlParams.get('search') || '';
    selectedGenres = urlParams.get('genres')?.split(',').map(Number).filter(Boolean) || [];
    selectedPlatforms = urlParams.get('platforms')?.split(',').map(Number).filter(Boolean) || [];
    ratingMin = Number(urlParams.get('rating_min')) || 0;
    ratingMax = Number(urlParams.get('rating_max')) || 5;
    sortBy = urlParams.get('sort') || '-rating';
    currentPage = Number(urlParams.get('page')) || 1;
    
    loadGames();
  });
  
  $: totalPages = $games.searchResult ? Math.ceil($games.searchResult.count / 20) : 1;
  $: gamesList = $games.searchResult?.results || [];
  $: hasActiveFilters = searchQuery || selectedGenres.length || selectedPlatforms.length || ratingMin > 0 || ratingMax < 5;
</script>

<svelte:head>
  <title>Browse Games - GameHub</title>
  <meta name="description" content="Discover and explore thousands of games. Filter by genre, platform, rating and more." />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
      Browse Games
    </h1>
    <p class="text-gray-600 dark:text-gray-400">
      Discover your next favorite game from our extensive catalog
    </p>
  </div>
  
  <!-- Search and Filters -->
  <div class="mb-8 space-y-4">
    <!-- Search Bar -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <Input
          bind:value={searchQuery}
          type="search"
          placeholder="Search for games..."
          icon="lucide:search"
          clearable
          on:keydown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <div class="flex gap-2">
        <Button on:click={handleSearch} icon="lucide:search">
          Search
        </Button>
        <Button
          variant="secondary"
          icon={showFilters ? 'lucide:filter-x' : 'lucide:filter'}
          on:click={() => showFilters = !showFilters}
        >
          Filters
        </Button>
      </div>
    </div>
    
    <!-- Filters Panel -->
    {#if showFilters}
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
          {#if hasActiveFilters}
            <Button variant="ghost" size="sm" on:click={clearFilters}>
              Clear All
            </Button>
          {/if}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Genres -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-3">Genres</h4>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              {#each genres as genre}
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.id)}
                    on:change={() => toggleGenre(genre.id)}
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {genre.name}
                  </span>
                </label>
              {/each}
            </div>
          </div>
          
          <!-- Platforms -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-3">Platforms</h4>
            <div class="space-y-2">
              {#each platforms as platform}
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    on:change={() => togglePlatform(platform.id)}
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {platform.name}
                  </span>
                </label>
              {/each}
            </div>
          </div>
          
          <!-- Rating Range -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-3">Rating</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Minimum: {ratingMin}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  bind:value={ratingMin}
                  on:change={handleFilterChange}
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Maximum: {ratingMax}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  bind:value={ratingMax}
                  on:change={handleFilterChange}
                  class="w-full"
                />
              </div>
            </div>
          </div>
          
          <!-- Sort By -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-3">Sort By</h4>
            <select
              bind:value={sortBy}
              on:change={handleFilterChange}
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {#each sortOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Results Info -->
  <div class="flex items-center justify-between mb-6">
    <div class="text-gray-600 dark:text-gray-400">
      {#if $games.searchResult}
        Showing {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, $games.searchResult.count)} of {$games.searchResult.count.toLocaleString()} games
      {:else}
        Loading games...
      {/if}
    </div>
    
    {#if hasActiveFilters}
      <Button variant="ghost" size="sm" on:click={clearFilters} icon="lucide:x">
        Clear Filters
      </Button>
    {/if}
  </div>
  
  <!-- Games Grid -->
  {#if isLoading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {#each Array(20) as _}
        <LoadingSkeleton class="h-80 rounded-xl" />
      {/each}
    </div>
  {:else if gamesList.length > 0}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {#each gamesList as game}
        <GameCard {game} />
      {/each}
    </div>
  {:else}
    <div class="text-center py-12">
      <Icon icon="lucide:search-x" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No games found
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Try adjusting your search criteria or filters
      </p>
      <Button variant="secondary" on:click={clearFilters}>
        Clear Filters
      </Button>
    </div>
  {/if}
  
  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="flex justify-center">
      <Pagination
        {currentPage}
        {totalPages}
        disabled={isLoading}
        on:pageChange={handlePageChange}
      />
    </div>
  {/if}
</div>