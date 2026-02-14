import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ButtonBackToHome } from '../components/ButtonBackToHome';
import { MovieListActions } from '../components/MovieListActions';
import { DetailSkeleton } from '../components/DetailSkeleton';
import { useMovieDetail } from '../hooks/useMovieDetail';
import { getVideos } from '../services/movieApi';
import { PageHead } from '../components/PageHead';
import { SimilarMovies } from '../components/SimilarMovies';

const DetailMeta = ({ label, value }) =>
  value ? (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  ) : null;

export const Detail = () => {
  const { movieId } = useParams();
  const { movie, loading, error, retry } = useMovieDetail(movieId);
  const [videos, setVideos] = useState([]);

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
  };

  return (
    <div className="container app-content detail-page">
      <PageHead
        title={Title}
        description={Plot ? Plot.slice(0, 160) : `Detalle de ${Title}`}
      />
      <ButtonBackToHome />
      <div className="detail-header">
        <h1 className="title is-4">{Title}</h1>
        <MovieListActions movie={movieForActions} />
      </div>

      {posterSrc && (
        <figure className="image detail-poster" style={{ maxWidth: 280 }}>
          <img src={posterSrc} alt={Title} />
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

      <SimilarMovies movieId={movieId} />
    </div>
  );
};
