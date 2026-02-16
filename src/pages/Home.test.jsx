import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { UserListsProvider } from '../context/UserListsContext';
import { ToastProvider } from '../context/ToastContext';
import { Home } from './Home';

const mockSearch = vi.fn();
const mockReset = vi.fn();
let mockMoviesState = {
  movies: [],
  loading: false,
  error: null,
  hasSearched: false,
  currentPage: 1,
  totalPages: 1,
};

vi.mock('../hooks/useMovies', () => ({
  useMovies: () => ({
    ...mockMoviesState,
    search: mockSearch,
    reset: mockReset,
    lastQuery: '',
    lastFilters: {},
  }),
}));

const mockHistory = ['Marvel', 'Batman'];
vi.mock('../hooks/useSearchHistory', () => ({
  useSearchHistory: () => ({
    history: mockHistory,
    add: vi.fn(),
    clear: vi.fn(),
    remove: vi.fn(),
  }),
}));

vi.mock('../hooks/useGenres', () => ({
  useGenres: () => ({
    genres: [
      { id: 28, name: 'Action' },
      { id: 18, name: 'Drama' },
    ],
  }),
}));

vi.mock('../hooks/useDebounce', () => ({
  useDebounce: (value) => value,
}));

vi.mock('../context/ToastContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useToast: () => ({ success: vi.fn(), error: vi.fn() }),
  };
});

vi.mock('../components/PageHead', () => ({ PageHead: () => null }));

const AllProviders = ({ children }) => (
  <HelmetProvider>
    <UserListsProvider>
      <ToastProvider>{children}</ToastProvider>
    </UserListsProvider>
  </HelmetProvider>
);

const renderHome = (initialEntries = ['/']) => {
  return render(
    <AllProviders>
      <MemoryRouter initialEntries={initialEntries}>
        <Home />
      </MemoryRouter>
    </AllProviders>
  );
};

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMoviesState = {
      movies: [],
      loading: false,
      error: null,
      hasSearched: false,
      currentPage: 1,
      totalPages: 1,
    };
  });

  it('cambiar Ordenar dispara fetch automáticamente', async () => {
    renderHome(['/?genre=28&type=movie']);
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('', 1, expect.objectContaining({ genre: '28', type: 'movie' }));
    });

    mockSearch.mockClear();
    const sortSelect = screen.getByLabelText(/ordenar/i);
    await userEvent.selectOptions(sortSelect, 'vote_average.desc');

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith(
        '',
        1,
        expect.objectContaining({ genre: '28', sortBy: 'vote_average.desc' })
      );
    });
  });

  it('cambiar Género/Año/Tipo resetea page a 1', async () => {
    renderHome(['/?genre=28&page=3']);
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('', 3, expect.any(Object));
    });

    mockSearch.mockClear();
    const genreSelect = screen.getByLabelText(/género/i);
    await userEvent.selectOptions(genreSelect, '18');

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('', 1, expect.objectContaining({ genre: '18' }));
    });
  });

  it('next page incrementa y fetch con page correcta', async () => {
    mockMoviesState = {
      movies: [{ id: 'movie-1', Title: 'Test', Poster: null }],
      loading: false,
      error: null,
      hasSearched: true,
      currentPage: 1,
      totalPages: 3,
    };

    renderHome(['/?genre=28&page=1']);
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('', 1, expect.any(Object));
    });

    mockSearch.mockClear();
    const nextBtn = screen.getByLabelText(/página siguiente/i);
    await userEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('', 2, expect.any(Object));
    });
  });

  it('click en búsqueda reciente dispara fetch con ese query', async () => {
    renderHome(['/']);
    await waitFor(() => expect(mockReset).toHaveBeenCalled());

    mockSearch.mockClear();
    mockReset.mockClear();

    const historyBtn = screen.getByText('Marvel');
    await userEvent.click(historyBtn);

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('Marvel', 1, expect.any(Object));
    });
  });

  it('cambiar filtro resetea page', async () => {
    mockMoviesState = {
      movies: [{ id: 'movie-1', Title: 'Test' }],
      loading: false,
      error: null,
      hasSearched: true,
      currentPage: 2,
      totalPages: 3,
    };

    renderHome(['/?genre=28&page=2']);
    mockSearch.mockClear();

    const yearSelect = screen.getByLabelText(/año/i);
    await userEvent.selectOptions(yearSelect, '2023');

    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith('', 1, expect.objectContaining({ year: '2023' }));
    });
  });
});
