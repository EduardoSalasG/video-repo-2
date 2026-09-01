import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Inject,
  MaxFileSizeValidator,
  BadRequestException,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthService, CourseService, CourseAccessService, DashboardService, ModuleService, SectionService, UserService, VideoService } from '../../application/services';
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
} from './dtos';

type AuthUser = { userId: string; email: string; role: Role };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.login(dto.email, dto.password);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return user;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { httpOnly: true, path: '/' });
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
  async search(@Query('q') q: string) {
    return this.users.search(q ?? '');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    if (user.role !== Role.ADMIN && user.userId !== id) {
      return { error: 'Forbidden' };
    }
    return this.users.getById(id);
  }

  @Get(':id/accesses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiCookieAuth()
  async getAccesses(@Param('id') id: string) {
    return this.courseAccess.getByUser(id);
  }

  @Delete(':id/accesses/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiCookieAuth()
  async revokeAccess(@Param('id') id: string, @Param('courseId') courseId: string) {
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
}

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly courses: CourseService,
    private readonly courseAccess: CourseAccessService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  async list() {
    return this.courses.list();
  }

  @Get(':courseId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.READ)
  @ApiCookieAuth()
  async get(@Param('courseId') courseId: string) {
    return this.courses.getById(courseId);
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
  async grant(@Param('courseId') courseId: string, @Body() dto: GrantCourseAccessDto) {
    await this.courseAccess.grant(dto.userId, courseId, dto.accessLevel);
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
  constructor(private readonly sections: SectionService) {}

  @Get(':sectionId')
  @UseGuards(JwtAuthGuard, CourseAccessGuard)
  @RequiredAccess(AccessLevel.READ)
  @ApiCookieAuth()
  async get(@Param('sectionId') sectionId: string) {
    return this.sections.getById(sectionId);
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
  constructor(private readonly videos: VideoService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  async search(@Query('tags') tags?: string) {
    const tagList = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    if (tagList.length === 0) {
      return { results: [] };
    }
    const results = await this.videos.searchByTags(tagList);
    return { results };
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
