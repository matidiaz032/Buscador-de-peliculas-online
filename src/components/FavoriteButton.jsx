import React from 'react';

export const FavoriteButton = ({ isFavorite, onToggle, label = 'Favoritos' }) => (
  <button
    type="button"
    className={`favorite-btn ${isFavorite ? 'is-active' : ''}`}
    onClick={onToggle}
    aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
  >
    {isFavorite ? '★' : '☆'} {label}
  </button>
);
