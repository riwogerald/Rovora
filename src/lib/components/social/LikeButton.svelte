<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';

  export let liked = false;
  export let likesCount = 0;
  export let targetId: string;
  export let type: 'codex_entry' | 'comment';
  
  const dispatch = createEventDispatcher<{ toggleLike: { targetId: string, type: string } }>();

  function handleToggleLike() {
    dispatch('toggleLike', { targetId, type });
  }
</script>

<button
  type="button"
  class="flex items-center gap-1 text-sm"
  class:liked={liked}
  on:click={handleToggleLike}
>
  <Icon icon="lucide:heart" class="w-4 h-4" />
  <span>{likesCount}</span>
</button>

<style>
  button {
    color: var(--color-text-secondary);
    transition: color 0.2s;
  }
  button.liked {
    color: var(--color-text-error);
  }
</style>

