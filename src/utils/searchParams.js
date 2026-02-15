/**
 * Helpers para sincronizar estado de búsqueda con la URL.
 * Single Responsibility: parseo y construcción de search params.
 */

const DEFAULTS = {
  type: 'movie',
  genre: '',
  year: '',
  sortBy: 'popularity.desc',
  page: 1,
};

/**
 * Omite valores por defecto del estado.
 * @param {Object} state - { query, filters: { type, genre, year, sortBy }, page }
 * @returns {Object} - Estado sin defaults
 */
export const omitDefaults = (state) => {
  const { query, filters = {}, page } = state;
  const { type, genre, year, sortBy } = filters;
  const result = { query: query?.trim() || '', filters: {}, page: page || 1 };

  if (type && type !== DEFAULTS.type) result.filters.type = type;
  if (genre && genre !== DEFAULTS.genre) result.filters.genre = genre;
  if (year && year !== DEFAULTS.year) result.filters.year = year;
  if (sortBy && sortBy !== DEFAULTS.sortBy) result.filters.sortBy = sortBy;

  return result;
};

/**
 * Parsea URLSearchParams a estado de UI.
 * @param {URLSearchParams} params
 * @returns {{ query: string, filters: Object, page: number }}
 */
export const parseSearchParamsToState = (params) => {
  const query = params.get('q') || '';
  const type = params.get('type') || DEFAULTS.type;
  const genre = params.get('genre') || '';
  const year = params.get('year') || '';
  const sortBy = params.get('sort') || DEFAULTS.sortBy;
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  return {
    query,
    filters: { type, genre, year, sortBy },
    page,
  };
};

/**
 * Construye URLSearchParams desde el estado (sin defaults).
 * @param {Object} state - { query, filters, page }
 * @returns {URLSearchParams}
 */
export const buildSearchParamsFromState = (state) => {
  const cleaned = omitDefaults(state);
  const sp = new URLSearchParams();

  if (cleaned.query) sp.set('q', cleaned.query);
  if (cleaned.filters.type) sp.set('type', cleaned.filters.type);
  if (cleaned.filters.genre) sp.set('genre', cleaned.filters.genre);
  if (cleaned.filters.year) sp.set('year', cleaned.filters.year);
  if (cleaned.filters.sortBy) sp.set('sort', cleaned.filters.sortBy);
  if (cleaned.page > 1) sp.set('page', String(cleaned.page));

  return sp;
};

/**
 * Indica si hay params suficientes para disparar búsqueda.
 * @param {Object} state
 * @returns {boolean}
 */
export const hasSearchableParams = (state) => {
  const q = state.query?.trim();
  const genre = state.filters?.genre;
  return !!(q || genre);
};
