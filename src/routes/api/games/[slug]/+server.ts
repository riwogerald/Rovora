import { json } from '@sveltejs/kit';
import { GameQueries } from '$lib/database/queries/games';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const { slug } = params;
    
    if (!slug) {
      return json({
        success: false,
        error: {
          code: 'INVALID_SLUG',
          message: 'Game slug is required'
        }
      }, { status: 400 });
    }

    const game = await GameQueries.getGameBySlug(slug);

    if (!game) {
      return json({
        success: false,
        error: {
          code: 'GAME_NOT_FOUND',
          message: 'Game not found'
        }
      }, { status: 404 });
    }

    return json({
      success: true,
      data: game
    });

  } catch (error) {
    console.error('Game Details API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch game details'
      }
    }, { status: 500 });
  }
};
