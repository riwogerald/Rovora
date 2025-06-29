<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { games, userStats } from '$lib/stores/games';
  import GameCard from '$lib/components/ui/GameCard.svelte';
  import ControllerRating from '$lib/components/ui/ControllerRating.svelte';
  import Icon from '@iconify/svelte';
  
  // Mock data for demonstration
  const featuredGames = [
    {
      id: '1',
      title: 'The Legend of Zelda: Breath of the Wild',
      slug: 'zelda-breath-of-the-wild',
      description: 'An open-world adventure game',
      cover_image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
      genres: [{ id: '1', name: 'Adventure', slug: 'adventure' }, { id: '2', name: 'Action', slug: 'action' }],
      platforms: [{ id: '1', name: 'Nintendo Switch', slug: 'nintendo-switch', short_name: 'Switch', icon: 'nintendo', color: '#e60012', category: 'console' as const }],
      screenshots: [],
      tags: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    },
    {
      id: '2',
      title: 'Cyberpunk 2077',
      slug: 'cyberpunk-2077',
      description: 'A futuristic RPG',
      cover_image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=400',
      genres: [{ id: '3', name: 'RPG', slug: 'rpg' }, { id: '2', name: 'Action', slug: 'action' }],
      platforms: [{ id: '2', name: 'PC', slug: 'pc', short_name: 'PC', icon: 'pc', color: '#333333', category: 'pc' as const }],
      screenshots: [],
      tags: [],
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ];
  
  let controllerRating = 0;
  
  function handleRatingChange(event: CustomEvent<{ value: number }>) {
    controllerRating = event.detail.value;
  }
</script>

<svelte:head>
  <title>Rovora - Gaming Codex & Social Platform</title>
  <meta name="description" content="Track your gaming journey with Rovora's enhanced social gaming log platform featuring Game Codex diary entries and controller-based ratings." />
</svelte:head>

<!-- Hero Section -->
<section class="relative py-20 bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-tertiary-500/10">
  <div class="container mx-auto px-4 text-center">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-5xl md:text-7xl font-gaming font-bold text-surface-900-50-token mb-6">
        Your Gaming
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
          Codex
        </span>
      </h1>
      
      <p class="text-xl md:text-2xl text-surface-600-300-token mb-8 leading-relaxed">
        Track, rate, and journal your gaming journey with our enhanced social platform featuring unique controller-based ratings and comprehensive game logging.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        {#if $auth.isAuthenticated}
          <a href="/library" class="btn variant-filled-primary text-lg px-8 py-3">
            <Icon icon="lucide:library" class="w-5 h-5 mr-2" />
            My Library
          </a>
          <a href="/discover" class="btn variant-ghost-surface text-lg px-8 py-3">
            <Icon icon="lucide:compass" class="w-5 h-5 mr-2" />
            Discover Games
          </a>
        {:else}
          <a href="/register" class="btn variant-filled-primary text-lg px-8 py-3">
            <Icon icon="lucide:gamepad-2" class="w-5 h-5 mr-2" />
            Start Your Codex
          </a>
          <a href="/discover" class="btn variant-ghost-surface text-lg px-8 py-3">
            <Icon icon="lucide-search" class="w-5 h-5 mr-2" />
            Browse Games
          </a>
        {/if}
      </div>
      
      <!-- Controller Rating Demo -->
      <div class="max-w-md mx-auto p-6 card variant-ghost-surface">
        <h3 class="text-lg font-semibold mb-4 text-surface-900-50-token">
          Rate with Controllers
        </h3>
        <ControllerRating 
          bind:value={controllerRating}
          on:change={handleRatingChange}
          size="lg"
          showValue={true}
        />
        <p class="text-sm text-surface-500-400-token mt-2">
          Our unique controller-based rating system
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="py-16">
  <div class="container mx-auto px-4">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-surface-900-50-token mb-4">
        Everything You Need for Gaming
      </h2>
      <p class="text-surface-600-300-token max-w-2xl mx-auto">
        From detailed game logging to social features, Rovora provides all the tools you need to enhance your gaming experience.
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Game Codex -->
      <div class="card variant-ghost-surface p-6 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:book-open" class="w-6 h-6 text-white" />
        </div>
        <h3 class="text-xl font-semibold text-surface-900-50-token mb-2">
          Game Codex
        </h3>
        <p class="text-surface-600-300-token">
          Create detailed diary entries for your gaming experiences with screenshots, thoughts, and milestones.
        </p>
      </div>
      
      <!-- Controller Ratings -->
      <div class="card variant-ghost-surface p-6 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-secondary-500 to-tertiary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:gamepad-2" class="w-6 h-6 text-white" />
        </div>
        <h3 class="text-xl font-semibold text-surface-900-50-token mb-2">
          Controller Ratings
        </h3>
        <p class="text-surface-600-300-token">
          Rate games with our unique controller-based system, breaking down gameplay, story, graphics, and more.
        </p>
      </div>
      
      <!-- Multi-Platform -->
      <div class="card variant-ghost-surface p-6 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-tertiary-500 to-primary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:monitor" class="w-6 h-6 text-white" />
        </div>
        <h3 class="text-xl font-semibold text-surface-900-50-token mb-2">
          Multi-Platform
        </h3>
        <p class="text-surface-600-300-token">
          Track games across all platforms - Steam, Xbox, PlayStation, Nintendo Switch, and more.
        </p>
      </div>
      
      <!-- Social Features -->
      <div class="card variant-ghost-surface p-6 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-success-500 to-primary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:users" class="w-6 h-6 text-white" />
        </div>
        <h3 class="text-xl font-semibold text-surface-900-50-token mb-2">
          Social Gaming
        </h3>
        <p class="text-surface-600-300-token">
          Follow friends, share your gaming journey, and discover new games through your network.
        </p>
      </div>
      
      <!-- Steam Integration -->
      <div class="card variant-ghost-surface p-6 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-warning-500 to-secondary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:steam" class="w-6 h-6 text-white" />
        </div>
        <h3 class="text-xl font-semibold text-surface-900-50-token mb-2">
          Steam Integration
        </h3>
        <p class="text-surface-600-300-token">
          Automatically import your Steam library and sync playtime, achievements, and game data.
        </p>
      </div>
      
      <!-- Advanced Tagging -->
      <div class="card variant-ghost-surface p-6 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-error-500 to-tertiary-500 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:tags" class="w-6 h-6 text-white" />
        </div>
        <h3 class="text-xl font-semibold text-surface-900-50-token mb-2">
          Smart Tagging
        </h3>
        <p class="text-surface-600-300-token">
          Organize games with mood-based tags, difficulty levels, and custom categories for easy discovery.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Featured Games -->
{#if featuredGames.length > 0}
  <section class="py-16 bg-surface-100-800-token">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-surface-900-50-token mb-4">
          Featured Games
        </h2>
        <p class="text-surface-600-300-token">
          Discover popular games in the Rovora community
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each featuredGames as game}
          <GameCard {game} showActions={false} />
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- Stats Section (if authenticated) -->
{#if $auth.isAuthenticated}
  <section class="py-16">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-surface-900-50-token mb-4">
          Your Gaming Stats
        </h2>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div class="card variant-ghost-surface p-6 text-center">
          <div class="text-3xl font-bold text-primary-500 mb-2">
            {$userStats.total_games}
          </div>
          <div class="text-sm text-surface-500-400-token">
            Games Tracked
          </div>
        </div>
        
        <div class="card variant-ghost-surface p-6 text-center">
          <div class="text-3xl font-bold text-secondary-500 mb-2">
            {$userStats.completed}
          </div>
          <div class="text-sm text-surface-500-400-token">
            Completed
          </div>
        </div>
        
        <div class="card variant-ghost-surface p-6 text-center">
          <div class="text-3xl font-bold text-tertiary-500 mb-2">
            {Math.round($userStats.total_playtime)}h
          </div>
          <div class="text-sm text-surface-500-400-token">
            Total Playtime
          </div>
        </div>
        
        <div class="card variant-ghost-surface p-6 text-center">
          <div class="text-3xl font-bold text-success-500 mb-2">
            {$userStats.average_rating.toFixed(1)}
          </div>
          <div class="text-sm text-surface-500-400-token">
            Avg Rating
          </div>
        </div>
      </div>
    </div>
  </section>
{/if}