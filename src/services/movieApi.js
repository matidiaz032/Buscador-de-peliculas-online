/**
 * Servicio unificado para la API de TMDB.
 * Búsqueda, detalle y películas similares en una sola API.
 */
import { API_TMDB_BASE, TMDB_IMAGE_BASE, TMDB_LOGO_BASE, getApiKey } from '../config/constants';

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

const logoUrl = (path) =>
  path ? `${TMDB_LOGO_BASE}${path}` : null;

/**
 * Infiere región ISO 3166-1 alpha-2 desde navigator.language.
 * Ej: es-AR -> AR, en-US -> US. Default: AR.
 */
export const inferRegion = () => {
  if (typeof navigator === 'undefined') return 'AR';
  const lang = navigator.language || '';
  const parts = lang.split('-');
  if (parts.length >= 2 && parts[1].length === 2) {
    return parts[1].toUpperCase();
  }
  return 'AR';
};

const parseId = (movieId) => {
  if (!movieId) return null;
  const match = String(movieId).match(/^(movie|tv)-(\d+)$/);
  return match ? { mediaType: match[1], tmdbId: parseInt(match[2], 10) } : null;
};

const toMovieId = (mediaType, tmdbId) => `${mediaType}-${tmdbId}`;

/** Key compuesta para exclusiones: mediaType:id (ej. "movie:123"). */
export const toExcludeKey = (movieId) => {
  if (!movieId) return '';
  const s = String(movieId);
  const match = s.match(/^(movie|tv)-(\d+)$/);
  if (match) return `${match[1]}:${match[2]}`;
  if (s.includes(':') && !s.includes('-')) return s;
  const type = s.startsWith('tv') ? 'tv' : 'movie';
  const num = s.replace(/\D/g, '') || s;
  return num ? `${type}:${num}` : '';
};

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

/** Ordena items raw por sortBy en frontend (para merge movie+tv). */
const sortByField = (items, sortBy) => {
  const param = sortBy || 'popularity.desc';
  const [field, order] = param.split('.');
  const asc = order === 'asc';

  const getVal = (item) => {
    if (field === 'popularity') return item.popularity ?? 0;
    if (field === 'vote_average') return item.vote_average ?? 0;
    if (field === 'primary_release_date' || field === 'first_air_date') {
      const d = item.release_date || item.first_air_date || '';
      return d ? new Date(d).getTime() : 0;
    }
    return 0;
  };

  return [...items].sort((a, b) => {
    const va = getVal(a);
    const vb = getVal(b);
    return asc ? va - vb : vb - va;
  });
};

/**
 * Busca películas y series.
 * Con query: search API (o /search/multi si type=all). Sin query: discover.
 * @param {string} query - Término de búsqueda (vacío = discover por género)
 * @param {number} [page=1] - Página
 * @param {Object} [filters] - { year, type, genre, sortBy }
 * @param {AbortSignal} [signal] - Para cancelar request solapado
 */
export const searchMovies = async (query, page = 1, filters = {}, signal) => {
  const { year, type = 'movie', genre, sortBy } = filters;
  const cacheKey = `search:${query}:${page}:${year || ''}:${type}:${genre || ''}:${sortBy || ''}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const hasQuery = query?.trim();
  let results = [];
  let totalResults = 0;
  let totalPages = 0;

  if (hasQuery) {
    if (type === 'all') {
      // /search/multi: películas y series
      const params = { query: query.trim(), page };
      const response = await fetch(buildUrl('/search/multi', params), { signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.status_message || 'Error al buscar');

      results = (data.results || []).filter(
        (r) => r.media_type === 'movie' || r.media_type === 'tv'
      );
      if (year) {
        const y = year.toString();
        results = results.filter((r) => {
          const d = r.release_date || r.first_air_date || '';
          return d.startsWith(y);
        });
      }
      if (genre) {
        const genreId = parseInt(genre, 10);
        results = results.filter((r) => r.genre_ids?.includes(genreId));
      }
      totalResults = data.total_results ?? results.length;
      totalPages = Math.max(1, Math.ceil((data.total_results ?? results.length) / 20));
    } else {
      const endpoint = type === 'tv' ? '/search/tv' : '/search/movie';
      const params = { query: query.trim(), page };
      if (year) params[type === 'tv' ? 'first_air_date_year' : 'year'] = year;

      const response = await fetch(buildUrl(endpoint, params), { signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.status_message || 'Error al buscar');

      results = data.results || [];
      totalResults = data.total_results ?? 0;
      totalPages = data.total_pages ?? Math.ceil(totalResults / 20);

      if (genre) {
        const genreId = parseInt(genre, 10);
        results = results.filter((r) => r.genre_ids?.includes(genreId));
      }
    }
  } else if (genre) {
    // Discover: explorar por género
    const sortParam = sortBy || 'popularity.desc';
    const tvSortMap = {
      'primary_release_date.desc': 'first_air_date.desc',
      'primary_release_date.asc': 'first_air_date.asc',
    };

    if (type === 'all') {
      // Discover movie + tv en paralelo, merge y ordenar en frontend
      const movieParams = {
        with_genres: genre,
        page,
        sort_by: sortParam,
      };
      if (year) movieParams.primary_release_year = year;

      const tvParams = {
        with_genres: genre,
        page,
        sort_by: tvSortMap[sortParam] || sortParam,
      };
      if (year) tvParams.first_air_date_year = year;

      const [movieRes, tvRes] = await Promise.all([
        fetch(buildUrl('/discover/movie', movieParams), { signal }).then((r) =>
          r.json()
        ),
        fetch(buildUrl('/discover/tv', tvParams), { signal }).then((r) =>
          r.json()
        ),
      ]);

      const movieItems = (movieRes.results || []).map((r) => ({ ...r, media_type: 'movie' }));
      const tvItems = (tvRes.results || []).map((r) => ({ ...r, media_type: 'tv' }));
      const merged = sortByField([...movieItems, ...tvItems], sortParam);

      const totalMovie = movieRes.total_results ?? 0;
      const totalTv = tvRes.total_results ?? 0;
      totalResults = totalMovie + totalTv;
      totalPages = Math.max(1, Math.ceil(totalResults / 20));
      results = merged.slice((page - 1) * 20, page * 20);
    } else {
      const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
      const params = {
        with_genres: genre,
        page,
        sort_by: type === 'tv' ? tvSortMap[sortParam] || sortParam : sortParam,
      };
      if (year) params[type === 'tv' ? 'first_air_date_year' : 'primary_release_year'] = year;

      const response = await fetch(buildUrl(endpoint, params), { signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.status_message || 'Error al buscar');

      results = data.results || [];
      totalResults = data.total_results ?? 0;
      totalPages = data.total_pages ?? Math.ceil(totalResults / 20);
    }
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
    genre_ids: data.genres?.map((g) => g.id) || [],
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
 * Incluye vote_average, vote_count, genre_ids para recomendaciones contextuales.
 * @param {string} movieId - Formato "movie-123" o "tv-456"
 * @param {number} [limit=6] - Máximo a devolver (se cachean hasta 20)
 */
export const getSimilarMovies = async (movieId, limit = 6) => {
  const parsed = parseId(movieId);
  if (!parsed) return [];

  const cacheKey = `similar:${movieId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached.slice(0, limit);

  const { mediaType, tmdbId } = parsed;
  const endpoint = `/${mediaType}/${tmdbId}/similar`;
  const response = await fetch(buildUrl(endpoint, { page: 1 }));
  const data = await response.json();

  if (!response.ok || !data.results?.length) return [];

  const results = data.results.slice(0, 20).map((item) => {
    const type = mediaType;
    const id = toMovieId(type, item.id);
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    const poster = posterUrl(item.poster_path);
    return {
      id,
      Title: title,
      Year: year,
      Poster: poster,
      mediaType: type,
      vote_average: item.vote_average,
      vote_count: item.vote_count ?? 0,
      genre_ids: item.genre_ids || [],
    };
  });

  setCache(cacheKey, results);
  return results.slice(0, limit);
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
 * Obtiene proveedores de streaming/alquiler/compra.
 * @param {string} movieId - Formato "movie-123" o "tv-456"
 * @param {string} [region] - Código ISO 3166-1 alpha-2 (ej: AR, US). Si no se pasa, usa inferRegion().
 */
export const getWatchProviders = async (movieId, region) => {
  const parsed = parseId(movieId);
  if (!parsed) return null;

  const reg = region || inferRegion();
  const cacheKey = `providers:${movieId}:${reg}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { mediaType, tmdbId } = parsed;
  const response = await fetch(buildUrl(`/${mediaType}/${tmdbId}/watch/providers`));
  const data = await response.json();

  if (!response.ok || !data.results) return null;

  const regionData = data.results[reg];
  if (!regionData) return null;

  const providers = {
    flatrate: (regionData.flatrate || []).map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: logoUrl(p.logo_path),
    })),
    rent: (regionData.rent || []).map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: logoUrl(p.logo_path),
    })),
    buy: (regionData.buy || []).map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logo: logoUrl(p.logo_path),
    })),
  };

  setCache(cacheKey, providers);
  return providers;
};

/**
 * Obtiene créditos (cast y crew).
 * @param {string} movieId - Formato "movie-123" o "tv-456"
 */
export const getCredits = async (movieId) => {
  const parsed = parseId(movieId);
  if (!parsed) return null;

  const cacheKey = `credits:${movieId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { mediaType, tmdbId } = parsed;
  const response = await fetch(buildUrl(`/${mediaType}/${tmdbId}/credits`));
  const data = await response.json();

  if (!response.ok) return null;

  const directors = (data.crew || [])
    .filter((c) => c.job === 'Director')
    .map((c) => ({ name: c.name, profile_path: c.profile_path }));

  const writersRaw = (data.crew || []).filter((c) =>
    ['Writer', 'Screenplay', 'Original Story', 'Story'].includes(c.job)
  );
  const writers = [...new Map(writersRaw.map((w) => [w.name, w])).values()].map(
    (c) => ({ name: c.name, job: c.job })
  );

  const cast = (data.cast || [])
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path,
    }));

  const credits = { directors, writers, cast };
  setCache(cacheKey, credits);
  return credits;
};

/** Fetch una página de discover (cacheada por params). */
const fetchDiscoverPage = async (endpoint, params) => {
  const { with_genres, sort_by, page, 'vote_average.gte': va, 'vote_count.gte': vc } = params;
  const cacheKey = `discoverPage:${endpoint}:${with_genres}:${sort_by}:${va}:${vc}:${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const response = await fetch(buildUrl(endpoint, params));
  const data = await response.json();
  if (!response.ok) throw new Error(data.status_message || 'Error');
  setCache(cacheKey, data);
  return data;
};

/**
 * Descubre películas/series para recomendaciones "Para vos".
 * Pagina hasta 5 páginas, relaja filtros si no hay resultados.
 * @param {Object} opts - { genreIds, excludeIds, type, limit }
 */
export const discoverForYou = async (opts = {}) => {
  const { genreIds = [], excludeIds = new Set(), type = 'movie', limit = 12 } = opts;

  if (!genreIds?.length) return [];

  const genreStr = genreIds.join(',');
  const exclude = new Set();
  const raw = excludeIds instanceof Set ? excludeIds : excludeIds;
  raw.forEach((id) => {
    const key = toExcludeKey(id);
    if (key) exclude.add(key);
  });

  const isExcluded = (m) => exclude.has(toExcludeKey(m.id));

  const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
  const sortParam = 'vote_average.desc';

  const attempts = [
    { vote_average_gte: 7, vote_count_gte: 200 },
    { vote_average_gte: 6.5, vote_count_gte: 50 },
  ];

  const mapItem = (item) => {
    const mediaType = item.media_type || type;
    const id = toMovieId(mediaType, item.id);
    return {
      id,
      Title: item.title || item.name,
      Year: (item.release_date || item.first_air_date || '').slice(0, 4),
      Poster: posterUrl(item.poster_path),
      mediaType,
    };
  };

  for (const { vote_average_gte, vote_count_gte } of attempts) {
    const collected = [];
    const maxPages = 5;

    for (let page = 1; page <= maxPages && collected.length < limit; page++) {
      const params = {
        with_genres: genreStr,
        sort_by: sortParam,
        'vote_average.gte': vote_average_gte,
        'vote_count.gte': vote_count_gte,
        page,
      };

      const data = await fetchDiscoverPage(endpoint, params);
      const items = (data.results || []).map(mapItem);

      for (const m of items) {
        if (!isExcluded(m)) {
          collected.push(m);
          if (collected.length >= limit) break;
        }
      }

      if ((data.total_pages ?? 1) <= page) break;
    }

    if (collected.length > 0) return collected.slice(0, limit);
  }

  return [];
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
