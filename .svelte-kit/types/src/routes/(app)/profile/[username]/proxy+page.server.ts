// @ts-nocheck
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/database/connection';
import { users, userStats, gameEntries, games, platforms } from '$lib/database/schema/auth';
import type { PageServerLoad } from './$types';

export const load = async ({ params, locals }: Parameters<PageServerLoad>[0]) => {
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

    // Check if this is the current user's own profile
    const isOwnProfile = locals.user?.id === user.id;

    // Check privacy settings
    if (!isOwnProfile && user.is_private) {
      throw error(403, 'This profile is private');
    }

    // Get user stats
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.user_id, user.id))
      .limit(1);

    // Get recent games (last 5)
    const recentGames = await db
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

    // Check if current user is following this user (if not own profile)
    let isFollowing = false;
    if (!isOwnProfile && locals.user) {
      // TODO: Implement follow relationship check
      // const followResult = await db.select().from(follows)...
    }

    return {
      user: {
        ...user,
        // Hide sensitive data based on privacy settings
        email: isOwnProfile ? user.email : undefined
      },
      stats,
      recentGames,
      isOwnProfile,
      isFollowing
    };

  } catch (err) {
    if (err instanceof Error && 'status' in err) {
      throw err; // Re-throw SvelteKit errors
    }
    
    console.error('Profile load error:', err);
    throw error(500, 'Failed to load profile');
  }
};