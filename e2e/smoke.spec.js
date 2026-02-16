import { test, expect } from '@playwright/test';

const STORAGE_KEY = 'movie-user-lists-v1';

const mockFavorites = Array.from({ length: 9 }, (_, i) => ({
  id: `movie-${i + 1}`,
  Title: `Test Movie ${i + 1}`,
  Year: '2024',
  Poster: 'https://image.tmdb.org/t/p/w500/test.jpg',
  addedAt: Date.now(),
}));

test.describe('Smoke tests', () => {
  test('Home carga y muestra búsqueda', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /buscador de películas/i })).toBeVisible();
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();
  });

  test('Búsqueda por género dispara fetch y muestra contenido', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/género/i).selectOption('28');
    await page.waitForTimeout(800);
    const hasContent = await page.locator('.movies-grid, .state-message').count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('Top9: Generar -> Descargar dispara download', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    }, {
      key: STORAGE_KEY,
      data: {
        favorites: mockFavorites,
        watchlist: [],
        watched: [],
        ratings: {},
      },
    });
    await page.goto('/perfil');
    await page.getByRole('button', { name: /generar top 9/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    await page.getByRole('button', { name: /descargar png/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/mi-top-9.*\.png/);
  });
});
