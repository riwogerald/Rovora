<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { resetPasswordSchema, type ResetPasswordData } from '$lib/auth/validation';
  import Icon from '@iconify/svelte';
  import { toast } from 'svelte-sonner';
  
  export let data;
  
  let form: HTMLFormElement;
  let loading = false;
  let errors: Record<string, string[]> = {};
  
  let formData: ResetPasswordData = {
    password: '',
    confirmPassword: '',
    token: data.token || ''
  };
  
  $: if ($page.form?.errors) {
    errors = $page.form.errors;
  }
  
  $: if ($page.form?.message) {
    if ($page.form.success) {
      toast.success($page.form.message);
    } else {
      toast.error($page.form.message);
    }
  }
</script>

<svelte:head>
  <title>Reset Password - Rovora</title>
  <meta name="description" content="Create a new password for your Rovora account" />
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
        Reset your password
      </h2>
      <p class="mt-2 text-surface-600-300-token">
        Enter your new password below
      </p>
    </div>

    {#if data.status === 'valid'}
      <!-- Reset Password Form -->
      <form
        bind:this={form}
        method="POST"
        action="?/reset"
        class="mt-8 space-y-6"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            loading = false;
            await update();
          };
        }}
      >
        <input type="hidden" name="token" value={formData.token} />
        
        <div class="space-y-4">
          <!-- New Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-surface-700-200-token mb-1">
              New Password
            </label>
            <div class="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                bind:value={formData.password}
                class="input w-full pl-10"
                class:input-error={errors.password?.length > 0}
                placeholder="Enter your new password"
              />
              <Icon icon="lucide:lock" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400-500-token" />
            </div>
            {#if errors.password?.length > 0}
              <p class="mt-1 text-sm text-error-500">{errors.password[0]}</p>
            {/if}
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-surface-700-200-token mb-1">
              Confirm New Password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                bind:value={formData.confirmPassword}
                class="input w-full pl-10"
                class:input-error={errors.confirmPassword?.length > 0}
                placeholder="Confirm your new password"
              />
              <Icon icon="lucide:lock" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400-500-token" />
            </div>
            {#if errors.confirmPassword?.length > 0}
              <p class="mt-1 text-sm text-error-500">{errors.confirmPassword[0]}</p>
            {/if}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          class="btn variant-filled-primary w-full"
        >
          {#if loading}
            <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            Updating password...
          {:else}
            <Icon icon="lucide:check" class="w-4 h-4 mr-2" />
            Update password
          {/if}
        </button>
      </form>
    {:else if data.status === 'expired'}
      <!-- Expired Token -->
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:clock" class="w-8 h-8 text-white" />
        </div>
        
        <h3 class="text-xl font-semibold text-surface-900-50-token mb-4">
          Reset link expired
        </h3>
        
        <div class="card variant-ghost-surface p-6 space-y-4">
          <p class="text-surface-700-200-token">
            This password reset link has expired. Reset links are only valid for 1 hour for security reasons.
          </p>
        </div>
        
        <a href="/forgot-password" class="btn variant-filled-primary w-full mt-6">
          <Icon icon="lucide:refresh-cw" class="w-4 h-4 mr-2" />
          Request new reset link
        </a>
      </div>
    {:else}
      <!-- Invalid Token -->
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-error-500 to-error-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:x" class="w-8 h-8 text-white" />
        </div>
        
        <h3 class="text-xl font-semibold text-surface-900-50-token mb-4">
          Invalid reset link
        </h3>
        
        <div class="card variant-ghost-surface p-6 space-y-4">
          <p class="text-surface-700-200-token">
            This password reset link is invalid or has already been used.
          </p>
        </div>
        
        <div class="space-y-3 mt-6">
          <a href="/forgot-password" class="btn variant-filled-primary w-full">
            <Icon icon="lucide:refresh-cw" class="w-4 h-4 mr-2" />
            Request new reset link
          </a>
          <a href="/login" class="btn variant-ghost-surface w-full">
            <Icon icon="lucide:arrow-left" class="w-4 h-4 mr-2" />
            Back to Sign In
          </a>
        </div>
      </div>
    {/if}
  </div>
</div>