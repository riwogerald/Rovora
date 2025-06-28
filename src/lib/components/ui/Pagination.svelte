<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '@iconify/svelte';
  import Button from './Button.svelte';
  
  export let currentPage = 1;
  export let totalPages = 1;
  export let showFirstLast = true;
  export let showPrevNext = true;
  export let maxVisiblePages = 5;
  export let disabled = false;
  
  const dispatch = createEventDispatcher<{
    pageChange: { page: number };
  }>();
  
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
      dispatch('pageChange', { page });
    }
  }
  
  $: visiblePages = (() => {
    const pages: number[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  })();
  
  $: showStartEllipsis = visiblePages[0] > 2;
  $: showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;
</script>

{#if totalPages > 1}
  <nav class="flex items-center justify-center space-x-1" aria-label="Pagination">
    <!-- First page -->
    {#if showFirstLast && currentPage > 1}
      <Button
        variant="ghost"
        size="sm"
        {disabled}
        icon="lucide:chevrons-left"
        on:click={() => goToPage(1)}
        aria-label="Go to first page"
      />
    {/if}
    
    <!-- Previous page -->
    {#if showPrevNext}
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || currentPage <= 1}
        icon="lucide:chevron-left"
        on:click={() => goToPage(currentPage - 1)}
        aria-label="Go to previous page"
      />
    {/if}
    
    <!-- First page number -->
    {#if visiblePages[0] > 1}
      <Button
        variant="ghost"
        size="sm"
        {disabled}
        on:click={() => goToPage(1)}
      >
        1
      </Button>
    {/if}
    
    <!-- Start ellipsis -->
    {#if showStartEllipsis}
      <span class="px-2 py-1 text-gray-500">...</span>
    {/if}
    
    <!-- Visible page numbers -->
    {#each visiblePages as page}
      <Button
        variant={page === currentPage ? 'primary' : 'ghost'}
        size="sm"
        {disabled}
        on:click={() => goToPage(page)}
        aria-label="Go to page {page}"
        aria-current={page === currentPage ? 'page' : undefined}
      >
        {page}
      </Button>
    {/each}
    
    <!-- End ellipsis -->
    {#if showEndEllipsis}
      <span class="px-2 py-1 text-gray-500">...</span>
    {/if}
    
    <!-- Last page number -->
    {#if visiblePages[visiblePages.length - 1] < totalPages}
      <Button
        variant="ghost"
        size="sm"
        {disabled}
        on:click={() => goToPage(totalPages)}
      >
        {totalPages}
      </Button>
    {/if}
    
    <!-- Next page -->
    {#if showPrevNext}
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || currentPage >= totalPages}
        icon="lucide:chevron-right"
        on:click={() => goToPage(currentPage + 1)}
        aria-label="Go to next page"
      />
    {/if}
    
    <!-- Last page -->
    {#if showFirstLast && currentPage < totalPages}
      <Button
        variant="ghost"
        size="sm"
        {disabled}
        icon="lucide:chevrons-right"
        on:click={() => goToPage(totalPages)}
        aria-label="Go to last page"
      />
    {/if}
  </nav>
{/if}