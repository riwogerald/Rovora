<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { wishlistCount } from '$lib/stores/wishlist';
  import { toggleMode } from 'mode-watcher';
  import Icon from '@iconify/svelte';
  import SearchBar from './SearchBar.svelte';
  import UserMenu from './UserMenu.svelte';
  
  let mobileMenuOpen = false;
  
  const navigation = [
    { name: 'Home', href: '/', icon: 'lucide:home' },
    { name: 'Games', href: '/games', icon: 'lucide:gamepad-2' },
    { name: 'Reviews', href: '/reviews', icon: 'lucide:star' },
    { name: 'Community', href: '/community', icon: 'lucide:users' }
  ];
</script>

<header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center space-x-2 font-bold text-xl text-primary-600">
        <Icon icon="lucide:gamepad-2" class="w-8 h-8" />
        <span>GameHub</span>
      </a>
      
      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center space-x-8">
        {#each navigation as item}
          <a 
            href={item.href}
            class="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            class:text-primary-600={$page.url.pathname === item.href}
            class:bg-primary-50={$page.url.pathname === item.href}
            class:dark:bg-primary-900/20={$page.url.pathname === item.href}
            class:text-gray-600={$page.url.pathname !== item.href}
            class:dark:text-gray-300={$page.url.pathname !== item.href}
            class:hover:text-gray-900={$page.url.pathname !== item.href}
            class:dark:hover:text-gray-100={$page.url.pathname !== item.href}
          >
            <Icon icon={item.icon} class="w-4 h-4" />
            <span>{item.name}</span>
          </a>
        {/each}
      </nav>
      
      <!-- Search Bar -->
      <div class="hidden lg:block flex-1 max-w-lg mx-8">
        <SearchBar />
      </div>
      
      <!-- Right Side Actions -->
      <div class="flex items-center space-x-4">
        <!-- Theme Toggle -->
        <button
          on:click={toggleMode}
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          <Icon icon="lucide:sun" class="w-5 h-5 dark:hidden" />
          <Icon icon="lucide:moon" class="w-5 h-5 hidden dark:block" />
        </button>
        
        {#if $auth.isAuthenticated}
          <!-- Wishlist -->
          <a
            href="/wishlist"
            class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Wishlist"
          >
            <Icon icon="lucide:heart" class="w-5 h-5" />
            {#if $wishlistCount > 0}
              <span class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {$wishlistCount}
              </span>
            {/if}
          </a>
          
          <!-- User Menu -->
          <UserMenu />
        {:else}
          <!-- Auth Buttons -->
          <div class="flex items-center space-x-2">
            <a href="/login" class="btn-ghost text-sm">Sign In</a>
            <a href="/register" class="btn-primary text-sm">Sign Up</a>
          </div>
        {/if}
        
        <!-- Mobile Menu Button -->
        <button
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Icon icon="lucide:menu" class="w-5 h-5" />
        </button>
      </div>
    </div>
    
    <!-- Mobile Search -->
    <div class="lg:hidden pb-4">
      <SearchBar />
    </div>
  </div>
  
  <!-- Mobile Menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div class="px-4 py-4 space-y-2">
        {#each navigation as item}
          <a
            href={item.href}
            class="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            class:text-primary-600={$page.url.pathname === item.href}
            class:bg-primary-50={$page.url.pathname === item.href}
            class:dark:bg-primary-900/20={$page.url.pathname === item.href}
            class:text-gray-600={$page.url.pathname !== item.href}
            class:dark:text-gray-300={$page.url.pathname !== item.href}
            on:click={() => mobileMenuOpen = false}
          >
            <Icon icon={item.icon} class="w-4 h-4" />
            <span>{item.name}</span>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</header>