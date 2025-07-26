import { hash, verify } from 'argon2';
import { createId } from '@paralleldrive/cuid2';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return await verify(hash, password);
}

export function generateEmailVerificationToken(): string {
  return createId();
}

export function generatePasswordResetToken(): string {
  return createId();
}

export function createEmailVerificationExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 2); // 2 hours
  return expiry;
}

export function createPasswordResetExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // 1 hour
  return expiry;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUsername(username: string): boolean {
  // Username must be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function isValidPassword(password: string): boolean {
  // Password must be at least 8 characters with at least one letter and one number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

export function sanitizeRedirectUrl(url: string | null, fallback: string = '/'): string {
  if (!url) return fallback;
  
  // Only allow relative URLs or same-origin URLs
  try {
    const parsed = new URL(url, 'http://localhost');
    if (parsed.origin === 'http://localhost' || url.startsWith('/')) {
      return url.startsWith('/') ? url : parsed.pathname + parsed.search;
    }
  } catch {
    // Invalid URL
  }
  
  return fallback;
}