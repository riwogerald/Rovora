<script lang="ts">
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { updateProfileSchema, type UpdateProfileData } from '$lib/auth/validation';
  import Icon from '@iconify/svelte';
  import { toast } from 'svelte-sonner';
  
  export let data;
  
  let activeTab = 'profile';
  let loading = false;
  let errors: Record<string, string[]> = {};
  
  $: user = data.user;
  $: preferences = data.preferences;
  $: platforms = data.platforms;
  
  let formData: UpdateProfileData = {
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    steam_id: user?.steam_id || '',
    xbox_gamertag: user?.xbox_gamertag || '',
    psn_id: user?.psn_id || '',
    nintendo_friend_code: user?.nintendo_friend_code || '',
    epic_username: user?.epic_username || '',
    gog_username: user?.gog_username || ''
  };
  
  $: if ($page.form?.errors) {
    errors = $page.form.errors;
  }
  
  $: if ($page.form?.message) {
    if ($page.form.success) {
      toast.success($page.form.message);
    } else {
      toast.error($page.form.message);
    }
  }
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'lucide:user' },
    { id: 'gaming', label: 'Gaming', icon: 'lucide:gamepad-2' },
    { id: 'privacy', label: 'Privacy', icon: 'lucide:shield' },
    { id: 'notifications', label: 'Notifications', icon: 'lucide:bell' },
    { id: 'account', label: 'Account', icon: 'lucide:settings' }
  ];
  
  function getPlatformIcon(slug: string): string {
    const iconMap: Record<string, string> = {
      steam: 'mdi:steam',
      xbox: 'mdi:microsoft-xbox',
      playstation: 'mdi:sony-playstation',
      nintendo: 'mdi:nintendo-switch',
      epic: 'simple-icons:epicgames',
      gog: 'simple-icons:gog-dot-com',
      pc: 'lucide:monitor'
    };
    return iconMap[slug] || 'lucide:gamepad-2';
  }
</script>

<svelte:head>
  <title>Profile Settings - Rovora</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900-50-token mb-2">
        Profile Settings
      </h1>
      <p class="text-surface-600-300-token">
        Customize your Rovora profile and preferences
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar Navigation -->
      <div class="lg:col-span-1">
        <nav class="card variant-ghost-surface p-4 sticky top-4">
          <ul class="space-y-2">
            {#each tabs as tab}
              <li>
                <button
                  on:click={() => activeTab = tab.id}
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                  class:variant-filled-primary={activeTab === tab.id}
                  class:variant-ghost-surface={activeTab !== tab.id}
                >
                  <Icon icon={tab.icon} class="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              </li>
            {/each}
          </ul>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-3">
        <!-- Profile Tab -->
        {#if activeTab === 'profile'}
          <div class="card variant-ghost-surface p-6">
            <h2 class="text-xl font-semibold text-surface-900-50-token mb-6">
              Profile Information
            </h2>
            
            <form
              method="POST"
              action="?/updateProfile"
              class="space-y-6"
              use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                  loading = false;
                  await update();
                };
              }}
            >
              <!-- Avatar Section -->
              <div class="flex items-center gap-6">
                <div class="relative">
                  {#if user?.avatar_url}
                    <img src={user.avatar_url} alt={user.username} class="w-20 h-20 rounded-full object-cover" />
                  {:else}
                    <div class="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-2xl font-bold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  {/if}
                  <button type="button" class="absolute -bottom-1 -right-1 btn-icon btn-sm variant-filled-surface">
                    <Icon icon="lucide:camera" class="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 class="font-semibold text-surface-900-50-token">{user?.username}</h3>
                  <p class="text-sm text-surface-500-400-token">
                    Member since {new Date(user?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Display Name -->
                <div>
                  <label for="display_name" class="block text-sm font-medium text-surface-700-200-token mb-2">
                    Display Name
                  </label>
                  <input
                    id="display_name"
                    name="display_name"
                    type="text"
                    bind:value={formData.display_name}
                    class="input w-full"
                    class:input-error={errors.display_name?.length > 0}
                    placeholder="Your display name"
                  />
                  {#if errors.display_name?.length > 0}
                    <p class="mt-1 text-sm text-error-500">{errors.display_name[0]}</p>
                  {/if}
                </div>

                <!-- Location -->
                <div>
                  <label for="location" class="block text-sm font-medium text-surface-700-200-token mb-2">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    bind:value={formData.location}
                    class="input w-full"
                    class:input-error={errors.location?.length > 0}
                    placeholder="Your location"
                  />
                  {#if errors.location?.length > 0}
                    <p class="mt-1 text-sm text-error-500">{errors.location[0]}</p>
                  {/if}
                </div>
              </div>

              <!-- Bio -->
              <div>
                <label for="bio" class="block text-sm font-medium text-surface-700-200-token mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  bind:value={formData.bio}
                  class="textarea w-full"
                  class:input-error={errors.bio?.length > 0}
                  placeholder="Tell us about yourself and your gaming interests..."
                ></textarea>
                <p class="mt-1 text-xs text-surface-500-400-token">
                  {(formData.bio || '').length}/500 characters
                </p>
                {#if errors.bio?.length > 0}
                  <p class="mt-1 text-sm text-error-500">{errors.bio[0]}</p>
                {/if}
              </div>

              <!-- Website -->
              <div>
                <label for="website" class="block text-sm font-medium text-surface-700-200-token mb-2">
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  bind:value={formData.website}
                  class="input w-full"
                  class:input-error={errors.website?.length > 0}
                  placeholder="https://your-website.com"
                />
                {#if errors.website?.length > 0}
                  <p class="mt-1 text-sm text-error-500">{errors.website[0]}</p>
                {/if}
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  class="btn variant-filled-primary"
                >
                  {#if loading}
                    <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  {:else}
                    <Icon icon="lucide:save" class="w-4 h-4 mr-2" />
                    Save Changes
                  {/if}
                </button>
              </div>
            </form>
          </div>
        {/if}

        <!-- Gaming Tab -->
        {#if activeTab === 'gaming'}
          <div class="card variant-ghost-surface p-6">
            <h2 class="text-xl font-semibold text-surface-900-50-token mb-6">
              Gaming Accounts
            </h2>
            
            <form
              method="POST"
              action="?/updateGaming"
              class="space-y-6"
              use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                  loading = false;
                  await update();
                };
              }}
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Steam ID -->
                <div>
                  <label for="steam_id" class="flex items-center gap-2 text-sm font-medium text-surface-700-200-token mb-2">
                    <Icon icon="mdi:steam" class="w-5 h-5" />
                    Steam ID
                  </label>
                  <input
                    id="steam_id"
                    name="steam_id"
                    type="text"
                    bind:value={formData.steam_id}
                    class="input w-full"
                    placeholder="Your Steam ID"
                  />
                </div>

                <!-- Xbox Gamertag -->
                <div>
                  <label for="xbox_gamertag" class="flex items-center gap-2 text-sm font-medium text-surface-700-200-token mb-2">
                    <Icon icon="mdi:microsoft-xbox" class="w-5 h-5" />
                    Xbox Gamertag
                  </label>
                  <input
                    id="xbox_gamertag"
                    name="xbox_gamertag"
                    type="text"
                    bind:value={formData.xbox_gamertag}
                    class="input w-full"
                    placeholder="Your Xbox Gamertag"
                  />
                </div>

                <!-- PSN ID -->
                <div>
                  <label for="psn_id" class="flex items-center gap-2 text-sm font-medium text-surface-700-200-token mb-2">
                    <Icon icon="mdi:sony-playstation" class="w-5 h-5" />
                    PSN ID
                  </label>
                  <input
                    id="psn_id"
                    name="psn_id"
                    type="text"
                    bind:value={formData.psn_id}
                    class="input w-full"
                    placeholder="Your PlayStation Network ID"
                  />
                </div>

                <!-- Nintendo Friend Code -->
                <div>
                  <label for="nintendo_friend_code" class="flex items-center gap-2 text-sm font-medium text-surface-700-200-token mb-2">
                    <Icon icon="mdi:nintendo-switch" class="w-5 h-5" />
                    Nintendo Friend Code
                  </label>
                  <input
                    id="nintendo_friend_code"
                    name="nintendo_friend_code"
                    type="text"
                    bind:value={formData.nintendo_friend_code}
                    class="input w-full"
                    placeholder="SW-0000-0000-0000"
                  />
                </div>

                <!-- Epic Username -->
                <div>
                  <label for="epic_username" class="flex items-center gap-2 text-sm font-medium text-surface-700-200-token mb-2">
                    <Icon icon="simple-icons:epicgames" class="w-5 h-5" />
                    Epic Games Username
                  </label>
                  <input
                    id="epic_username"
                    name="epic_username"
                    type="text"
                    bind:value={formData.epic_username}
                    class="input w-full"
                    placeholder="Your Epic Games username"
                  />
                </div>

                <!-- GOG Username -->
                <div>
                  <label for="gog_username" class="flex items-center gap-2 text-sm font-medium text-surface-700-200-token mb-2">
                    <Icon icon="simple-icons:gog-dot-com" class="w-5 h-5" />
                    GOG Username
                  </label>
                  <input
                    id="gog_username"
                    name="gog_username"
                    type="text"
                    bind:value={formData.gog_username}
                    class="input w-full"
                    placeholder="Your GOG username"
                  />
                </div>
              </div>

              <!-- Gaming Preferences -->
              <div class="border-t border-surface-200-700-token pt-6">
                <h3 class="text-lg font-semibold text-surface-900-50-token mb-4">
                  Gaming Preferences
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Default Platform -->
                  <div>
                    <label for="default_platform_id" class="block text-sm font-medium text-surface-700-200-token mb-2">
                      Default Platform
                    </label>
                    <select
                      id="default_platform_id"
                      name="default_platform_id"
                      class="select w-full"
                    >
                      <option value="">Select a platform</option>
                      {#each platforms as platform}
                        <option value={platform.id} selected={preferences?.default_platform_id === platform.id}>
                          {platform.name}
                        </option>
                      {/each}
                    </select>
                  </div>

                  <!-- Rating System -->
                  <div>
                    <label for="preferred_rating_system" class="block text-sm font-medium text-surface-700-200-token mb-2">
                      Preferred Rating System
                    </label>
                    <select
                      id="preferred_rating_system"
                      name="preferred_rating_system"
                      class="select w-full"
                    >
                      <option value="controller" selected={preferences?.preferred_rating_system === 'controller'}>
                        Controllers (1-5 🎮)
                      </option>
                      <option value="stars" selected={preferences?.preferred_rating_system === 'stars'}>
                        Stars (1-5 ⭐)
                      </option>
                      <option value="numeric" selected={preferences?.preferred_rating_system === 'numeric'}>
                        Numeric (1-10)
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Auto Import -->
                <div class="mt-4">
                  <label class="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="auto_import_steam"
                      class="checkbox"
                      checked={preferences?.auto_import_steam}
                    />
                    <div>
                      <span class="text-sm font-medium text-surface-700-200-token">
                        Auto-import Steam library
                      </span>
                      <p class="text-xs text-surface-500-400-token">
                        Automatically sync your Steam games and playtime
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  class="btn variant-filled-primary"
                >
                  {#if loading}
                    <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  {:else}
                    <Icon icon="lucide:save" class="w-4 h-4 mr-2" />
                    Save Changes
                  {/if}
                </button>
              </div>
            </form>
          </div>
        {/if}

        <!-- Privacy Tab -->
        {#if activeTab === 'privacy'}
          <div class="card variant-ghost-surface p-6">
            <h2 class="text-xl font-semibold text-surface-900-50-token mb-6">
              Privacy Settings
            </h2>
            
            <form
              method="POST"
              action="?/updatePrivacy"
              class="space-y-6"
              use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                  loading = false;
                  await update();
                };
              }}
            >
              <!-- Privacy Level -->
              <div>
                <label for="privacy_level" class="block text-sm font-medium text-surface-700-200-token mb-2">
                  Profile Visibility
                </label>
                <select
                  id="privacy_level"
                  name="privacy_level"
                  class="select w-full"
                >
                  <option value="public" selected={preferences?.privacy_level === 'public'}>
                    Public - Anyone can view your profile
                  </option>
                  <option value="friends" selected={preferences?.privacy_level === 'friends'}>
                    Friends Only - Only friends can view your profile
                  </option>
                  <option value="private" selected={preferences?.privacy_level === 'private'}>
                    Private - Only you can view your profile
                  </option>
                </select>
              </div>

              <!-- Visibility Options -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-surface-900-50-token">
                  What others can see
                </h3>
                
                <div class="space-y-3">
                  <label class="flex items-center justify-between">
                    <div>
                      <span class="text-sm font-medium text-surface-700-200-token">Playtime</span>
                      <p class="text-xs text-surface-500-400-token">Show your game playtime hours</p>
                    </div>
                    <input
                      type="checkbox"
                      name="show_playtime"
                      class="checkbox"
                      checked={preferences?.show_playtime}
                    />
                  </label>

                  <label class="flex items-center justify-between">
                    <div>
                      <span class="text-sm font-medium text-surface-700-200-token">Achievements</span>
                      <p class="text-xs text-surface-500-400-token">Show your unlocked achievements</p>
                    </div>
                    <input
                      type="checkbox"
                      name="show_achievements"
                      class="checkbox"
                      checked={preferences?.show_achievements}
                    />
                  </label>

                  <label class="flex items-center justify-between">
                    <div>
                      <span class="text-sm font-medium text-surface-700-200-token">Activity Feed</span>
                      <p class="text-xs text-surface-500-400-token">Show your gaming activity</p>
                    </div>
                    <input
                      type="checkbox"
                      name="show_activity"
                      class="checkbox"
                      checked={preferences?.show_activity}
                    />
                  </label>

                  <label class="flex items-center justify-between">
                    <div>
                      <span class="text-sm font-medium text-surface-700-200-token">Wishlist</span>
                      <p class="text-xs text-surface-500-400-token">Show your game wishlist</p>
                    </div>
                    <input
                      type="checkbox"
                      name="show_wishlist"
                      class="checkbox"
                      checked={preferences?.show_wishlist}
                    />
                  </label>

                  <label class="flex items-center justify-between">
                    <div>
                      <span class="text-sm font-medium text-surface-700-200-token">Reviews</span>
                      <p class="text-xs text-surface-500-400-token">Show your game reviews</p>
                    </div>
                    <input
                      type="checkbox"
                      name="show_reviews"
                      class="checkbox"
                      checked={preferences?.show_reviews}
                    />
                  </label>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  class="btn variant-filled-primary"
                >
                  {#if loading}
                    <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  {:else}
                    <Icon icon="lucide:save" class="w-4 h-4 mr-2" />
                    Save Changes
                  {/if}
                </button>
              </div>
            </form>
          </div>
        {/if}

        <!-- Notifications Tab -->
        {#if activeTab === 'notifications'}
          <div class="card variant-ghost-surface p-6">
            <h2 class="text-xl font-semibold text-surface-900-50-token mb-6">
              Notification Preferences
            </h2>
            
            <form
              method="POST"
              action="?/updateNotifications"
              class="space-y-6"
              use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                  loading = false;
                  await update();
                };
              }}
            >
              <div class="space-y-6">
                <!-- Email Notifications -->
                <div>
                  <h3 class="text-lg font-semibold text-surface-900-50-token mb-4">
                    Email Notifications
                  </h3>
                  
                  <div class="space-y-3">
                    <label class="flex items-center justify-between">
                      <div>
                        <span class="text-sm font-medium text-surface-700-200-token">Email notifications</span>
                        <p class="text-xs text-surface-500-400-token">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        name="email_notifications"
                        class="checkbox"
                        checked={preferences?.email_notifications}
                      />
                    </label>

                    <label class="flex items-center justify-between">
                      <div>
                        <span class="text-sm font-medium text-surface-700-200-token">Friend requests</span>
                        <p class="text-xs text-surface-500-400-token">When someone sends you a friend request</p>
                      </div>
                      <input
                        type="checkbox"
                        name="friend_requests"
                        class="checkbox"
                        checked={preferences?.friend_requests}
                      />
                    </label>

                    <label class="flex items-center justify-between">
                      <div>
                        <span class="text-sm font-medium text-surface-700-200-token">Game updates</span>
                        <p class="text-xs text-surface-500-400-token">Updates about games in your library</p>
                      </div>
                      <input
                        type="checkbox"
                        name="game_updates"
                        class="checkbox"
                        checked={preferences?.game_updates}
                      />
                    </label>

                    <label class="flex items-center justify-between">
                      <div>
                        <span class="text-sm font-medium text-surface-700-200-token">Social activity</span>
                        <p class="text-xs text-surface-500-400-token">Activity from people you follow</p>
                      </div>
                      <input
                        type="checkbox"
                        name="social_activity"
                        class="checkbox"
                        checked={preferences?.social_activity}
                      />
                    </label>
                  </div>
                </div>

                <!-- Push Notifications -->
                <div class="border-t border-surface-200-700-token pt-6">
                  <h3 class="text-lg font-semibold text-surface-900-50-token mb-4">
                    Push Notifications
                  </h3>
                  
                  <label class="flex items-center justify-between">
                    <div>
                      <span class="text-sm font-medium text-surface-700-200-token">Browser notifications</span>
                      <p class="text-xs text-surface-500-400-token">Receive push notifications in your browser</p>
                    </div>
                    <input
                      type="checkbox"
                      name="push_notifications"
                      class="checkbox"
                      checked={preferences?.push_notifications}
                    />
                  </label>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  class="btn variant-filled-primary"
                >
                  {#if loading}
                    <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  {:else}
                    <Icon icon="lucide:save" class="w-4 h-4 mr-2" />
                    Save Changes
                  {/if}
                </button>
              </div>
            </form>
          </div>
        {/if}

        <!-- Account Tab -->
        {#if activeTab === 'account'}
          <div class="space-y-6">
            <!-- Change Password -->
            <div class="card variant-ghost-surface p-6">
              <h2 class="text-xl font-semibold text-surface-900-50-token mb-6">
                Change Password
              </h2>
              
              <form
                method="POST"
                action="?/changePassword"
                class="space-y-4"
                use:enhance={() => {
                  loading = true;
                  return async ({ update }) => {
                    loading = false;
                    await update();
                  };
                }}
              >
                <div>
                  <label for="current_password" class="block text-sm font-medium text-surface-700-200-token mb-2">
                    Current Password
                  </label>
                  <input
                    id="current_password"
                    name="current_password"
                    type="password"
                    class="input w-full"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label for="new_password" class="block text-sm font-medium text-surface-700-200-token mb-2">
                    New Password
                  </label>
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    class="input w-full"
                    placeholder="Enter your new password"
                  />
                </div>

                <div>
                  <label for="confirm_password" class="block text-sm font-medium text-surface-700-200-token mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    class="input w-full"
                    placeholder="Confirm your new password"
                  />
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    class="btn variant-filled-primary"
                  >
                    {#if loading}
                      <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    {:else}
                      <Icon icon="lucide:key" class="w-4 h-4 mr-2" />
                      Update Password
                    {/if}
                  </button>
                </div>
              </form>
            </div>

            <!-- Account Actions -->
            <div class="card variant-ghost-surface p-6">
              <h2 class="text-xl font-semibold text-surface-900-50-token mb-6">
                Account Actions
              </h2>
              
              <div class="space-y-4">
                <!-- Export Data -->
                <div class="flex items-center justify-between p-4 border border-surface-200-700-token rounded-lg">
                  <div>
                    <h3 class="font-medium text-surface-900-50-token">Export Data</h3>
                    <p class="text-sm text-surface-500-400-token">Download all your Rovora data</p>
                  </div>
                  <button class="btn variant-ghost-surface">
                    <Icon icon="lucide:download" class="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>

                <!-- Delete Account -->
                <div class="flex items-center justify-between p-4 border border-error-500 rounded-lg bg-error-50 dark:bg-error-900/20">
                  <div>
                    <h3 class="font-medium text-error-700 dark:text-error-300">Delete Account</h3>
                    <p class="text-sm text-error-600 dark:text-error-400">Permanently delete your account and all data</p>
                  </div>
                  <button class="btn variant-filled-error">
                    <Icon icon="lucide:trash-2" class="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>