import { json } from '@sveltejs/kit';
import { GameQueries } from '$lib/database/queries/games';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const searchParams = url.searchParams;
    
    // Parse query parameters
    const query = searchParams.get('q') || undefined;
    const genres = searchParams.get('genres')?.split(',').filter(Boolean) || undefined;
    const platforms = searchParams.get('platforms')?.split(',').filter(Boolean) || undefined;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined;
    const releaseYear = searchParams.get('releaseYear') ? parseInt(searchParams.get('releaseYear')!) : undefined;
    const metacriticMin = searchParams.get('metacriticMin') ? parseInt(searchParams.get('metacriticMin')!) : undefined;
    const metacriticMax = searchParams.get('metacriticMax') ? parseInt(searchParams.get('metacriticMax')!) : undefined;
    const sortBy = searchParams.get('sortBy') as any || 'created_at';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const filters = {
      query,
      genres,
      platforms,
      tags,
      releaseYear,
      metacriticMin,
      metacriticMax,
      sortBy,
      sortOrder
    };

    const result = await GameQueries.searchGames(filters, limit, offset);

    return json({
      success: true,
      data: {
        games: result.games,
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
    console.error('Games API Error:', error);
    return json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch games'
      }
    }, { status: 500 });
  }
};
