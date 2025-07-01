<script lang="ts">
  import Icon from '@iconify/svelte';
  
  export let privacyLevel: 'public' | 'friends' | 'private' = 'public';
  export let size: 'sm' | 'md' = 'md';
  export let showLabel: boolean = true;
  
  $: iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  $: textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  
  $: privacyConfig = {
    public: {
      icon: 'lucide:globe',
      label: 'Public',
      color: 'text-success-500',
      description: 'Visible to everyone'
    },
    friends: {
      icon: 'lucide:users',
      label: 'Friends Only',
      color: 'text-warning-500',
      description: 'Visible to friends only'
    },
    private: {
      icon: 'lucide:lock',
      label: 'Private',
      color: 'text-error-500',
      description: 'Only visible to you'
    }
  };
  
  $: config = privacyConfig[privacyLevel];
</script>

<div class="flex items-center gap-1" title={config.description}>
  <Icon icon={config.icon} class="{iconSize} {config.color}" />
  {#if showLabel}
    <span class="{textSize} {config.color} font-medium">
      {config.label}
    </span>
  {/if}
</div>