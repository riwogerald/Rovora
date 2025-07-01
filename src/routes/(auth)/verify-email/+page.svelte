<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Icon from '@iconify/svelte';
  
  export let data;
  
  $: verificationStatus = data.status;
  $: user = data.user;
  
  let countdown = 5;
  let redirectTimer: NodeJS.Timeout;
  
  onMount(() => {
    if (verificationStatus === 'success') {
      redirectTimer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          window.location.href = '/dashboard';
        }
      }, 1000);
    }
    
    return () => {
      if (redirectTimer) {
        clearInterval(redirectTimer);
      }
    };
  });
</script>

<svelte:head>
  <title>Email Verification - Rovora</title>
  <meta name="description" content="Email verification status" />
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
    </div>

    <!-- Success State -->
    {#if verificationStatus === 'success'}
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:check" class="w-8 h-8 text-white" />
        </div>
        
        <h2 class="text-3xl font-bold text-surface-900-50-token mb-4">
          Email Verified!
        </h2>
        
        <div class="card variant-ghost-surface p-6 space-y-4">
          <p class="text-surface-700-200-token">
            Welcome to Rovora, <strong>{user?.username}</strong>! Your email has been successfully verified.
          </p>
          
          <div class="space-y-3 text-sm text-surface-600-300-token">
            <div class="flex items-center gap-3">
              <Icon icon="lucide:gamepad-2" class="w-5 h-5 text-primary-500" />
              <p>Start tracking your gaming journey</p>
            </div>
            <div class="flex items-center gap-3">
              <Icon icon="lucide:book-open" class="w-5 h-5 text-secondary-500" />
              <p>Create your first codex entry</p>
            </div>
            <div class="flex items-center gap-3">
              <Icon icon="lucide:users" class="w-5 h-5 text-tertiary-500" />
              <p>Connect with other gamers</p>
            </div>
          </div>
          
          <div class="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4 mt-4">
            <p class="text-sm text-success-700 dark:text-success-300">
              <Icon icon="lucide:info" class="w-4 h-4 inline mr-1" />
              Redirecting to your dashboard in {countdown} seconds...
            </p>
          </div>
        </div>
        
        <a href="/dashboard" class="btn variant-filled-primary w-full mt-6">
          <Icon icon="lucide:arrow-right" class="w-4 h-4 mr-2" />
          Go to Dashboard
        </a>
      </div>
    {/if}

    <!-- Error States -->
    {#if verificationStatus === 'expired'}
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:clock" class="w-8 h-8 text-white" />
        </div>
        
        <h2 class="text-3xl font-bold text-surface-900-50-token mb-4">
          Link Expired
        </h2>
        
        <div class="card variant-ghost-surface p-6 space-y-4">
          <p class="text-surface-700-200-token">
            This verification link has expired. Verification links are only valid for 2 hours for security reasons.
          </p>
          
          <div class="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
            <p class="text-sm text-warning-700 dark:text-warning-300">
              <Icon icon="lucide:shield-alert" class="w-4 h-4 inline mr-1" />
              Don't worry! You can request a new verification email.
            </p>
          </div>
        </div>
        
        <div class="space-y-3">
          <a href="/verify-email-notice" class="btn variant-filled-primary w-full">
            <Icon icon="lucide:refresh-cw" class="w-4 h-4 mr-2" />
            Get New Verification Link
          </a>
          <a href="/dashboard" class="btn variant-ghost-surface w-full">
            <Icon icon="lucide:arrow-right" class="w-4 h-4 mr-2" />
            Continue to Dashboard
          </a>
        </div>
      </div>
    {/if}

    {#if verificationStatus === 'invalid'}
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-error-500 to-error-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:x" class="w-8 h-8 text-white" />
        </div>
        
        <h2 class="text-3xl font-bold text-surface-900-50-token mb-4">
          Invalid Link
        </h2>
        
        <div class="card variant-ghost-surface p-6 space-y-4">
          <p class="text-surface-700-200-token">
            This verification link is invalid or has already been used.
          </p>
          
          <div class="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
            <p class="text-sm text-error-700 dark:text-error-300">
              <Icon icon="lucide:alert-triangle" class="w-4 h-4 inline mr-1" />
              If you're having trouble, please contact our support team.
            </p>
          </div>
        </div>
        
        <div class="space-y-3">
          <a href="/verify-email-notice" class="btn variant-filled-primary w-full">
            <Icon icon="lucide:refresh-cw" class="w-4 h-4 mr-2" />
            Get New Verification Link
          </a>
          <a href="/support" class="btn variant-ghost-surface w-full">
            <Icon icon="lucide:help-circle" class="w-4 h-4 mr-2" />
            Contact Support
          </a>
        </div>
      </div>
    {/if}

    {#if verificationStatus === 'already_verified'}
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:check-circle" class="w-8 h-8 text-white" />
        </div>
        
        <h2 class="text-3xl font-bold text-surface-900-50-token mb-4">
          Already Verified
        </h2>
        
        <div class="card variant-ghost-surface p-6 space-y-4">
          <p class="text-surface-700-200-token">
            Your email address is already verified. You have full access to all Rovora features!
          </p>
        </div>
        
        <a href="/dashboard" class="btn variant-filled-primary w-full">
          <Icon icon="lucide:arrow-right" class="w-4 h-4 mr-2" />
          Go to Dashboard
        </a>
      </div>
    {/if}
  </div>
</div>