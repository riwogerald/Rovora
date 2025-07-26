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

    const { type, targetId } = await request.json();

    if (!type || !targetId) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Type and target ID are required'
        }
      }, { status: 400 });
    }

    let result;
    
    switch (type) {
      case 'codex_entry':
        result = await SocialQueries.toggleCodexEntryLike(session.user.id, targetId);
        break;
      case 'comment':
        result = await SocialQueries.toggleCommentLike(session.user.id, targetId);
        break;
      default:
        return json({
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Invalid like type'
          }
        }, { status: 400 });
    }

    return json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Like API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to toggle like'
      }
    }, { status: 500 });
  }
};
