<script lang="ts">
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';
  
  let searchQuery = '';
  
  function handleSearch() {
    if (searchQuery.trim()) {
      goto(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  }
  
  const stats = [
    { label: 'Games', value: '50K+', icon: 'lucide:gamepad-2' },
    { label: 'Reviews', value: '1M+', icon: 'lucide:star' },
    { label: 'Users', value: '100K+', icon: 'lucide:users' },
    { label: 'Platforms', value: '15+', icon: 'lucide:monitor' }
  ];
</script>

<section class="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20 py-20 lg:py-32">
  <!-- Background Pattern -->
  <div class="absolute inset-0 opacity-5">
    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0); background-size: 20px 20px;"></div>
  </div>
  
  <div class="relative container mx-auto px-4 text-center">
    <!-- Main Heading -->
    <div class="max-w-4xl mx-auto mb-12">
      <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
        Discover Your
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
          Next Favorite
        </span>
        Game
      </h1>
      <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
        Explore thousands of games, read reviews, create wishlists, and connect with fellow gamers in the ultimate gaming discovery platform.
      </p>
    </div>
    
    <!-- Search Bar -->
    <div class="max-w-2xl mx-auto mb-12">
      <form on:submit|preventDefault={handleSearch} class="relative">
        <Icon 
          icon="lucide:search" 
          class="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" 
        />
        <input
          bind:value={searchQuery}
          type="text"
          placeholder="Search for games, genres, or developers..."
          class="w-full pl-12 pr-32 py-4 text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 shadow-lg transition-all"
        />
        <button
          type="submit"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-2 text-base"
        >
          Search
        </button>
      </form>
    </div>
    
    <!-- CTA Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
      <a href="/games" class="btn-primary text-lg px-8 py-3">
        <Icon icon="lucide:gamepad-2" class="w-5 h-5 mr-2" />
        Browse Games
      </a>
      <a href="/trending" class="btn-secondary text-lg px-8 py-3">
        <Icon icon="lucide:trending-up" class="w-5 h-5 mr-2" />
        Trending Now
      </a>
    </div>
    
    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
      {#each stats as stat}
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl mb-3">
            <Icon icon={stat.icon} class="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stat.value}
          </div>
          <div class="text-gray-600 dark:text-gray-400">
            {stat.label}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>