/**
 * Helpers para el recomendador contextual "Porque te gustó X".
 */

const MIN_VOTE_AVERAGE = 7;
const MIN_VOTE_COUNT = 200;

/**
 * Filtra y reordena películas similares para "Porque te gustó X".
 * @param {Array} similar - Resultados de getSimilarMovies (con vote_average, vote_count, genre_ids)
 * @param {number[]} currentGenreIds - genre_ids de la película actual
 * @param {Set<string>} excludeIds - IDs a excluir (vistas, favoritos, ver después)
 * @returns {Array} Ordenado por géneros en común (desc), luego por vote_average
 */
export const filterAndSortForPorqueTeGusto = (
  similar,
  currentGenreIds,
  excludeIds
) => {
  if (!similar?.length) return [];

  const currentSet = new Set(currentGenreIds || []);
  const exclude = excludeIds instanceof Set ? excludeIds : new Set(excludeIds);

  const filtered = similar.filter((m) => {
    if (exclude.has(m.id)) return false;
    const avg = m.vote_average ?? 0;
    const count = m.vote_count ?? 0;
    return avg >= MIN_VOTE_AVERAGE && count >= MIN_VOTE_COUNT;
  });

  const countCommonGenres = (item) => {
    const ids = item.genre_ids || [];
    return ids.filter((id) => currentSet.has(id)).length;
  };

  return filtered.sort((a, b) => {
    const commonA = countCommonGenres(a);
    const commonB = countCommonGenres(b);
    if (commonB !== commonA) return commonB - commonA;
    return (b.vote_average ?? 0) - (a.vote_average ?? 0);
  });
};
