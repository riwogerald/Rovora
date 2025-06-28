import { RATING_THRESHOLDS, METACRITIC_THRESHOLDS, GENRE_COLORS } from './constants';
import type { Game } from '$lib/types/game';

/**
 * Format a number with appropriate suffixes (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Get rating color class based on rating value
 */
export function getRatingColor(rating: number): string {
  if (rating >= RATING_THRESHOLDS.EXCELLENT) return 'text-green-600 dark:text-green-400';
  if (rating >= RATING_THRESHOLDS.GOOD) return 'text-blue-600 dark:text-blue-400';
  if (rating >= RATING_THRESHOLDS.AVERAGE) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-gray-600 dark:text-gray-400';
}

/**
 * Get Metacritic score color classes
 */
export function getMetacriticColor(score: number): { bg: string; text: string } {
  if (score >= METACRITIC_THRESHOLDS.UNIVERSAL_ACCLAIM) {
    return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' };
  }
  if (score >= METACRITIC_THRESHOLDS.GENERALLY_FAVORABLE) {
    return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' };
  }
  if (score >= METACRITIC_THRESHOLDS.MIXED) {
    return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300' };
  }
  return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' };
}

/**
 * Get genre color gradient
 */
export function getGenreColor(genreSlug: string): string {
  return GENRE_COLORS[genreSlug as keyof typeof GENRE_COLORS] || 'from-gray-500 to-gray-600';
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if a game is recently released (within last 30 days)
 */
export function isRecentlyReleased(game: Game): boolean {
  if (!game.released) return false;
  const releaseDate = new Date(game.released);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return releaseDate >= thirtyDaysAgo;
}

/**
 * Check if a game is upcoming (release date in future)
 */
export function isUpcoming(game: Game): boolean {
  if (!game.released) return true;
  const releaseDate = new Date(game.released);
  const now = new Date();
  return releaseDate > now;
}

/**
 * Get platform icon name
 */
export function getPlatformIcon(platformName: string): string {
  const name = platformName.toLowerCase();
  if (name.includes('pc') || name.includes('windows')) return 'lucide:monitor';
  if (name.includes('playstation') || name.includes('ps')) return 'lucide:gamepad-2';
  if (name.includes('xbox')) return 'lucide:gamepad-2';
  if (name.includes('nintendo') || name.includes('switch')) return 'lucide:gamepad-2';
  if (name.includes('mobile') || name.includes('android') || name.includes('ios')) return 'lucide:smartphone';
  return 'lucide:gamepad-2';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate SEO-friendly slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate reading time for text content
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}