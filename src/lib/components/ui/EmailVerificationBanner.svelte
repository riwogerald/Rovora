<script lang="ts">
  import { enhance } from '$app/forms';
  import Icon from '@iconify/svelte';
  import { toast } from 'svelte-sonner';
  
  export let user: any;
  export let showBanner = true;
  
  let resendLoading = false;
  let dismissed = false;
  
  function dismissBanner() {
    dismissed = true;
    // Store dismissal in localStorage
    localStorage.setItem('email-verification-banner-dismissed', 'true');
  }
  
  // Check if banner was previously dismissed
  if (typeof window !== 'undefined') {
    const wasDismissed = localStorage.getItem('email-verification-banner-dismissed');
    if (wasDismissed) {
      dismissed = true;
    }
  }
  
  $: shouldShow = showBanner && user && !user.email_verified && !dismissed;
</script>

{#if shouldShow}
  <div class="bg-gradient-to-r from-warning-500 to-tertiary-500 text-white">
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <Icon icon="lucide:mail" class="w-5 h-5 flex-shrink-0" />
          <div class="flex-1">
            <p class="text-sm font-medium">
              Please verify your email address to unlock all Rovora features
            </p>
            <p class="text-xs opacity-90">
              Check your inbox for a verification link or request a new one
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <form
            method="POST"
            action="/verify-email-notice?/resend"
            use:enhance={() => {
              resendLoading = true;
              return async ({ result, update }) => {
                resendLoading = false;
                if (result.type === 'success') {
                  toast.success('Verification email sent!');
                } else if (result.type === 'failure') {
                  toast.error('Failed to send email. Please try again.');
                }
                await update();
              };
            }}
          >
            <button
              type="submit"
              disabled={resendLoading}
              class="btn btn-sm variant-ghost-surface text-white border-white/20 hover:bg-white/10"
            >
              {#if resendLoading}
                <Icon icon="lucide:loader-2" class="w-3 h-3 mr-1 animate-spin" />
                Sending...
              {:else}
                <Icon icon="lucide:refresh-cw" class="w-3 h-3 mr-1" />
                Resend
              {/if}
            </button>
          </form>
          
          <a href="/verify-email-notice" class="btn btn-sm variant-filled-surface text-warning-500">
            <Icon icon="lucide:arrow-right" class="w-3 h-3 mr-1" />
            Verify Now
          </a>
          
          <button
            on:click={dismissBanner}
            class="btn-icon btn-sm variant-ghost-surface text-white hover:bg-white/10"
            aria-label="Dismiss banner"
          >
            <Icon icon="lucide:x" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}