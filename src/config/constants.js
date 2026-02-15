/**
 * Configuración centralizada de la aplicación.
 */
export const API_TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/w92';

export const getApiKey = () => {
  const key = import.meta.env.VITE_TMDB_API_KEY;
  if (!key) {
    throw new Error(
      'VITE_TMDB_API_KEY no está definida. Crea un archivo .env con tu API key de TMDB (https://www.themoviedb.org/settings/api).'
    );
  }
  return key;
};
