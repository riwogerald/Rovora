<script lang="ts">
  import Hero from '$lib/components/home/Hero.svelte';
  import FeaturedGames from '$lib/components/home/FeaturedGames.svelte';
  import TrendingGames from '$lib/components/home/TrendingGames.svelte';
  import GameCategories from '$lib/components/home/GameCategories.svelte';
</script>

<svelte:head>
  <title>GameHub - Discover Your Next Favorite Game</title>
  <meta name="description" content="Explore thousands of games, create wishlists, read reviews, and connect with fellow gamers on GameHub." />
</svelte:head>

<div class="space-y-12">
  <Hero />
  <FeaturedGames />
  <TrendingGames />
  <GameCategories />
</div>