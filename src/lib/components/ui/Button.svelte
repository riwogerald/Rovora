<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';
  
  export let variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let loading = false;
  export let icon: string | undefined = undefined;
  export let iconPosition: 'left' | 'right' = 'left';
  export let href: string | undefined = undefined;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let fullWidth = false;
  
  const dispatch = createEventDispatcher();
  
  function handleClick(event: MouseEvent) {
    if (!disabled && !loading) {
      dispatch('click', event);
    }
  }
  
  $: classes = [
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    // Variants
    variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    variant === 'ghost' && 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    variant === 'success' && 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    // Sizes
    size === 'sm' && 'px-3 py-1.5 text-sm rounded-md',
    size === 'md' && 'px-4 py-2 text-sm rounded-lg',
    size === 'lg' && 'px-6 py-3 text-base rounded-lg',
    // Full width
    fullWidth && 'w-full'
  ].filter(Boolean).join(' ');
</script>

{#if href}
  <a
    {href}
    class={classes}
    class:pointer-events-none={disabled || loading}
    on:click={handleClick}
    {...$$restProps}
  >
    {#if loading}
      <Icon icon="lucide:loader-2" class="w-4 h-4 animate-spin {icon && iconPosition === 'left' ? 'mr-2' : icon && iconPosition === 'right' ? 'ml-2' : ''}" />
    {:else if icon && iconPosition === 'left'}
      <Icon {icon} class="w-4 h-4 {$$slots.default ? 'mr-2' : ''}" />
    {/if}
    
    <slot />
    
    {#if !loading && icon && iconPosition === 'right'}
      <Icon {icon} class="w-4 h-4 {$$slots.default ? 'ml-2' : ''}" />
    {/if}
  </a>
{:else}
  <button
    {type}
    {disabled}
    class={classes}
    on:click={handleClick}
    {...$$restProps}
  >
    {#if loading}
      <Icon icon="lucide:loader-2" class="w-4 h-4 animate-spin {icon && iconPosition === 'left' ? 'mr-2' : icon && iconPosition === 'right' ? 'ml-2' : ''}" />
    {:else if icon && iconPosition === 'left'}
      <Icon {icon} class="w-4 h-4 {$$slots.default ? 'mr-2' : ''}" />
    {/if}
    
    <slot />
    
    {#if !loading && icon && iconPosition === 'right'}
      <Icon {icon} class="w-4 h-4 {$$slots.default ? 'ml-2' : ''}" />
    {/if}
  </button>
{/if}