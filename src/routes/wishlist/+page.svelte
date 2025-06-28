<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { wishlist } from '$lib/stores/wishlist';
  import { gamesAPI } from '$lib/api/client';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';
  import Icon from '@iconify/svelte';
  import { toast } from 'svelte-sonner';
  import type { Game } from '$lib/types/game';
  import type { Wishlist } from '$lib/types/user';
  import { formatDate, getRatingColor } from '$lib/utils/helpers';
  
  let wishlistGames: (Wishlist & { game?: Game })[] = [];
  let isLoading = true;
  let sortBy: 'added_date' | 'name' | 'rating' | 'release_date' = 'added_date';
  let filterBy: 'all' | 'high' | 'medium' | 'low' = 'all';
  
  async function loadWishlist() {
    if (!$auth.isAuthenticated) return;
    
    isLoading = true;
    
    try {
      // Get user's wishlist items
      const items = $wishlist.items;
      
      // Load game details for each item
      const gamesWithDetails = await Promise.all(
        items.map(async (item) => {
          try {
            const game = await gamesAPI.getGame(item.game_id);
            return { ...item, game };
          } catch (error) {
            console.error(`Failed to load game ${item.game_id}:`, error);
            return item;
          }
        })
      );
      
      wishlistGames = gamesWithDetails;
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      isLoading = false;
    }
  }
  
  function removeFromWishlist(gameId: string, gameName: string) {
    wishlist.removeItem(gameId);
    wishlistGames = wishlistGames.filter(item => item.game_id !== gameId);
    toast.success(`Removed ${gameName} from wishlist`);
  }
  
  function updatePriority(itemId: string, priority: 'low' | 'medium' | 'high') {
    wishlist.updateItem(itemId, { priority });
    wishlistGames = wishlistGames.map(item =>
      item.id === itemId ? { ...item, priority } : item
    );
    toast.success('Priority updated');
  }
  
  function sortGames(games: typeof wishlistGames) {
    return [...games].sort((a, b) => {
      switch (sortBy) {
        case 'added_date':
          return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
        case 'name':
          return (a.game?.name || '').localeCompare(b.game?.name || '');
        case 'rating':
          return (b.game?.rating || 0) - (a.game?.rating || 0);
        case 'release_date':
          const aDate = a.game?.released ? new Date(a.game.released).getTime() : 0;
          const bDate = b.game?.released ? new Date(b.game.released).getTime() : 0;
          return bDate - aDate;
        default:
          return 0;
      }
    });
  }
  
  function filterGames(games: typeof wishlistGames) {
    if (filterBy === 'all') return games;
    return games.filter(item => item.priority === filterBy);
  }
  
  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  }
  
  function exportWishlist() {
    const data = wishlistGames.map(item => ({
      name: item.game?.name || 'Unknown',
      priority: item.priority,
      added_date: item.added_at,
      rating: item.game?.rating,
      release_date: item.game?.released
    }));
    
    const csv = [
      'Name,Priority,Added Date,Rating,Release Date',
      ...data.map(row => 
        `"${row.name}","${row.priority}","${row.added_date}","${row.rating || ''}","${row.release_date || ''}"`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wishlist.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Wishlist exported successfully');
  }
  
  onMount(() => {
    if ($auth.isAuthenticated) {
      loadWishlist();
    }
  });
  
  $: if ($auth.isAuthenticated && $wishlist.items.length !== wishlistGames.length) {
    loadWishlist();
  }
  
  $: filteredAndSortedGames = sortGames(filterGames(wishlistGames));
</script>

<svelte:head>
  <title>My Wishlist - GameHub</title>
  <meta name="description" content="Manage your game wishlist and track games you want to play." />
</svelte:head>

{#if !$auth.isAuthenticated}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <Icon icon="lucide:heart" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Sign In Required
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Please sign in to view and manage your wishlist
      </p>
      <Button href="/login" variant="primary">
        Sign In
      </Button>
    </div>
  </div>
{:else}
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Wishlist
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {wishlistGames.length} {wishlistGames.length === 1 ? 'game' : 'games'} in your wishlist
        </p>
      </div>
      
      {#if wishlistGames.length > 0}
        <div class="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="secondary" size="sm" on:click={exportWishlist} icon="lucide:download">
            Export
          </Button>
        </div>
      {/if}
    </div>
    
    {#if isLoading}
      <div class="space-y-4">
        {#each Array(5) as _}
          <LoadingSkeleton class="h-32 w-full rounded-lg" />
        {/each}
      </div>
    {:else if wishlistGames.length === 0}
      <div class="text-center py-12">
        <Icon icon="lucide:heart" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Your wishlist is empty
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Start adding games you want to play to your wishlist
        </p>
        <Button href="/games" variant="primary">
          Browse Games
        </Button>
      </div>
    {:else}
      <!-- Filters and Sorting -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div class="flex items-center space-x-4">
          <!-- Filter by Priority -->
          <select
            bind:value={filterBy}
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Sort Options -->
          <select
            bind:value={sortBy}
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="added_date">Recently Added</option>
            <option value="name">Name (A-Z)</option>
            <option value="rating">Highest Rated</option>
            <option value="release_date">Release Date</option>
          </select>
        </div>
      </div>
      
      <!-- Wishlist Items -->
      <div class="space-y-4">
        {#each filteredAndSortedGames as item}
          <Card hover>
            <div class="flex flex-col md:flex-row gap-4">
              <!-- Game Image -->
              <div class="flex-shrink-0">
                <a href="/games/{item.game?.slug}" class="block">
                  {#if item.game?.background_image}
                    <img
                      src={item.game.background_image}
                      alt={item.game.name}
                      class="w-full md:w-32 h-32 object-cover rounded-lg"
                    />
                  {:else}
                    <div class="w-full md:w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Icon icon="lucide:image" class="w-8 h-8 text-gray-400" />
                    </div>
                  {/if}
                </a>
              </div>
              
              <!-- Game Info -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div class="flex-1">
                    <a href="/games/{item.game?.slug}" class="block">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {item.game?.name || 'Unknown Game'}
                      </h3>
                    </a>
                    
                    <div class="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {#if item.game?.rating}
                        <div class="flex items-center space-x-1">
                          <Icon icon="lucide:star" class="w-4 h-4 {getRatingColor(item.game.rating)}" />
                          <span class="{getRatingColor(item.game.rating)}">{item.game.rating.toFixed(1)}</span>
                        </div>
                      {/if}
                      
                      {#if item.game?.released}
                        <div class="flex items-center space-x-1">
                          <Icon icon="lucide:calendar" class="w-4 h-4" />
                          <span>{new Date(item.game.released).getFullYear()}</span>
                        </div>
                      {/if}
                      
                      <div class="flex items-center space-x-1">
                        <Icon icon="lucide:clock" class="w-4 h-4" />
                        <span>Added {formatDate(item.added_at)}</span>
                      </div>
                    </div>
                    
                    {#if item.game?.genres}
                      <div class="flex flex-wrap gap-1 mt-2">
                        {#each item.game.genres.slice(0, 3) as genre}
                          <Badge variant="secondary" size="sm">
                            {genre.name}
                          </Badge>
                        {/each}
                      </div>
                    {/if}
                  </div>
                  
                  <!-- Actions -->
                  <div class="flex items-center space-x-2">
                    <!-- Priority Selector -->
                    <select
                      value={item.priority}
                      on:change={(e) => updatePriority(item.id, e.currentTarget.value as any)}
                      class="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    
                    <Badge variant={getPriorityColor(item.priority)} size="sm">
                      {item.priority} priority
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="lucide:trash-2"
                      on:click={() => removeFromWishlist(item.game_id, item.game?.name || 'Unknown')}
                      aria-label="Remove from wishlist"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        {/each}
      </div>
    {/if}
  </div>
{/if}