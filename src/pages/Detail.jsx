import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ButtonBackToHome } from '../components/ButtonBackToHome';
import { useToast } from '../context/ToastContext';
import { MovieListActions } from '../components/MovieListActions';
import { DetailSkeleton } from '../components/DetailSkeleton';
import { useMovieDetail } from '../hooks/useMovieDetail';
import { getVideos } from '../services/movieApi';
import { PageHead } from '../components/PageHead';
import { SimilarMovies } from '../components/SimilarMovies';
import { PorqueTeGustoSection } from '../components/PorqueTeGustoSection';
import { WatchProvidersSection } from '../components/WatchProvidersSection';
import { CreditsSection } from '../components/CreditsSection';

const DetailMeta = ({ label, value }) =>
  value ? (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  ) : null;

export const Detail = () => {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const { movie, loading, error, retry } = useMovieDetail(movieId);
  const { success } = useToast();
  const [videos, setVideos] = useState([]);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const fromRoulette = searchParams.get('ref') === 'roulette';

  const toggleCinemaMode = useCallback(() => setIsCinemaMode((v) => !v), []);
  const exitCinemaMode = useCallback(() => setIsCinemaMode(false), []);

  useEffect(() => {
    if (!isCinemaMode) return;
    document.body.classList.add('cinema-mode');
    return () => document.body.classList.remove('cinema-mode');
  }, [isCinemaMode]);

  useEffect(() => {
    const handleKey = (e) => {
      const inInput = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName);
      if (!inInput && (e.key === 'c' || e.key === 'C')) toggleCinemaMode();
      if (e.key === 'Escape') exitCinemaMode();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleCinemaMode, exitCinemaMode]);

  useEffect(() => {
    if (movieId) {
      getVideos(movieId).then(setVideos).catch(() => setVideos([]));
    }
  }, [movieId]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !movie) {
    return (
      <div className="container app-content">
        <ButtonBackToHome />
        <div className="state-message">
          <p className="has-text-danger">{error || 'Película no encontrada'}</p>
          <button type="button" className="retry-btn" onClick={retry}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const {
    Title,
    Year,
    Poster,
    Plot,
    genres,
    genre_ids,
    runtime,
    vote_average,
    vote_count,
    mediaType,
    release_date,
    status,
    imdb_id,
    production_countries,
    tagline,
  } = movie;

  const posterSrc = Poster || null;
  const typeLabel = mediaType === 'tv' ? 'Serie' : 'Película';
  const runtimeStr = runtime ? `${runtime} min` : null;

  const movieForActions = {
    id: movieId,
    Title,
    Poster: posterSrc || 'N/A',
    Year,
    mediaType,
    genres,
    genre_ids,
    runtime,
    vote_average,
    vote_count,
  };

  const mainTrailer = videos[0];

  return (
    <>
      {isCinemaMode && (
        <div className="cinema-mode-overlay" role="dialog" aria-label="Modo Cine">
          <div className="cinema-mode-content">
            {posterSrc && (
              <img src={posterSrc} alt={Title} className="cinema-mode-poster" width={280} height={420} />
            )}
            <h1 className="cinema-mode-title">{Title}</h1>
            {tagline && <p className="cinema-mode-tagline">{tagline}</p>}
            {mainTrailer && (
              <a
                href={`https://www.youtube.com/watch?v=${mainTrailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button is-info cinema-mode-trailer-btn"
              >
                Ver trailer
              </a>
            )}
            <button
              type="button"
              className="cinema-mode-close"
              onClick={exitCinemaMode}
              aria-label="Salir del modo cine"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="container app-content detail-page">
      <PageHead
        title={Title}
        description={Plot ? Plot.slice(0, 160) : `Detalle de ${Title}`}
      />
      <ButtonBackToHome />
      <div className="detail-header">
        <h1 className="title is-4">{Title}</h1>
        <div className="detail-header-actions">
          <MovieListActions movie={movieForActions} />
          <button
            type="button"
            className="button is-info is-light detail-share-btn"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                success('Link copiado');
              } catch {
                success('No se pudo copiar');
              }
            }}
            title="Compartir resultado"
            aria-label="Compartir resultado"
          >
            {fromRoulette ? 'Compartir resultado' : 'Compartir'}
          </button>
          <button
            type="button"
            className="button is-info is-light detail-cinema-btn"
            onClick={toggleCinemaMode}
            title="Modo Cine (C)"
            aria-label="Modo Cine"
          >
            Modo Cine
          </button>
        </div>
      </div>

      {posterSrc && (
        <figure className="image detail-poster" style={{ maxWidth: 280 }}>
          <img src={posterSrc} alt={Title} loading="lazy" width={280} height={420} />
        </figure>
      )}

      <div className="detail-meta">
        <DetailMeta label="Año" value={Year || release_date} />
        <DetailMeta label="Género" value={genres} />
        <DetailMeta label="Duración" value={runtimeStr} />
        <DetailMeta label="Tipo" value={typeLabel} />
        <DetailMeta label="Rating" value={vote_average ? `${vote_average}/10` : null} />
        <DetailMeta label="Votos" value={vote_count} />
        <DetailMeta label="Estado" value={status} />
        <DetailMeta label="IMDb ID" value={imdb_id} />
        <DetailMeta label="País" value={production_countries} />
        {tagline && <DetailMeta label="Tagline" value={tagline} />}
      </div>

      {Plot && <p className="detail-plot">{Plot}</p>}

      {videos.length > 0 && (
        <div className="detail-trailers">
          <h3 className="detail-section-title">Trailers</h3>
          <div className="detail-trailers-grid">
            {videos.slice(0, 3).map((v) => (
              <div key={v.key} className="detail-trailer-item">
                <iframe
                  title={v.name}
                  src={`https://www.youtube.com/embed/${v.key}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <p className="detail-trailer-name">{v.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <WatchProvidersSection movieId={movieId} />
      <CreditsSection movieId={movieId} />
      <PorqueTeGustoSection
        movieId={movieId}
        title={Title}
        genreIds={genre_ids || []}
      />
      <SimilarMovies movieId={movieId} />
    </div>
    </>
  );
};
