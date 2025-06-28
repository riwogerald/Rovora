<script lang="ts">
  import type { Game } from '$lib/types/game';
  import { isInWishlist, wishlist } from '$lib/stores/wishlist';
  import { auth } from '$lib/stores/auth';
  import Icon from '@iconify/svelte';
  import { toast } from 'svelte-sonner';
  
  export let game: Game;
  export let featured = false;
  
  function handleWishlistToggle() {
    if (!$auth.isAuthenticated) {
      toast.error('Please sign in to add games to your wishlist');
      return;
    }
    
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
  
  function getRatingColor(rating: number) {
    if (rating >= 4.5) return 'text-green-600 dark:text-green-400';
    if (rating >= 4.0) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 3.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  }
  
  function getPlatformIcon(platformName: string) {
    const name = platformName.toLowerCase();
    if (name.includes('pc') || name.includes('windows')) return 'lucide:monitor';
    if (name.includes('playstation') || name.includes('ps')) return 'lucide:gamepad-2';
    if (name.includes('xbox')) return 'lucide:gamepad-2';
    if (name.includes('nintendo') || name.includes('switch')) return 'lucide:gamepad-2';
    if (name.includes('mobile') || name.includes('android') || name.includes('ios')) return 'lucide:smartphone';
    return 'lucide:gamepad-2';
  }
</script>

<article class="game-card group">
  <a href="/games/{game.slug}" class="block">
    <!-- Image Container -->
    <div class="relative overflow-hidden rounded-t-xl aspect-video bg-gray-200 dark:bg-gray-700">
      {#if game.background_image}
        <img
          src={game.background_image}
          alt={game.name}
          class="game-card-image w-full h-full object-cover"
          loading="lazy"
        />
      {:else}
        <div class="w-full h-full flex items-center justify-center">
          <Icon icon="lucide:image" class="w-12 h-12 text-gray-400" />
        </div>
      {/if}
      
      <!-- Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="absolute bottom-4 left-4 right-4">
          <div class="flex items-center space-x-2 text-white text-sm">
            {#each game.platforms.slice(0, 3) as platform}
              <Icon icon={getPlatformIcon(platform.name)} class="w-4 h-4" />
            {/each}
            {#if game.platforms.length > 3}
              <span class="text-xs">+{game.platforms.length - 3}</span>
            {/if}
          </div>
        </div>
      </div>
      
      <!-- Featured Badge -->
      {#if featured}
        <div class="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          Featured
        </div>
      {/if}
      
      <!-- Wishlist Button -->
      <button
        on:click|preventDefault={handleWishlistToggle}
        class="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
        class:text-red-500={$isInWishlist(game.id)}
        class:text-gray-600={!$isInWishlist(game.id)}
        class:dark:text-red-400={$isInWishlist(game.id)}
        class:dark:text-gray-400={!$isInWishlist(game.id)}
        aria-label={$isInWishlist(game.id) ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Icon 
          icon={$isInWishlist(game.id) ? 'lucide:heart-filled' : 'lucide:heart'} 
          class="w-4 h-4" 
        />
      </button>
    </div>
  </a>
  
  <!-- Content -->
  <div class="p-4">
    <a href="/games/{game.slug}" class="block">
      <!-- Title -->
      <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {game.name}
      </h3>
      
      <!-- Rating & Metacritic -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <div class="flex items-center space-x-1">
            <Icon icon="lucide:star" class="w-4 h-4 {getRatingColor(game.rating)}" />
            <span class="font-medium {getRatingColor(game.rating)}">
              {game.rating.toFixed(1)}
            </span>
          </div>
          <span class="text-gray-400 text-sm">
            ({game.ratings_count.toLocaleString()})
          </span>
        </div>
        
        {#if game.metacritic}
          <div class="game-rating" class:bg-green-100={game.metacritic >= 75} class:text-green-800={game.metacritic >= 75} class:bg-yellow-100={game.metacritic >= 50 && game.metacritic < 75} class:text-yellow-800={game.metacritic >= 50 && game.metacritic < 75} class:bg-red-100={game.metacritic < 50} class:text-red-800={game.metacritic < 50}>
            {game.metacritic}
          </div>
        {/if}
      </div>
      
      <!-- Genres -->
      <div class="flex flex-wrap gap-1 mb-3">
        {#each game.genres.slice(0, 2) as genre}
          <span class="platform-tag">
            {genre.name}
          </span>
        {/each}
        {#if game.genres.length > 2}
          <span class="platform-tag">
            +{game.genres.length - 2}
          </span>
        {/if}
      </div>
      
      <!-- Release Date & Playtime -->
      <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        {#if game.released}
          <span>
            {new Date(game.released).getFullYear()}
          </span>
        {:else}
          <span>TBA</span>
        {/if}
        
        {#if game.playtime > 0}
          <span class="flex items-center space-x-1">
            <Icon icon="lucide:clock" class="w-3 h-3" />
            <span>{game.playtime}h</span>
          </span>
        {/if}
      </div>
    </a>
  </div>
</article>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>