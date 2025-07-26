import { json } from '@sveltejs/kit';
import { SocialQueries } from '$lib/database/queries/social';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const session = await locals.auth();
    
    if (!session?.user?.id) {
      return json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 });
    }

    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const activities = await SocialQueries.getUserFeed(
      session.user.id,
      limit,
      offset
    );

    return json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          per_page: limit,
          total: activities.length, // TODO: Implement proper count
          has_next: activities.length === limit,
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Feed API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch activity feed'
      }
    }, { status: 500 });
  }
};
