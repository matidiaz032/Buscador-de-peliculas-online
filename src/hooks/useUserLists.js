import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'movie-user-lists-v1';
const OLD_FAVORITES_KEY = 'movie-favorites-v2';

const defaultData = () => ({
  favorites: [],
  watchlist: [],
  watched: [],
  ratings: {},
});

const ensureAddedAt = (list) =>
  (list || []).map((m) => ({ ...m, addedAt: m.addedAt ?? Date.now() }));

const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        ...data,
        favorites: ensureAddedAt(data.favorites),
        watchlist: ensureAddedAt(data.watchlist),
        watched: ensureAddedAt(data.watched),
      };
    }

    // Migrar desde favoritos antiguos
    const oldFav = localStorage.getItem(OLD_FAVORITES_KEY);
    if (oldFav) {
      const favorites = ensureAddedAt(JSON.parse(oldFav));
      const data = { ...defaultData(), favorites };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.removeItem(OLD_FAVORITES_KEY);
      return data;
    }

    return defaultData();
  } catch {
    return defaultData();
  }
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const toMovie = (item) => ({
  id: item.id,
  Title: item.Title ?? item.title,
  Year: item.Year ?? item.year,
  Poster: item.Poster ?? item.poster ?? 'N/A',
  mediaType: item.mediaType ?? (String(item.id).startsWith('tv-') ? 'tv' : 'movie'),
  addedAt: item.addedAt ?? Date.now(),
});

export const useUserLists = () => {
  const [data, setData] = useState(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateList = useCallback((listKey, updater) => {
    setData((prev) => ({
      ...prev,
      [listKey]: updater(prev[listKey] || []),
    }));
  }, []);

  const addToList = useCallback((listKey, movie) => {
    const m = toMovie(movie);
    m.addedAt = Date.now();
    updateList(listKey, (list) =>
      list.some((x) => x.id === m.id) ? list : [...list, m]
    );
  }, [updateList]);

  const removeFromList = useCallback((listKey, movieId) => {
    updateList(listKey, (list) => list.filter((x) => x.id !== movieId));
  }, [updateList]);

  const toggleInList = useCallback((listKey, movie) => {
    const m = toMovie(movie);
    m.addedAt = Date.now();
    setData((prev) => {
      const list = prev[listKey] || [];
      const exists = list.some((x) => x.id === m.id);
      return {
        ...prev,
        [listKey]: exists ? list.filter((x) => x.id !== m.id) : [...list, m],
      };
    });
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback((jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && (parsed.favorites || parsed.watchlist || parsed.watched || parsed.ratings)) {
        setData({
          favorites: parsed.favorites || [],
          watchlist: parsed.watchlist || [],
          watched: parsed.watched || [],
          ratings: parsed.ratings || {},
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const isInList = useCallback(
    (listKey, movieId) => (data[listKey] || []).some((m) => m.id === movieId),
    [data]
  );

  const setRating = useCallback((movieId, rating) => {
    setData((prev) => {
      const next = { ...prev.ratings };
      if (rating == null) {
        delete next[movieId];
      } else {
        next[movieId] = Math.min(10, Math.max(1, Math.round(rating)));
      }
      return { ...prev, ratings: next };
    });
  }, []);

  const getRating = useCallback((movieId) => data.ratings?.[movieId], [data.ratings]);

  return {
    favorites: data.favorites || [],
    watchlist: data.watchlist || [],
    watched: data.watched || [],
    ratings: data.ratings || {},

    addToFavorites: (m) => addToList('favorites', m),
    removeFromFavorites: (id) => removeFromList('favorites', id),
    toggleFavorite: (m) => toggleInList('favorites', m),
    isFavorite: (id) => isInList('favorites', id),

    addToWatchlist: (m) => addToList('watchlist', m),
    removeFromWatchlist: (id) => removeFromList('watchlist', id),
    toggleWatchlist: (m) => toggleInList('watchlist', m),
    isInWatchlist: (id) => isInList('watchlist', id),

    addToWatched: (m) => addToList('watched', m),
    removeFromWatched: (id) => removeFromList('watched', id),
    toggleWatched: (m) => toggleInList('watched', m),
    isWatched: (id) => isInList('watched', id),

    setRating,
    getRating,
    exportData,
    importData,
  };
};
