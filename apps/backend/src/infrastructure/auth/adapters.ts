import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import { IPasswordHasher, ITokenService, TokenPayload } from '../../application/ports';
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
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me',
    });
  }

  validate(payload: TokenPayload): { userId: string; email: string; role: Role } {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
