export interface Review {
  id: string;
  user_id: string;
  game_id: string;
  rating: number;
  title: string;
  content: string;
  playtime_hours?: number;
  platform?: string;
  completion_status: CompletionStatus;
  is_recommended: boolean;
  is_spoiler: boolean;
  created_at: string;
  updated_at: string;
  helpful_count: number;
  unhelpful_count: number;
  user?: User;
  game?: Game;
}

export type CompletionStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'dropped'
  | 'on_hold';

export interface ReviewVote {
  id: string;
  user_id: string;
  review_id: string;
  is_helpful: boolean;
  created_at: string;
}

export interface ReviewFilters {
  rating_min?: number;
  rating_max?: number;
  completion_status?: CompletionStatus[];
  is_recommended?: boolean;
  platform?: string;
  sort_by?: 'newest' | 'oldest' | 'most_helpful' | 'highest_rated' | 'lowest_rated';
  page?: number;
  page_size?: number;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: Record<number, number>;
  completion_status_distribution: Record<CompletionStatus, number>;
  recommendation_percentage: number;
  platform_distribution: Record<string, number>;
}