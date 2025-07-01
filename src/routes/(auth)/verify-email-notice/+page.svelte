<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '@iconify/svelte';
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  
  export let data;
  
  let resendLoading = false;
  
  $: user = data.user;
  
  $: if ($page.form?.message) {
    if ($page.form.success) {
      toast.success($page.form.message);
    } else {
      toast.error($page.form.message);
    }
  }
</script>

<svelte:head>
  <title>Verify Your Email - Rovora</title>
  <meta name="description" content="Please verify your email address to complete your Rovora registration" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Header -->
    <div class="text-center">
      <a href="/" class="inline-flex items-center gap-2 mb-6">
        <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
          <span class="text-white font-gaming font-bold">R</span>
        </div>
        <span class="font-gaming font-bold text-2xl text-surface-900-50-token">Rovora</span>
      </a>
      
      <div class="w-16 h-16 bg-gradient-to-br from-tertiary-500 to-warning-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon icon="lucide:mail" class="w-8 h-8 text-white" />
      </div>
      
      <h2 class="text-3xl font-bold text-surface-900-50-token">
        Check your email
      </h2>
      <p class="mt-2 text-surface-600-300-token">
        We've sent a verification link to your email address
      </p>
    </div>

    <!-- Content -->
    <div class="card variant-ghost-surface p-6 space-y-4">
      <div class="text-center">
        <p class="text-surface-700-200-token mb-4">
          Hi <strong>{user?.username}</strong>! We've sent a verification email to:
        </p>
        <p class="font-medium text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-lg">
          {user?.email}
        </p>
      </div>
      
      <div class="space-y-3 text-sm text-surface-600-300-token">
        <div class="flex items-start gap-3">
          <Icon icon="lucide:check-circle" class="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
          <p>Click the verification link in the email to activate your account</p>
        </div>
        <div class="flex items-start gap-3">
          <Icon icon="lucide:clock" class="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" />
          <p>The verification link will expire in 2 hours</p>
        </div>
        <div class="flex items-start gap-3">
          <Icon icon="lucide:shield-check" class="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
          <p>You can still browse Rovora, but some features require email verification</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="space-y-4">
      <!-- Resend Email -->
      <form
        method="POST"
        action="?/resend"
        use:enhance={() => {
          resendLoading = true;
          return async ({ update }) => {
            resendLoading = false;
            await update();
          };
        }}
      >
        <button
          type="submit"
          disabled={resendLoading}
          class="btn variant-ghost-primary w-full"
        >
          {#if resendLoading}
            <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            Sending...
          {:else}
            <Icon icon="lucide:refresh-cw" class="w-4 h-4 mr-2" />
            Resend verification email
          {/if}
        </button>
      </form>

      <!-- Continue to Dashboard -->
      <a href="/dashboard" class="btn variant-filled-primary w-full">
        <Icon icon="lucide:arrow-right" class="w-4 h-4 mr-2" />
        Continue to Dashboard
      </a>

      <!-- Check Email App -->
      <div class="text-center">
        <p class="text-sm text-surface-600-300-token mb-3">
          Can't find the email? Check your spam folder or:
        </p>
        <div class="flex gap-2 justify-center">
          <a 
            href="https://gmail.com" 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn variant-ghost-surface btn-sm"
          >
            <Icon icon="lucide:mail" class="w-4 h-4 mr-1" />
            Gmail
          </a>
          <a 
            href="https://outlook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn variant-ghost-surface btn-sm"
          >
            <Icon icon="lucide:mail" class="w-4 h-4 mr-1" />
            Outlook
          </a>
        </div>
      </div>
    </div>
  </div>
</div>