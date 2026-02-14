/**
 * Servicio unificado para la API de TMDB.
 * Búsqueda, detalle y películas similares en una sola API.
 */
import { API_TMDB_BASE, TMDB_IMAGE_BASE, getApiKey } from '../config/constants';

const CACHE_TTL = 30 * 60 * 1000; // 30 min
const cache = new Map();

const getCached = (key, ttl = CACHE_TTL) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const buildUrl = (path, params = {}) => {
  const searchParams = new URLSearchParams({ api_key: getApiKey(), ...params });
  return `${API_TMDB_BASE}${path}?${searchParams.toString()}`;
};

const posterUrl = (path) =>
  path ? `${TMDB_IMAGE_BASE}${path}` : null;

const parseId = (movieId) => {
  if (!movieId) return null;
  const match = String(movieId).match(/^(movie|tv)-(\d+)$/);
  return match ? { mediaType: match[1], tmdbId: parseInt(match[2], 10) } : null;
};

const toMovieId = (mediaType, tmdbId) => `${mediaType}-${tmdbId}`;

let genresCache = { movie: null, tv: null };

/**
 * Obtiene la lista de géneros (cacheada).
 */
export const getGenres = async (type = 'movie') => {
  if (genresCache[type]) return genresCache[type];
  const endpoint = type === 'tv' ? '/genre/tv/list' : '/genre/movie/list';
  const response = await fetch(buildUrl(endpoint, { language: 'es' }));
  const data = await response.json();
  if (!response.ok) throw new Error(data.status_message || 'Error');
  genresCache[type] = data.genres || [];
  return genresCache[type];
};

const normalizeSearchResult = (item) => {
  const mediaType = item.media_type || 'movie';
  const id = toMovieId(mediaType, item.id);
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const poster = posterUrl(item.poster_path);
  return { id, Title: title, Year: year, Poster: poster, mediaType };
};

/**
 * Busca películas y series.
 * Con query: usa search API. Con género sin query: usa discover.
 * @param {string} query - Término de búsqueda (vacío = discover por género)
 * @param {number} [page=1] - Página
 * @param {Object} [filters] - { year, type, genre, sortBy }
 */
export const searchMovies = async (query, page = 1, filters = {}) => {
  const { year, type = 'movie', genre, sortBy } = filters;
  const cacheKey = `search:${query}:${page}:${year || ''}:${type}:${genre || ''}:${sortBy || ''}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const hasQuery = query?.trim();
  let results = [];
  let totalResults = 0;
  let totalPages = 0;

  if (hasQuery) {
    // Búsqueda por texto
    const endpoint = type === 'tv' ? '/search/tv' : '/search/movie';
    const params = { query: query.trim(), page };
    if (year) params[type === 'tv' ? 'first_air_date_year' : 'year'] = year;

    const response = await fetch(buildUrl(endpoint, params));
    const data = await response.json();
    if (!response.ok) throw new Error(data.status_message || 'Error al buscar');

    results = data.results || [];
    totalResults = data.total_results ?? 0;
    totalPages = data.total_pages ?? Math.ceil(totalResults / 20);

    // Filtrar por género en cliente (search no soporta with_genres)
    if (genre) {
      const genreId = parseInt(genre, 10);
      results = results.filter((r) => r.genre_ids?.includes(genreId));
    }
  } else if (genre) {
    // Discover: explorar por género sin búsqueda de texto
    const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
    const sortParam = sortBy || 'popularity.desc';
    const tvSortMap = {
      'primary_release_date.desc': 'first_air_date.desc',
      'primary_release_date.asc': 'first_air_date.asc',
    };
    const params = {
      with_genres: genre,
      page,
      sort_by: type === 'tv' ? tvSortMap[sortParam] || sortParam : sortParam,
    };
    if (year) params[type === 'tv' ? 'first_air_date_year' : 'primary_release_year'] = year;

    const response = await fetch(buildUrl(endpoint, params));
    const data = await response.json();
    if (!response.ok) throw new Error(data.status_message || 'Error al buscar');

    results = data.results || [];
    totalResults = data.total_results ?? 0;
    totalPages = data.total_pages ?? Math.ceil(totalResults / 20);
  } else {
    return { movies: [], totalResults: 0, totalPages: 0 };
  }

  const movies = results.map(normalizeSearchResult);
  const result = { movies, totalResults, totalPages };
  setCache(cacheKey, result);
  return result;
};

/**
 * Obtiene detalle de película o serie.
 * @param {string} movieId - Formato "movie-123" o "tv-456"
 */
export const getMovieById = async (movieId) => {
  const parsed = parseId(movieId);
  if (!parsed) throw new Error('ID inválido');

  const cacheKey = `detail:${movieId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { mediaType, tmdbId } = parsed;
  const response = await fetch(buildUrl(`/${mediaType}/${tmdbId}`));
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.status_message || 'No encontrado');
  }

  const title = data.title || data.name;
  const year = (data.release_date || data.first_air_date || '').slice(0, 4);
  const poster = posterUrl(data.poster_path);
  const overview = data.overview || '';

  const movie = {
    id: movieId,
    Title: title,
    Year: year,
    Poster: poster,
    Plot: overview,
    mediaType,
    tmdbId,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    genres: data.genres?.map((g) => g.name).join(', ') || null,
    runtime: data.runtime,
    status: data.status,
    imdb_id: data.imdb_id,
    original_language: data.original_language,
    production_countries: data.production_countries?.map((c) => c.name).join(', ') || null,
    release_date: data.release_date || data.first_air_date,
    budget: data.budget,
    revenue: data.revenue,
    homepage: data.homepage,
    tagline: data.tagline,
  };

  setCache(cacheKey, movie);
  return movie;
};

/**
 * Obtiene películas/series similares.
 * @param {string} movieId - Formato "movie-123" o "tv-456"
 * @param {number} [limit=6]
 */
export const getSimilarMovies = async (movieId, limit = 6) => {
  const parsed = parseId(movieId);
  if (!parsed) return [];

  const cacheKey = `similar:${movieId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { mediaType, tmdbId } = parsed;
  const endpoint = `/${mediaType}/${tmdbId}/similar`;
  const response = await fetch(buildUrl(endpoint, { page: 1 }));
  const data = await response.json();

  if (!response.ok || !data.results?.length) return [];

  const results = data.results.slice(0, limit).map((item) => {
    const type = mediaType;
    const id = toMovieId(type, item.id);
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    const poster = posterUrl(item.poster_path);
    return { id, Title: title, Year: year, Poster: poster };
  });

  setCache(cacheKey, results);
  return results;
};

/**
 * Busca empresas/productoras por nombre.
 */
export const searchCompanies = async (query) => {
  if (!query?.trim()) return [];
  const response = await fetch(buildUrl('/search/company', { query: query.trim() }));
  const data = await response.json();
  if (!response.ok) return [];
  return (data.results || []).slice(0, 10);
};

/**
 * Busca personas (actores, directores) por nombre.
 */
export const searchPeople = async (query) => {
  if (!query?.trim()) return [];
  const response = await fetch(buildUrl('/search/person', { query: query.trim() }));
  const data = await response.json();
  if (!response.ok) return [];
  return (data.results || []).slice(0, 10);
};

/**
 * Obtiene películas y series en tendencia.
 * @param {string} [type='movie'] - 'movie' | 'tv' | 'all'
 * @param {string} [timeWindow='day'] - 'day' | 'week'
 */
export const getTrending = async (type = 'movie', timeWindow = 'day') => {
  const cacheKey = `trending:${type}:${timeWindow}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const endpoint = `/trending/${type === 'all' ? 'all' : type}/${timeWindow}`;
  const response = await fetch(buildUrl(endpoint));
  const data = await response.json();
  if (!response.ok) throw new Error(data.status_message || 'Error');

  const results = (data.results || []).map((item) => {
    const mediaType = item.media_type || type;
    const id = toMovieId(mediaType, item.id);
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    const poster = posterUrl(item.poster_path);
    return { id, Title: title, Year: year, Poster: poster, mediaType };
  });

  setCache(cacheKey, results);
  return results;
};

/**
 * Obtiene videos/trailers de una película o serie.
 * @param {string} movieId - Formato "movie-123" o "tv-456"
 */
export const getVideos = async (movieId) => {
  const parsed = parseId(movieId);
  if (!parsed) return [];

  const cacheKey = `videos:${movieId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { mediaType, tmdbId } = parsed;
  const response = await fetch(buildUrl(`/${mediaType}/${tmdbId}/videos`));
  const data = await response.json();
  if (!response.ok || !data.results?.length) return [];

  const videos = data.results
    .filter((v) => v.site === 'YouTube' && v.type === 'Trailer')
    .map((v) => ({
      key: v.key,
      name: v.name,
      type: v.type,
    }));

  setCache(cacheKey, videos);
  return videos;
};

/**
 * Obtiene una película/serie aleatoria usando Discover.
 * @param {Object} filters - { type, genre, year, companyId, personId }
 */
export const getRandomMovie = async (filters = {}) => {
  const { type = 'movie', genre, year, companyId, personId } = filters;

  // Para series con persona: TMDB discover/tv no soporta with_people, usamos person credits
  if (type === 'tv' && personId) {
    const response = await fetch(buildUrl(`/person/${personId}`, { append_to_response: 'tv_credits' }));
    const data = await response.json();
    if (!response.ok) throw new Error(data.status_message || 'Error');
    const credits = data.tv_credits?.cast || [];
    if (credits.length === 0) throw new Error('No hay series con esa persona');
    const item = credits[Math.floor(Math.random() * credits.length)];
    return normalizeSearchResult({ ...item, media_type: 'tv' });
  }

  const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
  const params = {
    page: 1,
    sort_by: type === 'tv' ? 'popularity.desc' : 'popularity.desc',
  };
  if (genre) params.with_genres = genre;
  if (year) params[type === 'tv' ? 'first_air_date_year' : 'primary_release_year'] = year;
  if (companyId) params.with_companies = companyId;
  if (personId && type === 'movie') params.with_people = personId;

  const response = await fetch(buildUrl(endpoint, params));
  const data = await response.json();
  if (!response.ok) throw new Error(data.status_message || 'Error');

  const totalPages = Math.min(data.total_pages ?? 1, 500);
  if (totalPages < 1) throw new Error('No hay resultados con esos filtros');

  const randomPage = Math.floor(Math.random() * totalPages) + 1;
  const pageResponse = await fetch(buildUrl(endpoint, { ...params, page: randomPage }));
  const pageData = await pageResponse.json();
  const results = pageData.results || [];

  if (results.length === 0) throw new Error('No se encontró ninguna película');

  const randomIndex = Math.floor(Math.random() * results.length);
  const item = results[randomIndex];
  return normalizeSearchResult({ ...item, media_type: type });
};
