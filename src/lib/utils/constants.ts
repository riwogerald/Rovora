// API Configuration
export const API_BASE_URL = 'https://api.rawg.io/api';
export const API_KEY = 'your-rawg-api-key'; // Will be replaced with environment variable

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 40;

// Rating thresholds
export const RATING_THRESHOLDS = {
  EXCELLENT: 4.5,
  GOOD: 4.0,
  AVERAGE: 3.5,
  POOR: 0
} as const;

// Metacritic score thresholds
export const METACRITIC_THRESHOLDS = {
  UNIVERSAL_ACCLAIM: 81,
  GENERALLY_FAVORABLE: 61,
  MIXED: 40,
  GENERALLY_UNFAVORABLE: 20,
  OVERWHELMING_DISLIKE: 0
} as const;

// Platform categories
export const PLATFORM_CATEGORIES = {
  PC: ['pc', 'windows', 'mac', 'linux'],
  CONSOLE: ['playstation', 'xbox', 'nintendo'],
  MOBILE: ['android', 'ios', 'mobile']
} as const;

// Genre colors for UI
export const GENRE_COLORS = {
  action: 'from-red-500 to-orange-500',
  adventure: 'from-green-500 to-emerald-500',
  rpg: 'from-purple-500 to-pink-500',
  strategy: 'from-blue-500 to-cyan-500',
  simulation: 'from-yellow-500 to-orange-500',
  sports: 'from-indigo-500 to-purple-500',
  racing: 'from-red-500 to-pink-500',
  puzzle: 'from-teal-500 to-cyan-500',
  arcade: 'from-orange-500 to-red-500',
  platformer: 'from-green-500 to-blue-500',
  shooter: 'from-gray-500 to-gray-700',
  fighting: 'from-red-600 to-orange-600'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'gamehub_user_preferences',
  RECENT_SEARCHES: 'gamehub_recent_searches',
  VIEWED_GAMES: 'gamehub_viewed_games',
  THEME: 'gamehub_theme'
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  API_ERROR: 'Unable to fetch data. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You need to be signed in to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  WISHLIST_ADDED: 'Game added to wishlist',
  WISHLIST_REMOVED: 'Game removed from wishlist',
  REVIEW_POSTED: 'Review posted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  COLLECTION_CREATED: 'Collection created successfully'
} as const;