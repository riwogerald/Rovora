<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';
  
  export let value: number = 0;
  export let max: number = 5;
  export let readonly: boolean = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let showValue: boolean = true;
  export let label: string = '';
  
  const dispatch = createEventDispatcher<{
    change: { value: number };
  }>();
  
  function handleClick(rating: number) {
    if (readonly) return;
    
    // Allow clicking the same rating to clear it
    const newValue = value === rating ? 0 : rating;
    value = newValue;
    dispatch('change', { value: newValue });
  }
  
  $: sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  $: iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
</script>

<div class="controller-rating-container">
  {#if label}
    <label class="block text-sm font-medium text-surface-600-300-token mb-2">
      {label}
    </label>
  {/if}
  
  <div class="flex items-center gap-2">
    <div class="controller-rating flex gap-1">
      {#each Array(max) as _, index}
        {@const rating = index + 1}
        {@const isActive = rating <= value}
        {@const isHovered = false} <!-- TODO: Add hover state -->
        
        <button
          type="button"
          class="controller-btn {sizeClasses[size]} {isActive ? 'active' : 'inactive'}"
          class:cursor-pointer={!readonly}
          class:cursor-default={readonly}
          disabled={readonly}
          on:click={() => handleClick(rating)}
          aria-label="Rate {rating} out of {max} controllers"
        >
          <Icon 
            icon="lucide:gamepad-2" 
            class="{iconSize[size]} {isActive ? 'text-white' : 'text-surface-400-500-token'}"
          />
        </button>
      {/each}
    </div>
    
    {#if showValue && value > 0}
      <span class="text-sm font-medium text-surface-600-300-token ml-2">
        {value}/{max}
      </span>
    {/if}
  </div>
</div>

<style>
  .controller-btn {
    transition: all 0.2s ease;
  }
  
  .controller-btn:hover:not(:disabled) {
    transform: scale(1.1);
  }
  
  .controller-btn.active {
    animation: controllerPress 0.1s ease-in-out;
  }
  
  .controller-btn:focus-visible {
    outline: 2px solid rgb(var(--color-primary-500));
    outline-offset: 2px;
  }
</style>