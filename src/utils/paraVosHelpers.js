/**
 * Helpers para el recomendador "Para vos".
 * Cálculo de top géneros a partir de vistas con rating alto.
 */

/** Parsea géneros de un item (string, array de strings o array de {id,name}). */
const parseGenres = (item) => {
  const g = item?.genres;
  if (!g) return [];
  if (typeof g === 'string') return g.split(',').map((s) => s.trim()).filter(Boolean);
  if (!Array.isArray(g)) return [];
  return g.map((x) => (typeof x === 'string' ? x : x?.name)).filter(Boolean);
};

/**
 * Obtiene los top géneros a partir de vistas con rating >= minRating.
 * @param {Array} watched - Lista de películas vistas
 * @param {Function} getRating - (movieId) => rating
 * @param {number} [minRating=8] - Rating mínimo para considerar
 * @param {number} [topN=5] - Cantidad de géneros a devolver
 * @returns {Array<{ name: string, count: number }>} Ordenado por count desc
 */
export const getTopGenresFromWatched = (watched, getRating, minRating = 8, topN = 5) => {
  if (!watched?.length || !getRating) return [];

  const counts = {};
  watched.forEach((item) => {
    const rating = getRating(item.id);
    if (rating == null || rating < minRating) return;

    const genres = parseGenres(item);
    genres.forEach((name) => {
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([name, count]) => ({ name, count }));
};

/**
 * Mapea nombres de géneros a IDs de TMDB.
 * @param {Array<{ id: number, name: string }>} genresList - Lista de géneros de TMDB
 * @param {string[]} genreNames - Nombres a mapear
 * @returns {number[]} IDs de TMDB
 */
export const genreNamesToIds = (genresList, genreNames) => {
  if (!genresList?.length || !genreNames?.length) return [];
  const nameToId = Object.fromEntries(genresList.map((g) => [g.name.toLowerCase(), g.id]));
  return genreNames
    .map((n) => nameToId[n.toLowerCase()])
    .filter((id) => id != null);
};
