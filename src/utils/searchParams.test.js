import { describe, it, expect } from 'vitest';
import {
  parseSearchParamsToState,
  buildSearchParamsFromState,
  hasSearchableParams,
  omitDefaults,
} from './searchParams';

describe('searchParams', () => {
  describe('parseSearchParamsToState', () => {
    it('parses empty params to defaults', () => {
      const params = new URLSearchParams();
      const state = parseSearchParamsToState(params);
      expect(state).toEqual({
        query: '',
        filters: { type: 'movie', genre: '', year: '', sortBy: 'popularity.desc' },
        page: 1,
      });
    });

    it('parses q, type, genre, year, sort, page', () => {
      const params = new URLSearchParams({
        q: 'batman',
        type: 'tv',
        genre: '28',
        year: '2024',
        sort: 'vote_average.desc',
        page: '3',
      });
      const state = parseSearchParamsToState(params);
      expect(state.query).toBe('batman');
      expect(state.filters.type).toBe('tv');
      expect(state.filters.genre).toBe('28');
      expect(state.filters.year).toBe('2024');
      expect(state.filters.sortBy).toBe('vote_average.desc');
      expect(state.page).toBe(3);
    });

    it('parses type=all', () => {
      const params = new URLSearchParams({ type: 'all' });
      const state = parseSearchParamsToState(params);
      expect(state.filters.type).toBe('all');
    });

    it('clamps invalid page to 1', () => {
      const params = new URLSearchParams({ page: '0' });
      const state = parseSearchParamsToState(params);
      expect(state.page).toBe(1);
    });
  });

  describe('buildSearchParamsFromState', () => {
    it('omits defaults', () => {
      const state = {
        query: '',
        filters: { type: 'movie', genre: '', year: '', sortBy: 'popularity.desc' },
        page: 1,
      };
      const sp = buildSearchParamsFromState(state);
      expect(sp.toString()).toBe('');
    });

    it('includes non-default values', () => {
      const state = {
        query: 'matrix',
        filters: { type: 'all', genre: '28', year: '2023', sortBy: 'vote_average.desc' },
        page: 2,
      };
      const sp = buildSearchParamsFromState(state);
      expect(sp.get('q')).toBe('matrix');
      expect(sp.get('type')).toBe('all');
      expect(sp.get('genre')).toBe('28');
      expect(sp.get('year')).toBe('2023');
      expect(sp.get('sort')).toBe('vote_average.desc');
      expect(sp.get('page')).toBe('2');
    });

    it('round-trips with parseSearchParamsToState', () => {
      const state = {
        query: 'inception',
        filters: { type: 'movie', genre: '878', year: '2010', sortBy: 'popularity.desc' },
        page: 1,
      };
      const sp = buildSearchParamsFromState(state);
      const parsed = parseSearchParamsToState(sp);
      expect(parsed.query).toBe(state.query);
      expect(parsed.filters.type).toBe(state.filters.type);
      expect(parsed.filters.genre).toBe(state.filters.genre);
      expect(parsed.filters.year).toBe(state.filters.year);
      expect(parsed.page).toBe(state.page);
    });
  });

  describe('hasSearchableParams', () => {
    it('returns false when empty', () => {
      expect(hasSearchableParams({ query: '', filters: {} })).toBe(false);
    });

    it('returns true when query exists', () => {
      expect(hasSearchableParams({ query: 'foo', filters: {} })).toBe(true);
    });

    it('returns true when genre exists', () => {
      expect(hasSearchableParams({ query: '', filters: { genre: '28' } })).toBe(true);
    });
  });
});
