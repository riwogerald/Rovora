<script lang="ts">
  import Icon from '@iconify/svelte';
  
  export let value = '';
  export let type: 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel' = 'text';
  export let placeholder = '';
  export let disabled = false;
  export let readonly = false;
  export let required = false;
  export let error = '';
  export let label = '';
  export let hint = '';
  export let icon: string | undefined = undefined;
  export let iconPosition: 'left' | 'right' = 'left';
  export let clearable = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let fullWidth = true;
  
  let inputElement: HTMLInputElement;
  
  function handleClear() {
    value = '';
    inputElement?.focus();
  }
  
  $: hasError = !!error;
  $: showClearButton = clearable && value && !disabled && !readonly;
  
  $: inputClasses = [
    'block border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
    // Base styles
    'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
    // Border and focus states
    hasError 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600' 
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600',
    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
    // Sizes
    size === 'sm' && 'px-3 py-1.5 text-sm',
    size === 'md' && 'px-3 py-2 text-sm',
    size === 'lg' && 'px-4 py-3 text-base',
    // Icon padding
    icon && iconPosition === 'left' && (size === 'sm' ? 'pl-9' : size === 'md' ? 'pl-10' : 'pl-11'),
    icon && iconPosition === 'right' && (size === 'sm' ? 'pr-9' : size === 'md' ? 'pr-10' : 'pr-11'),
    showClearButton && (size === 'sm' ? 'pr-9' : size === 'md' ? 'pr-10' : 'pr-11'),
    // Full width
    fullWidth && 'w-full'
  ].filter(Boolean).join(' ');
  
  $: iconClasses = [
    'absolute top-1/2 transform -translate-y-1/2 text-gray-400',
    size === 'sm' && 'w-4 h-4',
    size === 'md' && 'w-5 h-5',
    size === 'lg' && 'w-5 h-5',
    iconPosition === 'left' && (size === 'sm' ? 'left-2.5' : 'left-3'),
    iconPosition === 'right' && (size === 'sm' ? 'right-2.5' : 'right-3')
  ].filter(Boolean).join(' ');
</script>

<div class="space-y-1">
  {#if label}
    <label for={$$props.id} class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <div class="relative">
    {#if icon}
      <Icon {icon} class={iconClasses} />
    {/if}
    
    <input
      bind:this={inputElement}
      bind:value
      {type}
      {placeholder}
      {disabled}
      {readonly}
      {required}
      class={inputClasses}
      on:input
      on:change
      on:focus
      on:blur
      on:keydown
      on:keyup
      on:keypress
      {...$$restProps}
    />
    
    {#if showClearButton}
      <button
        type="button"
        class="absolute top-1/2 transform -translate-y-1/2 {size === 'sm' ? 'right-2.5' : 'right-3'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        on:click={handleClear}
      >
        <Icon icon="lucide:x" class="{size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}" />
      </button>
    {/if}
  </div>
  
  {#if error}
    <p class="text-sm text-red-600 dark:text-red-400">
      {error}
    </p>
  {:else if hint}
    <p class="text-sm text-gray-500 dark:text-gray-400">
      {hint}
    </p>
  {/if}
</div>