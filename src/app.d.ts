import type { Session } from '@auth/sveltekit';

// Define our custom User type based on database schema
export interface User {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  steam_id?: string;
  xbox_gamertag?: string;
  psn_id?: string;
  nintendo_friend_code?: string;
  epic_username?: string;
  gog_username?: string;
  is_verified: boolean;
  is_private: boolean;
  is_banned: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  privacy_level: 'public' | 'friends' | 'private';
  show_playtime: boolean;
  show_achievements: boolean;
  show_activity: boolean;
  show_wishlist: boolean;
  show_reviews: boolean;
  default_platform_id?: string;
  auto_import_steam: boolean;
  preferred_rating_system: 'controller' | 'stars' | 'numeric';
  email_notifications: boolean;
  push_notifications: boolean;
  friend_requests: boolean;
  game_updates: boolean;
  social_activity: boolean;
}

export interface UserStats {
  total_games: number;
  total_playtime: number;
  games_completed: number;
  games_playing: number;
  games_backlog: number;
  games_dropped: number;
  games_wishlist: number;
  average_rating: number;
  total_ratings: number;
  followers_count: number;
  following_count: number;
  codex_entries: number;
  reviews_written: number;
  lists_created: number;
  level: number;
  experience_points: number;
  achievements_unlocked: number;
  perfect_games: number;
}

declare global {
  namespace App {
    interface Locals {
      session: Session | null;
      user: User | null;
    }
    interface PageData {
      session: Session | null;
      user: User | null;
    }
  }
}

export {};
