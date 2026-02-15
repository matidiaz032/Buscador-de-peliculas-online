import React from 'react';
import { Link } from 'react-router-dom';

export const StatsCards = ({ favorites, watchlist, watched, ratings }) => {
  const ratedCount = Object.keys(ratings || {}).length;
  const ratedValues = Object.values(ratings || {}).filter((v) => v != null);
  const avgRating =
    ratedValues.length > 0
      ? (ratedValues.reduce((a, b) => a + b, 0) / ratedValues.length).toFixed(1)
      : null;

  const cards = [
    { label: 'Favoritos', count: favorites?.length ?? 0, to: '/favorites' },
    { label: 'Ver después', count: watchlist?.length ?? 0, to: '/watchlist' },
    { label: 'Vistas', count: watched?.length ?? 0, to: '/watched' },
    { label: 'Con valoración', count: ratedCount, to: ratedCount > 0 ? '/watched' : null },
    { label: 'Promedio', value: avgRating ? `${avgRating}/10` : '—', to: null },
  ];

  return (
    <div className="dashboard-stats-cards">
      {cards.map((c) => (
        <div key={c.label} className="dashboard-stat-card">
          {c.to ? (
            <Link to={c.to} className="dashboard-stat-card__link">
              <span className="dashboard-stat-card__label">{c.label}</span>
              <span className="dashboard-stat-card__value">
                {c.value ?? c.count}
              </span>
            </Link>
          ) : (
            <>
              <span className="dashboard-stat-card__label">{c.label}</span>
              <span className="dashboard-stat-card__value">{c.value}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
