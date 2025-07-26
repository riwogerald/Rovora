<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';

  export let userId: string;
  export let isFollowing = false;
  export let isLoading = false;
  export let disabled = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let variant: 'filled' | 'outline' = 'filled';

  const dispatch = createEventDispatcher<{
    toggleFollow: { userId: string; action: 'follow' | 'unfollow' };
  }>();

  async function handleToggleFollow() {
    if (isLoading || disabled) return;
    
    const action = isFollowing ? 'unfollow' : 'follow';
    dispatch('toggleFollow', { userId, action });
  }

  $: buttonClass = [
    'btn',
    `btn-${size}`,
    variant === 'filled' 
      ? (isFollowing ? 'variant-filled-success' : 'variant-filled-primary')
      : (isFollowing ? 'variant-outline-success' : 'variant-outline-primary')
  ].join(' ');

  $: iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
</script>

<button
  class={buttonClass}
  {disabled}
  on:click={handleToggleFollow}
>
  {#if isLoading}
    <Icon icon="lucide:loader-2" class="{iconSize} mr-2 animate-spin" />
  {:else}
    <Icon 
      icon={isFollowing ? 'lucide:user-check' : 'lucide:user-plus'} 
      class="{iconSize} mr-2" 
    />
  {/if}
  {isFollowing ? 'Following' : 'Follow'}
</button>
