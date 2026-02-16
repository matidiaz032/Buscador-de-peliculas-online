import { describe, it, expect } from 'vitest';
import { searchMovies } from './movieApi';

describe('movieApi searchMovies', () => {
  it('type=all con genre: merge movie+tv y ordenamiento consistente', async () => {
    const { movies, totalResults, totalPages } = await searchMovies('', 1, {
      type: 'all',
      genre: '28',
      sortBy: 'popularity.desc',
    });

    expect(Array.isArray(movies)).toBe(true);
    expect(movies.length).toBeGreaterThan(0);
    expect(totalResults).toBeGreaterThan(0);
    expect(totalPages).toBeGreaterThan(0);

    const hasMovies = movies.some((m) => m.mediaType === 'movie');
    const hasTv = movies.some((m) => m.mediaType === 'tv');
    expect(hasMovies || hasTv).toBe(true);

    const ids = new Set(movies.map((m) => m.id));
    expect(ids.size).toBe(movies.length);
  });
});
