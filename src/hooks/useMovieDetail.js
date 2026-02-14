/**
 * Hook personalizado para obtener detalle de una película.
 * Single Responsibility: gestiona el estado y fetching del detalle.
 */
import { useState, useEffect, useCallback } from 'react';
import { getMovieById } from '../services/movieApi';

export const useMovieDetail = (movieId) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovie = useCallback(async (id) => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getMovieById(id);
      setMovie(data);
    } catch (err) {
      setError(err.message);
      setMovie(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovie(movieId);
  }, [movieId, fetchMovie]);

  const retry = useCallback(() => fetchMovie(movieId), [movieId, fetchMovie]);

  return { movie, loading, error, retry };
};
