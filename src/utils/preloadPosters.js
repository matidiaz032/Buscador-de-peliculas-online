/**
 * Precarga posters externos (TMDB) para evitar CORS/tainted canvas al exportar.
 * fetch -> blob -> ObjectURL permite dibujar en canvas sin taint.
 * @param {string[]} urls - URLs de imágenes a precargar
 * @returns {Promise<string[]>} - Array de ObjectURLs (o null si falla)
 */
export const preloadPosters = async (urls) => {
  const results = await Promise.all(
    urls.map(async (url) => {
      if (!url || url.startsWith('data:')) return url;
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) return null;
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      } catch {
        return null;
      }
    })
  );
  return results;
};

/**
 * Revoca ObjectURLs para liberar memoria.
 * @param {string[]} urls - URLs creadas con createObjectURL
 */
export const revokePosterUrls = (urls) => {
  urls.forEach((url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
};
