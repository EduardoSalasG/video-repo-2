import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Inject,
  MaxFileSizeValidator,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthService, CourseService, CourseAccessService, DashboardService, ModuleService, ProgressService, SectionService, UserService, VideoService } from '../../application/services';
import { Course } from '../../domain/entities';
import { Role, AccessLevel } from '../../domain/enums';
import { CurrentUser, JwtAuthGuard, RolesGuard, CourseAccessGuard, Roles, RequiredAccess } from '../auth/guards';
import {
  RegisterDto,
  LoginDto,
  CreateCourseDto,
  UpdateCourseDto,
  CreateModuleDto,
  UpdateModuleDto,
  CreateSectionDto,
  UpdateSectionDto,
  CreateVideoMetadataDto,
  LinkVideoDto,
  GrantCourseAccessDto,
  UpdateUserRoleDto,
  ChangePasswordDto,
} from './dtos';

type AuthUser = { userId: string; email: string; role: Role };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private cookieOptions(origin?: string) {
    const isLocal = origin?.startsWith('http://localhost');
    const sameSite = isLocal
      ? 'lax'
      : (process.env.COOKIE_SAMESITE as 'strict' | 'lax' | 'none' | undefined) ?? 'lax';
    const secure = isLocal
      ? false
      : process.env.COOKIE_SECURE === 'true' || (sameSite === 'none' && process.env.NODE_ENV === 'production');
    return {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.auth.login(dto.email, dto.password);
    res.cookie('access_token', token, this.cookieOptions(req.headers.origin));
    return user;
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', this.cookieOptions(req.headers.origin));
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UserService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiCookieAuth()
  async search(@CurrentUser() user: AuthUser, @Query('q') q: string) {
    const results = await this.users.search(q ?? '');
    if (user.role === Role.ADMIN) return results;
    const allowedIds = await this.courseAccess.getInstructorStudentIds(user.userId);
    return results.filter((u) => u.role === Role.STUDENT && allowedIds.has(u.id));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    if (user.role === Role.ADMIN || user.userId === id) {
      return this.users.getById(id);
    }
    if (user.role === Role.INSTRUCTOR) {
      const allowedIds = await this.courseAccess.getInstructorStudentIds(user.userId);
      if (allowedIds.has(id)) {
        return this.users.getById(id);
      }
    }
    return { error: 'Forbidden' };
  }

  @Get(':id/accesses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiCookieAuth()
  async getAccesses(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const accesses = await this.courseAccess.getByUser(id);
    if (user.role === Role.ADMIN) return accesses;
    const myCourses = new Set((await this.courseAccess.getByUser(user.userId)).map((a) => a.courseId));
    return accesses.filter((a) => myCourses.has(a.courseId));
  }

  @Delete(':id/accesses/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiCookieAuth()
  async revokeAccess(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('courseId') courseId: string) {
    if (user.role === Role.INSTRUCTOR) {
      const myAccess = await this.courseAccess.getByUser(user.userId);
      const hasCourse = myAccess.some((a) => a.courseId === courseId);
      if (!hasCourse) return { error: 'Forbidden' };
    }
    await this.courseAccess.revoke(id, courseId);
    return { ok: true };
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.users.updateRole(id, dto.role);
  }

  @Patch(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    if (user.userId !== id) {
      throw new ForbiddenException('You can only change your own password');
    }
    return this.users.changePassword(id, dto.currentPassword, dto.newPassword);
  }
}

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly courses: CourseService,
    private readonly courseAccess: CourseAccessService,
    private readonly progress: ProgressService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  async list(@CurrentUser() user: AuthUser) {
    if (user.role === Role.ADMIN) {
      return this.courses.list();
    }
    const myAccess = await this.courseAccess.getByUser(user.userId);
    const courseIds = [...new Set(myAccess.map((a) => a.courseId))];
    const accessible = await Promise.all(courseIds.map((id) => this.courses.getById(id)));
    return accessible.filter((c): c is Course => c !== null);
  }

  @Get(':courseId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.READ)
  @ApiCookieAuth()
  async get(@Param('courseId') courseId: string) {
    return this.courses.getById(courseId);
  }

  @Get(':courseId/progress')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.READ)
  @ApiCookieAuth()
  async getProgress(@CurrentUser() user: AuthUser, @Param('courseId') courseId: string) {
    const completed = await this.progress.getCompletedByCourse(user.userId, courseId);
    return { completedSectionIds: completed };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiCookieAuth()
  async create(@Body() dto: CreateCourseDto) {
    return this.courses.create(dto);
  }

  @Patch(':courseId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @ApiCookieAuth()
  async update(@Param('courseId') courseId: string, @Body() dto: UpdateCourseDto) {
    return this.courses.update(courseId, dto);
  }

  @Delete(':courseId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @ApiCookieAuth()
  async delete(@Param('courseId') courseId: string) {
    return this.courses.delete(courseId);
  }

  @Post(':courseId/access')
  @UseGuards(JwtAuthGuard, RolesGuard, CourseAccessGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @ApiCookieAuth()
  async grant(
    @CurrentUser() user: AuthUser,
    @Param('courseId') courseId: string,
    @Body() dto: GrantCourseAccessDto,
  ) {
    await this.courseAccess.grant({ userId: user.userId, role: user.role as Role }, dto.userId, courseId, dto.accessLevel);
    return { ok: true };
  }
}

@ApiTags('modules')
@Controller('courses/:courseId/modules')
export class ModulesController {
  constructor(private readonly modules: ModuleService) {}

  @Get()
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.READ)
  @ApiCookieAuth()
  async list(@Param('courseId') courseId: string) {
    return this.modules.listByCourse(courseId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @ApiCookieAuth()
  async create(@Param('courseId') courseId: string, @Body() dto: CreateModuleDto) {
    return this.modules.create({ ...dto, courseId });
  }
}

@ApiTags('modules')
@Controller('modules')
export class ModuleDetailController {
  constructor(private readonly modules: ModuleService) {}

  @Get(':moduleId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.READ)
  @ApiCookieAuth()
  async get(@Param('moduleId') moduleId: string) {
    return this.modules.getById(moduleId);
  }

  @Patch(':moduleId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @ApiCookieAuth()
  async update(@Param('moduleId') moduleId: string, @Body() dto: UpdateModuleDto) {
    return this.modules.update(moduleId, dto);
  }

  @Delete(':moduleId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @ApiCookieAuth()
  async delete(@Param('moduleId') moduleId: string) {
    return this.modules.delete(moduleId);
  }
}

@ApiTags('sections')
@Controller('modules/:moduleId/sections')
export class SectionsController {
  constructor(private readonly sections: SectionService) {}

  @Get()
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.READ)
  @ApiCookieAuth()
  async list(@Param('moduleId') moduleId: string) {
    return this.sections.listByModule(moduleId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @ApiCookieAuth()
  async create(@Param('moduleId') moduleId: string, @Body() dto: CreateSectionDto) {
    return this.sections.create({ ...dto, moduleId });
  }
}

@ApiTags('sections')
@Controller('sections')
export class SectionDetailController {
  constructor(
    private readonly sections: SectionService,
    private readonly progress: ProgressService,
  ) {}

  @Get(':sectionId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.READ)
  @ApiCookieAuth()
  async get(@Param('sectionId') sectionId: string) {
    return this.sections.getById(sectionId);
  }

  @Get(':sectionId/progress')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.READ)
  @ApiCookieAuth()
  async getProgress(@CurrentUser() user: AuthUser, @Param('sectionId') sectionId: string) {
    const progress = await this.progress.getProgress(user.userId, sectionId);
    return { completed: progress?.completed ?? false };
  }

  @Post(':sectionId/progress')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.READ)
  @ApiCookieAuth()
  async markProgress(@CurrentUser() user: AuthUser, @Param('sectionId') sectionId: string) {
    const progress = await this.progress.markCompleted(user.userId, sectionId);
    return { completed: progress.completed };
  }

  @Patch(':sectionId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @ApiCookieAuth()
  async update(@Param('sectionId') sectionId: string, @Body() dto: UpdateSectionDto) {
    return this.sections.update(sectionId, dto);
  }

  @Delete(':sectionId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @ApiCookieAuth()
  async delete(@Param('sectionId') sectionId: string) {
    return this.sections.delete(sectionId);
  }
}

@ApiTags('videos')
@Controller('sections/:sectionId/videos')
export class VideosController {
  constructor(private readonly videos: VideoService) {}

  @Post()
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @UseInterceptors(FileInterceptor('video'))
  @ApiCookieAuth()
  async upload(
    @Param('sectionId') sectionId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'video/*' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('metadata') metadata: string,
  ) {
    if (!metadata) {
      throw new BadRequestException('metadata is required');
    }
    let parsed: CreateVideoMetadataDto;
    try {
      parsed = plainToInstance(CreateVideoMetadataDto, JSON.parse(metadata));
    } catch {
      throw new BadRequestException('metadata must be a valid JSON');
    }
    const errors = await validate(parsed);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return this.videos.upload(sectionId, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    }, { ...parsed, sectionId });
  }

  @Post('link')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.MAINTAIN)
  @ApiCookieAuth()
  async link(
    @Param('sectionId') sectionId: string,
    @Body() dto: LinkVideoDto,
  ) {
    return this.videos.attachLink(sectionId, dto.url, { ...dto.metadata, sectionId });
  }
}

@ApiTags('videos')
@Controller('video-files')
export class VideoFilesController {
  constructor(private readonly videos: VideoService) {}

  @Get(':videoFileId')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  async getUrl(@Param('videoFileId') videoFileId: string) {
    const url = await this.videos.getSignedUrl(videoFileId);
    return { url };
  }
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}

@ApiTags('search')
@Controller('videos')
export class VideoSearchController {
  constructor(
    private readonly videos: VideoService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  async search(@CurrentUser() user: AuthUser, @Query('tags') tags?: string) {
    const tagList = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    if (tagList.length === 0) {
      return { results: [] };
    }
    const results = await this.videos.searchByTags(tagList);
    if (user.role === Role.ADMIN) {
      return { results };
    }
    const myAccess = await this.courseAccess.getByUser(user.userId);
    const courseIds = new Set(myAccess.map((a) => a.courseId));
    return { results: results.filter((r) => courseIds.has(r.course.id)) };
  }

  @Get(':id/stream')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  async stream(
    @CurrentUser() user: AuthUser,
    @Param('id') videoFileId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.videos.stream(user.userId, videoFileId);
    if (result.type === 'url') {
      return res.redirect(result.url);
    }

    if (process.env.NODE_ENV === 'production') {
      res.set('X-Accel-Redirect', `/_protected_videos/${result.storageKey}`);
      res.set('Content-Type', result.mimeType);
      return res.status(200).end();
    }

    return res.redirect(`/uploads/${result.storageKey}`);
  }
}

@ApiTags('admin')
@Controller('admin')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiCookieAuth()
  async getDashboard(@CurrentUser() user: AuthUser) {
    return this.dashboard.getDashboard(user.userId, user.role as Role);
  }
}
