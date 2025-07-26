<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';
  import type { Game, GameEntry } from '$lib/types/core';
  
  export let game: Game | null = null;
  export let gameEntry: GameEntry | null = null;
  export let isEditing = false;
  export let initialData: any = null;

  const dispatch = createEventDispatcher<{
    submit: {
      gameId: string;
      gameEntryId?: string;
      title: string;
      content: string;
      entryType: string;
      mood?: string;
      playtimeAtEntry?: number;
      completionAtEntry?: number;
      spoilerLevel: string;
      isPublic: boolean;
      screenshots: string[];
      tags: string[];
    };
    cancel: void;
  }>();

  // Form data
  let title = initialData?.title || '';
  let content = initialData?.content || '';
  let entryType = initialData?.entry_type || 'journal';
  let mood = initialData?.mood || '';
  let playtimeAtEntry = initialData?.playtime_at_entry || gameEntry?.playtime_hours || '';
  let completionAtEntry = initialData?.completion_at_entry || gameEntry?.completion_percentage || '';
  let spoilerLevel = initialData?.spoiler_level || 'none';
  let isPublic = initialData?.is_public ?? true;
  let screenshots: string[] = [];
  let tags: string[] = [];

  // Form validation
  let errors: Record<string, string> = {};
  let isSubmitting = false;

  const entryTypes = [
    { value: 'journal', label: 'Journal Entry', icon: 'lucide:book-open', description: 'Personal thoughts and experiences' },
    { value: 'review', label: 'Review', icon: 'lucide:star', description: 'Detailed game review' },
    { value: 'screenshot', label: 'Screenshot', icon: 'lucide:camera', description: 'Share a memorable moment' },
    { value: 'achievement', label: 'Achievement', icon: 'lucide:trophy', description: 'Celebrate an accomplishment' },
    { value: 'milestone', label: 'Milestone', icon: 'lucide:flag', description: 'Mark a significant moment' },
    { value: 'thought', label: 'Quick Thought', icon: 'lucide:message-circle', description: 'Brief observation or idea' },
    { value: 'tip', label: 'Tip', icon: 'lucide:lightbulb', description: 'Share helpful advice' },
    { value: 'bug_report', label: 'Bug Report', icon: 'lucide:bug', description: 'Report an issue' }
  ];

  const spoilerLevels = [
    { value: 'none', label: 'No Spoilers', color: 'variant-soft-success' },
    { value: 'minor', label: 'Minor Spoilers', color: 'variant-soft-warning' },
    { value: 'major', label: 'Major Spoilers', color: 'variant-soft-error' },
    { value: 'ending', label: 'Ending Spoilers', color: 'variant-soft-error' }
  ];

  const moods = [
    'Excited', 'Frustrated', 'Amazed', 'Bored', 'Challenged', 'Relaxed', 
    'Nostalgic', 'Impressed', 'Confused', 'Satisfied', 'Hyped', 'Zen'
  ];

  function validateForm() {
    errors = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }

    if (!content.trim()) {
      errors.content = 'Content is required';
    } else if (content.length < 10) {
      errors.content = 'Content must be at least 10 characters';
    } else if (content.length > 5000) {
      errors.content = 'Content must be less than 5000 characters';
    }

    if (!game?.id) {
      errors.game = 'Game is required';
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    isSubmitting = true;

    try {
      dispatch('submit', {
        gameId: game!.id,
        gameEntryId: gameEntry?.id,
        title: title.trim(),
        content: content.trim(),
        entryType,
        mood: mood || undefined,
        playtimeAtEntry: playtimeAtEntry ? parseInt(playtimeAtEntry) : undefined,
        completionAtEntry: completionAtEntry ? parseInt(completionAtEntry) : undefined,
        spoilerLevel,
        isPublic,
        screenshots,
        tags
      });
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    dispatch('cancel');
  }

  // Auto-resize textarea
  function autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
</script>

<div class="card p-6 max-w-4xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h2 class="h3 font-semibold">
      {isEditing ? 'Edit' : 'Create'} Codex Entry
    </h2>
    
    {#if game}
      <div class="flex items-center gap-3">
        {#if game.cover_image}
          <img 
            src={game.cover_image} 
            alt={game.title}
            class="w-12 h-16 object-cover rounded"
          />
        {/if}
        <div>
          <h3 class="font-medium text-surface-900-50-token">{game.title}</h3>
          {#if gameEntry}
            <p class="text-sm text-surface-500-400-token">
              Status: {gameEntry.status} • 
              {#if gameEntry.playtime_hours}{gameEntry.playtime_hours}h played{/if}
            </p>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Entry Type Selection -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      {#each entryTypes as type}
        <label class="cursor-pointer">
          <input
            type="radio"
            bind:group={entryType}
            value={type.value}
            class="sr-only"
          />
          <div class="entry-type-card p-3 rounded-lg border-2 transition-all
                      {entryType === type.value 
                        ? 'border-primary-500 bg-primary-50-900-token' 
                        : 'border-surface-200-700-token hover:border-surface-300-600-token'
                      }">
            <Icon icon={type.icon} class="w-6 h-6 mx-auto mb-2 text-primary-500" />
            <h4 class="text-sm font-medium text-center">{type.label}</h4>
            <p class="text-xs text-surface-500-400-token text-center mt-1">{type.description}</p>
          </div>
        </label>
      {/each}
    </div>

    <!-- Title -->
    <div>
      <label for="title" class="label">
        <span>Title <span class="text-error-500">*</span></span>
      </label>
      <input
        id="title"
        type="text"
        bind:value={title}
        placeholder="Give your entry a descriptive title..."
        class="input {errors.title ? 'input-error' : ''}"
        maxlength="200"
      />
      {#if errors.title}
        <p class="text-error-500 text-sm mt-1">{errors.title}</p>
      {/if}
      <p class="text-surface-500-400-token text-sm mt-1">{title.length}/200 characters</p>
    </div>

    <!-- Content -->
    <div>
      <label for="content" class="label">
        <span>Content <span class="text-error-500">*</span></span>
      </label>
      <textarea
        id="content"
        bind:value={content}
        on:input={autoResize}
        placeholder="Share your thoughts, experiences, or insights about this game..."
        class="textarea min-h-32 {errors.content ? 'input-error' : ''}"
        maxlength="5000"
      ></textarea>
      {#if errors.content}
        <p class="text-error-500 text-sm mt-1">{errors.content}</p>
      {/if}
      <p class="text-surface-500-400-token text-sm mt-1">{content.length}/5000 characters</p>
    </div>

    <!-- Additional Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Mood -->
      <div>
        <label for="mood" class="label">
          <span>Mood</span>
        </label>
        <select id="mood" bind:value={mood} class="select">
          <option value="">Select mood...</option>
          {#each moods as moodOption}
            <option value={moodOption}>{moodOption}</option>
          {/each}
        </select>
      </div>

      <!-- Playtime -->
      <div>
        <label for="playtime" class="label">
          <span>Playtime (hours)</span>
        </label>
        <input
          id="playtime"
          type="number"
          bind:value={playtimeAtEntry}
          placeholder="e.g. 25"
          class="input"
          min="0"
          max="9999"
        />
      </div>

      <!-- Completion -->
      <div>
        <label for="completion" class="label">
          <span>Completion (%)</span>
        </label>
        <input
          id="completion"
          type="number"
          bind:value={completionAtEntry}
          placeholder="e.g. 75"
          class="input"
          min="0"
          max="100"
        />
      </div>

      <!-- Spoiler Level -->
      <div>
        <label for="spoiler" class="label">
          <span>Spoiler Level</span>
        </label>
        <select id="spoiler" bind:value={spoilerLevel} class="select">
          {#each spoilerLevels as level}
            <option value={level.value}>{level.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Privacy & Settings -->
    <div class="flex items-center justify-between p-4 bg-surface-100-800-token rounded-lg">
      <div class="flex items-center gap-3">
        <Icon 
          icon={isPublic ? 'lucide:globe' : 'lucide:lock'} 
          class="w-5 h-5 text-{isPublic ? 'success' : 'warning'}-500"
        />
        <div>
          <h4 class="font-medium">Visibility</h4>
          <p class="text-sm text-surface-500-400-token">
            {isPublic ? 'Public - visible to everyone' : 'Private - only visible to you'}
          </p>
        </div>
      </div>
      
      <label class="flex items-center cursor-pointer">
        <input
          type="checkbox"
          bind:checked={isPublic}
          class="checkbox"
        />
        <span class="ml-2">Make public</span>
      </label>
    </div>

    <!-- Spoiler Warning -->
    {#if spoilerLevel !== 'none'}
      <div class="alert variant-soft-warning">
        <Icon icon="lucide:alert-triangle" slot="lead" />
        <div class="alert-message">
          <h3 class="alert-title">Spoiler Warning</h3>
          <p>This entry contains {spoilerLevel} spoilers and will be clearly marked.</p>
        </div>
      </div>
    {/if}

    <!-- Form Actions -->
    <div class="flex items-center justify-end gap-3 pt-6 border-t border-surface-200-700-token">
      <button
        type="button"
        on:click={handleCancel}
        class="btn variant-ghost-surface"
        disabled={isSubmitting}
      >
        Cancel
      </button>
      
      <button
        type="submit"
        class="btn variant-filled-primary"
        disabled={isSubmitting || !validateForm()}
      >
        {#if isSubmitting}
          <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
        {:else}
          <Icon icon="lucide:save" class="w-4 h-4 mr-2" />
        {/if}
        {isEditing ? 'Update Entry' : 'Create Entry'}
      </button>
    </div>
  </form>
</div>

<style>
  .entry-type-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
</style>
