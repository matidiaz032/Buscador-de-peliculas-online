import React, { useMemo } from 'react';

/** Extrae nombres de géneros (string, array de strings o array de {id,name}). */
const toGenreNames = (g) => {
  if (!g) return [];
  if (typeof g === 'string') return g.split(',').map((s) => s.trim()).filter(Boolean);
  if (!Array.isArray(g)) return [];
  return g.map((x) => (typeof x === 'string' ? x : x?.name)).filter(Boolean);
};

const countGenres = (items) => {
  const counts = {};
  (items || []).forEach((item) => {
    toGenreNames(item.genres).forEach((name) => {
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
  });
  return counts;
};

export const GenreBars = ({ favorites, watched }) => {
  const topGenres = useMemo(() => {
    const combined = [...(favorites || []), ...(watched || [])];
    const counts = countGenres(combined);
    const entries = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const max = Math.max(...entries.map(([, n]) => n), 1);
    return entries.map(([name, n]) => ({ name, count: n, pct: (n / max) * 100 }));
  }, [favorites, watched]);

  if (topGenres.length === 0) {
    return (
      <div className="dashboard-section">
        <h3 className="dashboard-section__title">Top géneros</h3>
        <p className="dashboard-section__empty">
          No hay datos de géneros. Añade películas desde el detalle para que se guarden.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section__title">Top géneros</h3>
      <p className="dashboard-section__subtitle">Favoritos y vistas</p>
      <div className="genre-bars">
        {topGenres.map(({ name, count, pct }) => (
          <div key={name} className="genre-bar-item">
            <div className="genre-bar-header">
              <span className="genre-bar-name">{name}</span>
              <span className="genre-bar-count">{count}</span>
            </div>
            <div className="genre-bar-track">
              <div
                className="genre-bar-fill"
                style={{ width: `${pct}%` }}
                role="presentation"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
