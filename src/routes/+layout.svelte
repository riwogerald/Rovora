<script lang="ts">
  import '../app.postcss';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { Modal, Toast, initializeStores } from '@skeletonlabs/skeleton';
  import { ModeWatcher } from 'mode-watcher';
  
  // Initialize Skeleton stores
  initializeStores();
  
  // Initialize auth on app start
  onMount(() => {
    auth.init();
  });
  
  // Check if we're on a full-width page
  $: isFullWidth = $page.route.id?.includes('/game/') || $page.route.id?.includes('/user/') || false;
</script>

<!-- Skeleton Modal -->
<Modal />

<!-- Skeleton Toast -->
<Toast />

<!-- Mode Watcher for theme switching -->
<ModeWatcher />

<div class="app h-full overflow-hidden flex flex-col" data-theme="rovora">
  <!-- Header will go here -->
  <header class="border-b border-surface-200-700-token bg-surface-50-900-token">
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <a href="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-gaming font-bold text-sm">R</span>
          </div>
          <span class="font-gaming font-bold text-xl text-surface-900-50-token">Rovora</span>
        </a>
        
        <nav class="hidden md:flex items-center gap-6">
          <a href="/library" class="text-surface-600-300-token hover:text-primary-500 transition-colors">
            Library
          </a>
          <a href="/discover" class="text-surface-600-300-token hover:text-primary-500 transition-colors">
            Discover
          </a>
          <a href="/codex" class="text-surface-600-300-token hover:text-primary-500 transition-colors">
            Codex
          </a>
          <a href="/social" class="text-surface-600-300-token hover:text-primary-500 transition-colors">
            Social
          </a>
        </nav>
        
        <div class="flex items-center gap-3">
          {#if $auth.isAuthenticated}
            <button class="btn-icon variant-ghost-surface">
              <i class="i-lucide-search w-5 h-5"></i>
            </button>
            <button class="btn-icon variant-ghost-surface">
              <i class="i-lucide-bell w-5 h-5"></i>
            </button>
            <button class="btn-icon variant-ghost-surface">
              <i class="i-lucide-user w-5 h-5"></i>
            </button>
          {:else}
            <a href="/login" class="btn variant-ghost-surface">Sign In</a>
            <a href="/register" class="btn variant-filled-primary">Sign Up</a>
          {/if}
        </div>
      </div>
    </div>
  </header>
  
  <!-- Main Content -->
  <main class="flex-1 overflow-auto">
    <div class="{isFullWidth ? '' : 'container mx-auto px-4 py-6'}">
      <slot />
    </div>
  </main>
  
  <!-- Footer -->
  <footer class="border-t border-surface-200-700-token bg-surface-50-900-token py-6">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="font-gaming font-bold text-primary-500">Rovora</span>
          <span class="text-surface-500-400-token">© 2024</span>
        </div>
        
        <div class="flex items-center gap-6 text-sm text-surface-500-400-token">
          <a href="/about" class="hover:text-primary-500 transition-colors">About</a>
          <a href="/privacy" class="hover:text-primary-500 transition-colors">Privacy</a>
          <a href="/terms" class="hover:text-primary-500 transition-colors">Terms</a>
          <a href="/support" class="hover:text-primary-500 transition-colors">Support</a>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  .app {
    min-height: 100vh;
  }
</style>