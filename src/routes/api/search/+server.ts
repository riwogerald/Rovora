import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SearchService } from '$lib/services/search';
import { db } from '$lib/database/connection';

const searchService = new SearchService(db);

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const query = url.searchParams.get('q') || '';
    const category = url.searchParams.get('category') || 'all';
    const genres = url.searchParams.get('genres')?.split(',').filter(Boolean) || [];
    const platforms = url.searchParams.get('platforms')?.split(',').filter(Boolean) || [];
    const playStatus = url.searchParams.get('status')?.split(',').filter(Boolean) || [];
    const sortBy = url.searchParams.get('sortBy') || 'relevance';
    const sortDirection = url.searchParams.get('sortDirection') || 'desc';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Parse rating filter
    let rating;
    const minRating = url.searchParams.get('minRating');
    const maxRating = url.searchParams.get('maxRating');
    if (minRating && maxRating) {
      rating = {
        min: parseFloat(minRating),
        max: parseFloat(maxRating)
      };
    }

    // Parse date range
    let dateRange;
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    const filters = {
      query,
      category: category as 'all' | 'games' | 'users' | 'entries',
      gameGenres: genres,
      platforms,
      playStatus,
      rating,
      dateRange,
      sortBy: sortBy as 'relevance' | 'title' | 'date' | 'rating' | 'popularity',
      sortDirection: sortDirection as 'asc' | 'desc',
      limit,
      offset
    };

    const results = await searchService.search(filters);

    return json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return json(
      { 
        error: 'Failed to perform search',
        results: [],
        totalCount: 0,
        facets: { genres: [], platforms: [], statuses: [] },
        suggestions: []
      },
      { status: 500 }
    );
  }
};
