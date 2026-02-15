/**
 * Hook para obtener watch providers de una película/serie.
 * Single Responsibility: estado y fetching de proveedores.
 */
import { useState, useEffect, useCallback } from 'react';
import { getWatchProviders, inferRegion } from '../services/movieApi';

export const useWatchProviders = (movieId) => {
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProviders = useCallback(async (id) => {
    if (!id) {
      setProviders(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const region = inferRegion();
      const data = await getWatchProviders(id, region);
      setProviders(data);
    } catch (err) {
      setError(err.message);
      setProviders(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders(movieId);
  }, [movieId, fetchProviders]);

  return { providers, loading, error };
};
