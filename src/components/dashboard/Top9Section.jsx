import React, { useState } from 'react';
import { Top9Modal } from './Top9Modal';

const SOURCES = [
  { key: 'favorites', label: 'Favoritos' },
  { key: 'watched', label: 'Vistas' },
];

export const Top9Section = ({ favorites, watched }) => {
  const [showModal, setShowModal] = useState(false);
  const [source, setSource] = useState('favorites');

  const getItems = () => {
    const list = source === 'favorites' ? favorites : watched;
    return (list || []).slice(0, 9);
  };

  const items = getItems();
  const sourceLabel = SOURCES.find((s) => s.key === source)?.label ?? source;

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section__title">Top 9</h3>
      <p className="dashboard-section__subtitle">
        Genera una imagen con tus 9 favoritas o vistas
      </p>
      <div className="top9-controls">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="user-list-select"
          style={{ maxWidth: 160 }}
        >
          {SOURCES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="user-list-btn"
          onClick={() => setShowModal(true)}
          disabled={items.length === 0}
        >
          Generar Top 9
        </button>
      </div>
      {items.length === 0 && (
        <p className="dashboard-section__empty">
          Añade al menos una película a {sourceLabel} para generar tu Top 9.
        </p>
      )}
      <Top9Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        items={items}
        sourceLabel={sourceLabel}
      />
    </div>
  );
};
