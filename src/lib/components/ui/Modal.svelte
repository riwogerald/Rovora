<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import Icon from '@iconify/svelte';
  
  export let open = false;
  export let title = '';
  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  export let closable = true;
  export let closeOnBackdrop = true;
  export let closeOnEscape = true;
  
  const dispatch = createEventDispatcher();
  
  let modalElement: HTMLDivElement;
  
  function close() {
    if (closable) {
      open = false;
      dispatch('close');
    }
  }
  
  function handleBackdropClick(event: MouseEvent) {
    if (closeOnBackdrop && event.target === modalElement) {
      close();
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (closeOnEscape && event.key === 'Escape') {
      close();
    }
  }
  
  onMount(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  });
  
  $: if (open) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  
  $: modalClasses = [
    'relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-hidden',
    size === 'sm' && 'max-w-sm',
    size === 'md' && 'max-w-md',
    size === 'lg' && 'max-w-lg',
    size === 'xl' && 'max-w-xl',
    size === 'full' && 'max-w-4xl'
  ].filter(Boolean).join(' ');
</script>

{#if open}
  <!-- Backdrop -->
  <div
    bind:this={modalElement}
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    transition:fade={{ duration: 200 }}
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
  >
    <!-- Modal -->
    <div
      class={modalClasses}
      transition:scale={{ duration: 200, start: 0.95 }}
    >
      <!-- Header -->
      {#if title || closable || $$slots.header}
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex-1">
            {#if $$slots.header}
              <slot name="header" />
            {:else if title}
              <h3 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            {/if}
          </div>
          
          {#if closable}
            <button
              type="button"
              class="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              on:click={close}
              aria-label="Close modal"
            >
              <Icon icon="lucide:x" class="w-5 h-5" />
            </button>
          {/if}
        </div>
      {/if}
      
      <!-- Body -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
        <slot />
      </div>
      
      <!-- Footer -->
      {#if $$slots.footer}
        <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}