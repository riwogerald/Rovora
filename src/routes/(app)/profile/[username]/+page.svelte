<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '@iconify/svelte';
  import ControllerRating from '$lib/components/ui/ControllerRating.svelte';
  
  export let data;
  
  $: user = data.user;
  $: stats = data.stats;
  $: recentGames = data.recentGames;
  $: isOwnProfile = data.isOwnProfile;
  $: isFollowing = data.isFollowing;
  
  function formatJoinDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }
  
  function formatPlaytime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes}m`;
    if (hours < 100) return `${hours}h ${minutes % 60}m`;
    return `${hours}h`;
  }
  
  function getPlatformIcon(slug: string): string {
    const iconMap: Record<string, string> = {
      steam: 'mdi:steam',
      xbox: 'mdi:microsoft-xbox',
      playstation: 'mdi:sony-playstation',
      nintendo: 'mdi:nintendo-switch',
      epic: 'simple-icons:epicgames',
      gog: 'simple-icons:gog-dot-com'
    };
    return iconMap[slug] || 'lucide:gamepad-2';
  }
</script>

<svelte:head>
  <title>{user?.display_name || user?.username} - Rovora</title>
  <meta name="description" content="View {user?.display_name || user?.username}'s gaming profile on Rovora" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-6xl mx-auto">
    <!-- Profile Header -->
    <div class="card variant-ghost-surface p-8 mb-8">
      <div class="flex flex-col md:flex-row items-start gap-6">
        <!-- Avatar -->
        <div class="relative">
          {#if user?.avatar_url}
            <img src={user.avatar_url} alt={user.username} class="w-24 h-24 rounded-full object-cover" />
          {:else}
            <div class="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span class="text-white text-3xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          {/if}
          
          {#if user?.is_verified}
            <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <Icon icon="lucide:check" class="w-4 h-4 text-white" />
            </div>
          {/if}
        </div>

        <!-- Profile Info -->
        <div class="flex-1">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 class="text-3xl font-bold text-surface-900-50-token">
                {user?.display_name || user?.username}
              </h1>
              {#if user?.display_name}
                <p class="text-surface-500-400-token">@{user.username}</p>
              {/if}
            </div>
            
            <div class="flex items-center gap-3">
              {#if !isOwnProfile}
                <button class="btn variant-filled-primary">
                  <Icon icon={isFollowing ? 'lucide:user-check' : 'lucide:user-plus'} class="w-4 h-4 mr-2" />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button class="btn variant-ghost-surface">
                  <Icon icon="lucide:message-circle" class="w-4 h-4 mr-2" />
                  Message
                </button>
              {:else}
                <a href="/profile" class="btn variant-ghost-surface">
                  <Icon icon="lucide:settings" class="w-4 h-4 mr-2" />
                  Edit Profile
                </a>
              {/if}
            </div>
          </div>

          <!-- Bio -->
          {#if user?.bio}
            <p class="text-surface-700-200-token mb-4 leading-relaxed">
              {user.bio}
            </p>
          {/if}

          <!-- Profile Details -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-surface-500-400-token">
            {#if user?.location}
              <div class="flex items-center gap-1">
                <Icon icon="lucide:map-pin" class="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            {/if}
            
            {#if user?.website}
              <a href={user.website} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 hover:text-primary-500 transition-colors">
                <Icon icon="lucide:link" class="w-4 h-4" />
                <span>Website</span>
              </a>
            {/if}
            
            <div class="flex items-center gap-1">
              <Icon icon="lucide:calendar" class="w-4 h-4" />
              <span>Joined {formatJoinDate(user?.created_at || '')}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Gaming Accounts -->
      {#if user?.steam_id || user?.xbox_gamertag || user?.psn_id || user?.nintendo_friend_code}
        <div class="border-t border-surface-200-700-token mt-6 pt-6">
          <h3 class="text-lg font-semibold text-surface-900-50-token mb-3">
            Gaming Accounts
          </h3>
          <div class="flex flex-wrap gap-3">
            {#if user.steam_id}
              <div class="flex items-center gap-2 px-3 py-2 bg-surface-100-800-token rounded-lg">
                <Icon icon="mdi:steam" class="w-5 h-5" />
                <span class="text-sm">{user.steam_id}</span>
              </div>
            {/if}
            {#if user.xbox_gamertag}
              <div class="flex items-center gap-2 px-3 py-2 bg-surface-100-800-token rounded-lg">
                <Icon icon="mdi:microsoft-xbox" class="w-5 h-5" />
                <span class="text-sm">{user.xbox_gamertag}</span>
              </div>
            {/if}
            {#if user.psn_id}
              <div class="flex items-center gap-2 px-3 py-2 bg-surface-100-800-token rounded-lg">
                <Icon icon="mdi:sony-playstation" class="w-5 h-5" />
                <span class="text-sm">{user.psn_id}</span>
              </div>
            {/if}
            {#if user.nintendo_friend_code}
              <div class="flex items-center gap-2 px-3 py-2 bg-surface-100-800-token rounded-lg">
                <Icon icon="mdi:nintendo-switch" class="w-5 h-5" />
                <span class="text-sm">{user.nintendo_friend_code}</span>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Stats Sidebar -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Gaming Stats -->
        <div class="card variant-ghost-surface p-6">
          <h2 class="text-xl font-semibold text-surface-900-50-token mb-4">
            Gaming Stats
          </h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-surface-600-300-token">Games Tracked</span>
              <span class="font-semibold text-surface-900-50-token">{stats?.total_games || 0}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-surface-600-300-token">Completed</span>
              <span class="font-semibold text-success-500">{stats?.games_completed || 0}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-surface-600-300-token">Currently Playing</span>
              <span class="font-semibold text-primary-500">{stats?.games_playing || 0}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-surface-600-300-token">Total Playtime</span>
              <span class="font-semibold text-surface-900-50-token">
                {formatPlaytime(stats?.total_playtime || 0)}
              </span>
            </div>
            
            {#if stats?.average_rating > 0}
              <div class="flex items-center justify-between">
                <span class="text-surface-600-300-token">Avg Rating</span>
                <div class="flex items-center gap-2">
                  <ControllerRating value={Math.round(stats.average_rating)} readonly size="sm" showValue={false} />
                  <span class="text-sm font-medium">{stats.average_rating.toFixed(1)}</span>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Social Stats -->
        <div class="card variant-ghost-surface p-6">
          <h2 class="text-xl font-semibold text-surface-900-50-token mb-4">
            Social
          </h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-surface-600-300-token">Followers</span>
              <span class="font-semibold text-surface-900-50-token">{stats?.followers_count || 0}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-surface-600-300-token">Following</span>
              <span class="font-semibold text-surface-900-50-token">{stats?.following_count || 0}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-surface-600-300-token">Codex Entries</span>
              <span class="font-semibold text-secondary-500">{stats?.codex_entries || 0}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-surface-600-300-token">Reviews</span>
              <span class="font-semibold text-tertiary-500">{stats?.reviews_written || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Recent Games -->
        <div class="card variant-ghost-surface p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-surface-900-50-token">
              Recent Games
            </h2>
            <a href="/profile/{user?.username}/library" class="text-primary-500 hover:text-primary-400 text-sm">
              View all →
            </a>
          </div>
          
          {#if recentGames?.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each recentGames as gameEntry}
                <div class="flex items-center gap-4 p-4 bg-surface-100-800-token rounded-lg">
                  {#if gameEntry.game.cover_image}
                    <img src={gameEntry.game.cover_image} alt={gameEntry.game.title} class="w-12 h-12 rounded object-cover" />
                  {:else}
                    <div class="w-12 h-12 bg-surface-200-700-token rounded flex items-center justify-center">
                      <Icon icon="lucide:gamepad-2" class="w-6 h-6 text-surface-400-500-token" />
                    </div>
                  {/if}
                  
                  <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-surface-900-50-token truncate">
                      {gameEntry.game.title}
                    </h3>
                    <div class="flex items-center gap-2 text-sm text-surface-500-400-token">
                      <Icon icon={getPlatformIcon(gameEntry.platform.slug)} class="w-4 h-4" />
                      <span class="capitalize">{gameEntry.status}</span>
                      {#if gameEntry.playtime_hours}
                        <span>• {gameEntry.playtime_hours}h</span>
                      {/if}
                    </div>
                  </div>
                  
                  {#if gameEntry.rating}
                    <ControllerRating value={gameEntry.rating.value} readonly size="sm" showValue={false} />
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8">
              <Icon icon="lucide:gamepad-2" class="w-12 h-12 text-surface-400-500-token mx-auto mb-4" />
              <p class="text-surface-500-400-token">
                {isOwnProfile ? "You haven't" : `${user?.username} hasn't`} tracked any games yet
              </p>
            </div>
          {/if}
        </div>

        <!-- Recent Activity -->
        <div class="card variant-ghost-surface p-6">
          <h2 class="text-xl font-semibold text-surface-900-50-token mb-6">
            Recent Activity
          </h2>
          
          <div class="text-center py-8">
            <Icon icon="lucide:activity" class="w-12 h-12 text-surface-400-500-token mx-auto mb-4" />
            <p class="text-surface-500-400-token">
              No recent activity to show
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>