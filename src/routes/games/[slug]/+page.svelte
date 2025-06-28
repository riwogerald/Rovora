<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { gamesAPI } from '$lib/api/client';
  import { auth } from '$lib/stores/auth';
  import { wishlist, isInWishlist } from '$lib/stores/wishlist';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';
  import GameCard from '$lib/components/games/GameCard.svelte';
  import Icon from '@iconify/svelte';
  import { toast } from 'svelte-sonner';
  import type { Game } from '$lib/types/game';
  import { getRatingColor, getMetacriticColor, formatDate, getPlatformIcon } from '$lib/utils/helpers';
  
  let game: Game | null = null;
  let screenshots: Array<{ id: number; image: string }> = [];
  let relatedGames: Game[] = [];
  let isLoading = true;
  let error = '';
  let selectedScreenshot = 0;
  
  async function loadGame() {
    const slug = $page.params.slug;
    if (!slug) return;
    
    isLoading = true;
    error = '';
    
    try {
      // Load game details
      game = await gamesAPI.getGame(slug);
      
      // Load screenshots
      try {
        const screenshotData = await gamesAPI.getGameScreenshots(slug);
        screenshots = screenshotData.results || [];
      } catch (e) {
        console.warn('Failed to load screenshots:', e);
      }
      
      // Load related games (mock for now)
      if (game?.genres.length) {
        try {
          const relatedData = await gamesAPI.getGames({
            genres: [game.genres[0].id],
            page_size: 4,
            ordering: '-rating'
          });
          relatedGames = relatedData.results.filter(g => g.id !== game?.id).slice(0, 4);
        } catch (e) {
          console.warn('Failed to load related games:', e);
        }
      }
    } catch (e) {
      error = 'Failed to load game details. Please try again.';
      console.error('Failed to load game:', e);
    } finally {
      isLoading = false;
    }
  }
  
  function handleWishlistToggle() {
    if (!$auth.isAuthenticated) {
      toast.error('Please sign in to add games to your wishlist');
      return;
    }
    
    if (!game) return;
    
    if ($isInWishlist(game.id)) {
      wishlist.removeItem(game.id);
      toast.success(`Removed ${game.name} from wishlist`);
    } else {
      wishlist.addItem({
        id: crypto.randomUUID(),
        user_id: $auth.user!.id,
        game_id: game.id,
        added_at: new Date().toISOString(),
        priority: 'medium'
      });
      toast.success(`Added ${game.name} to wishlist`);
    }
  }
  
  onMount(() => {
    loadGame();
  });
  
  // Reload when slug changes
  $: if ($page.params.slug) {
    loadGame();
  }
</script>

<svelte:head>
  {#if game}
    <title>{game.name} - GameHub</title>
    <meta name="description" content={game.description || `Discover ${game.name} and more games on GameHub`} />
  {:else}
    <title>Game Details - GameHub</title>
  {/if}
</svelte:head>

{#if isLoading}
  <div class="min-h-screen">
    <!-- Hero Section Skeleton -->
    <div class="relative h-96 bg-gray-200 dark:bg-gray-700">
      <LoadingSkeleton class="w-full h-full" />
    </div>
    
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <LoadingSkeleton class="h-8 w-64" />
          <LoadingSkeleton class="h-32 w-full" />
          <LoadingSkeleton class="h-64 w-full" />
        </div>
        <div class="space-y-6">
          <LoadingSkeleton class="h-48 w-full" />
          <LoadingSkeleton class="h-32 w-full" />
        </div>
      </div>
    </div>
  </div>
{:else if error}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <Icon icon="lucide:alert-circle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Game Not Found
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {error}
      </p>
      <Button href="/games">
        Browse Games
      </Button>
    </div>
  </div>
{:else if game}
  <!-- Hero Section -->
  <div class="relative h-96 overflow-hidden">
    {#if game.background_image}
      <img
        src={game.background_image}
        alt={game.name}
        class="w-full h-full object-cover"
      />
    {:else}
      <div class="w-full h-full bg-gradient-to-br from-primary-600 to-purple-600"></div>
    {/if}
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    
    <!-- Hero Content -->
    <div class="absolute bottom-0 left-0 right-0 p-8">
      <div class="container mx-auto">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div class="flex-1">
            <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
              {game.name}
            </h1>
            
            <div class="flex flex-wrap items-center gap-4 text-white/90">
              <!-- Rating -->
              <div class="flex items-center space-x-1">
                <Icon icon="lucide:star" class="w-5 h-5 text-yellow-400" />
                <span class="font-medium">{game.rating.toFixed(1)}</span>
                <span class="text-white/70">({game.ratings_count.toLocaleString()})</span>
              </div>
              
              <!-- Metacritic -->
              {#if game.metacritic}
                <div class="flex items-center space-x-2">
                  <span class="text-sm">Metacritic:</span>
                  <span class="px-2 py-1 bg-white/20 rounded text-sm font-medium">
                    {game.metacritic}
                  </span>
                </div>
              {/if}
              
              <!-- Release Date -->
              {#if game.released}
                <div class="flex items-center space-x-1">
                  <Icon icon="lucide:calendar" class="w-4 h-4" />
                  <span>{formatDate(game.released)}</span>
                </div>
              {/if}
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center space-x-3">
            <Button
              variant={$isInWishlist(game.id) ? 'danger' : 'secondary'}
              icon={$isInWishlist(game.id) ? 'lucide:heart-filled' : 'lucide:heart'}
              on:click={handleWishlistToggle}
            >
              {$isInWishlist(game.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
            
            <Button variant="primary" icon="lucide:external-link">
              View on Store
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Main Content -->
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Description -->
        {#if game.description}
          <Card>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              About This Game
            </h2>
            <div class="prose dark:prose-invert max-w-none">
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                {game.description}
              </p>
            </div>
          </Card>
        {/if}
        
        <!-- Screenshots -->
        {#if screenshots.length > 0}
          <Card>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Screenshots
            </h2>
            
            <!-- Main Screenshot -->
            <div class="mb-4">
              <img
                src={screenshots[selectedScreenshot]?.image}
                alt="Screenshot {selectedScreenshot + 1}"
                class="w-full h-64 md:h-80 object-cover rounded-lg"
              />
            </div>
            
            <!-- Screenshot Thumbnails -->
            <div class="grid grid-cols-4 md:grid-cols-6 gap-2">
              {#each screenshots.slice(0, 12) as screenshot, index}
                <button
                  class="aspect-video rounded overflow-hidden border-2 transition-colors"
                  class:border-primary-500={selectedScreenshot === index}
                  class:border-transparent={selectedScreenshot !== index}
                  on:click={() => selectedScreenshot = index}
                >
                  <img
                    src={screenshot.image}
                    alt="Screenshot {index + 1}"
                    class="w-full h-full object-cover"
                  />
                </button>
              {/each}
            </div>
          </Card>
        {/if}
        
        <!-- Related Games -->
        {#if relatedGames.length > 0}
          <Card>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Similar Games
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {#each relatedGames as relatedGame}
                <GameCard game={relatedGame} />
              {/each}
            </div>
          </Card>
        {/if}
      </div>
      
      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Game Info -->
        <Card>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Game Information
          </h3>
          
          <div class="space-y-4">
            <!-- Platforms -->
            <div>
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Platforms
              </h4>
              <div class="flex flex-wrap gap-2">
                {#each game.platforms as platform}
                  <Badge variant="secondary">
                    <Icon icon={getPlatformIcon(platform.name)} class="w-3 h-3 mr-1" />
                    {platform.name}
                  </Badge>
                {/each}
              </div>
            </div>
            
            <!-- Genres -->
            <div>
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Genres
              </h4>
              <div class="flex flex-wrap gap-2">
                {#each game.genres as genre}
                  <Badge variant="primary">
                    {genre.name}
                  </Badge>
                {/each}
              </div>
            </div>
            
            <!-- Developers -->
            {#if game.developers.length > 0}
              <div>
                <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Developers
                </h4>
                <div class="space-y-1">
                  {#each game.developers as developer}
                    <p class="text-sm text-gray-900 dark:text-gray-100">
                      {developer.name}
                    </p>
                  {/each}
                </div>
              </div>
            {/if}
            
            <!-- Publishers -->
            {#if game.publishers.length > 0}
              <div>
                <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Publishers
                </h4>
                <div class="space-y-1">
                  {#each game.publishers as publisher}
                    <p class="text-sm text-gray-900 dark:text-gray-100">
                      {publisher.name}
                    </p>
                  {/each}
                </div>
              </div>
            {/if}
            
            <!-- Playtime -->
            {#if game.playtime > 0}
              <div>
                <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Average Playtime
                </h4>
                <p class="text-sm text-gray-900 dark:text-gray-100">
                  {game.playtime} hours
                </p>
              </div>
            {/if}
          </div>
        </Card>
        
        <!-- Rating Breakdown -->
        <Card>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ratings
          </h3>
          
          <div class="space-y-4">
            <!-- Overall Rating -->
            <div class="text-center">
              <div class="text-3xl font-bold {getRatingColor(game.rating)} mb-1">
                {game.rating.toFixed(1)}
              </div>
              <div class="flex items-center justify-center mb-2">
                {#each Array(5) as _, i}
                  <Icon
                    icon="lucide:star"
                    class="w-4 h-4 {i < Math.floor(game.rating) ? 'text-yellow-400' : 'text-gray-300'}"
                  />
                {/each}
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Based on {game.ratings_count.toLocaleString()} ratings
              </p>
            </div>
            
            <!-- Metacritic Score -->
            {#if game.metacritic}
              <div class="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Metacritic Score
                </div>
                <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {getMetacriticColor(game.metacritic).bg} {getMetacriticColor(game.metacritic).text}">
                  {game.metacritic}
                </div>
              </div>
            {/if}
          </div>
        </Card>
      </div>
    </div>
  </div>
{/if}