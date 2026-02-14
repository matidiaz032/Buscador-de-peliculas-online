import { useState, useEffect, useCallback } from 'react';
import { getSimilarMovies } from '../services/movieApi';

export const useSimilarMovies = (movieId) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSimilar = useCallback(async (id) => {
    if (!id) {
      setSimilar([]);
      return;
    }

    setLoading(true);
    try {
      const movies = await getSimilarMovies(id, 6);
      setSimilar(movies);
    } catch {
      setSimilar([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSimilar(movieId);
  }, [movieId, fetchSimilar]);

  return { similar, loading };
};
