import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SearchService } from '$lib/services/search';
import { db } from '$lib/database/connection';

const searchService = new SearchService(db);

export const GET: RequestHandler = async ({ url }) => {
  try {
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      // Return popular searches if no query
      const popularSearches = await searchService.getPopularSearches();
      return json({
        suggestions: popularSearches.slice(0, limit).map(text => ({
          text,
          type: 'suggestion',
          metadata: {}
        }))
      });
    }

    const suggestions = await searchService.autocomplete(query, limit);

    return json({
      suggestions
    });
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return json(
      { 
        error: 'Failed to get autocomplete suggestions',
        suggestions: []
      },
      { status: 500 }
    );
  }
};
