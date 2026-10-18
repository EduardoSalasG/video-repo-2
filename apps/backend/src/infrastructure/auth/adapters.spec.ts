import { describe, expect, it } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './adapters';
import { Role } from '../../domain/enums';

const jwtService = new JwtService({ secret: 'test-secret' });
const tokens = new JwtTokenService(jwtService);

describe('JwtTokenService stream tickets', () => {
  const ticket = {
    videoFileId: 'vf-1',
    userId: 'user-1',
    email: 'u@test.dev',
    role: Role.STUDENT,
  };

  it('round-trips a signed ticket', () => {
    const token = tokens.signStreamTicket(ticket);
    expect(tokens.verifyStreamTicket(token)).toEqual(ticket);
  });

  it('rejects a regular auth JWT (no video-stream typ)', () => {
    const token = tokens.sign({ sub: 'user-1', email: 'u@test.dev', role: Role.STUDENT });
    expect(tokens.verifyStreamTicket(token)).toBeNull();
  });

  it('rejects tampered or garbage tokens', () => {
    const token = tokens.signStreamTicket(ticket);
    expect(tokens.verifyStreamTicket(`${token}x`)).toBeNull();
    expect(tokens.verifyStreamTicket('not-a-jwt')).toBeNull();
  });
});
