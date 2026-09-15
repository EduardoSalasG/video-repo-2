import { describe, it, expect, vi, afterEach } from 'vitest';
import { api } from './api';

const mockFetch = (status: number, body: string | null) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(body, { status })),
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api request handling', () => {
  it('resolves null when the response body is empty', async () => {
    mockFetch(200, '');
    await expect(api.delete('/sections/abc')).resolves.toBeNull();
  });

  it('resolves null for 204 responses', async () => {
    mockFetch(204, null);
    await expect(api.delete('/modules/abc')).resolves.toBeNull();
  });

  it('parses JSON bodies as before', async () => {
    mockFetch(200, '{"id":"1","title":"Módulo"}');
    await expect(api.get('/modules/1')).resolves.toEqual({ id: '1', title: 'Módulo' });
  });

  it('still throws ApiError on failed responses', async () => {
    mockFetch(404, '{"message":"Section not found"}');
    await expect(api.delete('/sections/abc')).rejects.toMatchObject({ status: 404 });
  });
});
