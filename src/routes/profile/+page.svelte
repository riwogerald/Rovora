<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { wishlist } from '$lib/stores/wishlist';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Icon from '@iconify/svelte';
  import { toast } from 'svelte-sonner';
  
  let showEditModal = false;
  let editForm = {
    display_name: '',
    bio: '',
    location: '',
    website: ''
  };
  
  function openEditModal() {
    if ($auth.user) {
      editForm = {
        display_name: $auth.user.display_name || '',
        bio: $auth.user.bio || '',
        location: $auth.user.location || '',
        website: $auth.user.website || ''
      };
    }
    showEditModal = true;
  }
  
  function saveProfile() {
    if ($auth.user) {
      auth.updateUser(editForm);
      toast.success('Profile updated successfully');
      showEditModal = false;
    }
  }
  
  $: user = $auth.user;
  $: stats = {
    wishlistCount: $wishlist.items.length,
    reviewsCount: 0, // Will be implemented later
    collectionsCount: 0, // Will be implemented later
    followersCount: user?.follower_count || 0,
    followingCount: user?.following_count || 0
  };
</script>

<svelte:head>
  <title>My Profile - GameHub</title>
  <meta name="description" content="Manage your GameHub profile and view your gaming statistics." />
</svelte:head>

{#if !$auth.isAuthenticated}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <Icon icon="lucide:user" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Sign In Required
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Please sign in to view your profile
      </p>
      <Button href="/login" variant="primary">
        Sign In
      </Button>
    </div>
  </div>
{:else if user}
  <div class="container mx-auto px-4 py-8">
    <!-- Profile Header -->
    <Card padding="lg" class="mb-8">
      <div class="flex flex-col md:flex-row md:items-center gap-6">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          {#if user.avatar_url}
            <img
              src={user.avatar_url}
              alt={user.display_name || user.username}
              class="w-24 h-24 rounded-full object-cover"
            />
          {:else}
            <div class="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {(user.display_name || user.username).charAt(0).toUpperCase()}
            </div>
          {/if}
        </div>
        
        <!-- User Info -->
        <div class="flex-1">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {user.display_name || user.username}
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mb-2">
                @{user.username}
              </p>
              {#if user.bio}
                <p class="text-gray-700 dark:text-gray-300 mb-2">
                  {user.bio}
                </p>
              {/if}
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {#if user.location}
                  <div class="flex items-center space-x-1">
                    <Icon icon="lucide:map-pin" class="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                {/if}
                {#if user.website}
                  <div class="flex items-center space-x-1">
                    <Icon icon="lucide:link" class="w-4 h-4" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" class="hover:text-primary-600 dark:hover:text-primary-400">
                      {user.website}
                    </a>
                  </div>
                {/if}
                <div class="flex items-center space-x-1">
                  <Icon icon="lucide:calendar" class="w-4 h-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <Button variant="secondary" on:click={openEditModal} icon="lucide:edit">
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
    
    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <Card padding="md" class="text-center">
        <div class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
          {stats.wishlistCount}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Wishlist
        </div>
      </Card>
      
      <Card padding="md" class="text-center">
        <div class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
          {stats.reviewsCount}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Reviews
        </div>
      </Card>
      
      <Card padding="md" class="text-center">
        <div class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
          {stats.collectionsCount}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Collections
        </div>
      </Card>
      
      <Card padding="md" class="text-center">
        <div class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
          {stats.followersCount}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Followers
        </div>
      </Card>
      
      <Card padding="md" class="text-center">
        <div class="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
          {stats.followingCount}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Following
        </div>
      </Card>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card hover clickable href="/wishlist">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Icon icon="lucide:heart" class="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              My Wishlist
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {stats.wishlistCount} games
            </p>
          </div>
        </div>
      </Card>
      
      <Card hover clickable href="/collections">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Icon icon="lucide:folder" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              Collections
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {stats.collectionsCount} collections
            </p>
          </div>
        </div>
      </Card>
      
      <Card hover clickable href="/my-reviews">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Icon icon="lucide:star" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">
              My Reviews
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {stats.reviewsCount} reviews
            </p>
          </div>
        </div>
      </Card>
    </div>
  </div>
  
  <!-- Edit Profile Modal -->
  <Modal bind:open={showEditModal} title="Edit Profile" size="md">
    <form on:submit|preventDefault={saveProfile} class="space-y-4">
      <Input
        bind:value={editForm.display_name}
        label="Display Name"
        placeholder="Your display name"
      />
      
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bio
        </label>
        <textarea
          bind:value={editForm.bio}
          placeholder="Tell us about yourself..."
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        ></textarea>
      </div>
      
      <Input
        bind:value={editForm.location}
        label="Location"
        placeholder="Your location"
        icon="lucide:map-pin"
      />
      
      <Input
        bind:value={editForm.website}
        label="Website"
        type="url"
        placeholder="https://your-website.com"
        icon="lucide:link"
      />
    </form>
    
    <svelte:fragment slot="footer">
      <Button variant="secondary" on:click={() => showEditModal = false}>
        Cancel
      </Button>
      <Button variant="primary" on:click={saveProfile}>
        Save Changes
      </Button>
    </svelte:fragment>
  </Modal>
{/if}