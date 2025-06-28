<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from 'svelte-sonner';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import { page } from '$app/stores';
  
  // Check if we're on a full-width page (like game details)
  $: isFullWidth = $page.route.id?.includes('/games/[id]') || false;
</script>

<ModeWatcher />
<Toaster richColors position="top-right" />

<div class="min-h-screen flex flex-col">
  <Header />
  
  <main class="flex-1" class:container={!isFullWidth} class:mx-auto={!isFullWidth} class:px-4={!isFullWidth} class:py-8={!isFullWidth}>
    <slot />
  </main>
  
  <Footer />
</div>

<style>
  .container {
    max-width: 1400px;
  }
</style>