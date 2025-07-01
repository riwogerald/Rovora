<script lang="ts">
  import '../app.postcss';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { Modal, Toast, initializeStores } from '@skeletonlabs/skeleton';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from 'svelte-sonner';
  import Icon from '@iconify/svelte';
  import EmailVerificationBanner from '$lib/components/ui/EmailVerificationBanner.svelte';
  
  export let data;
  
  // Initialize Skeleton stores
  initializeStores();
  
  $: user = data.user;
  $: isAuthPage = $page.route.id?.startsWith('/(auth)');
  $: isAppPage = $page.route.id?.startsWith('/(app)');
  
  let showUserMenu = false;
  
  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
  }
  
  function closeUserMenu() {
    showUserMenu = false;
  }
</script>

<!-- Skeleton Modal -->
<Modal />

<!-- Skeleton Toast -->
<Toast />

<!-- Sonner Toast -->
<Toaster richColors position="top-right" />

<!-- Mode Watcher for theme switching -->
<ModeWatcher />

<!-- Click outside to close user menu -->
{#if showUserMenu}
  <div class="fixed inset-0 z-10" on:click={closeUserMenu} role="button" tabindex="-1"></div>
{/if}

<div class="app h-full overflow-hidden flex flex-col" data-theme="rovora">
  <!-- Email Verification Banner -->
  <EmailVerificationBanner {user} showBanner={!isAuthPage} />
  
  {#if !isAuthPage}
    <!-- Header -->
    <header class="border-b border-surface-200-700-token bg-surface-50-900-token sticky top-0 z-20">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <a href="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-gaming font-bold text-sm">R</span>
            </div>
            <span class="font-gaming font-bold text-xl text-surface-900-50-token">Rovora</span>
          </a>
          
          <nav class="hidden md:flex items-center gap-6">
            {#if user}
              <a href="/dashboard" class="text-surface-600-300-token hover:text-primary-500 transition-colors">
                Dashboard
              </a>
              <a href="/library" class="text-surface-600-300-token hover:text-primary-500 transition-colors">
                Library
              </a>
              <a href="/codex" class="text-surface-600-300-token hover:text-primary-500 transition-colors">
                Codex
              </a>
              <a href="/discover" class="text-surface-600-300-token hover:text-primary-500 transition-colors">
                Discover
              </a>
            {:else}
              <a href="/discover" class="text-surface-600-300-token hover:text-primary-500 transition-colors">
                Discover
              </a>
            {/if}
          </nav>
          
          <div class="flex items-center gap-3">
            {#if user}
              <button class="btn-icon variant-ghost-surface">
                <Icon icon="lucide:search" class="w-5 h-5" />
              </button>
              <button class="btn-icon variant-ghost-surface">
                <Icon icon="lucide:bell" class="w-5 h-5" />
              </button>
              
              <!-- User Menu -->
              <div class="relative">
                <button 
                  on:click={toggleUserMenu}
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-100-800-token transition-colors"
                >
                  {#if user.avatar_url}
                    <img src={user.avatar_url} alt={user.username} class="w-6 h-6 rounded-full" />
                  {:else}
                    <div class="w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  {/if}
                  <span class="hidden sm:block text-sm font-medium text-surface-900-50-token">
                    {user.display_name || user.username}
                  </span>
                  {#if !user.email_verified}
                    <Icon icon="lucide:alert-circle" class="w-4 h-4 text-warning-500" title="Email not verified" />
                  {/if}
                  <Icon icon="lucide:chevron-down" class="w-4 h-4 text-surface-500-400-token" />
                </button>
                
                <!-- Dropdown Menu -->
                {#if showUserMenu}
                  <div class="absolute right-0 top-full mt-2 w-64 card variant-filled-surface p-2 shadow-lg z-30">
                    <!-- User Info -->
                    <div class="px-3 py-2 border-b border-surface-200-700-token mb-2">
                      <p class="font-medium text-surface-900-50-token">
                        {user.display_name || user.username}
                      </p>
                      <p class="text-sm text-surface-500-400-token">@{user.username}</p>
                      {#if !user.email_verified}
                        <div class="flex items-center gap-1 mt-1">
                          <Icon icon="lucide:alert-circle" class="w-3 h-3 text-warning-500" />
                          <span class="text-xs text-warning-500">Email not verified</span>
                        </div>
                      {/if}
                    </div>
                    
                    <!-- Menu Items -->
                    <div class="space-y-1">
                      <a href="/profile/{user.username}" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100-800-token transition-colors">
                        <Icon icon="lucide:user" class="w-4 h-4" />
                        <span>View Profile</span>
                      </a>
                      
                      <a href="/profile" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100-800-token transition-colors">
                        <Icon icon="lucide:settings" class="w-4 h-4" />
                        <span>Settings</span>
                      </a>
                      
                      <a href="/library" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100-800-token transition-colors">
                        <Icon icon="lucide:library" class="w-4 h-4" />
                        <span>My Library</span>
                      </a>
                      
                      <a href="/codex" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100-800-token transition-colors">
                        <Icon icon="lucide:book-open" class="w-4 h-4" />
                        <span>My Codex</span>
                      </a>
                      
                      <div class="border-t border-surface-200-700-token my-2"></div>
                      
                      <a href="/help" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100-800-token transition-colors">
                        <Icon icon="lucide:help-circle" class="w-4 h-4" />
                        <span>Help & Support</span>
                      </a>
                      
                      <form method="POST" action="/logout" class="w-full">
                        <button type="submit" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100-800-token transition-colors text-left">
                          <Icon icon="lucide:log-out" class="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </form>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <a href="/login" class="btn variant-ghost-surface">Sign In</a>
              <a href="/register" class="btn variant-filled-primary">Sign Up</a>
            {/if}
          </div>
        </div>
      </div>
    </header>
  {/if}
  
  <!-- Main Content -->
  <main class="flex-1 overflow-auto">
    <slot />
  </main>
  
  {#if !isAuthPage && !isAppPage}
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
  {/if}
</div>

<style>
  .app {
    min-height: 100vh;
  }
</style>