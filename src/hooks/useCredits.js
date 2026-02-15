/**
 * Hook para obtener créditos (cast y crew) de una película/serie.
 * Single Responsibility: estado y fetching de créditos.
 */
import { useState, useEffect, useCallback } from 'react';
import { getCredits } from '../services/movieApi';

export const useCredits = (movieId) => {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCredits = useCallback(async (id) => {
    if (!id) {
      setCredits(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getCredits(id);
      setCredits(data);
    } catch (err) {
      setError(err.message);
      setCredits(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits(movieId);
  }, [movieId, fetchCredits]);

  return { credits, loading, error };
};
