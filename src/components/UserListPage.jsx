import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Title } from './Title';
import { PageHead } from './PageHead';
import { MoviesList } from './MoviesList';
import { useUserListsContext } from '../context/UserListsContext';

const SORT_OPTIONS = [
  { value: 'addedDesc', label: 'Más recientes' },
  { value: 'addedAsc', label: 'Más antiguos' },
  { value: 'yearDesc', label: 'Año (nuevo)' },
  { value: 'yearAsc', label: 'Año (viejo)' },
  { value: 'titleAsc', label: 'Título (A-Z)' },
  { value: 'titleDesc', label: 'Título (Z-A)' },
  { value: 'ratingDesc', label: 'Mi valoración (alta)' },
  { value: 'ratingAsc', label: 'Mi valoración (baja)' },
];

const sortList = (list, sortBy, getRating) => {
  const arr = [...list];
  switch (sortBy) {
    case 'addedDesc':
      return arr.sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
    case 'addedAsc':
      return arr.sort((a, b) => (a.addedAt ?? 0) - (b.addedAt ?? 0));
    case 'yearDesc':
      return arr.sort((a, b) => (b.Year || '') - (a.Year || ''));
    case 'yearAsc':
      return arr.sort((a, b) => (a.Year || '') - (b.Year || ''));
    case 'titleAsc':
      return arr.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    case 'titleDesc':
      return arr.sort((a, b) => (b.Title || '').localeCompare(a.Title || ''));
    case 'ratingDesc':
      return arr.sort((a, b) => (getRating(b.id) ?? 0) - (getRating(a.id) ?? 0));
    case 'ratingAsc':
      return arr.sort((a, b) => (getRating(a.id) ?? 0) - (getRating(b.id) ?? 0));
    default:
      return arr;
  }
};

const formatDate = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const UserListPage = ({
  title,
  pageTitle,
  description,
  listKey,
  emptyMessage,
  showUserRating = false,
  showExportImport = true,
}) => {
  const { [listKey]: list, getRating, exportData, importData } = useUserListsContext();
  const [sortBy, setSortBy] = useState('addedDesc');
  const [filterType, setFilterType] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const filteredAndSorted = useMemo(() => {
    let result = list;

    if (filterType) {
      result = result.filter((m) => {
        const type = m.mediaType ?? (String(m.id).startsWith('tv-') ? 'tv' : 'movie');
        return type === filterType;
      });
    }
    if (filterYear) {
      result = result.filter((m) => (m.Year || '').toString() === filterYear);
    }
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      result = result.filter((m) => (m.Title || '').toLowerCase().includes(q));
    }

    return sortList(result, sortBy, getRating);
  }, [list, sortBy, filterType, filterYear, filterQuery, getRating]);

  const years = useMemo(() => {
    const set = new Set();
    list.forEach((m) => m.Year && set.add(String(m.Year)));
    return ['', ...Array.from(set).sort((a, b) => b - a)];
  }, [list]);

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movie-lists-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    const ok = importData(importText);
    if (ok) {
      setShowImport(false);
      setImportText('');
    } else {
      setImportError('JSON inválido o formato incorrecto');
    }
  };

  return (
    <div className="container app-content">
      <PageHead title={pageTitle} description={description} />
      <Link to="/" className="btn-back" style={{ marginBottom: '1rem' }}>
        ← Volver
      </Link>
      <Title>{title}</Title>

      <div className="user-list-toolbar">
        <div className="user-list-filters">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="user-list-select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="user-list-select"
          >
            <option value="">Todo</option>
            <option value="movie">Películas</option>
            <option value="tv">Series</option>
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="user-list-select"
          >
            <option value="">Año</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y || 'Todos'}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buscar en la lista..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="user-list-search"
          />
        </div>
        {showExportImport && (
          <div className="user-list-actions">
            <button type="button" className="user-list-btn" onClick={handleExport}>
              Exportar
            </button>
            <button
              type="button"
              className="user-list-btn"
              onClick={() => setShowImport(!showImport)}
            >
              Importar
            </button>
          </div>
        )}
      </div>

      {showImport && (
        <div className="user-list-import">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Pega aquí el JSON exportado..."
            rows={4}
          />
          {importError && <p className="has-text-danger">{importError}</p>}
          <button type="button" className="user-list-btn" onClick={handleImport}>
            Importar
          </button>
          <button
            type="button"
            className="user-list-btn user-list-btn--secondary"
            onClick={() => {
              setShowImport(false);
              setImportText('');
              setImportError('');
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <p className="state-message">{emptyMessage}</p>
      ) : filteredAndSorted.length === 0 ? (
        <p className="state-message">Ningún resultado con esos filtros</p>
      ) : (
        <MoviesList
          movies={filteredAndSorted}
          showUserRating={showUserRating}
          showAddedAt={true}
          formatAddedAt={formatDate}
        />
      )}
    </div>
  );
};
