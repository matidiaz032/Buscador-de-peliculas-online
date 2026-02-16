import { http, HttpResponse } from 'msw';

const API_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org';

const mockMovie = (id, title = `Movie ${id}`) => ({
  id,
  title,
  release_date: '2024-01-15',
  poster_path: '/poster.jpg',
  genre_ids: [28, 12],
  vote_average: 7.5,
  vote_count: 1000,
  popularity: 50,
  media_type: 'movie',
});

const mockTv = (id, name = `Show ${id}`) => ({
  id,
  name,
  first_air_date: '2024-01-15',
  poster_path: '/poster.jpg',
  genre_ids: [18],
  vote_average: 8,
  vote_count: 500,
  popularity: 40,
  media_type: 'tv',
});

export const handlers = [
  http.get(`${API_BASE}/search/movie`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const results = Array.from({ length: 5 }, (_, i) =>
      mockMovie((page - 1) * 20 + i + 1, `${query} Movie ${i + 1}`)
    );
    return HttpResponse.json({
      results,
      total_results: 100,
      total_pages: 5,
      page,
    });
  }),

  http.get(`${API_BASE}/search/tv`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const results = Array.from({ length: 5 }, (_, i) =>
      mockTv((page - 1) * 20 + i + 1, `${query} Show ${i + 1}`)
    );
    return HttpResponse.json({
      results,
      total_results: 80,
      total_pages: 4,
      page,
    });
  }),

  http.get(`${API_BASE}/search/multi`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const results = [
      ...Array.from({ length: 3 }, (_, i) =>
        mockMovie((page - 1) * 20 + i + 1, `${query} Movie ${i + 1}`)
      ),
      ...Array.from({ length: 3 }, (_, i) =>
        mockTv((page - 1) * 20 + i + 100, `${query} Show ${i + 1}`)
      ),
    ];
    return HttpResponse.json({
      results,
      total_results: 120,
      total_pages: 6,
      page,
    });
  }),

  http.get(`${API_BASE}/discover/movie`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const genre = url.searchParams.get('with_genres') || '';
    const results = Array.from({ length: 10 }, (_, i) =>
      mockMovie((page - 1) * 20 + i + 1, `Discover Movie ${genre} ${i + 1}`)
    );
    return HttpResponse.json({
      results,
      total_results: 200,
      total_pages: 10,
      page,
    });
  }),

  http.get(`${API_BASE}/discover/tv`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const genre = url.searchParams.get('with_genres') || '';
    const results = Array.from({ length: 10 }, (_, i) =>
      mockTv((page - 1) * 20 + i + 1, `Discover Show ${genre} ${i + 1}`)
    );
    return HttpResponse.json({
      results,
      total_results: 150,
      total_pages: 8,
      page,
    });
  }),

  http.get(`${API_BASE}/genre/movie/list`, () =>
    HttpResponse.json({
      genres: [
        { id: 28, name: 'Action' },
        { id: 18, name: 'Drama' },
      ],
    })
  ),

  http.get(`${API_BASE}/genre/tv/list`, () =>
    HttpResponse.json({
      genres: [
        { id: 10759, name: 'Action & Adventure' },
        { id: 18, name: 'Drama' },
      ],
    })
  ),

  http.get(`${IMAGE_BASE}/t/p/w500/:path`, () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
    return new HttpResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }),
  http.get(`${IMAGE_BASE}/t/p/w92/:path`, () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
    return new HttpResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }),
];
