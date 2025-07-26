import { json } from '@sveltejs/kit';
import { CodexQueries } from '$lib/database/queries/codex';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const { entryId } = params;
    
    if (!entryId) {
      return json({
        success: false,
        error: {
          code: 'INVALID_ENTRY_ID',
          message: 'Entry ID is required'
        }
      }, { status: 400 });
    }

    const entry = await CodexQueries.getCodexEntryById(entryId);

    if (!entry) {
      return json({
        success: false,
        error: {
          code: 'ENTRY_NOT_FOUND',
          message: 'Codex entry not found'
        }
      }, { status: 404 });
    }

    // Check if entry is public or if user owns it
    const session = await locals.auth();
    if (!entry.is_public && (!session?.user?.id || session.user.id !== entry.user_id)) {
      return json({
        success: false,
        error: {
          code: 'ENTRY_PRIVATE',
          message: 'This entry is private'
        }
      }, { status: 403 });
    }

    return json({
      success: true,
      data: entry
    });

  } catch (error) {
    console.error('Codex Entry Details API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch codex entry'
      }
    }, { status: 500 });
  }
};

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
    const updates = await request.json();

    if (!entryId) {
      return json({
        success: false,
        error: {
          code: 'INVALID_ENTRY_ID',
          message: 'Entry ID is required'
        }
      }, { status: 400 });
    }

    // Remove fields that shouldn't be updated directly
    const {
      id, user_id, game_id, game_entry_id, created_at, likes_count, comments_count, shares_count,
      ...allowedUpdates
    } = updates;

    // Validate entry type if provided
    if (allowedUpdates.entry_type) {
      const validEntryTypes = ['review', 'journal', 'screenshot', 'achievement', 'milestone', 'thought', 'tip', 'bug_report'];
      if (!validEntryTypes.includes(allowedUpdates.entry_type)) {
        return json({
          success: false,
          error: {
            code: 'INVALID_ENTRY_TYPE',
            message: 'Invalid entry type'
          }
        }, { status: 400 });
      }
    }

    // Handle screenshots array
    if (allowedUpdates.screenshots && Array.isArray(allowedUpdates.screenshots)) {
      allowedUpdates.screenshots = JSON.stringify(allowedUpdates.screenshots);
    }

    const updatedEntry = await CodexQueries.updateCodexEntry(
      entryId,
      session.user.id,
      allowedUpdates
    );

    if (!updatedEntry) {
      return json({
        success: false,
        error: {
          code: 'ENTRY_NOT_FOUND',
          message: 'Codex entry not found or you do not have permission to edit it'
        }
      }, { status: 404 });
    }

    return json({
      success: true,
      data: updatedEntry
    });

  } catch (error) {
    console.error('Update Codex Entry API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update codex entry'
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
          code: 'INVALID_ENTRY_ID',
          message: 'Entry ID is required'
        }
      }, { status: 400 });
    }

    const deleted = await CodexQueries.deleteCodexEntry(entryId, session.user.id);

    if (!deleted) {
      return json({
        success: false,
        error: {
          code: 'ENTRY_NOT_FOUND',
          message: 'Codex entry not found or you do not have permission to delete it'
        }
      }, { status: 404 });
    }

    return json({
      success: true,
      data: { message: 'Codex entry deleted successfully' }
    });

  } catch (error) {
    console.error('Delete Codex Entry API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete codex entry'
      }
    }, { status: 500 });
  }
};
