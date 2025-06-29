<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';
  import ControllerRating from './ControllerRating.svelte';
  import type { Game, GameEntry, Platform } from '$lib/types/core';
  
  export let game: Game;
  export let gameEntry: GameEntry | null = null;
  export let showActions: boolean = true;
  export let compact: boolean = false;
  
  const dispatch = createEventDispatcher<{
    addToLibrary: { game: Game };
    updateStatus: { gameEntry: GameEntry; status: string };
    viewDetails: { game: Game };
  }>();
  
  function handleAddToLibrary() {
    dispatch('addToLibrary', { game });
  }
  
  function handleStatusChange(status: string) {
    if (gameEntry) {
      dispatch('updateStatus', { gameEntry, status });
    }
  }
  
  function handleViewDetails() {
    dispatch('viewDetails', { game });
  }
  
  function getPlatformIcon(platform: Platform): string {
    const iconMap: Record<string, string> = {
      steam: 'i-mdi-steam',
      xbox: 'i-mdi-microsoft-xbox',
      playstation: 'i-mdi-sony-playstation',
      nintendo: 'i-mdi-nintendo-switch',
      epic: 'i-simple-icons-epicgames',
      gog: 'i-simple-icons-gog-dot-com',
      pc: 'i-lucide-monitor',
      mobile: 'i-lucide-smartphone'
    };
    return iconMap[platform.slug] || 'i-lucide-gamepad-2';
  }
  
  function getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      playing: 'text-green-500',
      completed: 'text-blue-500',
      dropped: 'text-red-500',
      backlog: 'text-yellow-500',
      wishlist: 'text-purple-500',
      on_hold: 'text-orange-500'
    };
    return colorMap[status] || 'text-surface-500';
  }
</script>

<div class="game-card card p-4 {compact ? 'h-auto' : 'h-full'} flex flex-col">
  <!-- Game Image -->
  <div class="relative mb-3 overflow-hidden rounded-lg {compact ? 'aspect-video' : 'aspect-[3/4]'}">
    {#if game.cover_image}
      <img
        src={game.cover_image}
        alt={game.title}
        class="game-image w-full h-full object-cover transition-transform duration-300"
        loading="lazy"
      />
    {:else}
      <div class="w-full h-full bg-surface-200-700-token flex items-center justify-center">
        <Icon icon="lucide:image" class="w-8 h-8 text-surface-400-500-token" />
      </div>
    {/if}
    
    <!-- Status indicator -->
    {#if gameEntry}
      <div class="absolute top-2 left-2">
        <div class="status-indicator status-{gameEntry.status}">
          <div class="status-{gameEntry.status} mr-1"></div>
          {gameEntry.status}
        </div>
      </div>
    {/if}
    
    <!-- Rating -->
    {#if gameEntry?.rating}
      <div class="absolute top-2 right-2 bg-surface-900-50-token/80 backdrop-blur-sm rounded-lg px-2 py-1">
        <div class="flex items-center gap-1">
          <Icon icon="lucide:gamepad-2" class="w-3 h-3 text-primary-500" />
          <span class="text-xs font-medium text-surface-50-900-token">
            {gameEntry.rating.value}/5
          </span>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Game Info -->
  <div class="flex-1 flex flex-col">
    <button
      on:click={handleViewDetails}
      class="text-left mb-2 group"
    >
      <h3 class="font-semibold text-surface-900-50-token group-hover:text-primary-500 transition-colors line-clamp-2">
        {game.title}
      </h3>
    </button>
    
    {#if !compact}
      <!-- Genres -->
      <div class="flex flex-wrap gap-1 mb-2">
        {#each game.genres.slice(0, 2) as genre}
          <span class="badge variant-soft-surface text-xs">
            {genre.name}
          </span>
        {/each}
        {#if game.genres.length > 2}
          <span class="badge variant-soft-surface text-xs">
            +{game.genres.length - 2}
          </span>
        {/if}
      </div>
      
      <!-- Platforms -->
      <div class="flex items-center gap-1 mb-3">
        {#each game.platforms.slice(0, 4) as platform}
          <Icon 
            icon={getPlatformIcon(platform)} 
            class="w-4 h-4 text-surface-500-400-token"
            title={platform.name}
          />
        {/each}
        {#if game.platforms.length > 4}
          <span class="text-xs text-surface-500-400-token">
            +{game.platforms.length - 4}
          </span>
        {/if}
      </div>
    {/if}
    
    <!-- Game Entry Details -->
    {#if gameEntry && !compact}
      <div class="mt-auto space-y-2">
        {#if gameEntry.playtime_hours}
          <div class="flex items-center gap-1 text-xs text-surface-500-400-token">
            <Icon icon="lucide:clock" class="w-3 h-3" />
            <span>{gameEntry.playtime_hours}h played</span>
          </div>
        {/if}
        
        {#if gameEntry.completion_percentage}
          <div class="flex items-center gap-1 text-xs text-surface-500-400-token">
            <Icon icon="lucide:trophy" class="w-3 h-3" />
            <span>{gameEntry.completion_percentage}% complete</span>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Actions -->
    {#if showActions}
      <div class="mt-auto pt-3 border-t border-surface-200-700-token">
        {#if gameEntry}
          <!-- Status change dropdown -->
          <select
            value={gameEntry.status}
            on:change={(e) => handleStatusChange(e.currentTarget.value)}
            class="select select-sm w-full"
          >
            <option value="playing">Playing</option>
            <option value="completed">Completed</option>
            <option value="backlog">Backlog</option>
            <option value="wishlist">Wishlist</option>
            <option value="on_hold">On Hold</option>
            <option value="dropped">Dropped</option>
          </select>
        {:else}
          <button
            on:click={handleAddToLibrary}
            class="btn variant-filled-primary w-full btn-sm"
          >
            <Icon icon="lucide:plus" class="w-4 h-4 mr-1" />
            Add to Library
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>