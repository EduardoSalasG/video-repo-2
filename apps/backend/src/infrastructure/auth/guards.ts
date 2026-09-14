import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role, AccessLevel } from '../../domain/enums';
import { CourseAccessService, PermissionService } from '../../application/services';
import { PrismaService } from '../persistence/prisma.service';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: Role };
}

export interface CurrentUser {
  userId: string;
  email: string;
  role: Role;
}

export const RequiresPermission = (permission: string) => SetMetadata('permission', permission);
export const RequiredAccess = (level: AccessLevel) => SetMetadata('access_level', level);

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): CurrentUser => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.user) throw new Error('No authenticated user in request');
  return request.user;
});

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<string | undefined>('permission', context.getHandler());
    if (!required) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) return false;
    return this.permissions.can(user.role, required);
  }
}

@Injectable()
export class CourseAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly courseAccess: CourseAccessService,
    private readonly permissions: PermissionService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<AccessLevel | undefined>('access_level', context.getHandler());
    if (!required) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) return false;
    if (await this.permissions.isSuperuser(user.role)) return true;

    const courseId = await this.resolveCourseId(request.params);
    if (!courseId) return false;

    return this.courseAccess.hasAccess(user.userId, courseId, required);
  }

  private async resolveCourseId(params: Request['params']): Promise<string | null> {
    const courseId = typeof params.courseId === 'string' ? params.courseId : undefined;
    if (courseId) return courseId;

    const moduleId = typeof params.moduleId === 'string' ? params.moduleId : undefined;
    if (moduleId) {
      const row = await this.prisma.module.findUnique({
        where: { id: moduleId },
        select: { courseId: true },
      });
      return row?.courseId ?? null;
    }

    const sectionId = typeof params.sectionId === 'string' ? params.sectionId : undefined;
    if (sectionId) {
      const row = await this.prisma.section.findUnique({
        where: { id: sectionId },
        select: { module: { select: { courseId: true } } },
      });
      return row?.module.courseId ?? null;
    }

    return null;
  }
}
