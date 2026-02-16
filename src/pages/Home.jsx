import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Title } from '../components/Title';
import { SearchForm } from '../components/SearchForm';
import { MoviesList } from '../components/MoviesList';
import { Pagination } from '../components/Pagination';
import { MoviesListSkeleton } from '../components/MovieSkeleton';
import { SearchHistory } from '../components/SearchHistory';
import { SearchFilters } from '../components/SearchFilters';
import { MovieRoulette } from '../components/MovieRoulette';
import { TrendingSection } from '../components/TrendingSection';
import { PageHead } from '../components/PageHead';
import { useMovies } from '../hooks/useMovies';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import {
  parseSearchParamsToState,
  buildSearchParamsFromState,
  hasSearchableParams,
} from '../utils/searchParams';

const DEBOUNCE_MS = 350;

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);
  const prevSearchRef = useRef(null);
  const { history, add, clear, remove } = useSearchHistory();
  const { success } = useToast();

  const urlState = parseSearchParamsToState(searchParams);
  const [query, setQuery] = useState(urlState.query);
  const [filters, setFilters] = useState(urlState.filters);
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  const {
    movies,
    loading,
    error,
    hasSearched,
    search,
    reset,
    lastQuery,
    lastFilters,
    currentPage,
    totalPages,
  } = useMovies();

  const syncToUrl = useCallback(
    (newState, replace = false) => {
      const sp = buildSearchParamsFromState(newState);
      const newSearch = sp.toString();
      const currentSearch = searchParams.toString();
      if (newSearch === currentSearch) return;

      if (replace) {
        setSearchParams(sp, { replace: true });
      } else {
        setSearchParams(sp);
      }
    },
    [searchParams, setSearchParams]
  );

  const syncToUrlRef = useRef(syncToUrl);
  syncToUrlRef.current = syncToUrl;
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const fetchResults = useCallback(
    (q, page, fl) => {
      const hasQ = q?.trim();
      const hasGenre = fl?.genre;

      if (!hasQ && !hasGenre) {
        reset();
        return;
      }
      if (import.meta.env.DEV) {
        console.debug('[Home] fetchResults', { query: hasQ || '(genre)', page, filters: fl });
      }
      search(hasQ || '', page, fl);
    },
    [search, reset]
  );

  // Sync from URL (mount + back/forward) + fetch
  useEffect(() => {
    const currentSearch = searchParams.toString();
    if (prevSearchRef.current === currentSearch) return;
    prevSearchRef.current = currentSearch;

    const state = parseSearchParamsToState(searchParams);
    setQuery(state.query);
    setFilters(state.filters);

    if (hasSearchableParams(state)) {
      fetchResults(state.query, state.page, state.filters);
    } else {
      reset();
    }
  }, [searchParams, fetchResults, reset]);

  // Debounced query: sync to URL (page 1) solo cuando el usuario cambia query/filters.
  // No sobrescribir si la URL ya tiene lo mismo (preserva paginación) o si debouncedQuery
  // está desactualizado (ej: click en historial reciente).
  useEffect(() => {
    const current = parseSearchParamsToState(searchParamsRef.current);
    const queryMatch = current.query === debouncedQuery;
    const filtersMatch =
      JSON.stringify(current.filters) === JSON.stringify(filters);
    if (queryMatch && filtersMatch) return;

    if (current.query && !debouncedQuery.trim()) return;

    if (!debouncedQuery.trim() && !filters.genre) {
      syncToUrlRef.current({ query: '', filters: { type: 'movie' }, page: 1 });
      reset();
      return;
    }
    syncToUrlRef.current({ query: debouncedQuery, filters, page: 1 });
  }, [debouncedQuery, filters, reset]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const inInput = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName);
      if (!inInput && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (!inInput && e.key === 'Escape') {
        setQuery('');
        syncToUrl({ query: '', filters: { type: 'movie' }, page: 1 });
        reset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [syncToUrl, reset]);

  const handleSearch = (searchQuery) => {
    const q = searchQuery.trim();
    setQuery(q);
    if (q || filters.genre) {
      syncToUrl({ query: q, filters, page: 1 });
    } else {
      setFilters({ type: 'movie', genre: '', year: '', sortBy: 'popularity.desc' });
      syncToUrl({ query: '', filters: { type: 'movie' }, page: 1 });
      reset();
    }
  };

  useEffect(() => {
    if (movies.length > 0 && query.trim() && !loading) {
      add(query);
    }
  }, [movies.length, query, loading, add]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    syncToUrl({ query, filters: newFilters, page: 1 });
  };

  const handleHistorySelect = (item) => {
    setQuery(item);
    syncToUrl({ query: item, filters, page: 1 });
  };

  const handlePageChange = (page) => {
    syncToUrl({ query, filters, page }, true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      success('Link copiado');
    } catch {
      success('No se pudo copiar');
    }
  };

  const renderContent = () => {
    if (loading && movies.length === 0) {
      return <MoviesListSkeleton count={10} />;
    }

    if (error) {
      return (
        <div className="state-message">
          <p className="has-text-danger">{error}</p>
          <button
            type="button"
            className="retry-btn"
            onClick={() => search(lastQuery || query, 1, lastFilters || filters)}
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (hasSearched && movies.length === 0) {
      return <p className="state-message">Sin resultados</p>;
    }

    if (movies.length > 0) {
      return (
        <>
          <MoviesList movies={movies} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      );
    }

    return (
      <>
        <p className="state-message">
          Escribe para buscar o selecciona un género para explorar
        </p>
        <TrendingSection />
      </>
    );
  };

  return (
    <div className="container app-content">
      <PageHead
        title="Buscar"
        description="Busca películas y series en la base de datos de TMDB"
      />
      <Title>Buscador de Películas</Title>
      <div className="search-form-wrapper">
        <MovieRoulette />
        <div className="search-form-row">
          <SearchForm
            ref={searchInputRef}
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            disabled={loading}
          />
          <button
            type="button"
            className="button is-info is-light copy-link-btn"
            onClick={handleCopyLink}
            title="Copiar link"
            aria-label="Copiar link"
          >
            Copiar link
          </button>
        </div>
        <SearchFilters
          filters={filters}
          onChange={handleFiltersChange}
          sortDisabled={!!query.trim()}
        />
        {(!hasSearched || !query.trim()) && !filters.genre && (
          <SearchHistory
            history={history}
            onSelect={handleHistorySelect}
            onRemove={remove}
            onClear={clear}
          />
        )}
      </div>
      {renderContent()}
    </div>
  );
};
