import React, { useState, useEffect, useMemo } from 'react';
import { getSimilarMovies } from '../services/movieApi';
import { filterAndSortForPorqueTeGusto } from '../utils/porqueTeGustoHelpers';
import { useUserListsContext } from '../context/UserListsContext';
import { Movie } from './Movie';
import { MoviesListSkeleton } from './MovieSkeleton';

export const PorqueTeGustoSection = ({ movieId, title, genreIds = [] }) => {
  const { watched, favorites, watchlist } = useUserListsContext();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const excludeIds = useMemo(() => {
    const ids = new Set([movieId]);
    [...(watched || []), ...(favorites || []), ...(watchlist || [])].forEach((m) =>
      ids.add(m.id)
    );
    return ids;
  }, [movieId, watched, favorites, watchlist]);

  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      setMovies([]);
      return;
    }

    setLoading(true);
    getSimilarMovies(movieId, 20)
      .then((similar) => {
        const filtered = filterAndSortForPorqueTeGusto(
          similar,
          genreIds,
          excludeIds
        );
        setMovies(filtered);
      })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [movieId, genreIds.join(','), excludeIds]);

  if (loading) {
    return (
      <section className="detail-section porque-te-gusto-section">
        <h3 className="detail-section-title">Porque te gustó {title}</h3>
        <div className="para-vos-skeleton">
          <MoviesListSkeleton count={6} />
        </div>
      </section>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="detail-section porque-te-gusto-section">
      <h3 className="detail-section-title">Porque te gustó {title}</h3>
      <div className="para-vos-carousel">
        {movies.map((movie) => (
          <div key={movie.id} className="para-vos-carousel__item">
            <Movie
              id={movie.id}
              title={movie.Title}
              year={movie.Year}
              poster={movie.Poster}
              movie={movie}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
