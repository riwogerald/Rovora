<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Icon from '@iconify/svelte';
  import { debounce } from '$lib/utils/debounce';

  export let placeholder = 'Search games, users, or entries...';
  export let value = '';
  export let showFilters = true;
  export let category: 'all' | 'games' | 'users' | 'entries' = 'all';

  const dispatch = createEventDispatcher<{
    search: { query: string; category: string };
    select: { type: string; id: string; text: string };
  }>();

  let isOpen = false;
  let isLoading = false;
  let suggestions: any[] = [];
  let searchInput: HTMLInputElement;
  let dropdownElement: HTMLDivElement;
  let selectedIndex = -1;

  // Debounced autocomplete function
  const debouncedAutocomplete = debounce(async (query: string) => {
    if (!query || query.length < 2) {
      suggestions = [];
      isOpen = false;
      return;
    }

    isLoading = true;
    try {
      const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      suggestions = data.suggestions || [];
      isOpen = suggestions.length > 0;
    } catch (error) {
      console.error('Autocomplete error:', error);
      suggestions = [];
      isOpen = false;
    } finally {
      isLoading = false;
    }
  }, 300);

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    selectedIndex = -1;
    debouncedAutocomplete(value);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!isOpen) {
      if (event.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        event.preventDefault();
        isOpen = false;
        selectedIndex = -1;
        searchInput.blur();
        break;
    }
  }

  function selectSuggestion(suggestion: any) {
    value = suggestion.text;
    isOpen = false;
    selectedIndex = -1;
    
    dispatch('select', {
      type: suggestion.type,
      id: suggestion.metadata?.id || suggestion.metadata?.username || suggestion.text,
      text: suggestion.text
    });
  }

  function handleSearch() {
    if (!value.trim()) return;
    
    isOpen = false;
    selectedIndex = -1;
    dispatch('search', { query: value.trim(), category });
  }

  function handleFocus() {
    if (value && suggestions.length > 0) {
      isOpen = true;
    } else if (value.length >= 2) {
      debouncedAutocomplete(value);
    }
  }

  function handleBlur(event: FocusEvent) {
    // Delay closing to allow clicking on suggestions
    setTimeout(() => {
      if (!dropdownElement?.contains(event.relatedTarget as Node)) {
        isOpen = false;
        selectedIndex = -1;
      }
    }, 200);
  }

  function getIcon(type: string): string {
    switch (type) {
      case 'game': return 'lucide:gamepad-2';
      case 'user': return 'lucide:user';
      case 'entry': return 'lucide:book-open';
      default: return 'lucide:search';
    }
  }

  onMount(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        searchInput && 
        !searchInput.contains(event.target as Node) &&
        dropdownElement &&
        !dropdownElement.contains(event.target as Node)
      ) {
        isOpen = false;
        selectedIndex = -1;
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="search-container relative w-full max-w-2xl">
  <!-- Search Input -->
  <div class="relative">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Icon icon="lucide:search" class="w-5 h-5 text-surface-400-500-token" />
    </div>
    
    <input
      bind:this={searchInput}
      bind:value
      type="text"
      class="input w-full pl-10 pr-12"
      {placeholder}
      on:input={handleInput}
      on:keydown={handleKeyDown}
      on:focus={handleFocus}
      on:blur={handleBlur}
      autocomplete="off"
      spellcheck="false"
    />
    
    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
      {#if isLoading}
        <Icon icon="lucide:loader-2" class="w-5 h-5 text-surface-400-500-token animate-spin" />
      {:else if value}
        <button
          type="button"
          class="text-surface-400-500-token hover:text-surface-600-300-token transition-colors"
          on:click={() => { value = ''; suggestions = []; isOpen = false; }}
        >
          <Icon icon="lucide:x" class="w-5 h-5" />
        </button>
      {/if}
    </div>
  </div>

  <!-- Category Filter (if enabled) -->
  {#if showFilters}
    <div class="flex items-center gap-2 mt-2">
      <span class="text-sm text-surface-500-400-token">Search in:</span>
      <div class="flex gap-1">
        {#each [
          { value: 'all', label: 'All' },
          { value: 'games', label: 'Games' },
          { value: 'users', label: 'Users' },
          { value: 'entries', label: 'Entries' }
        ] as option}
          <button
            type="button"
            class="btn btn-sm"
            class:variant-filled-primary={category === option.value}
            class:variant-ghost-surface={category !== option.value}
            on:click={() => category = option.value as any}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Autocomplete Dropdown -->
  {#if isOpen && suggestions.length > 0}
    <div
      bind:this={dropdownElement}
      class="absolute top-full left-0 right-0 mt-1 bg-surface-50-900-token border border-surface-200-700-token rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
    >
      {#each suggestions as suggestion, index}
        <button
          type="button"
          class="w-full text-left px-4 py-3 hover:bg-surface-100-800-token transition-colors flex items-center gap-3"
          class:bg-surface-100-800-token={index === selectedIndex}
          on:click={() => selectSuggestion(suggestion)}
        >
          <!-- Icon -->
          <div class="flex-shrink-0">
            {#if suggestion.type === 'user' && suggestion.metadata?.avatar}
              <img 
                src={suggestion.metadata.avatar} 
                alt=""
                class="w-6 h-6 rounded-full object-cover"
              />
            {:else if suggestion.type === 'game' && suggestion.metadata?.image}
              <img 
                src={suggestion.metadata.image} 
                alt=""
                class="w-6 h-6 rounded object-cover"
              />
            {:else}
              <Icon 
                icon={getIcon(suggestion.type)} 
                class="w-6 h-6 text-surface-500-400-token"
              />
            {/if}
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="font-medium text-surface-900-50-token truncate">
              {suggestion.text}
            </div>
            {#if suggestion.type === 'user' && suggestion.metadata?.username}
              <div class="text-sm text-surface-500-400-token truncate">
                @{suggestion.metadata.username}
              </div>
            {:else if suggestion.type !== 'suggestion'}
              <div class="text-sm text-surface-500-400-token capitalize">
                {suggestion.type}
              </div>
            {/if}
          </div>
          
          <!-- Type indicator -->
          <div class="flex-shrink-0">
            <span class="text-xs px-2 py-1 bg-surface-200-700-token rounded-full text-surface-600-300-token capitalize">
              {suggestion.type === 'suggestion' ? 'popular' : suggestion.type}
            </span>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
  }
</style>
