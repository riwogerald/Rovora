<script lang="ts">
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';
  
  let searchQuery = '';
  let isOpen = false;
  let searchInput: HTMLInputElement;
  
  function handleSearch() {
    if (searchQuery.trim()) {
      goto(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
      isOpen = false;
      searchQuery = '';
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    } else if (event.key === 'Escape') {
      isOpen = false;
      searchInput?.blur();
    }
  }
</script>

<div class="relative">
  <div class="relative">
    <Icon 
      icon="lucide:search" 
      class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
    />
    <input
      bind:this={searchInput}
      bind:value={searchQuery}
      on:keydown={handleKeydown}
      on:focus={() => isOpen = true}
      on:blur={() => setTimeout(() => isOpen = false, 200)}
      type="text"
      placeholder="Search games..."
      class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
    />
    {#if searchQuery}
      <button
        on:click={() => { searchQuery = ''; searchInput?.focus(); }}
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <Icon icon="lucide:x" class="w-4 h-4" />
      </button>
    {/if}
  </div>
  
  <!-- Search Suggestions (placeholder for future implementation) -->
  {#if isOpen && searchQuery.length > 2}
    <div class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
      <div class="p-4 text-sm text-gray-500 dark:text-gray-400">
        Press Enter to search for "{searchQuery}"
      </div>
    </div>
  {/if}
</div>