import { useState, useEffect, useCallback } from 'react';
import { getMovieById } from '../services/movieApi';

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
      const ratings = migrateRatingsKeys(data.ratings);
      return {
        ...data,
        favorites: ensureAddedAt(data.favorites),
        watchlist: ensureAddedAt(data.watchlist),
        watched: ensureAddedAt(data.watched),
        ratings,
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

/** Key compuesta para ratings: mediaType:id (ej. "movie:123") */
const toRatingKey = (movieId) => {
  if (!movieId) return '';
  const s = String(movieId);
  const match = s.match(/^(movie|tv)-(\d+)$/);
  if (match) return `${match[1]}:${match[2]}`;
  if (s.includes(':')) return s;
  const type = s.startsWith('tv') ? 'tv' : 'movie';
  return `${type}:${s}`;
};

/** Migra ratings con keys legacy (movie-123) a nuevo formato (movie:123). */
const migrateRatingsKeys = (ratings) => {
  if (!ratings || typeof ratings !== 'object') return {};
  const next = {};
  for (const [k, v] of Object.entries(ratings)) {
    if (v == null) continue;
    next[toRatingKey(k)] = Math.min(10, Math.max(1, Math.round(v)));
  }
  return next;
};

/** Normaliza genres a string "Drama, Action" para persistencia y compatibilidad. */
const normalizeGenres = (g) => {
  if (!g) return null;
  if (typeof g === 'string') return g.trim() || null;
  if (Array.isArray(g)) {
    const names = g.map((x) => (typeof x === 'string' ? x : x?.name)).filter(Boolean);
    return names.length ? names.join(', ') : null;
  }
  return null;
};

/** Extrae genre_ids de item (varios formatos). */
const extractGenreIds = (item) => {
  if (item.genre_ids?.length) return item.genre_ids;
  if (item.genreIds?.length) return item.genreIds;
  const g = item.genres;
  if (Array.isArray(g) && g.length && typeof g[0] === 'object' && g[0]?.id != null) {
    return g.map((x) => x.id).filter((id) => id != null);
  }
  return null;
};

const toMovie = (item) => {
  const mediaType = item.mediaType ?? (String(item.id).startsWith('tv-') ? 'tv' : 'movie');
  const genres = normalizeGenres(item.genres) ?? item.genres;
  const genre_ids = extractGenreIds(item);

  const m = {
    id: item.id,
    Title: item.Title ?? item.title,
    Year: item.Year ?? item.year,
    Poster: item.Poster ?? item.poster ?? 'N/A',
    mediaType,
    addedAt: item.addedAt ?? Date.now(),
  };
  if (genres) m.genres = genres;
  if (genre_ids?.length) m.genre_ids = genre_ids;
  if (item.runtime != null) m.runtime = item.runtime;
  if (item.vote_average != null) m.vote_average = item.vote_average;
  if (item.vote_count != null) m.vote_count = item.vote_count;
  return m;
};

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
          favorites: ensureAddedAt(parsed.favorites || []),
          watchlist: ensureAddedAt(parsed.watchlist || []),
          watched: ensureAddedAt(parsed.watched || []),
          ratings: migrateRatingsKeys(parsed.ratings || {}),
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const resetData = useCallback(() => {
    setData(defaultData());
  }, []);

  const isInList = useCallback(
    (listKey, movieId) => (data[listKey] || []).some((m) => m.id === movieId),
    [data]
  );

  const setRating = useCallback((movieIdOrMovie, rating) => {
    const movieId = typeof movieIdOrMovie === 'object' ? movieIdOrMovie?.id : movieIdOrMovie;
    const key = toRatingKey(movieId);
    setData((prev) => {
      const next = { ...prev.ratings };
      if (rating == null) {
        delete next[key];
      } else {
        next[key] = Math.min(10, Math.max(1, Math.round(rating)));
      }
      return { ...prev, ratings: next };
    });
  }, []);

  const getRating = useCallback(
    (movieIdOrMovie) => {
      const movieId = typeof movieIdOrMovie === 'object' ? movieIdOrMovie?.id : movieIdOrMovie;
      const key = toRatingKey(movieId);
      return data.ratings?.[key] ?? data.ratings?.[movieId];
    },
    [data.ratings]
  );

  const runBackfillGenres = useCallback(async () => {
    const items = [];
    ['favorites', 'watchlist', 'watched'].forEach((listKey) => {
      (data[listKey] || []).forEach((m) => {
        const needsBackfill = !m.genre_ids?.length && !m.genres;
        if (needsBackfill) items.push({ listKey, item: m });
      });
    });
    const toBackfill = items.slice(0, 20);
    if (toBackfill.length === 0) return;

    const results = await Promise.all(
      toBackfill.map(async ({ listKey, item }) => {
        try {
          const detail = await getMovieById(item.id);
          return { listKey, id: item.id, detail };
        } catch {
          return null;
        }
      })
    );

    setData((prev) => {
      const next = { ...prev };
      for (const r of results) {
        if (!r) continue;
        const list = next[r.listKey] || [];
        const existing = list.find((m) => m.id === r.id);
        const merged = toMovie({ ...r.detail, addedAt: existing?.addedAt ?? Date.now() });
        next[r.listKey] = list.map((m) => (m.id === r.id ? merged : m));
      }
      return next;
    });
  }, [data.favorites, data.watchlist, data.watched]);

  useEffect(() => {
    const needs = ['favorites', 'watchlist', 'watched'].some((key) =>
      (data[key] || []).some((m) => !m.genre_ids?.length && !m.genres)
    );
    if (!needs) return;
    runBackfillGenres();
  }, [data.favorites, data.watchlist, data.watched, runBackfillGenres]);

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
    resetData,
  };
};
