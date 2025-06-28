<script lang="ts">
  import { onMount } from 'svelte';
  import { games } from '$lib/stores/games';
  import GameCard from '$lib/components/games/GameCard.svelte';
  import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';
  
  // Mock data for now - will be replaced with real API calls
  const mockFeaturedGames = [
    {
      id: '1',
      name: 'Cyberpunk 2077',
      slug: 'cyberpunk-2077',
      background_image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.2,
      rating_top: 5,
      ratings_count: 15420,
      metacritic: 86,
      playtime: 45,
      platforms: [{ id: 1, name: 'PC', slug: 'pc', games_count: 0 }],
      genres: [{ id: 1, name: 'RPG', slug: 'rpg', games_count: 0 }],
      tags: [],
      developers: [{ id: 1, name: 'CD Projekt Red', slug: 'cd-projekt-red', games_count: 0 }],
      publishers: [{ id: 1, name: 'CD Projekt', slug: 'cd-projekt', games_count: 0 }],
      stores: []
    },
    {
      id: '2',
      name: 'The Witcher 3: Wild Hunt',
      slug: 'the-witcher-3-wild-hunt',
      background_image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.8,
      rating_top: 5,
      ratings_count: 28950,
      metacritic: 93,
      playtime: 120,
      platforms: [{ id: 1, name: 'PC', slug: 'pc', games_count: 0 }],
      genres: [{ id: 1, name: 'RPG', slug: 'rpg', games_count: 0 }],
      tags: [],
      developers: [{ id: 1, name: 'CD Projekt Red', slug: 'cd-projekt-red', games_count: 0 }],
      publishers: [{ id: 1, name: 'CD Projekt', slug: 'cd-projekt', games_count: 0 }],
      stores: []
    },
    {
      id: '3',
      name: 'Red Dead Redemption 2',
      slug: 'red-dead-redemption-2',
      background_image: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.6,
      rating_top: 5,
      ratings_count: 22340,
      metacritic: 97,
      playtime: 80,
      platforms: [{ id: 1, name: 'PC', slug: 'pc', games_count: 0 }],
      genres: [{ id: 2, name: 'Action', slug: 'action', games_count: 0 }],
      tags: [],
      developers: [{ id: 2, name: 'Rockstar Games', slug: 'rockstar-games', games_count: 0 }],
      publishers: [{ id: 2, name: 'Rockstar Games', slug: 'rockstar-games', games_count: 0 }],
      stores: []
    }
  ];
  
  onMount(() => {
    // Simulate loading
    games.setLoading(true);
    setTimeout(() => {
      games.setFeatured(mockFeaturedGames);
      games.setLoading(false);
    }, 1000);
  });
</script>

<section class="py-16">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Featured Games
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Hand-picked games that are making waves in the gaming community
        </p>
      </div>
      <a href="/games?featured=true" class="btn-ghost">
        View All
      </a>
    </div>
    
    {#if $games.isLoading}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each Array(3) as _}
          <LoadingSkeleton class="h-80 rounded-xl" />
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each $games.featured as game}
          <GameCard {game} featured={true} />
        {/each}
      </div>
    {/if}
  </div>
</section>