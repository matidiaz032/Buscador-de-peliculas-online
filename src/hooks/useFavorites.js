import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'movie-favorites-v2'; // v2: migración a TMDB (IDs movie-123 / tv-456)

const loadFavorites = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const add = useCallback((movie) => {
    setFavorites((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [...prev, movie];
    });
  }, []);

  const remove = useCallback((movieId) => {
    setFavorites((prev) => prev.filter((m) => m.id !== movieId));
  }, []);

  const toggle = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) return prev.filter((m) => m.id !== movie.id);
      return [...prev, movie];
    });
  }, []);

  const isFavorite = useCallback(
    (movieId) => favorites.some((m) => m.id === movieId),
    [favorites]
  );

  return { favorites, add, remove, toggle, isFavorite };
};
