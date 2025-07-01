<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { loginSchema, type LoginData } from '$lib/auth/validation';
  import Icon from '@iconify/svelte';
  import { toast } from 'svelte-sonner';
  
  let form: HTMLFormElement;
  let loading = false;
  let errors: Record<string, string[]> = {};
  
  let formData: LoginData = {
    email: '',
    password: '',
    remember: false
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
  <title>Sign In - Rovora</title>
  <meta name="description" content="Sign in to your Rovora account" />
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
        Welcome back
      </h2>
      <p class="mt-2 text-surface-600-300-token">
        Sign in to your gaming codex
      </p>
    </div>

    <!-- Login Form -->
    <form
      bind:this={form}
      method="POST"
      action="?/login"
      class="mt-8 space-y-6"
      use:enhance={() => {
        loading = true;
        return async ({ update }) => {
          loading = false;
          await update();
        };
      }}
    >
      <div class="space-y-4">
        <!-- Email -->
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

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-surface-700-200-token mb-1">
            Password
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
              placeholder="Enter your password"
            />
            <Icon icon="lucide:lock" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400-500-token" />
          </div>
          {#if errors.password?.length > 0}
            <p class="mt-1 text-sm text-error-500">{errors.password[0]}</p>
          {/if}
        </div>
      </div>

      <!-- Remember me & Forgot password -->
      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input
            type="checkbox"
            name="remember"
            bind:checked={formData.remember}
            class="checkbox"
          />
          <span class="ml-2 text-sm text-surface-600-300-token">Remember me</span>
        </label>

        <a href="/forgot-password" class="text-sm text-primary-500 hover:text-primary-400 transition-colors">
          Forgot password?
        </a>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        disabled={loading}
        class="btn variant-filled-primary w-full"
      >
        {#if loading}
          <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
          Signing in...
        {:else}
          <Icon icon="lucide:log-in" class="w-4 h-4 mr-2" />
          Sign in
        {/if}
      </button>

      <!-- Sign Up Link -->
      <div class="text-center">
        <p class="text-sm text-surface-600-300-token">
          Don't have an account?
          <a href="/register" class="font-medium text-primary-500 hover:text-primary-400 transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </form>
  </div>
</div>