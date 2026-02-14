import { useState, useCallback } from 'react';
import { searchMovies } from '../services/movieApi';

const initialState = {
  movies: [],
  totalResults: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
};

export const useMovies = () => {
  const [state, setState] = useState(initialState);
  const [lastQuery, setLastQuery] = useState('');
  const [lastFilters, setLastFilters] = useState({});

  const search = useCallback(async (query, page = 1, filters = {}) => {
    const hasQuery = query?.trim();
    const hasGenre = filters.genre;

    if (!hasQuery && !hasGenre) {
      setState(initialState);
      setLastQuery('');
      setLastFilters({});
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { movies, totalResults, totalPages } = await searchMovies(
        hasQuery || '',
        page,
        filters
      );
      setState({
        movies,
        totalResults,
        totalPages: totalPages ?? Math.ceil((totalResults || 0) / 20),
        currentPage: page,
        loading: false,
        error: null,
      });
      setLastQuery(hasQuery || '');
      setLastFilters(filters);
    } catch (error) {
      setState({
        ...initialState,
        loading: false,
        error: error.message,
        totalPages: 0,
      });
    }
  }, []);

  const goToPage = useCallback(
    (page) => {
      if (lastQuery || lastFilters.genre) {
        search(lastQuery || '', page, lastFilters);
      }
    },
    [lastQuery, lastFilters, search]
  );

  const reset = useCallback(() => {
    setState(initialState);
    setLastQuery('');
    setLastFilters({});
  }, []);

  const totalPages = state.totalPages ?? Math.ceil((state.totalResults || 0) / 20);

  return {
    ...state,
    search,
    goToPage,
    reset,
    lastQuery,
    lastFilters,
    hasSearched: state.movies.length > 0 || state.error !== null,
    totalPages,
  };
};
