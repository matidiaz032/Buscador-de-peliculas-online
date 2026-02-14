import React, { forwardRef } from 'react';

export const SearchForm = forwardRef(({
  value,
  onChange,
  onSearch,
  disabled = false,
  placeholder = 'Buscar películas o series (Ctrl+K)',
}, ref) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field has-addons">
        <div className="control">
          <input
            ref={ref}
            className="input"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            aria-label="Buscar película"
          />
        </div>
        <div className="control">
          <button
            type="submit"
            className="button is-info is-light"
            disabled={disabled || !value.trim()}
          >
            Buscar
          </button>
        </div>
      </div>
    </form>
  );
});

SearchForm.displayName = 'SearchForm';
