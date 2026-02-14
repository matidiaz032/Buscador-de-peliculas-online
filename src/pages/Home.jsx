import React, { useState, useEffect, useRef } from 'react';
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

export const Home = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ type: 'movie' });
  const searchInputRef = useRef(null);
  const { history, add, clear, remove } = useSearchHistory();

  const {
    movies,
    loading,
    error,
    hasSearched,
    search,
    goToPage,
    reset,
    lastQuery,
    lastFilters,
    currentPage,
    totalPages,
  } = useMovies();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (searchQuery) => {
    const q = searchQuery.trim();
    setQuery(q);
    if (q || filters.genre) {
      search(q, 1, filters);
    } else {
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
    if (newFilters.genre) {
      search(query.trim(), 1, newFilters);
    } else if (!query.trim()) {
      reset();
    } else {
      search(query.trim(), 1, newFilters);
    }
  };

  const handleHistorySelect = (item) => {
    setQuery(item);
    search(item, 1, filters);
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
            onPageChange={goToPage}
            loading={loading}
          />
        </>
      );
    }

    return (
      <>
        <p className="state-message">
          Escribe y pulsa Buscar, o selecciona un género para explorar
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
        <SearchForm
          ref={searchInputRef}
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          disabled={loading}
        />
        <SearchFilters filters={filters} onChange={handleFiltersChange} />
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
