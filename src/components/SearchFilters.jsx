import React from 'react';
import { useGenres } from '../hooks/useGenres';

const TYPES = [
  { value: 'movie', label: 'Películas' },
  { value: 'tv', label: 'Series' },
  { value: 'all', label: 'Todos' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Más populares' },
  { value: 'popularity.asc', label: 'Menos populares' },
  { value: 'primary_release_date.desc', label: 'Más recientes' },
  { value: 'primary_release_date.asc', label: 'Más antiguas' },
  { value: 'vote_average.desc', label: 'Mejor valoradas' },
  { value: 'vote_average.asc', label: 'Peor valoradas' },
];

const currentYear = new Date().getFullYear();
const years = ['', ...Array.from({ length: 50 }, (_, i) => String(currentYear - i))];

export const SearchFilters = ({ filters, onChange, sortDisabled = false }) => {
  const { year, type, genre, sortBy } = filters;
  const { genres } = useGenres(type === 'all' ? 'movie' : type || 'movie');

  return (
    <div className="search-filters">
      <div className="search-filters__field">
        <label htmlFor="filter-type" className="search-filters__label">
          Tipo
        </label>
        <select
          id="filter-type"
          className="search-filters__select"
          value={type || 'movie'}
          onChange={(e) => {
            const newType = e.target.value;
            onChange({ ...filters, type: newType, genre: newType === 'all' ? filters.genre : undefined });
          }}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="search-filters__field">
        <label htmlFor="filter-genre" className="search-filters__label">
          Género
        </label>
        <select
          id="filter-genre"
          className="search-filters__select"
          value={genre || ''}
          onChange={(e) => onChange({ ...filters, genre: e.target.value || undefined })}
        >
          <option value="">Todos</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="search-filters__field">
        <label htmlFor="filter-year" className="search-filters__label">
          Año
        </label>
        <select
          id="filter-year"
          className="search-filters__select"
          value={year || ''}
          onChange={(e) => onChange({ ...filters, year: e.target.value || undefined })}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y || 'Todos'}
            </option>
          ))}
        </select>
      </div>

      <div className="search-filters__field">
        <label htmlFor="filter-sort" className="search-filters__label">
          Ordenar
        </label>
        <select
          id="filter-sort"
          className="search-filters__select"
          value={sortBy || 'popularity.desc'}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value || undefined })}
          disabled={sortDisabled}
          title={sortDisabled ? 'Orden no disponible en búsqueda por texto' : ''}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
