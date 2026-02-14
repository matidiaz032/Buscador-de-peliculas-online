import { useState, useCallback } from 'react';

const STORAGE_KEY = 'movie-search-history';
const MAX_ITEMS = 10;

const loadHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveHistory = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
};

export const useSearchHistory = () => {
  const [history, setHistory] = useState(loadHistory);

  const add = useCallback((query) => {
    const trimmed = query?.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered];
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const remove = useCallback((query) => {
    setHistory((prev) => {
      const updated = prev.filter((q) => q !== query);
      saveHistory(updated);
      return updated;
    });
  }, []);

  return { history, add, clear, remove };
};
