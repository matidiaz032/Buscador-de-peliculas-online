import React, { useState, useRef } from 'react';
import { useUserListsContext } from '../../context/UserListsContext';
import { useToast } from '../../context/ToastContext';

const isValidImportStructure = (parsed) =>
  parsed &&
  typeof parsed === 'object' &&
  (Array.isArray(parsed.favorites) ||
    Array.isArray(parsed.watchlist) ||
    Array.isArray(parsed.watched) ||
    (parsed.ratings && typeof parsed.ratings === 'object'));

export const DataControls = () => {
  const { exportData, importData, resetData } = useUserListsContext();
  const { success, error } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      const blob = new Blob([exportData()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `movie-lists-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('Datos exportados');
    } catch (err) {
      error('Error al exportar');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result;
        const parsed = JSON.parse(text);
        if (!isValidImportStructure(parsed)) {
          setImportError('Estructura inválida. Debe tener favorites, watchlist, watched o ratings.');
          return;
        }
        const ok = importData(text);
        if (ok) {
          success('Datos importados correctamente');
        } else {
          setImportError('No se pudo importar. Revisa el formato.');
        }
      } catch {
        setImportError('Archivo JSON inválido');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
    success('Datos restablecidos');
  };

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section__title">Tus datos</h3>
      <p className="dashboard-section__subtitle">
        Exporta, importa o restablece tus listas y valoraciones
      </p>
      <div className="data-controls">
        <button type="button" className="user-list-btn" onClick={handleExport}>
          Exportar
        </button>
        <div className="data-controls-import">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="data-controls-file-input"
            aria-label="Importar archivo JSON"
          />
          <button
            type="button"
            className="user-list-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Importar
          </button>
        </div>
        {showResetConfirm ? (
          <div className="data-controls-reset-confirm">
            <span>¿Borrar todo?</span>
            <button
              type="button"
              className="user-list-btn data-controls-reset-btn"
              onClick={handleReset}
            >
              Sí, borrar
            </button>
            <button
              type="button"
              className="user-list-btn user-list-btn--secondary"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="user-list-btn user-list-btn--danger"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset
          </button>
        )}
      </div>
      {importError && (
        <p className="dashboard-section__error">{importError}</p>
      )}
    </div>
  );
};
