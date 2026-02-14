import React from 'react';

export const MovieSkeleton = () => (
  <div className="movie-skeleton">
    <div className="movie-skeleton__poster" />
    <div className="movie-skeleton__content">
      <div className="movie-skeleton__title" />
      <div className="movie-skeleton__subtitle" />
    </div>
  </div>
);

export const MoviesListSkeleton = ({ count = 10 }) => (
  <div className="movies-grid">
    {Array.from({ length: count }, (_, i) => (
      <MovieSkeleton key={i} />
    ))}
  </div>
);
