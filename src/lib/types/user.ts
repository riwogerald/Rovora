import type { InferSelectModel } from 'drizzle-orm';
import type { users, userPreferences, userStats } from '$lib/database/schema';

export type User = InferSelectModel<typeof users>;
export type UserPreferences = InferSelectModel<typeof userPreferences>;
export type UserStats = InferSelectModel<typeof userStats>;

export interface Wishlist {
  id: string;
  user_id: string;
  game_id: string;
  priority: number;
  notes?: string;
  created_at: string;
}

export interface UserProfile extends User {
  preferences?: UserPreferences;
  stats?: UserStats;
}
