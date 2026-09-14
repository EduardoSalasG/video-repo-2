export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.status = status;
    this.data = data;
  }
}

export function apiErrorMessage(err: unknown, fallback = 'Error inesperado'): string {
  if (err instanceof ApiError) {
    const data = err.data as { message?: string | string[] } | null;
    const raw = data?.message;
    if (Array.isArray(raw)) return raw.join(', ');
    if (raw) return raw;
    return err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
}
