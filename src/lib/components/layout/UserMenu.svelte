<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import Icon from '@iconify/svelte';
  
  let isOpen = false;
  
  function toggleMenu() {
    isOpen = !isOpen;
  }
  
  function closeMenu() {
    isOpen = false;
  }
  
  function handleLogout() {
    auth.logout();
    closeMenu();
  }
  
  const menuItems = [
    { label: 'Profile', href: '/profile', icon: 'lucide:user' },
    { label: 'Settings', href: '/settings', icon: 'lucide:settings' },
    { label: 'Collections', href: '/collections', icon: 'lucide:folder' },
    { label: 'Reviews', href: '/my-reviews', icon: 'lucide:star' }
  ];
</script>

<div class="relative">
  <button
    on:click={toggleMenu}
    class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    aria-label="User menu"
  >
    {#if $auth.user?.avatar_url}
      <img 
        src={$auth.user.avatar_url} 
        alt={$auth.user.display_name || $auth.user.username}
        class="w-8 h-8 rounded-full object-cover"
      />
    {:else}
      <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {($auth.user?.display_name || $auth.user?.username || 'U').charAt(0).toUpperCase()}
      </div>
    {/if}
    <Icon icon="lucide:chevron-down" class="w-4 h-4 transition-transform" class:rotate-180={isOpen} />
  </button>
  
  {#if isOpen}
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 z-40" 
      on:click={closeMenu}
      on:keydown={(e) => e.key === 'Escape' && closeMenu()}
    ></div>
    
    <!-- Menu -->
    <div class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
      <!-- User Info -->
      <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
          {$auth.user?.display_name || $auth.user?.username}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {$auth.user?.email}
        </p>
      </div>
      
      <!-- Menu Items -->
      <div class="py-2">
        {#each menuItems as item}
          <a
            href={item.href}
            on:click={closeMenu}
            class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon icon={item.icon} class="w-4 h-4" />
            <span>{item.label}</span>
          </a>
        {/each}
      </div>
      
      <!-- Logout -->
      <div class="border-t border-gray-200 dark:border-gray-700 py-2">
        <button
          on:click={handleLogout}
          class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Icon icon="lucide:log-out" class="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  {/if}
</div>