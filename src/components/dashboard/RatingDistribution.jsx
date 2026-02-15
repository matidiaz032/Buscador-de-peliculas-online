import React, { useMemo } from 'react';

export const RatingDistribution = ({ ratings }) => {
  const distribution = useMemo(() => {
    const counts = Array.from({ length: 10 }, (_, i) => ({ rating: i + 1, count: 0 }));
    Object.values(ratings || {}).forEach((v) => {
      if (v >= 1 && v <= 10) counts[v - 1].count += 1;
    });
    const max = Math.max(...counts.map((c) => c.count), 1);
    return counts.map((c) => ({ ...c, pct: (c.count / max) * 100 }));
  }, [ratings]);

  const total = distribution.reduce((a, c) => a + c.count, 0);
  if (total === 0) return null;

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section__title">Distribución de valoraciones</h3>
      <div className="rating-distribution">
        {distribution.map(({ rating, count, pct }) => (
          <div key={rating} className="rating-bar-item">
            <span className="rating-bar-label">{rating}</span>
            <div className="genre-bar-track">
              <div
                className="genre-bar-fill"
                style={{ width: `${pct}%` }}
                role="presentation"
              />
            </div>
            <span className="rating-bar-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
