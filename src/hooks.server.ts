import { handle as authHandle } from '$lib/auth/lucia';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

// Custom handle for additional processing
const customHandle: Handle = async ({ event, resolve }) => {
  // Add custom server-side logic here if needed
  // For example: rate limiting, logging, etc.
  
  return resolve(event);
};

// Sequence the handles: auth first, then custom
export const handle = sequence(authHandle, customHandle);
