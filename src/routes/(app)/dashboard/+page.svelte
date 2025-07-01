<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '@iconify/svelte';
  
  export let data;
  
  $: user = data.user;
</script>

<svelte:head>
  <title>Dashboard - Rovora</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-4xl mx-auto">
    <!-- Welcome Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900-50-token mb-2">
        Welcome back, {user?.display_name || user?.username}!
      </h1>
      <p class="text-surface-600-300-token">
        Ready to continue your gaming journey?
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="card variant-ghost-surface p-6 text-center">
        <div class="text-3xl font-bold text-primary-500 mb-2">0</div>
        <div class="text-sm text-surface-500-400-token">Games Tracked</div>
      </div>
      
      <div class="card variant-ghost-surface p-6 text-center">
        <div class="text-3xl font-bold text-secondary-500 mb-2">0</div>
        <div class="text-sm text-surface-500-400-token">Completed</div>
      </div>
      
      <div class="card variant-ghost-surface p-6 text-center">
        <div class="text-3xl font-bold text-tertiary-500 mb-2">0h</div>
        <div class="text-sm text-surface-500-400-token">Total Playtime</div>
      </div>
      
      <div class="card variant-ghost-surface p-6 text-center">
        <div class="text-3xl font-bold text-success-500 mb-2">0</div>
        <div class="text-sm text-surface-500-400-token">Codex Entries</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <a href="/games/add" class="card variant-ghost-surface p-6 hover:variant-soft-primary transition-all group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon icon="lucide:plus" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="font-semibold text-surface-900-50-token">Add Game</h3>
            <p class="text-sm text-surface-500-400-token">Track a new game</p>
          </div>
        </div>
      </a>

      <a href="/codex/new" class="card variant-ghost-surface p-6 hover:variant-soft-secondary transition-all group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-secondary-500 to-tertiary-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon icon="lucide:book-open" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="font-semibold text-surface-900-50-token">New Entry</h3>
            <p class="text-sm text-surface-500-400-token">Write a codex entry</p>
          </div>
        </div>
      </a>

      <a href="/library" class="card variant-ghost-surface p-6 hover:variant-soft-tertiary transition-all group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-tertiary-500 to-success-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon icon="lucide:library" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="font-semibold text-surface-900-50-token">My Library</h3>
            <p class="text-sm text-surface-500-400-token">Browse your games</p>
          </div>
        </div>
      </a>
    </div>

    <!-- Recent Activity -->
    <div class="card variant-ghost-surface p-6">
      <h2 class="text-xl font-semibold text-surface-900-50-token mb-4">
        Recent Activity
      </h2>
      
      <div class="text-center py-12">
        <Icon icon="lucide:activity" class="w-12 h-12 text-surface-400-500-token mx-auto mb-4" />
        <p class="text-surface-500-400-token">
          No recent activity. Start by adding some games to your library!
        </p>
      </div>
    </div>
  </div>
</div>