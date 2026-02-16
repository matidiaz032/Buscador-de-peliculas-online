import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { preloadPosters, revokePosterUrls } from './preloadPosters';

describe('preloadPosters', () => {
  let createObjectURLSpy;
  let fetchSpy;

  beforeEach(() => {
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => `blob:mock-${blob.size}`);
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns data URLs as-is without fetching', async () => {
    const dataUrl = 'data:image/png;base64,abc123';
    const result = await preloadPosters([dataUrl]);
    expect(result).toEqual([dataUrl]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetches http URLs and returns blob URLs', async () => {
    const blob = new Blob(['x'], { type: 'image/png' });
    fetchSpy.mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(blob) });

    const result = await preloadPosters(['https://image.tmdb.org/t/p/w500/abc.jpg']);
    expect(fetchSpy).toHaveBeenCalledWith('https://image.tmdb.org/t/p/w500/abc.jpg', {
      mode: 'cors',
    });
    expect(result[0]).toMatch(/^blob:mock-/);
  });

  it('returns null for failed fetches', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('CORS'));

    const result = await preloadPosters(['https://example.com/poster.jpg']);
    expect(result).toEqual([null]);
  });

  it('returns null for non-ok response', async () => {
    fetchSpy.mockResolvedValueOnce({ ok: false });

    const result = await preloadPosters(['https://example.com/404.jpg']);
    expect(result).toEqual([null]);
  });

  it('handles null/empty URLs', async () => {
    const result = await preloadPosters([null, '']);
    expect(result).toEqual([null, '']);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('revokePosterUrls', () => {
  let revokeSpy;

  beforeEach(() => {
    revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('revokes blob URLs only', () => {
    revokePosterUrls(['blob:abc', 'https://example.com', 'data:image/png,xyz']);
    expect(revokeSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).toHaveBeenCalledWith('blob:abc');
  });
});
