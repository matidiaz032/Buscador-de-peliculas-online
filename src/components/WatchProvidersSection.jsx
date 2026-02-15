import React from 'react';
import { useWatchProviders } from '../hooks/useWatchProviders';

const PLACEHOLDER_LOGO =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92 92" fill="%2321262d"%3E%3Crect width="92" height="92" rx="8"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%238b949e" font-size="10"%3E?%3C/text%3E%3C/svg%3E';

const ProviderGroup = ({ label, items }) => {
  if (!items?.length) return null;
  return (
    <div className="watch-providers-group">
      <span className="watch-providers-label">{label}</span>
      <div className="watch-providers-list">
        {items.map((p) => (
          <div key={p.id} className="watch-provider-item" title={p.name}>
            <img
              src={p.logo || PLACEHOLDER_LOGO}
              alt={p.name}
              loading="lazy"
              width={92}
              height={92}
              onError={(e) => {
                e.target.src = PLACEHOLDER_LOGO;
              }}
            />
            <span className="watch-provider-name">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WatchProvidersSection = ({ movieId }) => {
  const { providers, loading, error } = useWatchProviders(movieId);

  if (loading) {
    return (
      <section className="detail-section watch-providers-section">
        <h3 className="detail-section-title">Disponible en</h3>
        <div className="watch-providers-skeleton">
          <div className="watch-providers-skeleton__line" />
          <div className="watch-providers-skeleton__line" style={{ width: '70%' }} />
        </div>
      </section>
    );
  }

  if (error) return null;

  const hasProviders =
    providers?.flatrate?.length ||
    providers?.rent?.length ||
    providers?.buy?.length;

  if (!hasProviders) return null;

  return (
    <section className="detail-section watch-providers-section">
      <h3 className="detail-section-title">Disponible en</h3>
      <ProviderGroup label="Streaming" items={providers.flatrate} />
      <ProviderGroup label="Alquiler" items={providers.rent} />
      <ProviderGroup label="Compra" items={providers.buy} />
    </section>
  );
};
