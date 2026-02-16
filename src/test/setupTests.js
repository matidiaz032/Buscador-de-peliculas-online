import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';

vi.mock('../config/constants', () => ({
  API_TMDB_BASE: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p/w500',
  TMDB_LOGO_BASE: 'https://image.tmdb.org/t/p/w92',
  getApiKey: () => 'test-api-key',
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
