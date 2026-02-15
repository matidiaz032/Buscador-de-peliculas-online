import React from 'react';
import { useCredits } from '../hooks/useCredits';
import { TMDB_IMAGE_BASE } from '../config/constants';

const PLACEHOLDER_PROFILE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 185 278" fill="%2321262d"%3E%3Crect width="185" height="278"/%3E%3Ccircle cx="92" cy="90" r="35" fill="%238b949e"/%3E%3Cpath d="M40 200 Q92 160 144 200 L144 278 L40 278 Z" fill="%238b949e"/%3E%3C/svg%3E';

const profileUrl = (path) =>
  path ? `${TMDB_IMAGE_BASE.replace('/w500', '/w185')}${path}` : null;

export const CreditsSection = ({ movieId }) => {
  const { credits, loading, error } = useCredits(movieId);

  if (loading) {
    return (
      <section className="detail-section credits-section">
        <h3 className="detail-section-title">Reparto y equipo</h3>
        <div className="credits-skeleton">
          <div className="credits-skeleton__scroll" />
        </div>
      </section>
    );
  }

  if (error || !credits) return null;

  const hasContent =
    credits.directors?.length ||
    credits.writers?.length ||
    credits.cast?.length;

  if (!hasContent) return null;

  const directorsStr = credits.directors?.map((d) => d.name).join(', ');
  const writersStr = credits.writers?.map((w) => w.name).join(', ');

  return (
    <section className="detail-section credits-section">
      <h3 className="detail-section-title">Reparto y equipo</h3>

      {(directorsStr || writersStr) && (
        <div className="credits-crew">
          {directorsStr && (
            <p className="credits-crew-item">
              <strong>Director(es):</strong> {directorsStr}
            </p>
          )}
          {writersStr && (
            <p className="credits-crew-item">
              <strong>Guion:</strong> {writersStr}
            </p>
          )}
        </div>
      )}

      {credits.cast?.length > 0 && (
        <div className="credits-cast-scroll">
          {credits.cast.map((person) => (
            <div key={person.id} className="credits-cast-card">
              <figure className="image credits-cast-photo">
                <img
                  src={profileUrl(person.profile_path) || PLACEHOLDER_PROFILE}
                  alt={person.name}
                  loading="lazy"
                  width={185}
                  height={278}
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_PROFILE;
                  }}
                />
              </figure>
              <p className="credits-cast-name">{person.name}</p>
              <p className="credits-cast-character">{person.character}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
