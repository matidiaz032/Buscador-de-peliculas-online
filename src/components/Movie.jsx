import React from 'react';
import { Link } from 'react-router-dom';
import { useUserListsContext } from '../context/UserListsContext';
import { useToast } from '../context/ToastContext';

const PLACEHOLDER_POSTER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" fill="%2321262d"%3E%3Crect width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%238b949e" font-size="14"%3ENo image%3C/text%3E%3C/svg%3E';

export const Movie = ({
  id,
  title,
  year,
  poster,
  movie,
  showUserRating,
  showAddedAt,
  addedAt,
  formatAddedAt,
}) => {
  const {
    toggleFavorite,
    isFavorite,
    toggleWatchlist,
    isInWatchlist,
    toggleWatched,
    isWatched,
    getRating,
  } = useUserListsContext();
  const toast = useToast();
  const fullMovie = movie || { id, Title: title, Year: year, Poster: poster };

  const handleListClick = (e, listKey, toggleFn, isInFn, addedMsg, removedMsg) => {
    e.preventDefault();
    e.stopPropagation();
    const wasIn = isInFn(id);
    toggleFn(fullMovie);
    toast[wasIn ? 'info' : 'success'](wasIn ? removedMsg : addedMsg);
  };

  const userRating = showUserRating ? getRating(id) : null;

  return (
    <div className="movie-card-wrapper">
      <Link to={`/detail/${id}`} className="card movie-card">
        <div className="card-image">
          <figure className="image">
            <img
              src={poster && poster !== 'N/A' ? poster : PLACEHOLDER_POSTER}
              alt={title}
              loading="lazy"
            />
          </figure>
        </div>
        <div className="card-content">
          <div className="media">
            <div className="media-content">
              <p className="title is-4">{title}</p>
              <p className="subtitle is-6">
                {year}
                {userRating != null && (
                  <span className="movie-user-rating"> ★ {userRating}/10</span>
                )}
                {showAddedAt && addedAt && (
                  <span className="movie-added-at" title="Añadido">
                    {' · '}{formatAddedAt?.(addedAt) ?? new Date(addedAt).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </Link>
      <div className="movie-card-actions">
        <button
          type="button"
          className={`list-btn favorite-btn-card ${isFavorite(id) ? 'is-active' : ''}`}
          onClick={(e) =>
            handleListClick(
              e,
              'favorites',
              toggleFavorite,
              isFavorite,
              `${title} añadido a favoritos`,
              `${title} quitado de favoritos`
            )
          }
          aria-label={isFavorite(id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          title={isFavorite(id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          ★
        </button>
        <button
          type="button"
          className={`list-btn watchlist-btn-card ${isInWatchlist(id) ? 'is-active' : ''}`}
          onClick={(e) =>
            handleListClick(
              e,
              'watchlist',
              toggleWatchlist,
              isInWatchlist,
              `${title} añadido a ver después`,
              `${title} quitado de ver después`
            )
          }
          aria-label={isInWatchlist(id) ? 'Quitar de ver después' : 'Ver después'}
          title={isInWatchlist(id) ? 'Quitar de ver después' : 'Ver después'}
        >
          +
        </button>
        <button
          type="button"
          className={`list-btn watched-btn-card ${isWatched(id) ? 'is-active' : ''}`}
          onClick={(e) =>
            handleListClick(
              e,
              'watched',
              toggleWatched,
              isWatched,
              `${title} marcada como vista`,
              `${title} quitada de vistas`
            )
          }
          aria-label={isWatched(id) ? 'Quitar de vistas' : 'Marcar como vista'}
          title={isWatched(id) ? 'Quitar de vistas' : 'Marcar como vista'}
        >
          ✓
        </button>
      </div>
    </div>
  );
};
