import { writable, derived } from 'svelte/store';
import type { 
  ActivityWithDetails, 
  CommentWithDetails, 
  Follow,
  GameListWithDetails 
} from '$lib/database/queries/social';

interface SocialState {
  // Activity Feed
  feed: ActivityWithDetails[];
  userActivities: ActivityWithDetails[];
  
  // Following System
  following: Follow[];
  followers: Follow[];
  followingIds: Set<string>;
  
  // Comments
  comments: Record<string, CommentWithDetails[]>; // keyed by codex entry ID
  
  // Game Lists
  userLists: GameListWithDetails[];
  followingLists: GameListWithDetails[];
  
  // Loading States
  isLoadingFeed: boolean;
  isLoadingFollowing: boolean;
  isLoadingComments: boolean;
  
  // Errors
  error: string | null;
}

const initialState: SocialState = {
  feed: [],
  userActivities: [],
  following: [],
  followers: [],
  followingIds: new Set(),
  comments: {},
  userLists: [],
  followingLists: [],
  isLoadingFeed: false,
  isLoadingFollowing: false,
  isLoadingComments: false,
  error: null
};

function createSocialStore() {
  const { subscribe, set, update } = writable<SocialState>(initialState);

  return {
    subscribe,
    
    // === ACTIVITY FEED ===
    setFeed: (feed: ActivityWithDetails[]) => {
      update(state => ({ ...state, feed }));
    },
    
    addActivityToFeed: (activity: ActivityWithDetails) => {
      update(state => ({
        ...state,
        feed: [activity, ...state.feed]
      }));
    },
    
    setUserActivities: (activities: ActivityWithDetails[]) => {
      update(state => ({ ...state, userActivities: activities }));
    },
    
    addUserActivity: (activity: ActivityWithDetails) => {
      update(state => ({
        ...state,
        userActivities: [activity, ...state.userActivities]
      }));
    },
    
    // === FOLLOWING SYSTEM ===
    setFollowing: (following: Follow[]) => {
      update(state => ({
        ...state,
        following,
        followingIds: new Set(following.map(f => f.following_id))
      }));
    },
    
    addFollowing: (follow: Follow) => {
      update(state => {
        const newFollowingIds = new Set(state.followingIds);
        newFollowingIds.add(follow.following_id);
        
        return {
          ...state,
          following: [...state.following, follow],
          followingIds: newFollowingIds
        };
      });
    },
    
    removeFollowing: (followingId: string) => {
      update(state => {
        const newFollowingIds = new Set(state.followingIds);
        newFollowingIds.delete(followingId);
        
        return {
          ...state,
          following: state.following.filter(f => f.following_id !== followingId),
          followingIds: newFollowingIds
        };
      });
    },
    
    setFollowers: (followers: Follow[]) => {
      update(state => ({ ...state, followers }));
    },
    
    addFollower: (follow: Follow) => {
      update(state => ({
        ...state,
        followers: [...state.followers, follow]
      }));
    },
    
    removeFollower: (followerId: string) => {
      update(state => ({
        ...state,
        followers: state.followers.filter(f => f.follower_id !== followerId)
      }));
    },
    
    isFollowing: (userId: string) => {
      return derived(
        { subscribe },
        ($social) => $social.followingIds.has(userId)
      );
    },
    
    // === COMMENTS ===
    setComments: (codexEntryId: string, comments: CommentWithDetails[]) => {
      update(state => ({
        ...state,
        comments: {
          ...state.comments,
          [codexEntryId]: comments
        }
      }));
    },
    
    addComment: (codexEntryId: string, comment: CommentWithDetails) => {
      update(state => {
        const existingComments = state.comments[codexEntryId] || [];
        return {
          ...state,
          comments: {
            ...state.comments,
            [codexEntryId]: [comment, ...existingComments]
          }
        };
      });
    },
    
    updateComment: (codexEntryId: string, commentId: string, updates: Partial<CommentWithDetails>) => {
      update(state => {
        const comments = state.comments[codexEntryId];
        if (!comments) return state;
        
        const updateCommentInArray = (comments: CommentWithDetails[]): CommentWithDetails[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, ...updates };
            }
            // Also update in replies
            if (comment.replies) {
              return {
                ...comment,
                replies: updateCommentInArray(comment.replies)
              };
            }
            return comment;
          });
        };
        
        return {
          ...state,
          comments: {
            ...state.comments,
            [codexEntryId]: updateCommentInArray(comments)
          }
        };
      });
    },
    
    toggleCommentLike: (codexEntryId: string, commentId: string) => {
      update(state => {
        const comments = state.comments[codexEntryId];
        if (!comments) return state;
        
        const toggleLikeInArray = (comments: CommentWithDetails[]): CommentWithDetails[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              const isLiked = comment.is_liked || false;
              return {
                ...comment,
                is_liked: !isLiked,
                likes_count: isLiked ? comment.likes_count - 1 : comment.likes_count + 1
              };
            }
            // Also update in replies
            if (comment.replies) {
              return {
                ...comment,
                replies: toggleLikeInArray(comment.replies)
              };
            }
            return comment;
          });
        };
        
        return {
          ...state,
          comments: {
            ...state.comments,
            [codexEntryId]: toggleLikeInArray(comments)
          }
        };
      });
    },
    
    // === GAME LISTS ===
    setUserLists: (lists: GameListWithDetails[]) => {
      update(state => ({ ...state, userLists: lists }));
    },
    
    addUserList: (list: GameListWithDetails) => {
      update(state => ({
        ...state,
        userLists: [list, ...state.userLists]
      }));
    },
    
    updateUserList: (listId: string, updates: Partial<GameListWithDetails>) => {
      update(state => ({
        ...state,
        userLists: state.userLists.map(list =>
          list.id === listId ? { ...list, ...updates } : list
        )
      }));
    },
    
    removeUserList: (listId: string) => {
      update(state => ({
        ...state,
        userLists: state.userLists.filter(list => list.id !== listId)
      }));
    },
    
    setFollowingLists: (lists: GameListWithDetails[]) => {
      update(state => ({ ...state, followingLists: lists }));
    },
    
    // === LOADING STATES ===
    setLoadingFeed: (isLoading: boolean) => {
      update(state => ({ ...state, isLoadingFeed: isLoading }));
    },
    
    setLoadingFollowing: (isLoading: boolean) => {
      update(state => ({ ...state, isLoadingFollowing: isLoading }));
    },
    
    setLoadingComments: (isLoading: boolean) => {
      update(state => ({ ...state, isLoadingComments: isLoading }));
    },
    
    // === ERROR HANDLING ===
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },
    
    // === HELPERS ===
    getCommentsForEntry: (codexEntryId: string) => {
      return derived(
        { subscribe },
        ($social) => $social.comments[codexEntryId] || []
      );
    },
    
    reset: () => {
      set(initialState);
    }
  };
}

export const social = createSocialStore();

// Derived stores
export const feedStats = derived(social, $social => ({
  totalActivities: $social.feed.length,
  totalFollowing: $social.following.length,
  totalFollowers: $social.followers.length,
  totalLists: $social.userLists.length
}));

export const recentActivities = derived(social, $social => {
  return $social.feed
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
});

export const topFollowedUsers = derived(social, $social => {
  // This would need to be populated from API data
  // For now, just return following list
  return $social.following.slice(0, 5);
});

export const popularLists = derived(social, $social => {
  return $social.followingLists
    .sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
    .slice(0, 5);
});
