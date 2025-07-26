<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';

  export let suggestions: any[] = [];
  export let isLoading = false;

  const dispatch = createEventDispatcher<{
    followUser: { userId: string };
    viewProfile: { userId: string };
  }>();

  function handleFollowUser(userId: string) {
    dispatch('followUser', { userId });
  }

  function handleViewProfile(userId: string) {
    dispatch('viewProfile', { userId });
  }
</script>

<div class="follow-suggestions">
  <h3 class="text-lg font-semibold text-surface-900-50-token mb-4">
    Suggested Users
  </h3>
  
  {#if isLoading}
    <div class="space-y-3">
      {#each Array(3) as _}
        <div class="flex items-center gap-3 p-3 bg-surface-100-800-token rounded-lg animate-pulse">
          <div class="w-10 h-10 bg-surface-300-600-token rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-surface-300-600-token rounded mb-1"></div>
            <div class="h-3 bg-surface-200-700-token rounded w-2/3"></div>
          </div>
          <div class="w-16 h-8 bg-surface-300-600-token rounded"></div>
        </div>
      {/each}
    </div>
  {:else if suggestions.length > 0}
    <div class="space-y-3">
      {#each suggestions as user}
        <div class="flex items-center gap-3 p-3 bg-surface-100-800-token rounded-lg hover:bg-surface-200-700-token transition-colors">
          <button
            on:click={() => handleViewProfile(user.id)}
            class="flex items-center gap-3 flex-1 min-w-0"
          >
            {#if user.avatar_url}
              <img 
                src={user.avatar_url} 
                alt={user.username}
                class="w-10 h-10 rounded-full object-cover"
              />
            {:else}
              <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            {/if}
            
            <div class="flex-1 min-w-0 text-left">
              <h4 class="font-medium text-surface-900-50-token truncate">
                {user.display_name || user.username}
              </h4>
              <p class="text-sm text-surface-500-400-token truncate">
                @{user.username}
              </p>
            </div>
          </button>
          
          <button
            on:click={() => handleFollowUser(user.id)}
            class="btn btn-sm variant-filled-primary"
          >
            <Icon icon="lucide:user-plus" class="w-3 h-3 mr-1" />
            Follow
          </button>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-8">
      <Icon icon="lucide:users" class="w-12 h-12 text-surface-400-500-token mx-auto mb-2" />
      <p class="text-sm text-surface-500-400-token">
        No suggestions available right now
      </p>
    </div>
  {/if}
</div>

<style>
  .follow-suggestions {
    max-width: 100%;
  }
</style>
