import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { IPasswordHasher, ITokenService, IUserRepository, TokenPayload } from '../../application/ports';
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

function streamQueryExtractor(req: Request): string | null {
  if (!req.path.endsWith('/stream')) return null;
  const token = req.query?.access_token;
  return typeof token === 'string' ? token : null;
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
        streamQueryExtractor,
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
