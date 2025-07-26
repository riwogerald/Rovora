<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';
  import { formatDistanceToNow } from 'date-fns';
  import type { CodexEntryWithDetails } from '$lib/database/queries/codex';
  
  export let entry: CodexEntryWithDetails;
  export let compact = false;
  export let showGame = true;
  export let showUser = true;
  export let currentUserId: string | null = null;

  const dispatch = createEventDispatcher<{
    like: { entryId: string };
    comment: { entryId: string };
    share: { entryId: string };
    edit: { entry: CodexEntryWithDetails };
    delete: { entryId: string };
    viewDetails: { entry: CodexEntryWithDetails };
  }>();

  $: isOwner = currentUserId === entry.user_id;
  $: screenshots = entry.screenshots ? JSON.parse(entry.screenshots) : [];
  $: hasContent = entry.content.length > 0;
  $: previewContent = compact && entry.content.length > 200 
    ? entry.content.substring(0, 200) + '...' 
    : entry.content;

  function getEntryTypeIcon(type: string): string {
    const iconMap: Record<string, string> = {
      journal: 'lucide:book-open',
      review: 'lucide:star',
      screenshot: 'lucide:camera',
      achievement: 'lucide:trophy',
      milestone: 'lucide:flag',
      thought: 'lucide:message-circle',
      tip: 'lucide:lightbulb',
      bug_report: 'lucide:bug'
    };
    return iconMap[type] || 'lucide:file-text';
  }

  function getEntryTypeColor(type: string): string {
    const colorMap: Record<string, string> = {
      journal: 'text-blue-500',
      review: 'text-yellow-500',
      screenshot: 'text-green-500',
      achievement: 'text-purple-500',
      milestone: 'text-orange-500',
      thought: 'text-pink-500',
      tip: 'text-teal-500',
      bug_report: 'text-red-500'
    };
    return colorMap[type] || 'text-surface-500';
  }

  function getSpoilerLevelColor(level: string): string {
    const colorMap: Record<string, string> = {
      none: 'text-green-500',
      minor: 'text-yellow-500',
      major: 'text-orange-500',
      ending: 'text-red-500'
    };
    return colorMap[level] || 'text-surface-500';
  }

  function handleLike() {
    dispatch('like', { entryId: entry.id });
  }

  function handleComment() {
    dispatch('comment', { entryId: entry.id });
  }

  function handleShare() {
    dispatch('share', { entryId: entry.id });
  }

  function handleEdit() {
    dispatch('edit', { entry });
  }

  function handleDelete() {
    if (confirm('Are you sure you want to delete this codex entry?')) {
      dispatch('delete', { entryId: entry.id });
    }
  }

  function handleViewDetails() {
    dispatch('viewDetails', { entry });
  }
</script>

<article class="codex-entry-card card p-4 {compact ? 'hover:shadow-md' : ''} transition-shadow cursor-pointer" 
         on:click={handleViewDetails} 
         on:keydown={(e) => e.key === 'Enter' && handleViewDetails()}>
  
  <!-- Header -->
  <header class="flex items-start justify-between mb-3">
    <div class="flex items-start gap-3 flex-1 min-w-0">
      <!-- Entry Type Icon -->
      <div class="flex-shrink-0 mt-1">
        <Icon 
          icon={getEntryTypeIcon(entry.entry_type)} 
          class="w-5 h-5 {getEntryTypeColor(entry.entry_type)}"
        />
      </div>

      <!-- Entry Info -->
      <div class="flex-1 min-w-0">
        <!-- Title -->
        <h3 class="font-semibold text-surface-900-50-token {compact ? 'text-base' : 'text-lg'} 
                   leading-tight mb-1 line-clamp-2">
          {entry.title}
        </h3>

        <!-- Metadata -->
        <div class="flex items-center gap-3 text-sm text-surface-500-400-token mb-2">
          <!-- User -->
          {#if showUser}
            <div class="flex items-center gap-1">
              {#if entry.user.avatar_url}
                <img 
                  src={entry.user.avatar_url} 
                  alt={entry.user.username}
                  class="w-4 h-4 rounded-full"
                />
              {:else}
                <Icon icon="lucide:user" class="w-4 h-4" />
              {/if}
              <span>{entry.user.display_name || entry.user.username}</span>
            </div>
          {/if}

          <!-- Game -->
          {#if showGame}
            <div class="flex items-center gap-1">
              <Icon icon="lucide:gamepad-2" class="w-4 h-4" />
              <span class="truncate max-w-32">{entry.game.title}</span>
            </div>
          {/if}

          <!-- Date -->
          <div class="flex items-center gap-1">
            <Icon icon="lucide:clock" class="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(entry.created_at))} ago</span>
          </div>
        </div>

        <!-- Context Info -->
        <div class="flex items-center gap-4 text-xs text-surface-400-500-token mb-2">
          {#if entry.mood}
            <div class="flex items-center gap-1">
              <Icon icon="lucide:heart" class="w-3 h-3" />
              <span>Feeling {entry.mood.toLowerCase()}</span>
            </div>
          {/if}

          {#if entry.playtime_at_entry}
            <div class="flex items-center gap-1">
              <Icon icon="lucide:clock" class="w-3 h-3" />
              <span>{entry.playtime_at_entry}h played</span>
            </div>
          {/if}

          {#if entry.completion_at_entry}
            <div class="flex items-center gap-1">
              <Icon icon="lucide:target" class="w-3 h-3" />
              <span>{entry.completion_at_entry}% complete</span>
            </div>
          {/if}

          {#if entry.spoiler_level !== 'none'}
            <div class="flex items-center gap-1 {getSpoilerLevelColor(entry.spoiler_level)}">
              <Icon icon="lucide:alert-triangle" class="w-3 h-3" />
              <span class="capitalize">{entry.spoiler_level} spoilers</span>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Actions Menu -->
    {#if isOwner}
      <div class="flex items-center gap-1 ml-2">
        <button
          on:click|stopPropagation={handleEdit}
          class="btn btn-sm variant-ghost-surface"
          title="Edit entry"
        >
          <Icon icon="lucide:edit-3" class="w-4 h-4" />
        </button>
        
        <button
          on:click|stopPropagation={handleDelete}
          class="btn btn-sm variant-ghost-error"
          title="Delete entry"
        >
          <Icon icon="lucide:trash-2" class="w-4 h-4" />
        </button>
      </div>
    {/if}
  </header>

  <!-- Content -->
  {#if hasContent}
    <div class="mb-4">
      <!-- Spoiler Warning -->
      {#if entry.spoiler_level !== 'none'}
        <div class="alert variant-soft-warning mb-3 text-sm">
          <Icon icon="lucide:eye-off" class="w-4 h-4" slot="lead" />
          <span>Contains {entry.spoiler_level} spoilers - click to reveal</span>
        </div>
      {/if}

      <!-- Entry Content -->
      <div class="prose prose-sm max-w-none text-surface-700-200-token">
        <p class="whitespace-pre-wrap">{previewContent}</p>
        
        {#if compact && entry.content.length > 200}
          <button 
            on:click|stopPropagation={handleViewDetails}
            class="text-primary-500 hover:text-primary-600 text-sm font-medium mt-2"
          >
            Read more...
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Screenshots -->
  {#if screenshots.length > 0}
    <div class="mb-4">
      <div class="flex gap-2 overflow-x-auto">
        {#each screenshots.slice(0, compact ? 2 : 4) as screenshot}
          <img 
            src={screenshot} 
            alt="Screenshot"
            class="w-20 h-20 object-cover rounded flex-shrink-0"
          />
        {/each}
        
        {#if screenshots.length > (compact ? 2 : 4)}
          <div class="w-20 h-20 bg-surface-200-700-token rounded flex items-center justify-center">
            <span class="text-sm text-surface-500-400-token">
              +{screenshots.length - (compact ? 2 : 4)}
            </span>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Rating Display -->
  {#if entry.rating}
    <div class="mb-4 p-3 bg-surface-100-800-token rounded-lg">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Overall Rating</span>
        <div class="flex items-center gap-1">
          {#each Array(5) as _, i}
            <Icon 
              icon="lucide:gamepad-2" 
              class="w-4 h-4 {i < entry.rating.overall_rating ? 'text-primary-500' : 'text-surface-300-600-token'}"
            />
          {/each}
          <span class="ml-1 text-sm text-surface-600-300-token">
            {entry.rating.overall_rating}/5
          </span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Footer Actions -->
  <footer class="flex items-center justify-between pt-3 border-t border-surface-200-700-token">
    <div class="flex items-center gap-4">
      <!-- Like -->
      <button
        on:click|stopPropagation={handleLike}
        class="flex items-center gap-1 text-sm text-surface-500-400-token hover:text-error-500 transition-colors"
      >
        <Icon icon="lucide:heart" class="w-4 h-4" />
        <span>{entry.likes_count || 0}</span>
      </button>

      <!-- Comments -->
      <button
        on:click|stopPropagation={handleComment}
        class="flex items-center gap-1 text-sm text-surface-500-400-token hover:text-primary-500 transition-colors"
      >
        <Icon icon="lucide:message-circle" class="w-4 h-4" />
        <span>{entry.comments_count || 0}</span>
      </button>

      <!-- Share -->
      <button
        on:click|stopPropagation={handleShare}
        class="flex items-center gap-1 text-sm text-surface-500-400-token hover:text-secondary-500 transition-colors"
      >
        <Icon icon="lucide:share" class="w-4 h-4" />
        <span>{entry.shares_count || 0}</span>
      </button>
    </div>

    <!-- Entry Type Badge -->
    <div class="badge variant-soft-surface text-xs">
      {entry.entry_type.replace('_', ' ')}
    </div>
  </footer>
</article>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .codex-entry-card:hover {
    transform: translateY(-1px);
  }
</style>
