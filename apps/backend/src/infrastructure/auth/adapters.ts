import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { IPasswordHasher, ITokenService, IUserRepository, StreamTicket, TokenPayload } from '../../application/ports';
import { InjectionTokens } from '../../application/tokens';
import { Role } from '../../domain/enums';

interface CookieRequest extends Request {
  cookies: Record<string, string | undefined>;
}

function cookieExtractor(req: Request): string | null {
  const request = req as CookieRequest;
  const token = request.cookies?.access_token;
  return token ?? null;
}

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }

  signStreamTicket(ticket: StreamTicket): string {
    return this.jwtService.sign(
      { typ: 'video-stream', vf: ticket.videoFileId, sub: ticket.userId, email: ticket.email, role: ticket.role },
      { expiresIn: (process.env.STREAM_TICKET_EXPIRES_IN ?? '4h') as JwtSignOptions['expiresIn'] },
    );
  }

  verifyStreamTicket(token: string): StreamTicket | null {
    try {
      const payload = this.jwtService.verify<{ typ?: string; vf?: string; sub?: string; email?: string; role?: Role }>(token);
      if (
        payload.typ !== 'video-stream' ||
        typeof payload.vf !== 'string' ||
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string' ||
        typeof payload.role !== 'string'
      ) {
        return null;
      }
      return { videoFileId: payload.vf, userId: payload.sub, email: payload.email, role: payload.role };
    } catch {
      return null;
    }
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(InjectionTokens.USER_REPOSITORY) private readonly users: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me',
    });
  }

  async validate(payload: TokenPayload): Promise<{ userId: string; email: string; role: Role }> {
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { userId: user.id, email: user.email, role: user.role };
  }
}
