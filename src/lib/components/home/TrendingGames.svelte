<script lang="ts">
  import { onMount } from 'svelte';
  import { games } from '$lib/stores/games';
  import GameCard from '$lib/components/games/GameCard.svelte';
  import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';
  import Icon from '@iconify/svelte';
  
  // Mock trending games data
  const mockTrendingGames = [
    {
      id: '4',
      name: 'Baldur\'s Gate 3',
      slug: 'baldurs-gate-3',
      background_image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.9,
      rating_top: 5,
      ratings_count: 35200,
      metacritic: 96,
      playtime: 100,
      platforms: [{ id: 1, name: 'PC', slug: 'pc', games_count: 0 }],
      genres: [{ id: 1, name: 'RPG', slug: 'rpg', games_count: 0 }],
      tags: [],
      developers: [{ id: 3, name: 'Larian Studios', slug: 'larian-studios', games_count: 0 }],
      publishers: [{ id: 3, name: 'Larian Studios', slug: 'larian-studios', games_count: 0 }],
      stores: []
    },
    {
      id: '5',
      name: 'Spider-Man 2',
      slug: 'spider-man-2',
      background_image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.7,
      rating_top: 5,
      ratings_count: 18750,
      metacritic: 90,
      playtime: 25,
      platforms: [{ id: 2, name: 'PlayStation 5', slug: 'playstation5', games_count: 0 }],
      genres: [{ id: 2, name: 'Action', slug: 'action', games_count: 0 }],
      tags: [],
      developers: [{ id: 4, name: 'Insomniac Games', slug: 'insomniac-games', games_count: 0 }],
      publishers: [{ id: 4, name: 'Sony Interactive Entertainment', slug: 'sony-interactive-entertainment', games_count: 0 }],
      stores: []
    },
    {
      id: '6',
      name: 'Starfield',
      slug: 'starfield',
      background_image: 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.1,
      rating_top: 5,
      ratings_count: 12400,
      metacritic: 82,
      playtime: 60,
      platforms: [{ id: 1, name: 'PC', slug: 'pc', games_count: 0 }],
      genres: [{ id: 1, name: 'RPG', slug: 'rpg', games_count: 0 }],
      tags: [],
      developers: [{ id: 5, name: 'Bethesda Game Studios', slug: 'bethesda-game-studios', games_count: 0 }],
      publishers: [{ id: 5, name: 'Bethesda Softworks', slug: 'bethesda-softworks', games_count: 0 }],
      stores: []
    },
    {
      id: '7',
      name: 'Hogwarts Legacy',
      slug: 'hogwarts-legacy',
      background_image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800',
      rating: 4.4,
      rating_top: 5,
      ratings_count: 24680,
      metacritic: 84,
      playtime: 35,
      platforms: [{ id: 1, name: 'PC', slug: 'pc', games_count: 0 }],
      genres: [{ id: 1, name: 'RPG', slug: 'rpg', games_count: 0 }],
      tags: [],
      developers: [{ id: 6, name: 'Avalanche Software', slug: 'avalanche-software', games_count: 0 }],
      publishers: [{ id: 6, name: 'Warner Bros. Games', slug: 'warner-bros-games', games_count: 0 }],
      stores: []
    }
  ];
  
  onMount(() => {
    // Simulate loading
    setTimeout(() => {
      games.setTrending(mockTrendingGames);
    }, 1200);
  });
</script>

<section class="py-16 bg-gray-50 dark:bg-gray-800/50">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center space-x-3">
        <div class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
          <Icon icon="lucide:trending-up" class="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Trending Now
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Games that are currently popular in the community
          </p>
        </div>
      </div>
      <a href="/games?trending=true" class="btn-ghost">
        View All
      </a>
    </div>
    
    {#if $games.trending.length === 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each Array(4) as _}
          <LoadingSkeleton class="h-80 rounded-xl" />
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each $games.trending as game, index}
          <div class="relative">
            <!-- Trending Badge -->
            <div class="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              #{index + 1}
            </div>
            <GameCard {game} />
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>