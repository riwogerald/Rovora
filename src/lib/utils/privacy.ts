import type { User } from '$lib/types/core';

export interface PrivacySettings {
  privacy_level: 'public' | 'friends' | 'private';
  show_playtime: boolean;
  show_achievements: boolean;
  show_activity: boolean;
  show_wishlist: boolean;
  show_reviews: boolean;
  show_library: boolean;
  show_codex: boolean;
  show_stats: boolean;
  show_gaming_accounts: boolean;
  allow_friend_requests: boolean;
  show_online_status: boolean;
  indexable_profile: boolean;
}

export interface PrivacyContext {
  viewer: User | null;
  profileOwner: User;
  isOwnProfile: boolean;
  isFriend: boolean;
  privacySettings: PrivacySettings;
}

/**
 * Check if a user can view another user's profile
 */
export function canViewProfile(context: PrivacyContext): boolean {
  const { viewer, profileOwner, isOwnProfile, isFriend, privacySettings } = context;
  
  // Owner can always view their own profile
  if (isOwnProfile) return true;
  
  // Check privacy level
  switch (privacySettings.privacy_level) {
    case 'public':
      return true;
    case 'friends':
      return viewer !== null && isFriend;
    case 'private':
      return false;
    default:
      return false;
  }
}

/**
 * Check if a specific profile section is visible
 */
export function canViewSection(
  context: PrivacyContext, 
  section: keyof PrivacySettings
): boolean {
  // First check if profile is viewable at all
  if (!canViewProfile(context)) return false;
  
  // Owner can always see their own content
  if (context.isOwnProfile) return true;
  
  // For private profiles, nothing is visible except to owner
  if (context.privacySettings.privacy_level === 'private') return false;
  
  // Check specific section setting
  return context.privacySettings[section] === true;
}

/**
 * Filter user data based on privacy settings
 */
export function filterUserData(user: User, context: PrivacyContext): Partial<User> {
  const filtered: Partial<User> = {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    is_verified: user.is_verified,
    created_at: user.created_at
  };
  
  // If can't view profile, return minimal data
  if (!canViewProfile(context)) {
    return {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      is_verified: user.is_verified
    };
  }
  
  // Add sections based on privacy settings
  if (canViewSection(context, 'show_stats')) {
    filtered.stats = user.stats;
  }
  
  if (canViewSection(context, 'show_gaming_accounts')) {
    filtered.steam_id = user.steam_id;
    filtered.xbox_gamertag = user.xbox_gamertag;
    filtered.psn_id = user.psn_id;
    filtered.nintendo_friend_code = user.nintendo_friend_code;
    filtered.epic_username = user.epic_username;
    filtered.gog_username = user.gog_username;
  }
  
  // Bio and location are shown for friends and public
  if (context.privacySettings.privacy_level !== 'private') {
    filtered.bio = user.bio;
    filtered.location = user.location;
    filtered.website = user.website;
  }
  
  return filtered;
}

/**
 * Get privacy level display info
 */
export function getPrivacyLevelInfo(level: 'public' | 'friends' | 'private') {
  const configs = {
    public: {
      icon: 'lucide:globe',
      label: 'Public',
      color: 'text-success-500',
      description: 'Visible to everyone'
    },
    friends: {
      icon: 'lucide:users',
      label: 'Friends Only',
      color: 'text-warning-500',
      description: 'Visible to friends only'
    },
    private: {
      icon: 'lucide:lock',
      label: 'Private',
      color: 'text-error-500',
      description: 'Only visible to you'
    }
  };
  
  return configs[level];
}

/**
 * Check if user can send friend request
 */
export function canSendFriendRequest(context: PrivacyContext): boolean {
  const { viewer, isOwnProfile, isFriend, privacySettings } = context;
  
  // Can't send to yourself
  if (isOwnProfile) return false;
  
  // Must be logged in
  if (!viewer) return false;
  
  // Can't send if already friends
  if (isFriend) return false;
  
  // Check if target user allows friend requests
  return privacySettings.allow_friend_requests;
}

/**
 * Get visible activity types based on privacy settings
 */
export function getVisibleActivityTypes(context: PrivacyContext): string[] {
  if (!canViewSection(context, 'show_activity')) return [];
  
  const visibleTypes = ['game_completed', 'achievement_unlocked'];
  
  if (canViewSection(context, 'show_reviews')) {
    visibleTypes.push('review_posted');
  }
  
  if (canViewSection(context, 'show_codex')) {
    visibleTypes.push('codex_entry_created');
  }
  
  if (canViewSection(context, 'show_library')) {
    visibleTypes.push('game_added', 'game_started');
  }
  
  return visibleTypes;
}

/**
 * Default privacy settings for new users
 */
export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  privacy_level: 'public',
  show_playtime: true,
  show_achievements: true,
  show_activity: true,
  show_wishlist: true,
  show_reviews: true,
  show_library: true,
  show_codex: true,
  show_stats: true,
  show_gaming_accounts: true,
  allow_friend_requests: true,
  show_online_status: true,
  indexable_profile: true
};