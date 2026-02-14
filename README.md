# Buscador de Películas

Aplicación React moderna para buscar películas y series usando la API de [TMDB](https://www.themoviedb.org/).

**[Demo en vivo](https://buscador-de-peliculas-online.vercel.app/)**

## Requisitos

- **Node.js** >= 18 (requerido por Vite 5)
- Cuenta en [TMDB](https://www.themoviedb.org/signup) y API key (gratuita)

Con **nvm** instalado: `nvm use` (usa la versión de `.nvmrc`)

## Configuración

1. Copia el archivo de ejemplo de variables de entorno:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y añade tu API key de TMDB:
   ```
   VITE_TMDB_API_KEY=tu_api_key_aqui
   ```
   Obtener en: https://www.themoviedb.org/settings/api

## Desarrollo

```bash
npm install
npm run dev
```

La app estará en http://localhost:3000

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Ejecutar ESLint |
| `npm run lint:fix` | Corregir errores de ESLint |
| `npm run format` | Formatear código con Prettier |

## Docker

### Build y ejecución

```bash
# Con docker-compose (usa VITE_TMDB_API_KEY del .env)
docker compose up --build

# O con Docker directamente
docker build --build-arg VITE_TMDB_API_KEY=tu_key -t search-movies .
docker run -p 8080:80 search-movies
```

La app estará en http://localhost:8080

## Estructura del proyecto

```
src/
├── config/          # Constantes y configuración
├── services/        # Capa de API (TMDB)
├── hooks/           # Custom hooks para lógica reutilizable
├── components/      # Componentes UI
├── pages/           # Páginas/vistas
└── main.jsx         # Entry point
```

## Buenas prácticas aplicadas

- **SOLID**: Servicios con responsabilidad única, inyección de dependencias
- **Clean Code**: Nombres descriptivos, funciones pequeñas, separación de concerns
- **Custom Hooks**: Lógica de fetching extraída y reutilizable
- **Variables de entorno**: API key no hardcodeada
- **Docker**: Build multi-stage para producción ligera
