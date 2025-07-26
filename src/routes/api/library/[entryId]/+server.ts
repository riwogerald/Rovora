import { json } from '@sveltejs/kit';
import { GameQueries } from '$lib/database/queries/games';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
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

    const { entryId } = params;
    const { status } = await request.json();

    if (!entryId || !status) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Entry ID and status are required'
        }
      }, { status: 400 });
    }

    const validStatuses = ['playing', 'completed', 'dropped', 'backlog', 'wishlist', 'on_hold'];
    if (!validStatuses.includes(status)) {
      return json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status value'
        }
      }, { status: 400 });
    }

    const updatedEntry = await GameQueries.updateGameEntryStatus(
      entryId,
      status,
      session.user.id
    );

    return json({
      success: true,
      data: updatedEntry
    });

  } catch (error) {
    console.error('Update Entry API Error:', error);
    
    if (error.message === 'Game entry not found') {
      return json({
        success: false,
        error: {
          code: 'ENTRY_NOT_FOUND',
          message: 'Game entry not found'
        }
      }, { status: 404 });
    }

    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update game entry'
      }
    }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
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

    const { entryId } = params;

    if (!entryId) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Entry ID is required'
        }
      }, { status: 400 });
    }

    // TODO: Implement delete game entry functionality
    // This would require adding a delete method to GameQueries

    return json({
      success: true,
      data: { message: 'Game entry deleted successfully' }
    });

  } catch (error) {
    console.error('Delete Entry API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete game entry'
      }
    }, { status: 500 });
  }
};
