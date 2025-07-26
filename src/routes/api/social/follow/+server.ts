import { json } from '@sveltejs/kit';
import { SocialQueries } from '$lib/database/queries/social';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
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

    const { followingId } = await request.json();

    if (!followingId) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Following user ID is required'
        }
      }, { status: 400 });
    }

    if (session.user.id === followingId) {
      return json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Cannot follow yourself'
        }
      }, { status: 400 });
    }

    const follow = await SocialQueries.followUser(session.user.id, followingId);

    return json({
      success: true,
      data: follow
    });

  } catch (error) {
    console.error('Follow API Error:', error);
    
    if (error.message === 'Already following this user') {
      return json({
        success: false,
        error: {
          code: 'ALREADY_FOLLOWING',
          message: 'You are already following this user'
        }
      }, { status: 409 });
    }

    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to follow user'
      }
    }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
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

    const { followingId } = await request.json();

    if (!followingId) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Following user ID is required'
        }
      }, { status: 400 });
    }

    const unfollowed = await SocialQueries.unfollowUser(session.user.id, followingId);

    if (!unfollowed) {
      return json({
        success: false,
        error: {
          code: 'NOT_FOLLOWING',
          message: 'You are not following this user'
        }
      }, { status: 404 });
    }

    return json({
      success: true,
      data: { message: 'Successfully unfollowed user' }
    });

  } catch (error) {
    console.error('Unfollow API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to unfollow user'
      }
    }, { status: 500 });
  }
};
