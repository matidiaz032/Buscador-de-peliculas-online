# Buscador de Películas Online

Aplicación React moderna para buscar películas y series usando la API de [TMDB](https://www.themoviedb.org/).

**[Demo en vivo](https://buscador-de-peliculas-online.vercel.app/)**

## Features

- Búsqueda avanzada con URL stateful (query, filtros, paginación en la URL)
- Providers (Dónde verla)
- Cast & Crew
- Recomendador heurístico ("Para vos")
- Top 9 exportable a PNG
- Dashboard con estadísticas
- Persistencia local (favoritos, vistas, watchlist)
- Tests (Vitest + RTL + MSW)
- E2E (Playwright)

## Stack

- React + Vite
- TMDB API
- Vitest + RTL
- MSW
- Playwright

## Setup

```bash
nvm use 20
npm install
cp .env.example .env
# Editar .env y añadir VITE_TMDB_API_KEY
npm run dev
```

La app estará en http://localhost:3000

## Tests

```bash
npm run test:run
npx playwright test
```

## Arquitectura

| Carpeta | Descripción |
|---------|-------------|
| `src/services/` | Capa de API (movieApi, TMDB) |
| `src/hooks/` | Custom hooks (useMovies, useDebounce, useGenres, etc.) |
| `src/pages/` | Páginas/vistas (Home, Detail, Dashboard, etc.) |
| `src/components/` | Componentes UI reutilizables |
| `src/utils/` | Helpers (searchParams, preloadPosters) |
| `src/context/` | Context providers (Toast, UserLists) |
| `src/config/` | Constantes y configuración |

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run test` | Tests en modo watch |
| `npm run test:run` | Tests una sola vez |
| `npm run ci:test` | Tests para CI |
| `npm run lint` | Ejecutar ESLint |
| `npm run lint:fix` | Corregir errores de ESLint |
| `npm run format` | Formatear código con Prettier |

## Docker

```bash
docker compose up --build
# O: docker build --build-arg VITE_TMDB_API_KEY=tu_key -t search-movies .
#    docker run -p 8080:80 search-movies
```

## Buenas prácticas

- SOLID: Servicios con responsabilidad única
- Custom Hooks: Lógica extraída y reutilizable
- Variables de entorno: API key no hardcodeada
- Tests: Unitarios (Vitest), integración (RTL + MSW), E2E (Playwright)
