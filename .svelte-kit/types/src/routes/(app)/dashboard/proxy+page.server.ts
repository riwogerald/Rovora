// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SocialQueries } from '$lib/database/queries/social';
import { db } from '$lib/database/connection';

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  const socialQueries = new SocialQueries(db);

  try {
    // Get user's activity feed
    const activities = await socialQueries.getUserActivityFeed(locals.user.id, {
      limit: 10,
      offset: 0
    });

    // Get basic stats (we'll implement proper queries later)
    // For now, return placeholder data
    const stats = {
      gamesTracked: 0,
      gamesCompleted: 0,
      totalPlaytime: 0,
      codexEntries: 0
    };

    return {
      user: locals.user,
      activities,
      stats
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Return fallback data if there's an error
    return {
      user: locals.user,
      activities: [],
      stats: {
        gamesTracked: 0,
        gamesCompleted: 0,
        totalPlaytime: 0,
        codexEntries: 0
      }
    };
  }
};
