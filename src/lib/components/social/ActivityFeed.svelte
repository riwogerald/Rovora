<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { formatDistanceToNow } from 'date-fns';
  import Icon from '@iconify/svelte';
  import type { ActivityWithDetails } from '$lib/database/queries/social';

  export let activities: ActivityWithDetails[] = [];
  export let isLoading = false;
  export let hasMore = true;

  const dispatch = createEventDispatcher<{
    loadMore: void;
    viewGame: { gameId: string };
    viewCodexEntry: { entryId: string };
    viewUser: { userId: string };
  }>();

  function getActivityIcon(type: string): string {
    const iconMap: Record<string, string> = {
      game_added: 'lucide:plus',
      game_completed: 'lucide:check-circle',
      game_rated: 'lucide:star',
      game_started: 'lucide:play',
      codex_entry_created: 'lucide:book-open',
      achievement_unlocked: 'lucide:trophy',
      milestone_reached: 'lucide:flag',
      user_followed: 'lucide:user-plus',
      list_created: 'lucide:list',
      list_updated: 'lucide:edit-3',
      review_posted: 'lucide:message-square'
    };
    return iconMap[type] || 'lucide:activity';
  }

  function getActivityColor(type: string): string {
    const colorMap: Record<string, string> = {
      game_added: 'text-blue-500',
      game_completed: 'text-green-500',
      game_rated: 'text-yellow-500',
      game_started: 'text-purple-500',
      codex_entry_created: 'text-indigo-500',
      achievement_unlocked: 'text-orange-500',
      milestone_reached: 'text-pink-500',
      user_followed: 'text-cyan-500',
      list_created: 'text-teal-500',
      list_updated: 'text-lime-500',
      review_posted: 'text-rose-500'
    };
    return colorMap[type] || 'text-surface-500';
  }

  function formatActivityText(activity: ActivityWithDetails): string {
    const userName = activity.user.display_name || activity.user.username;
    
    switch (activity.type) {
      case 'game_added':
        return `${userName} added ${activity.game?.title} to their library`;
      case 'game_completed':
        return `${userName} completed ${activity.game?.title}`;
      case 'game_rated':
        return `${userName} rated ${activity.game?.title}`;
      case 'game_started':
        return `${userName} started playing ${activity.game?.title}`;
      case 'codex_entry_created':
        return `${userName} created a ${activity.codex_entry?.entry_type} entry for ${activity.game?.title}`;
      case 'achievement_unlocked':
        return `${userName} unlocked an achievement in ${activity.game?.title}`;
      case 'milestone_reached':
        return `${userName} reached a milestone in ${activity.game?.title}`;
      case 'user_followed':
        return `${userName} followed ${activity.target_user?.display_name || activity.target_user?.username}`;
      case 'list_created':
        return `${userName} created a new game list`;
      case 'list_updated':
        return `${userName} updated their game list`;
      case 'review_posted':
        return `${userName} posted a review for ${activity.game?.title}`;
      default:
        return `${userName} did something`;
    }
  }

  function handleActivityClick(activity: ActivityWithDetails) {
    if (activity.game_id) {
      dispatch('viewGame', { gameId: activity.game_id });
    } else if (activity.codex_entry_id) {
      dispatch('viewCodexEntry', { entryId: activity.codex_entry_id });
    } else if (activity.target_user_id) {
      dispatch('viewUser', { userId: activity.target_user_id });
    }
  }

  function handleLoadMore() {
    if (hasMore && !isLoading) {
      dispatch('loadMore');
    }
  }
</script>

<div class="activity-feed space-y-4">
  <!-- Activities List -->
  {#each activities as activity (activity.id)}
    <div 
      class="activity-item card p-4 hover:shadow-md transition-shadow cursor-pointer"
      on:click={() => handleActivityClick(activity)}
      on:keydown={(e) => e.key === 'Enter' && handleActivityClick(activity)}
      role="button"
      tabindex="0"
    >
      <div class="flex items-start gap-3">
        <!-- Activity Icon -->
        <div class="activity-icon flex-shrink-0">
          <div class="w-10 h-10 rounded-full bg-surface-100-800-token flex items-center justify-center">
            <Icon 
              icon={getActivityIcon(activity.type)} 
              class="w-5 h-5 {getActivityColor(activity.type)}"
            />
          </div>
        </div>

        <!-- Activity Content -->
        <div class="flex-1 min-w-0">
          <!-- User Avatar and Name -->
          <div class="flex items-center gap-2 mb-2">
            <div class="w-6 h-6 rounded-full bg-surface-300-600-token flex items-center justify-center">
              {#if activity.user.avatar_url}
                <img 
                  src={activity.user.avatar_url} 
                  alt={activity.user.username}
                  class="w-6 h-6 rounded-full object-cover"
                />
              {:else}
                <Icon icon="lucide:user" class="w-3 h-3" />
              {/if}
            </div>
            
            <button
              on:click|stopPropagation={() => dispatch('viewUser', { userId: activity.user_id })}
              class="font-medium text-sm text-surface-900-50-token hover:text-primary-500 transition-colors"
            >
              {activity.user.display_name || activity.user.username}
            </button>
            
            <span class="text-xs text-surface-500-400-token">
              {formatDistanceToNow(new Date(activity.created_at))} ago
            </span>
          </div>

          <!-- Activity Description -->
          <p class="text-surface-700-200-token mb-3">
            {formatActivityText(activity)}
          </p>

          <!-- Activity Media/Content -->
          <div class="activity-content">
            {#if activity.game}
              <div class="flex items-center gap-3 p-3 bg-surface-50-900-token rounded-lg">
                {#if activity.game.cover_image}
                  <img 
                    src={activity.game.cover_image} 
                    alt={activity.game.title}
                    class="w-12 h-16 object-cover rounded"
                  />
                {/if}
                <div>
                  <h4 class="font-medium text-surface-900-50-token">
                    {activity.game.title}
                  </h4>
                  <p class="text-sm text-surface-500-400-token">Game</p>
                </div>
              </div>
            {:else if activity.codex_entry}
              <div class="flex items-center gap-3 p-3 bg-surface-50-900-token rounded-lg">
                <div class="w-12 h-12 bg-primary-100-800-token rounded-lg flex items-center justify-center">
                  <Icon 
                    icon={activity.codex_entry.entry_type === 'review' ? 'lucide:star' : 'lucide:book-open'} 
                    class="w-6 h-6 text-primary-500"
                  />
                </div>
                <div>
                  <h4 class="font-medium text-surface-900-50-token">
                    {activity.codex_entry.title}
                  </h4>
                  <p class="text-sm text-surface-500-400-token capitalize">
                    {activity.codex_entry.entry_type.replace('_', ' ')}
                  </p>
                </div>
              </div>
            {:else if activity.target_user}
              <div class="flex items-center gap-3 p-3 bg-surface-50-900-token rounded-lg">
                <div class="w-12 h-12 bg-surface-300-600-token rounded-full flex items-center justify-center">
                  {#if activity.target_user.avatar_url}
                    <img 
                      src={activity.target_user.avatar_url} 
                      alt={activity.target_user.username}
                      class="w-12 h-12 rounded-full object-cover"
                    />
                  {:else}
                    <Icon icon="lucide:user" class="w-6 h-6" />
                  {/if}
                </div>
                <div>
                  <h4 class="font-medium text-surface-900-50-token">
                    {activity.target_user.display_name || activity.target_user.username}
                  </h4>
                  <p class="text-sm text-surface-500-400-token">User</p>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/each}

  <!-- Loading State -->
  {#if isLoading}
    <div class="flex items-center justify-center p-8">
      <Icon icon="lucide:loader-2" class="w-8 h-8 animate-spin text-surface-500-400-token" />
    </div>
  {/if}

  <!-- Load More Button -->
  {#if hasMore && !isLoading && activities.length > 0}
    <div class="text-center">
      <button
        on:click={handleLoadMore}
        class="btn variant-ghost-surface"
      >
        <Icon icon="lucide:chevron-down" class="w-4 h-4 mr-2" />
        Load More
      </button>
    </div>
  {/if}

  <!-- Empty State -->
  {#if activities.length === 0 && !isLoading}
    <div class="text-center p-12 text-surface-500-400-token">
      <Icon icon="lucide:users" class="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h3 class="text-lg font-medium mb-2">No Activity Yet</h3>
      <p class="max-w-md mx-auto">
        Follow some users to see their gaming activities, or start adding games to your library to create your own activity feed!
      </p>
    </div>
  {/if}
</div>

<style>
  .activity-item:hover {
    transform: translateY(-1px);
  }
  
  .activity-item:active {
    transform: translateY(0);
  }
</style>
