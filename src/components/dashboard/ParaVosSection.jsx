import React, { useState, useEffect, useMemo } from 'react';
import { useUserListsContext } from '../../context/UserListsContext';
import { useGenres } from '../../hooks/useGenres';
import { discoverForYou } from '../../services/movieApi';
import { getTopGenresFromWatched, genreNamesToIds } from '../../utils/paraVosHelpers';
import { Movie } from '../Movie';
import { MoviesListSkeleton } from '../MovieSkeleton';

export const ParaVosSection = () => {
  const { watched, favorites, watchlist, getRating } = useUserListsContext();
  const { genres } = useGenres('movie');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const excludeIds = useMemo(() => {
    const ids = new Set();
    [...(watched || []), ...(favorites || []), ...(watchlist || [])].forEach((m) => {
      if (m?.id) ids.add(String(m.id));
    });
    return ids;
  }, [watched, favorites, watchlist]);

  const topGenres = useMemo(
    () => getTopGenresFromWatched(watched, getRating, 8, 5),
    [watched, getRating]
  );

  const genreIds = useMemo(
    () => genreNamesToIds(genres, topGenres.map((g) => g.name)),
    [genres, topGenres]
  );

  useEffect(() => {
    if (!genreIds.length) {
      setLoading(false);
      setMovies([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    discoverForYou({
      genreIds,
      excludeIds,
      type: 'movie',
      limit: 12,
    })
      .then(setMovies)
      .catch((err) => {
        setError(err.message);
        setMovies([]);
      })
      .finally(() => setLoading(false));
  }, [genreIds.join(','), excludeIds]);

  if (topGenres.length === 0) {
    return (
      <div className="dashboard-section">
        <h3 className="dashboard-section__title">Para vos</h3>
        <p className="dashboard-section__empty">
          Añadí películas a Vistas y valorá con 8 o más para que te recomendemos según tus gustos.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-section">
        <h3 className="dashboard-section__title">Para vos</h3>
        <p className="dashboard-section__subtitle">
          Basado en tus géneros favoritos (vistas con rating ≥ 8)
        </p>
        <div className="para-vos-skeleton">
          <MoviesListSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-section">
        <h3 className="dashboard-section__title">Para vos</h3>
        <p className="dashboard-section__error">{error}</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="dashboard-section">
        <h3 className="dashboard-section__title">Para vos</h3>
        <p className="dashboard-section__subtitle">
          Basado en tus géneros favoritos (vistas con rating ≥ 8)
        </p>
        <p className="dashboard-section__empty">
          No encontramos más recomendaciones que no hayas visto. ¡Explorá nuevos géneros!
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section__title">Para vos</h3>
      <p className="dashboard-section__subtitle">
        Basado en tus géneros favoritos (vistas con rating ≥ 8)
      </p>
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
    </div>
  );
};
