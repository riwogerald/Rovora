<script lang="ts">
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let hover = false;
  export let clickable = false;
  export let href: string | undefined = undefined;
  
  $: classes = [
    'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
    hover && 'hover:shadow-md transition-shadow duration-200',
    clickable && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750',
    padding === 'none' && '',
    padding === 'sm' && 'p-4',
    padding === 'md' && 'p-6',
    padding === 'lg' && 'p-8'
  ].filter(Boolean).join(' ');
</script>

{#if href}
  <a {href} class={classes} {...$$restProps}>
    <slot />
  </a>
{:else if clickable}
  <button class={classes} on:click {...$$restProps}>
    <slot />
  </button>
{:else}
  <div class={classes} {...$$restProps}>
    <slot />
  </div>
{/if}