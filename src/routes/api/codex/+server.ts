import { json } from '@sveltejs/kit';
import { CodexQueries } from '$lib/database/queries/codex';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const searchParams = url.searchParams;
    
    // Parse query parameters
    const userId = searchParams.get('userId') || undefined;
    const gameId = searchParams.get('gameId') || undefined;
    const entryType = searchParams.get('entryType') || undefined;
    const spoilerLevel = searchParams.get('spoilerLevel') || undefined;
    const isPublic = searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined;
    const mood = searchParams.get('mood') || undefined;
    const sortBy = searchParams.get('sortBy') as any || 'created_at';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const filters = {
      userId,
      gameId,
      entryType,
      spoilerLevel,
      isPublic,
      mood,
      sortBy,
      sortOrder
    };

    const result = await CodexQueries.getCodexEntries(filters, limit, offset);

    return json({
      success: true,
      data: {
        entries: result.entries,
        pagination: {
          page,
          per_page: limit,
          total: result.total,
          total_pages: Math.ceil(result.total / limit),
          has_next: result.hasMore,
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Codex API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch codex entries'
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

    const data = await request.json();
    
    const {
      gameId,
      gameEntryId,
      title,
      content,
      entryType,
      mood,
      playtimeAtEntry,
      completionAtEntry,
      spoilerLevel = 'none',
      isPublic = true,
      screenshots = [],
      tags = []
    } = data;

    // Validate required fields
    if (!gameId || !title || !content || !entryType) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Game ID, title, content, and entry type are required'
        }
      }, { status: 400 });
    }

    // Validate entry type
    const validEntryTypes = ['review', 'journal', 'screenshot', 'achievement', 'milestone', 'thought', 'tip', 'bug_report'];
    if (!validEntryTypes.includes(entryType)) {
      return json({
        success: false,
        error: {
          code: 'INVALID_ENTRY_TYPE',
          message: 'Invalid entry type'
        }
      }, { status: 400 });
    }

    // Create the codex entry
    const entry = await CodexQueries.createCodexEntry({
      user_id: session.user.id,
      game_id: gameId,
      game_entry_id: gameEntryId,
      title,
      content,
      entry_type: entryType,
      mood,
      playtime_at_entry: playtimeAtEntry,
      completion_at_entry: completionAtEntry,
      spoiler_level: spoilerLevel,
      is_public: isPublic,
      screenshots: screenshots.length > 0 ? JSON.stringify(screenshots) : null
    });

    // Add tags if provided
    if (tags.length > 0) {
      await CodexQueries.addTagsToEntry(entry.id, tags);
    }

    return json({
      success: true,
      data: entry
    });

  } catch (error) {
    console.error('Create Codex Entry API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create codex entry'
      }
    }, { status: 500 });
  }
};
