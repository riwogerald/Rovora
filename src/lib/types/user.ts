export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  is_private: boolean;
  follower_count: number;
  following_count: number;
  game_count: number;
  review_count: number;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  privacy_level: 'public' | 'friends' | 'private';
  show_activity: boolean;
  show_wishlist: boolean;
  show_reviews: boolean;
}

export interface UserProfile extends User {
  stats: UserStats;
  recent_activity: Activity[];
  favorite_genres: Genre[];
  favorite_platforms: Platform[];
}

export interface UserStats {
  total_playtime: number;
  games_completed: number;
  games_in_progress: number;
  games_wishlist: number;
  reviews_written: number;
  reviews_helpful: number;
  achievements_unlocked: number;
  level: number;
  experience_points: number;
}

export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  data: Record<string, any>;
  created_at: string;
}

export type ActivityType = 
  | 'game_added_to_wishlist'
  | 'game_removed_from_wishlist'
  | 'game_rated'
  | 'review_posted'
  | 'game_completed'
  | 'achievement_unlocked'
  | 'user_followed'
  | 'collection_created'
  | 'collection_updated';

export interface Wishlist {
  id: string;
  user_id: string;
  game_id: string;
  added_at: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  price_alert?: number;
  game?: Game;
}

export interface GameCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  game_count: number;
  games?: CollectionGame[];
}

export interface CollectionGame {
  id: string;
  collection_id: string;
  game_id: string;
  added_at: string;
  notes?: string;
  game?: Game;
}