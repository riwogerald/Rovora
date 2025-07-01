<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { registerSchema, type RegisterData } from '$lib/auth/validation';
  import Icon from '@iconify/svelte';
  import { toast } from 'svelte-sonner';
  
  let form: HTMLFormElement;
  let loading = false;
  let errors: Record<string, string[]> = {};
  
  let formData: RegisterData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  function validateField(field: keyof RegisterData, value: string) {
    try {
      registerSchema.pick({ [field]: true }).parse({ [field]: value });
      errors[field] = [];
    } catch (error: any) {
      errors[field] = error.errors?.map((e: any) => e.message) || [];
    }
  }
  
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
  <title>Sign Up - Rovora</title>
  <meta name="description" content="Create your Rovora account and start tracking your gaming journey" />
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
        Create your account
      </h2>
      <p class="mt-2 text-surface-600-300-token">
        Start your gaming codex journey
      </p>
    </div>

    <!-- Registration Form -->
    <form
      bind:this={form}
      method="POST"
      action="?/register"
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
        <!-- Username -->
        <div>
          <label for="username" class="block text-sm font-medium text-surface-700-200-token mb-1">
            Username
          </label>
          <div class="relative">
            <input
              id="username"
              name="username"
              type="text"
              required
              bind:value={formData.username}
              on:blur={() => validateField('username', formData.username)}
              class="input w-full pl-10"
              class:input-error={errors.username?.length > 0}
              placeholder="Enter your username"
            />
            <Icon icon="lucide:user" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400-500-token" />
          </div>
          {#if errors.username?.length > 0}
            <p class="mt-1 text-sm text-error-500">{errors.username[0]}</p>
          {/if}
        </div>

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
              on:blur={() => validateField('email', formData.email)}
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
              on:blur={() => validateField('password', formData.password)}
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

        <!-- Confirm Password -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-surface-700-200-token mb-1">
            Confirm Password
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
              placeholder="Confirm your password"
            />
            <Icon icon="lucide:lock" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-surface-400-500-token" />
          </div>
          {#if errors.confirmPassword?.length > 0}
            <p class="mt-1 text-sm text-error-500">{errors.confirmPassword[0]}</p>
          {/if}
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        disabled={loading}
        class="btn variant-filled-primary w-full"
      >
        {#if loading}
          <Icon icon="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
          Creating account...
        {:else}
          <Icon icon="lucide:gamepad-2" class="w-4 h-4 mr-2" />
          Create account
        {/if}
      </button>

      <!-- Sign In Link -->
      <div class="text-center">
        <p class="text-sm text-surface-600-300-token">
          Already have an account?
          <a href="/login" class="font-medium text-primary-500 hover:text-primary-400 transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </form>
  </div>
</div>