import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { preloadPosters, revokePosterUrls } from '../../utils/preloadPosters';

const PLACEHOLDER_POSTER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" fill="%2321262d"%3E%3Crect width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%238b949e" font-size="14"%3ENo image%3C/text%3E%3C/svg%3E';

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const drawTop9ToCanvas = async (items, preloadedUrls) => {
  const W = 900;
  const H = 1100;
  const PAD = 24;
  const TITLE_H = 80;
  const GRID_GAP = 12;
  const CELL_W = (W - PAD * 2 - GRID_GAP * 2) / 3;
  const CELL_H = (H - TITLE_H - PAD * 2 - GRID_GAP * 2) / 3;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Mi Top 9', W / 2, TITLE_H - 20);

  const images = await Promise.all(
    items.map((m, i) => {
      const src =
        (preloadedUrls && preloadedUrls[i]) ||
        (m.Poster && m.Poster !== 'N/A' ? m.Poster : null) ||
        PLACEHOLDER_POSTER;
      return loadImage(src).catch(() => null);
    })
  );

  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = PAD + col * (CELL_W + GRID_GAP);
    const y = TITLE_H + PAD + row * (CELL_H + GRID_GAP);

    if (images[i]) {
      ctx.drawImage(images[i], x, y, CELL_W, CELL_H);
    } else {
      ctx.fillStyle = '#21262d';
      ctx.fillRect(x, y, CELL_W, CELL_H);
    }
  }

  return canvas;
};

export const Top9Modal = ({ isOpen, onClose, items, sourceLabel }) => {
  const [exporting, setExporting] = useState(false);
  const [preloadedUrls, setPreloadedUrls] = useState([]);
  const modalRef = useRef(null);
  const { success, error } = useToast();

  const preloadedBlobsRef = useRef([]);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  useEffect(() => {
    if (!isOpen || !items?.length) {
      revokePosterUrls(preloadedBlobsRef.current);
      preloadedBlobsRef.current = [];
      setPreloadedUrls([]);
      return;
    }
    const urls = items.map((m) =>
      m.Poster && m.Poster !== 'N/A' ? m.Poster : null
    );
    preloadPosters(urls).then((loaded) => {
      const blobs = (loaded || []).filter((u) => u && u.startsWith('blob:'));
      if (!isOpenRef.current) {
        revokePosterUrls(blobs);
        return;
      }
      preloadedBlobsRef.current = blobs;
      setPreloadedUrls(loaded);
    });
    return () => {
      revokePosterUrls(preloadedBlobsRef.current);
      preloadedBlobsRef.current = [];
    };
  }, [isOpen, items]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      const el = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      el?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  const handleDownload = async () => {
    setExporting(true);
    try {
      const canvas = await drawTop9ToCanvas(items, preloadedUrls);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mi-top-9-${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
        URL.revokeObjectURL(url);
        success('Imagen descargada');
      }, 'image/png');
    } catch (err) {
      error('Error al generar imagen');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="top9-modal-title">
      <div
        ref={modalRef}
        className="modal-content top9-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key !== 'Tab') return;
          const focusables = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusables?.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="modal-header">
          <h3 id="top9-modal-title">Mi Top 9 — {sourceLabel}</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="top9-grid">
          {items.map((m, i) => (
            <div key={m.id} className="top9-cell">
              <img
                src={
                  preloadedUrls[i] ||
                  (m.Poster && m.Poster !== 'N/A' ? m.Poster : null) ||
                  PLACEHOLDER_POSTER
                }
                alt={m.Title}
                loading="lazy"
                width={200}
                height={300}
              />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="user-list-btn"
            onClick={handleDownload}
            disabled={exporting}
          >
            {exporting ? 'Generando...' : 'Descargar PNG'}
          </button>
          <button type="button" className="user-list-btn user-list-btn--secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
