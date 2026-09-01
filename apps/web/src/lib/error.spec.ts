import { describe, it, expect } from 'vitest';
import { ApiError } from './error';

describe('ApiError', () => {
  it('stores status and data', () => {
    const error = new ApiError(400, { message: 'bad request' });
    expect(error.status).toBe(400);
    expect(error.data).toEqual({ message: 'bad request' });
    expect(error.message).toBe('HTTP 400');
  });

  it('uses a custom message when provided', () => {
    const error = new ApiError(500, null, 'Server error');
    expect(error.message).toBe('Server error');
  });
});
