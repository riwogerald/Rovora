import { json } from '@sveltejs/kit';
import { GameQueries } from '$lib/database/queries/games';
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
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const userGames = await GameQueries.getUserGameLibrary(
      session.user.id,
      status,
      limit,
      offset
    );

    return json({
      success: true,
      data: {
        games: userGames,
        pagination: {
          page,
          per_page: limit,
          total: userGames.length, // TODO: Implement proper count query
          total_pages: Math.ceil(userGames.length / limit),
          has_next: userGames.length === limit,
          has_prev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Library API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user library'
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

    const { gameId, platformId, status = 'backlog' } = await request.json();

    if (!gameId || !platformId) {
      return json({
        success: false,
        error: {
          code: 'INVALID_DATA',
          message: 'Game ID and Platform ID are required'
        }
      }, { status: 400 });
    }

    const gameEntry = await GameQueries.addGameToLibrary(
      session.user.id,
      gameId,
      platformId,
      status
    );

    return json({
      success: true,
      data: gameEntry
    });

  } catch (error) {
    console.error('Add to Library API Error:', error);
    
    if (error.message === 'Game already in library for this platform') {
      return json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Game already exists in your library for this platform'
        }
      }, { status: 409 });
    }

    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to add game to library'
      }
    }, { status: 500 });
  }
};
