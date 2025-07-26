// @ts-nocheck
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/database/connection';
import { users, userStats, gameEntries, games, platforms } from '$lib/database/schema/auth';
import { PrivacyQueries } from '$lib/database/queries/privacy';
import { SocialQueries } from '$lib/database/queries/social';
import { canViewProfile, canViewSection, filterUserData } from '$lib/utils/privacy';
import type { PageServerLoad } from './$types';

export const load = async ({ params, locals, request }: Parameters<PageServerLoad>[0]) => {
  const { username } = params;

  try {
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      throw error(404, 'User not found');
    }

    // Get privacy context
    const privacyContext = await PrivacyQueries.getPrivacyContext(
      locals.user?.id || null,
      user.id
    );

    // Check if profile can be viewed
    if (!canViewProfile(privacyContext)) {
      throw error(403, 'This profile is private');
    }

    // Record profile view (if not own profile)
    if (locals.user?.id !== user.id) {
      await PrivacyQueries.recordProfileView(
        user.id,
        locals.user?.id,
        {
          ip_address: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          referrer: request.headers.get('referer') || undefined
        }
      );
    }

    // Get user stats (if visible)
    let stats = null;
    if (canViewSection(privacyContext, 'show_stats')) {
      const [userStatsResult] = await db
        .select()
        .from(userStats)
        .where(eq(userStats.user_id, user.id))
        .limit(1);
      stats = userStatsResult;
    }

    // Get recent games (if library is visible)
    let recentGames: any[] = [];
    if (canViewSection(privacyContext, 'show_library')) {
      recentGames = await db
        .select({
          gameEntry: gameEntries,
          game: games,
          platform: platforms
        })
        .from(gameEntries)
        .innerJoin(games, eq(gameEntries.game_id, games.id))
        .innerJoin(platforms, eq(gameEntries.platform_id, platforms.id))
        .where(eq(gameEntries.user_id, user.id))
        .orderBy(gameEntries.updated_at)
        .limit(5);
    }

    // Initialize social queries
    const socialQueries = new SocialQueries(db);
    
    // Check if current user is following this user
    let isFollowing = false;
    if (!privacyContext.isOwnProfile && locals.user) {
      isFollowing = await socialQueries.isFollowing(locals.user.id, user.id);
    }
    
    // Get recent activity (if activity is visible)
    let recentActivity: any[] = [];
    if (canViewSection(privacyContext, 'show_activity')) {
      try {
        recentActivity = await socialQueries.getUserActivityFeed(user.id, {
          limit: 5,
          offset: 0
        });
      } catch (error) {
        console.error('Error fetching user activity:', error);
        recentActivity = [];
      }
    }

    // Filter user data based on privacy settings
    const filteredUser = filterUserData(user, privacyContext);

    return {
      user: filteredUser,
      stats,
      recentGames,
      recentActivity,
      isOwnProfile: privacyContext.isOwnProfile,
      isFollowing,
      canViewLibrary: canViewSection(privacyContext, 'show_library'),
      canViewActivity: canViewSection(privacyContext, 'show_activity'),
      canViewCodex: canViewSection(privacyContext, 'show_codex'),
      canSendFriendRequest: privacyContext.privacySettings.allow_friend_requests && 
                           !privacyContext.isOwnProfile && 
                           !isFollowing && 
                           locals.user !== null
    };

  } catch (err) {
    if (err instanceof Error && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    
    console.error('Profile load error:', err);
    throw error(500, 'Failed to load profile');
  }
};