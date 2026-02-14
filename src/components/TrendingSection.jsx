import React, { useState, useEffect } from 'react';
import { getTrending } from '../services/movieApi';
import { MoviesList } from './MoviesList';
import { MoviesListSkeleton } from './MovieSkeleton';

export const TrendingSection = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('movie');
  const [timeWindow, setTimeWindow] = useState('day');

  useEffect(() => {
    setLoading(true);
    getTrending(type, timeWindow)
      .then(setMovies)
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [type, timeWindow]);

  return (
    <section className="trending-section">
      <div className="trending-header">
        <h2 className="trending-title">En tendencia</h2>
        <div className="trending-controls">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="trending-select"
          >
            <option value="movie">Películas</option>
            <option value="tv">Series</option>
            <option value="all">Todo</option>
          </select>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            className="trending-select"
          >
            <option value="day">Hoy</option>
            <option value="week">Esta semana</option>
          </select>
        </div>
      </div>
      {loading ? (
        <MoviesListSkeleton count={8} />
      ) : (
        <MoviesList movies={movies.slice(0, 12)} />
      )}
    </section>
  );
};
