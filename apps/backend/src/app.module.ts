import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessLevelService, AuthService, CourseService, CourseAccessService, DashboardService, DifficultyService, LabelService, LabelTypeService, ModuleService, ProgressService, SectionService, StyleService, UserService, VideoService, VideoTypeService } from './application/services';
import { InjectionTokens } from './application/tokens';
import { AuthController, UsersController, CoursesController, ModulesController, ModuleDetailController, SectionsController, SectionDetailController, VideosController, VideoFilesController, HealthController, VideoSearchController, DashboardController, LabelsController, PrimaryStylesController, DifficultiesController, VideoTypesController, LabelTypesController, AccessLevelsController } from './infrastructure/http/controllers';
import { PrismaService } from './infrastructure/persistence/prisma.service';
import {
  PrismaUserRepository,
  PrismaCourseRepository,
  PrismaModuleRepository,
  PrismaSectionRepository,
  PrismaVideoFileRepository,
  PrismaVideoMetadataRepository,
  PrismaVideoLabelRepository,
  PrismaPrimaryStyleRepository,
  PrismaDifficultyRepository,
  PrismaVideoTypeRepository,
  PrismaLabelTypeRepository,
  PrismaAccessLevelRepository,
  PrismaCourseAccessRepository,
  PrismaProgressRepository,
} from './infrastructure/persistence/repositories';
import { JwtAuthGuard, RolesGuard, CourseAccessGuard } from './infrastructure/auth/guards';
import { JwtStrategy, BcryptPasswordHasher, JwtTokenService } from './infrastructure/auth/adapters';
import { LocalVideoStorage } from './infrastructure/storage/local-video.storage';
import { S3VideoStorage } from './infrastructure/storage/s3-video.storage';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET ?? 'change-me',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [
    AuthController,
    UsersController,
    CoursesController,
    ModulesController,
    ModuleDetailController,
    SectionsController,
    SectionDetailController,
    VideosController,
    VideoFilesController,
    HealthController,
    VideoSearchController,
    DashboardController,
    LabelsController,
    PrimaryStylesController,
    DifficultiesController,
    VideoTypesController,
    LabelTypesController,
    AccessLevelsController,
  ],
  providers: [
    { provide: InjectionTokens.TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: InjectionTokens.PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    {
      provide: InjectionTokens.VIDEO_STORAGE,
      useClass: process.env.VIDEO_STORAGE === 's3' ? S3VideoStorage : LocalVideoStorage,
    },
    { provide: InjectionTokens.USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: InjectionTokens.COURSE_REPOSITORY, useClass: PrismaCourseRepository },
    { provide: InjectionTokens.MODULE_REPOSITORY, useClass: PrismaModuleRepository },
    { provide: InjectionTokens.SECTION_REPOSITORY, useClass: PrismaSectionRepository },
    { provide: InjectionTokens.VIDEO_FILE_REPOSITORY, useClass: PrismaVideoFileRepository },
    { provide: InjectionTokens.VIDEO_METADATA_REPOSITORY, useClass: PrismaVideoMetadataRepository },
    { provide: InjectionTokens.VIDEO_LABEL_REPOSITORY, useClass: PrismaVideoLabelRepository },
    { provide: InjectionTokens.PRIMARY_STYLE_REPOSITORY, useClass: PrismaPrimaryStyleRepository },
    { provide: InjectionTokens.DIFFICULTY_REPOSITORY, useClass: PrismaDifficultyRepository },
    { provide: InjectionTokens.VIDEO_TYPE_REPOSITORY, useClass: PrismaVideoTypeRepository },
    { provide: InjectionTokens.LABEL_TYPE_REPOSITORY, useClass: PrismaLabelTypeRepository },
    { provide: InjectionTokens.ACCESS_LEVEL_REPOSITORY, useClass: PrismaAccessLevelRepository },
    { provide: InjectionTokens.COURSE_ACCESS_REPOSITORY, useClass: PrismaCourseAccessRepository },
    { provide: InjectionTokens.PROGRESS_REPOSITORY, useClass: PrismaProgressRepository },
    PrismaService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    CourseAccessGuard,
    AuthService,
    UserService,
    CourseService,
    CourseAccessService,
    ModuleService,
    SectionService,
    VideoService,
    DashboardService,
    LabelService,
    StyleService,
    DifficultyService,
    VideoTypeService,
    LabelTypeService,
    AccessLevelService,
    ProgressService,
  ],
})
export class AppModule {}
