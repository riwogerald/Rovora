<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { forgotPasswordSchema, type ForgotPasswordData } from '$lib/auth/validation';
  import Icon from '@iconify/svelte';
  import { toast } from 'svelte-sonner';
  
  let form: HTMLFormElement;
  let loading = false;
  let errors: Record<string, string[]> = {};
  let submitted = false;
  
  let formData: ForgotPasswordData = {
    email: ''
  };
  
  $: if ($page.form?.errors) {
    errors = $page.form.errors;
  }
  
  $: if ($page.form?.message) {
    if ($page.form.success) {
      toast.success($page.form.message);
      submitted = true;
    } else {
      toast.error($page.form.message);
    }
  }
</script>

<svelte:head>
  <title>Forgot Password - Rovora</title>
  <meta name="description" content="Reset your Rovora account password" />
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
      
      <h2 class="text-3xl font-bold text-surface-900-50-token">
        Forgot your password?
      </h2>
      <p class="mt-2 text-surface-600-300-token">
        No worries! Enter your email and we'll send you a reset link.
      </p>
    </div>

    {#if !submitted}
      <!-- Forgot Password Form -->
      <form
        bind:this={form}
        method="POST"
        action="?/forgot"
        class="mt-8 space-y-6"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            await update();
          };
        }}
      >
        <div>
          <label for="email" class="block text-sm font-medium text-surface-700-200-token mb-1">
            Email address
          </label>
          <div class="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              bind:value={formData.email}
              class="input w-full pl-10"
              class:input-error={errors.email?.length > 0}
              placeholder="Enter your email"
            />
            <Icon icon="lucide:mail" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400-500-token" />
          </div>
          {#if errors.email?.length > 0}
            <p class="mt-1 text-sm text-error-500">{errors.email[0]}</p>
          {/if}
        </div>

        <button
          type="submit"
          disabled={loading}
          class="btn variant-filled-primary w-full"
        >
          {#if loading}
            <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            Sending reset link...
          {:else}
            <Icon icon="lucide:mail" class="w-4 h-4 mr-2" />
            Send reset link
          {/if}
        </button>

        <div class="text-center">
          <p class="text-sm text-surface-600-300-token">
            Remember your password?
            <a href="/login" class="font-medium text-primary-500 hover:text-primary-400 transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </form>
    {:else}
      <!-- Success Message -->
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:mail-check" class="w-8 h-8 text-white" />
        </div>
        
        <h3 class="text-xl font-semibold text-surface-900-50-token mb-4">
          Check your email
        </h3>
        
        <div class="card variant-ghost-surface p-6 space-y-4">
          <p class="text-surface-700-200-token">
            If an account with that email exists, we've sent you a password reset link.
          </p>
          
          <div class="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <p class="text-sm text-primary-700 dark:text-primary-300">
              <Icon icon="lucide:info" class="w-4 h-4 inline mr-1" />
              The reset link will expire in 1 hour for security.
            </p>
          </div>
        </div>
        
        <div class="space-y-3 mt-6">
          <a href="/login" class="btn variant-filled-primary w-full">
            <Icon icon="lucide:arrow-left" class="w-4 h-4 mr-2" />
            Back to Sign In
          </a>
          
          <button
            on:click={() => submitted = false}
            class="btn variant-ghost-surface w-full"
          >
            <Icon icon="lucide:refresh-cw" class="w-4 h-4 mr-2" />
            Try different email
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>