import React, { useState, useMemo } from 'react';

export const SearchHistory = ({ history, onSelect, onRemove, onClear }) => {
  const [filter, setFilter] = useState('');

  const filteredHistory = useMemo(() => {
    if (!filter.trim()) return history;
    const q = filter.toLowerCase();
    return history.filter((item) => item.toLowerCase().includes(q));
  }, [history, filter]);

  if (history.length === 0) return null;

  return (
    <div className="search-history">
      <div className="search-history__header">
        <span className="search-history__title">Búsquedas recientes</span>
        <button
          type="button"
          className="search-history__clear"
          onClick={onClear}
          aria-label="Borrar historial"
        >
          Borrar
        </button>
      </div>
      {history.length > 4 && (
        <input
          type="text"
          placeholder="Filtrar historial..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-history__filter"
        />
      )}
      <ul className="search-history__list">
        {filteredHistory.map((item) => (
          <li key={item} className="search-history__item">
            <button
              type="button"
              className="search-history__btn"
              onClick={() => onSelect(item)}
            >
              {item}
            </button>
            <button
              type="button"
              className="search-history__remove"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
              aria-label={`Quitar ${item}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
