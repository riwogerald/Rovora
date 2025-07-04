
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const COLORTERM: string;
	export const TERM: string;
	export const LSCOLORS: string;
	export const PATH: string;
	export const HOME: string;
	export const SHELL: string;
	export const HISTFILE: string;
	export const TMPDIR: string;
	export const CHROME_BIN: string;
	export const PWD: string;
	export const npm_config_yes: string;
	export const NEXT_TELEMETRY_DISABLED: string;
	export const ASTRO_TELEMETRY_DISABLED: string;
	export const __NEXT_DISABLE_MEMORY_WATCHER: string;
	export const NG_CLI_ANALYTICS: string;
	export const EDITOR: string;
	export const npm_config_user_agent: string;
	export const INIT_CWD: string;
	export const npm_config_update_notifier: string;
	export const npm_config_ignore_dep_scripts: string;
	export const npm_config_prefer_symlinked_executables: string;
	export const npm_config_verify_store_integrity: string;
	export const npm_config_global_pnpmfile: string;
	export const npm_config_cache: string;
	export const npm_config_globalconfig: string;
	export const npm_config_init_module: string;
	export const npm_config_noproxy: string;
	export const npm_config_prefix: string;
	export const npm_config_userconfig: string;
	export const npm_config_npm_version: string;
	export const npm_config_global_prefix: string;
	export const npm_config_local_prefix: string;
	export const npm_execpath: string;
	export const npm_node_execpath: string;
	export const NODE: string;
	export const COLOR: string;
	export const npm_command: string;
	export const npm_package_name: string;
	export const npm_package_version: string;
	export const npm_package_engines_node: string;
	export const npm_package_engines_bun: string;
	export const npm_package_json: string;
	export const npm_lifecycle_event: string;
	export const npm_lifecycle_script: string;
	export const npm_config_node_gyp: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		COLORTERM: string;
		TERM: string;
		LSCOLORS: string;
		PATH: string;
		HOME: string;
		SHELL: string;
		HISTFILE: string;
		TMPDIR: string;
		CHROME_BIN: string;
		PWD: string;
		npm_config_yes: string;
		NEXT_TELEMETRY_DISABLED: string;
		ASTRO_TELEMETRY_DISABLED: string;
		__NEXT_DISABLE_MEMORY_WATCHER: string;
		NG_CLI_ANALYTICS: string;
		EDITOR: string;
		npm_config_user_agent: string;
		INIT_CWD: string;
		npm_config_update_notifier: string;
		npm_config_ignore_dep_scripts: string;
		npm_config_prefer_symlinked_executables: string;
		npm_config_verify_store_integrity: string;
		npm_config_global_pnpmfile: string;
		npm_config_cache: string;
		npm_config_globalconfig: string;
		npm_config_init_module: string;
		npm_config_noproxy: string;
		npm_config_prefix: string;
		npm_config_userconfig: string;
		npm_config_npm_version: string;
		npm_config_global_prefix: string;
		npm_config_local_prefix: string;
		npm_execpath: string;
		npm_node_execpath: string;
		NODE: string;
		COLOR: string;
		npm_command: string;
		npm_package_name: string;
		npm_package_version: string;
		npm_package_engines_node: string;
		npm_package_engines_bun: string;
		npm_package_json: string;
		npm_lifecycle_event: string;
		npm_lifecycle_script: string;
		npm_config_node_gyp: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
