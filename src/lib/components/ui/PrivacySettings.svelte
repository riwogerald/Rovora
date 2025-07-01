<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';
  import PrivacyIndicator from './PrivacyIndicator.svelte';
  
  export let preferences: any;
  export let loading: boolean = false;
  
  const dispatch = createEventDispatcher<{
    save: { preferences: any };
  }>();
  
  let formData = {
    privacy_level: preferences?.privacy_level || 'public',
    show_playtime: preferences?.show_playtime ?? true,
    show_achievements: preferences?.show_achievements ?? true,
    show_activity: preferences?.show_activity ?? true,
    show_wishlist: preferences?.show_wishlist ?? true,
    show_reviews: preferences?.show_reviews ?? true,
    show_library: preferences?.show_library ?? true,
    show_codex: preferences?.show_codex ?? true,
    show_stats: preferences?.show_stats ?? true,
    show_gaming_accounts: preferences?.show_gaming_accounts ?? true,
    allow_friend_requests: preferences?.allow_friend_requests ?? true,
    show_online_status: preferences?.show_online_status ?? true,
    indexable_profile: preferences?.indexable_profile ?? true
  };
  
  function handleSave() {
    dispatch('save', { preferences: formData });
  }
  
  const privacyOptions = [
    {
      value: 'public',
      label: 'Public Profile',
      description: 'Anyone can view your profile and activity',
      icon: 'lucide:globe'
    },
    {
      value: 'friends',
      label: 'Friends Only',
      description: 'Only your friends can view your profile',
      icon: 'lucide:users'
    },
    {
      value: 'private',
      label: 'Private Profile',
      description: 'Only you can view your profile',
      icon: 'lucide:lock'
    }
  ];
  
  const visibilitySettings = [
    {
      key: 'show_playtime',
      label: 'Playtime Hours',
      description: 'Show how many hours you\'ve played each game',
      icon: 'lucide:clock'
    },
    {
      key: 'show_achievements',
      label: 'Achievements',
      description: 'Show your unlocked achievements and trophies',
      icon: 'lucide:trophy'
    },
    {
      key: 'show_activity',
      label: 'Activity Feed',
      description: 'Show your recent gaming activity',
      icon: 'lucide:activity'
    },
    {
      key: 'show_wishlist',
      label: 'Wishlist',
      description: 'Show games you want to play',
      icon: 'lucide:heart'
    },
    {
      key: 'show_reviews',
      label: 'Reviews & Ratings',
      description: 'Show your game reviews and ratings',
      icon: 'lucide:star'
    },
    {
      key: 'show_library',
      label: 'Game Library',
      description: 'Show your complete game collection',
      icon: 'lucide:library'
    },
    {
      key: 'show_codex',
      label: 'Codex Entries',
      description: 'Show your gaming journal entries',
      icon: 'lucide:book-open'
    },
    {
      key: 'show_stats',
      label: 'Gaming Statistics',
      description: 'Show your gaming stats and progress',
      icon: 'lucide:bar-chart'
    },
    {
      key: 'show_gaming_accounts',
      label: 'Gaming Accounts',
      description: 'Show your connected gaming platform accounts',
      icon: 'lucide:gamepad-2'
    }
  ];
  
  const socialSettings = [
    {
      key: 'allow_friend_requests',
      label: 'Friend Requests',
      description: 'Allow others to send you friend requests',
      icon: 'lucide:user-plus'
    },
    {
      key: 'show_online_status',
      label: 'Online Status',
      description: 'Show when you\'re online and active',
      icon: 'lucide:circle'
    },
    {
      key: 'indexable_profile',
      label: 'Search Engine Indexing',
      description: 'Allow search engines to index your public profile',
      icon: 'lucide:search'
    }
  ];
</script>

<div class="space-y-8">
  <!-- Profile Privacy Level -->
  <div>
    <h3 class="text-lg font-semibold text-surface-900-50-token mb-4 flex items-center gap-2">
      <Icon icon="lucide:shield" class="w-5 h-5" />
      Profile Privacy
    </h3>
    
    <div class="space-y-3">
      {#each privacyOptions as option}
        <label class="flex items-start gap-3 p-4 border border-surface-200-700-token rounded-lg cursor-pointer hover:bg-surface-100-800-token transition-colors"
               class:border-primary-500={formData.privacy_level === option.value}
               class:bg-primary-50={formData.privacy_level === option.value}
               class:dark:bg-primary-900/20={formData.privacy_level === option.value}>
          <input
            type="radio"
            name="privacy_level"
            value={option.value}
            bind:group={formData.privacy_level}
            class="radio mt-1"
          />
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <Icon icon={option.icon} class="w-4 h-4" />
              <span class="font-medium text-surface-900-50-token">{option.label}</span>
            </div>
            <p class="text-sm text-surface-600-300-token">{option.description}</p>
          </div>
        </label>
      {/each}
    </div>
    
    <div class="mt-4 p-4 bg-surface-100-800-token rounded-lg">
      <div class="flex items-center gap-2 mb-2">
        <Icon icon="lucide:info" class="w-4 h-4 text-primary-500" />
        <span class="text-sm font-medium text-surface-900-50-token">Current Privacy Level</span>
      </div>
      <PrivacyIndicator privacyLevel={formData.privacy_level} />
    </div>
  </div>

  <!-- Visibility Settings -->
  <div>
    <h3 class="text-lg font-semibold text-surface-900-50-token mb-4 flex items-center gap-2">
      <Icon icon="lucide:eye" class="w-5 h-5" />
      What Others Can See
    </h3>
    
    <div class="space-y-4">
      {#each visibilitySettings as setting}
        <div class="flex items-center justify-between p-4 bg-surface-100-800-token rounded-lg">
          <div class="flex items-start gap-3">
            <Icon icon={setting.icon} class="w-5 h-5 text-surface-500-400-token mt-0.5" />
            <div>
              <span class="font-medium text-surface-900-50-token">{setting.label}</span>
              <p class="text-sm text-surface-600-300-token">{setting.description}</p>
            </div>
          </div>
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={formData[setting.key]}
              class="checkbox"
              disabled={formData.privacy_level === 'private'}
            />
          </label>
        </div>
      {/each}
    </div>
    
    {#if formData.privacy_level === 'private'}
      <div class="mt-4 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon icon="lucide:lock" class="w-4 h-4 text-warning-600 dark:text-warning-400" />
          <span class="text-sm font-medium text-warning-700 dark:text-warning-300">
            Private Profile Active
          </span>
        </div>
        <p class="text-sm text-warning-600 dark:text-warning-400 mt-1">
          Individual visibility settings are disabled when your profile is private. Only you can see your profile content.
        </p>
      </div>
    {/if}
  </div>

  <!-- Social Settings -->
  <div>
    <h3 class="text-lg font-semibold text-surface-900-50-token mb-4 flex items-center gap-2">
      <Icon icon="lucide:users" class="w-5 h-5" />
      Social Interactions
    </h3>
    
    <div class="space-y-4">
      {#each socialSettings as setting}
        <div class="flex items-center justify-between p-4 bg-surface-100-800-token rounded-lg">
          <div class="flex items-start gap-3">
            <Icon icon={setting.icon} class="w-5 h-5 text-surface-500-400-token mt-0.5" />
            <div>
              <span class="font-medium text-surface-900-50-token">{setting.label}</span>
              <p class="text-sm text-surface-600-300-token">{setting.description}</p>
            </div>
          </div>
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={formData[setting.key]}
              class="checkbox"
            />
          </label>
        </div>
      {/each}
    </div>
  </div>

  <!-- Privacy Tips -->
  <div class="p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
    <h4 class="font-semibold text-primary-700 dark:text-primary-300 mb-3 flex items-center gap-2">
      <Icon icon="lucide:lightbulb" class="w-5 h-5" />
      Privacy Tips
    </h4>
    <ul class="space-y-2 text-sm text-primary-600 dark:text-primary-400">
      <li class="flex items-start gap-2">
        <Icon icon="lucide:check" class="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Friends-only profiles are visible to users you've accepted as friends</span>
      </li>
      <li class="flex items-start gap-2">
        <Icon icon="lucide:check" class="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>You can always change these settings later in your profile preferences</span>
      </li>
      <li class="flex items-start gap-2">
        <Icon icon="lucide:check" class="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Private codex entries are never visible to others, regardless of profile settings</span>
      </li>
      <li class="flex items-start gap-2">
        <Icon icon="lucide:check" class="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>Disabling search indexing helps keep your profile private from search engines</span>
      </li>
    </ul>
  </div>

  <!-- Save Button -->
  <div class="flex justify-end">
    <button
      type="button"
      on:click={handleSave}
      disabled={loading}
      class="btn variant-filled-primary"
    >
      {#if loading}
        <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
        Saving...
      {:else}
        <Icon icon="lucide:save" class="w-4 h-4 mr-2" />
        Save Privacy Settings
      {/if}
    </button>
  </div>
</div>