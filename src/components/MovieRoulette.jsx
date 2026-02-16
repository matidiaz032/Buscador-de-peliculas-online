import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenres } from '../hooks/useGenres';
import { useToast } from '../context/ToastContext';
import { getRandomMovie, searchCompanies, searchPeople } from '../services/movieApi';
import { buildSearchParamsFromState } from '../utils/searchParams';

const TYPES = [
  { value: 'movie', label: 'Películas' },
  { value: 'tv', label: 'Series' },
];

const currentYear = new Date().getFullYear();
const years = ['', ...Array.from({ length: 50 }, (_, i) => String(currentYear - i))];

export const MovieRoulette = () => {
  const navigate = useNavigate();
  const { success } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [filters, setFilters] = useState({
    type: 'movie',
    genre: '',
    year: '',
  });
  const [companyQuery, setCompanyQuery] = useState('');
  const [companyResults, setCompanyResults] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [personQuery, setPersonQuery] = useState('');
  const [personResults, setPersonResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { genres } = useGenres(filters.type);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [isOpen]);

  const handleCompanySearch = async (e) => {
    const q = e.target.value;
    setCompanyQuery(q);
    if (q.length < 2) {
      setCompanyResults([]);
      return;
    }
    const results = await searchCompanies(q);
    setCompanyResults(results);
  };

  const handlePersonSearch = async (e) => {
    const q = e.target.value;
    setPersonQuery(q);
    if (q.length < 2) {
      setPersonResults([]);
      return;
    }
    const results = await searchPeople(q);
    setPersonResults(results);
  };

  const handleSpin = async () => {
    setSpinning(true);
    try {
      const filterParams = {
        type: filters.type,
        genre: filters.genre || undefined,
        year: filters.year || undefined,
        companyId: selectedCompany?.id || undefined,
        personId: selectedPerson?.id || undefined,
      };
      const movie = await getRandomMovie(filterParams);
      navigate(`/detail/${movie.id}?ref=roulette`);
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      alert(error.message || 'Error al obtener película aleatoria');
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="movie-roulette">
      <button
        type="button"
        className="roulette-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={spinning}
      >
        🎲 Ruleta
      </button>

      {isOpen && (
        <div
          className="roulette-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Ruleta de películas"
        >
          <p className="roulette-desc">
            Configura los filtros y deja que la suerte elija por ti
          </p>

          <div className="roulette-filters">
            <div className="roulette-field">
              <label>Tipo</label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value, genre: '' })
                }
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="roulette-field">
              <label>Género</label>
              <select
                value={filters.genre}
                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              >
                <option value="">Cualquiera</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="roulette-field">
              <label>Año</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y || 'Cualquiera'}
                  </option>
                ))}
              </select>
            </div>

            <div className="roulette-field roulette-field--wide">
              <label>Productora</label>
              <input
                type="text"
                placeholder="Ej: Disney, Warner..."
                value={selectedCompany ? selectedCompany.name : companyQuery}
                onChange={handleCompanySearch}
                onFocus={() => selectedCompany && setSelectedCompany(null)}
              />
              {companyResults.length > 0 && !selectedCompany && (
                <ul className="roulette-results">
                  {companyResults.map((c) => (
                    <li
                      key={c.id}
                      onClick={() => {
                        setSelectedCompany(c);
                        setCompanyResults([]);
                        setCompanyQuery('');
                      }}
                    >
                      {c.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="roulette-field roulette-field--wide">
              <label>Actor / Director</label>
              <input
                type="text"
                placeholder="Ej: Christopher Nolan..."
                value={selectedPerson ? selectedPerson.name : personQuery}
                onChange={handlePersonSearch}
                onFocus={() => selectedPerson && setSelectedPerson(null)}
              />
              {personResults.length > 0 && !selectedPerson && (
                <ul className="roulette-results">
                  {personResults.map((p) => (
                    <li
                      key={p.id}
                      onClick={() => {
                        setSelectedPerson(p);
                        setPersonResults([]);
                        setPersonQuery('');
                      }}
                    >
                      {p.name}
                      {p.known_for_department && ` (${p.known_for_department})`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="roulette-actions">
            <button
              type="button"
              className="roulette-spin-btn"
              onClick={handleSpin}
              disabled={spinning}
            >
              {spinning ? 'Girando...' : '¡Girar!'}
            </button>
            <button
              type="button"
              className="roulette-share-filters-btn"
              onClick={async () => {
                try {
                  const sp = buildSearchParamsFromState({
                    query: '',
                    filters: {
                      type: filters.type,
                      genre: filters.genre || undefined,
                      year: filters.year || undefined,
                    },
                    page: 1,
                  });
                  const url = new URL(window.location.href);
                  url.pathname = '/';
                  url.search = sp.toString();
                  await navigator.clipboard.writeText(url.toString());
                  success('Link de filtros copiado');
                } catch {
                  success('No se pudo copiar');
                }
              }}
            >
              Compartir filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
