import { useState, useEffect } from 'react';
import { getGenres } from '../services/movieApi';

export const useGenres = (type = 'movie') => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGenres(type)
      .then(setGenres)
      .catch(() => setGenres([]))
      .finally(() => setLoading(false));
  }, [type]);

  return { genres, loading };
};
