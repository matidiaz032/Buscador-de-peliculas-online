import React from 'react';
import { useUserListsContext } from '../context/UserListsContext';
import { useToast } from '../context/ToastContext';

export const MovieListActions = ({ movie }) => {
  const {
    toggleFavorite,
    isFavorite,
    toggleWatchlist,
    isInWatchlist,
    toggleWatched,
    isWatched,
    addToWatched,
    removeFromWatchlist,
    setRating,
    getRating,
  } = useUserListsContext();
  const toast = useToast();
  const movieData = {
    id: movie.id,
    Title: movie.Title,
    Year: movie.Year,
    Poster: movie.Poster || 'N/A',
    mediaType: movie.mediaType,
    ...(movie.genres && { genres: movie.genres }),
    ...(movie.genre_ids?.length && { genre_ids: movie.genre_ids }),
    ...(movie.runtime != null && { runtime: movie.runtime }),
    ...(movie.vote_average != null && { vote_average: movie.vote_average }),
    ...(movie.vote_count != null && { vote_count: movie.vote_count }),
  };

  const handleToggle = (toggleFn, isInFn, addMsg, removeMsg) => {
    const wasIn = isInFn(movie.id);
    toggleFn(movieData);
    toast[wasIn ? 'info' : 'success'](wasIn ? removeMsg : addMsg);
  };

  const handleRatingChange = (e) => {
    const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
    setRating(movie.id, val);
    if (val != null) {
      addToWatched(movieData);
      removeFromWatchlist(movie.id);
      toast.success(`Tu valoración: ${val}/10`);
    }
  };

  const userRating = getRating(movie.id);

  return (
    <div className="movie-list-actions">
      <div className="movie-list-buttons">
        <button
          type="button"
          className={`list-btn ${isFavorite(movie.id) ? 'is-active' : ''}`}
          onClick={() =>
            handleToggle(
              toggleFavorite,
              isFavorite,
              'Añadido a favoritos',
              'Quitado de favoritos'
            )
          }
          aria-label={isFavorite(movie.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          title={isFavorite(movie.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          ★ Favoritos
        </button>
        <button
          type="button"
          className={`list-btn ${isInWatchlist(movie.id) ? 'is-active' : ''}`}
          onClick={() =>
            handleToggle(
              toggleWatchlist,
              isInWatchlist,
              'Añadido a ver después',
              'Quitado de ver después'
            )
          }
          aria-label={isInWatchlist(movie.id) ? 'Quitar de ver después' : 'Añadir a ver después'}
          title={isInWatchlist(movie.id) ? 'Quitar de ver después' : 'Ver después'}
        >
          + Ver después
        </button>
        <button
          type="button"
          className={`list-btn ${isWatched(movie.id) ? 'is-active' : ''}`}
          onClick={() =>
            handleToggle(
              toggleWatched,
              isWatched,
              'Marcada como vista',
              'Quitada de vistas'
            )
          }
          aria-label={isWatched(movie.id) ? 'Quitar de vistas' : 'Marcar como vista'}
          title={isWatched(movie.id) ? 'Quitar de vistas' : 'Marcar como vista'}
        >
          ✓ Vista
        </button>
      </div>
      <div className="movie-rating-input">
        <label htmlFor="user-rating">Tu valoración:</label>
        <select
          id="user-rating"
          value={userRating ?? ''}
          onChange={handleRatingChange}
        >
          <option value="">—</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n}/10
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
