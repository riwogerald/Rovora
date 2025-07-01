<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';
  import type { User } from '$lib/types/core';
  
  export let user: User;
  export let showFollowButton: boolean = true;
  export let isFollowing: boolean = false;
  export let compact: boolean = false;
  
  const dispatch = createEventDispatcher<{
    follow: { user: User };
    unfollow: { user: User };
    viewProfile: { user: User };
  }>();
  
  function handleFollow() {
    if (isFollowing) {
      dispatch('unfollow', { user });
    } else {
      dispatch('follow', { user });
    }
  }
  
  function handleViewProfile() {
    dispatch('viewProfile', { user });
  }
  
  function formatJoinDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }
</script>

<div class="card variant-ghost-surface p-4 hover:variant-soft-surface transition-all group">
  <div class="flex items-start gap-4">
    <!-- Avatar -->
    <button on:click={handleViewProfile} class="flex-shrink-0">
      {#if user.avatar_url}
        <img 
          src={user.avatar_url} 
          alt={user.username} 
          class="w-12 h-12 rounded-full object-cover group-hover:scale-105 transition-transform" 
        />
      {:else}
        <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
          <span class="text-white font-bold">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
      {/if}
      
      {#if user.is_verified}
        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
          <Icon icon="lucide:check" class="w-2 h-2 text-white" />
        </div>
      {/if}
    </button>

    <!-- User Info -->
    <div class="flex-1 min-w-0">
      <button on:click={handleViewProfile} class="text-left">
        <h3 class="font-semibold text-surface-900-50-token group-hover:text-primary-500 transition-colors truncate">
          {user.display_name || user.username}
        </h3>
        {#if user.display_name}
          <p class="text-sm text-surface-500-400-token">@{user.username}</p>
        {/if}
      </button>
      
      {#if !compact && user.bio}
        <p class="text-sm text-surface-600-300-token mt-1 line-clamp-2">
          {user.bio}
        </p>
      {/if}
      
      <div class="flex items-center gap-3 mt-2 text-xs text-surface-500-400-token">
        {#if user.location}
          <div class="flex items-center gap-1">
            <Icon icon="lucide:map-pin" class="w-3 h-3" />
            <span>{user.location}</span>
          </div>
        {/if}
        
        <div class="flex items-center gap-1">
          <Icon icon="lucide:calendar" class="w-3 h-3" />
          <span>Joined {formatJoinDate(user.created_at)}</span>
        </div>
      </div>
      
      {#if user.stats}
        <div class="flex items-center gap-4 mt-2 text-xs text-surface-500-400-token">
          <span>{user.stats.total_games} games</span>
          <span>{user.stats.followers_count} followers</span>
          <span>{user.stats.following_count} following</span>
        </div>
      {/if}
    </div>

    <!-- Actions -->
    {#if showFollowButton}
      <button
        on:click={handleFollow}
        class="btn btn-sm"
        class:variant-filled-primary={!isFollowing}
        class:variant-ghost-surface={isFollowing}
      >
        <Icon 
          icon={isFollowing ? 'lucide:user-check' : 'lucide:user-plus'} 
          class="w-4 h-4 mr-1" 
        />
        {isFollowing ? 'Following' : 'Follow'}
      </button>
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