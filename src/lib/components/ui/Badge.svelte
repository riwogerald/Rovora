<script lang="ts">
  export let variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'default';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let rounded = false;
  
  $: classes = [
    'inline-flex items-center font-medium',
    // Variants
    variant === 'default' && 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    variant === 'primary' && 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    variant === 'secondary' && 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    variant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    variant === 'warning' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    variant === 'danger' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    // Sizes
    size === 'sm' && 'px-2 py-0.5 text-xs',
    size === 'md' && 'px-2.5 py-1 text-sm',
    size === 'lg' && 'px-3 py-1.5 text-base',
    // Shape
    rounded ? 'rounded-full' : 'rounded-md'
  ].filter(Boolean).join(' ');
</script>

<span class={classes} {...$$restProps}>
  <slot />
</span>