import React from 'react';
import { Link } from 'react-router-dom';
import { useSimilarMovies } from '../hooks/useSimilarMovies';
import { MoviesListSkeleton } from './MovieSkeleton';

const PLACEHOLDER_POSTER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" fill="%2321262d"%3E%3Crect width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%238b949e" font-size="14"%3ENo image%3C/text%3E%3C/svg%3E';

export const SimilarMovies = ({ movieId }) => {
  const { similar, loading } = useSimilarMovies(movieId);

  if (loading) {
    return (
      <section className="similar-movies">
        <h2 className="similar-movies__title">Películas similares</h2>
        <MoviesListSkeleton count={6} />
      </section>
    );
  }
  if (similar.length === 0) return null;

  return (
    <section className="similar-movies">
      <h2 className="similar-movies__title">Películas similares</h2>
      <div className="movies-grid">
        {similar.map((movie) => (
          <Link
            key={movie.id}
            to={`/detail/${movie.id}`}
            className="card movie-card"
          >
            <div className="card-image">
              <figure className="image">
                <img
                  src={movie.Poster || PLACEHOLDER_POSTER}
                  alt={movie.Title}
                  loading="lazy"
                />
              </figure>
            </div>
            <div className="card-content">
              <div className="media">
                <div className="media-content">
                  <p className="title is-4">{movie.Title}</p>
                  <p className="subtitle is-6">{movie.Year}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
