<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import Icon from '@iconify/svelte';
  
  export let open = false;
  export let placement: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' = 'bottom-start';
  export let offset = 8;
  export let closeOnClick = true;
  
  const dispatch = createEventDispatcher();
  
  let triggerElement: HTMLElement;
  let dropdownElement: HTMLElement;
  
  function toggle() {
    open = !open;
    dispatch(open ? 'open' : 'close');
  }
  
  function close() {
    open = false;
    dispatch('close');
  }
  
  function handleClickOutside(event: MouseEvent) {
    if (
      open &&
      triggerElement &&
      dropdownElement &&
      !triggerElement.contains(event.target as Node) &&
      !dropdownElement.contains(event.target as Node)
    ) {
      close();
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      close();
    }
  }
  
  function handleItemClick() {
    if (closeOnClick) {
      close();
    }
  }
  
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
  
  $: dropdownClasses = [
    'absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-48',
    placement === 'bottom-start' && 'top-full left-0',
    placement === 'bottom-end' && 'top-full right-0',
    placement === 'top-start' && 'bottom-full left-0',
    placement === 'top-end' && 'bottom-full right-0'
  ].filter(Boolean).join(' ');
  
  $: dropdownStyle = `margin-top: ${placement.startsWith('bottom') ? offset : -offset}px;`;
</script>

<div class="relative inline-block">
  <!-- Trigger -->
  <div bind:this={triggerElement} on:click={toggle} on:keydown={(e) => e.key === 'Enter' && toggle()}>
    <slot name="trigger" {open} {toggle} />
  </div>
  
  <!-- Dropdown -->
  {#if open}
    <div
      bind:this={dropdownElement}
      class={dropdownClasses}
      style={dropdownStyle}
      transition:scale={{ duration: 150, start: 0.95 }}
      on:click={handleItemClick}
    >
      <slot {close} />
    </div>
  {/if}
</div>