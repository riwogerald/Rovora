import { json } from '@sveltejs/kit';
import { SocialQueries } from '$lib/database/queries/social';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const searchParams = url.searchParams;
    const codexEntryId = searchParams.get('codexEntryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!codexEntryId) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Codex entry ID is required'
        }
      }, { status: 400 });
    }

    const session = await locals.auth();
    const userId = session?.user?.id;

    const comments = await SocialQueries.getCodexEntryComments(
      codexEntryId,
      userId,
      limit,
      offset
    );

    return json({
      success: true,
      data: {
        comments,
        pagination: {
          page,
          per_page: limit,
          total: comments.length, // TODO: Implement proper count
          has_next: comments.length === limit,
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Comments GET API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch comments'
      }
    }, { status: 500 });
  }
};

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

    const { codexEntryId, content, parentCommentId } = await request.json();

    if (!codexEntryId || !content) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Codex entry ID and content are required'
        }
      }, { status: 400 });
    }

    if (content.trim().length < 1) {
      return json({
        success: false,
        error: {
          code: 'INVALID_CONTENT',
          message: 'Comment content cannot be empty'
        }
      }, { status: 400 });
    }

    if (content.length > 1000) {
      return json({
        success: false,
        error: {
          code: 'CONTENT_TOO_LONG',
          message: 'Comment must be less than 1000 characters'
        }
      }, { status: 400 });
    }

    const comment = await SocialQueries.createComment(
      session.user.id,
      codexEntryId,
      content.trim(),
      parentCommentId
    );

    return json({
      success: true,
      data: comment
    });

  } catch (error) {
    console.error('Comments POST API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create comment'
      }
    }, { status: 500 });
  }
};
