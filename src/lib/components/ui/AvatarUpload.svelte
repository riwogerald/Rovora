<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';
  
  export let currentAvatar: string | null = null;
  export let username: string = '';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let editable: boolean = true;
  
  const dispatch = createEventDispatcher<{
    upload: { file: File };
    remove: void;
  }>();
  
  let fileInput: HTMLInputElement;
  let dragOver = false;
  
  $: sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };
  
  $: textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };
  
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }
  
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  }
  
  function handleFile(file: File) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    dispatch('upload', { file });
  }
  
  function handleRemove() {
    dispatch('remove');
  }
  
  function openFileDialog() {
    fileInput?.click();
  }
</script>

<div class="relative inline-block">
  <!-- Avatar Display -->
  <div 
    class="relative {sizeClasses[size]} rounded-full overflow-hidden group"
    class:cursor-pointer={editable}
    on:click={editable ? openFileDialog : undefined}
    on:dragover|preventDefault={() => dragOver = true}
    on:dragleave={() => dragOver = false}
    on:drop={handleDrop}
    role={editable ? 'button' : 'img'}
    tabindex={editable ? 0 : -1}
    aria-label={editable ? 'Upload avatar' : `${username}'s avatar`}
  >
    {#if currentAvatar}
      <img 
        src={currentAvatar} 
        alt="{username}'s avatar" 
        class="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
    {:else}
      <div class="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <span class="text-white font-bold {textSizeClasses[size]}">
          {username.charAt(0).toUpperCase()}
        </span>
      </div>
    {/if}
    
    <!-- Overlay for editable avatars -->
    {#if editable}
      <div 
        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        class:opacity-100={dragOver}
      >
        <Icon icon="lucide:camera" class="w-6 h-6 text-white" />
      </div>
    {/if}
  </div>
  
  <!-- Edit Button -->
  {#if editable}
    <button 
      type="button"
      on:click={openFileDialog}
      class="absolute -bottom-1 -right-1 btn-icon btn-sm variant-filled-surface shadow-lg"
      aria-label="Change avatar"
    >
      <Icon icon="lucide:camera" class="w-4 h-4" />
    </button>
  {/if}
  
  <!-- Remove Button (only show if there's an avatar) -->
  {#if editable && currentAvatar}
    <button 
      type="button"
      on:click={handleRemove}
      class="absolute -top-1 -right-1 btn-icon btn-sm variant-filled-error shadow-lg"
      aria-label="Remove avatar"
    >
      <Icon icon="lucide:x" class="w-3 h-3" />
    </button>
  {/if}
  
  <!-- Hidden file input -->
  {#if editable}
    <input
      bind:this={fileInput}
      type="file"
      accept="image/*"
      on:change={handleFileSelect}
      class="hidden"
      aria-hidden="true"
    />
  {/if}
</div>

{#if editable}
  <div class="mt-2 text-center">
    <p class="text-xs text-surface-500-400-token">
      Click to upload or drag & drop
    </p>
    <p class="text-xs text-surface-400-500-token">
      Max 5MB • JPG, PNG, GIF
    </p>
  </div>
{/if}