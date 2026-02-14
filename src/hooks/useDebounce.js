import { useState, useEffect } from 'react';

/**
 * Hook que retorna un valor debounced.
 * @param {*} value - Valor a debouncear
 * @param {number} delay - Milisegundos de espera
 * @returns Valor actualizado tras el delay
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
