import React from 'react';
import { Movie } from './Movie';

export const MoviesList = ({
  movies,
  showUserRating = false,
  showAddedAt = false,
  formatAddedAt = (ts) => (ts ? new Date(ts).toLocaleDateString() : ''),
}) => (
  <div className="movies-grid">
    {movies.map((movie) => (
      <Movie
        key={movie.id}
        id={movie.id}
        title={movie.Title}
        year={movie.Year}
        poster={movie.Poster}
        movie={movie}
        showUserRating={showUserRating}
        showAddedAt={showAddedAt}
        addedAt={movie.addedAt}
        formatAddedAt={formatAddedAt}
      />
    ))}
  </div>
);
