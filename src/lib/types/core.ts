// Core type definitions for Rovora platform

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
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  is_private: boolean;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  privacy_level: 'public' | 'friends' | 'private';
  notifications: NotificationSettings;
  gaming: GamingPreferences;
}

export interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  friend_requests: boolean;
  game_updates: boolean;
  social_activity: boolean;
}

export interface GamingPreferences {
  default_platform: Platform;
  auto_import_steam: boolean;
  show_playtime: boolean;
  show_achievements: boolean;
  preferred_rating_system: 'controller' | 'stars' | 'numeric';
}

export interface UserStats {
  total_games: number;
  total_playtime: number;
  games_completed: number;
  games_playing: number;
  games_backlog: number;
  games_dropped: number;
  average_rating: number;
  codex_entries: number;
  followers_count: number;
  following_count: number;
  level: number;
  experience_points: number;
}

// Game-related types
export interface Game {
  id: string;
  title: string;
  slug: string;
  description?: string;
  release_date?: string;
  developer?: string;
  publisher?: string;
  genres: Genre[];
  platforms: Platform[];
  cover_image?: string;
  screenshots: string[];
  metacritic_score?: number;
  steam_app_id?: string;
  igdb_id?: string;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  short_name: string;
  icon: string;
  color: string;
  category: 'console' | 'pc' | 'mobile' | 'handheld';
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: 'mood' | 'mechanic' | 'theme' | 'difficulty' | 'length' | 'custom';
  color?: string;
}

// Gaming log and codex types
export interface GameEntry {
  id: string;
  user_id: string;
  game_id: string;
  status: GameStatus;
  platform: Platform;
  rating?: ControllerRating;
  playtime_hours?: number;
  completion_percentage?: number;
  started_date?: string;
  completed_date?: string;
  last_played?: string;
  is_favorite: boolean;
  is_private: boolean;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export type GameStatus = 
  | 'playing' 
  | 'completed' 
  | 'dropped' 
  | 'backlog' 
  | 'wishlist' 
  | 'on_hold';

export interface ControllerRating {
  value: number; // 1-5 controllers
  aspects?: {
    gameplay: number;
    story: number;
    graphics: number;
    audio: number;
    replayability: number;
  };
}

export interface CodexEntry {
  id: string;
  user_id: string;
  game_id: string;
  game_entry_id: string;
  title: string;
  content: string;
  entry_type: CodexEntryType;
  mood?: string;
  spoiler_level: SpoilerLevel;
  playtime_at_entry?: number;
  screenshots: string[];
  tags: Tag[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export type CodexEntryType = 
  | 'review' 
  | 'journal' 
  | 'screenshot' 
  | 'achievement' 
  | 'milestone' 
  | 'thought' 
  | 'tip';

export type SpoilerLevel = 'none' | 'minor' | 'major' | 'ending';

// Social features
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  data: Record<string, any>;
  is_public: boolean;
  created_at: string;
}

export type ActivityType = 
  | 'game_added'
  | 'game_completed'
  | 'game_rated'
  | 'codex_entry_created'
  | 'achievement_unlocked'
  | 'milestone_reached'
  | 'user_followed'
  | 'list_created'
  | 'list_updated';

// Collections and lists
export interface GameList {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  is_collaborative: boolean;
  cover_image?: string;
  game_entries: GameEntry[];
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

// Search and filtering
export interface SearchFilters {
  query?: string;
  genres?: string[];
  platforms?: string[];
  tags?: string[];
  status?: GameStatus[];
  rating_min?: number;
  rating_max?: number;
  release_year_min?: number;
  release_year_max?: number;
  sort_by?: SortOption;
  sort_order?: 'asc' | 'desc';
}

export type SortOption = 
  | 'title'
  | 'release_date'
  | 'rating'
  | 'playtime'
  | 'last_played'
  | 'date_added'
  | 'completion_date';

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}