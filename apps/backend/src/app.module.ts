import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService, CourseService, CourseAccessService, ModuleService, SectionService, UserService, VideoService } from './application/services';
import { InjectionTokens } from './application/tokens';
import { AuthController, UsersController, CoursesController, ModulesController, ModuleDetailController, SectionsController, SectionDetailController, VideosController } from './infrastructure/http/controllers';
import { PrismaService } from './infrastructure/persistence/prisma.service';
import {
  PrismaUserRepository,
  PrismaCourseRepository,
  PrismaModuleRepository,
  PrismaSectionRepository,
  PrismaVideoFileRepository,
  PrismaVideoMetadataRepository,
  PrismaCourseAccessRepository,
} from './infrastructure/persistence/repositories';
import { JwtAuthGuard, RolesGuard, CourseAccessGuard } from './infrastructure/auth/guards';
import { JwtStrategy, BcryptPasswordHasher, JwtTokenService } from './infrastructure/auth/adapters';
import { LocalVideoStorage } from './infrastructure/storage/local-video.storage';
import { S3VideoStorage } from './infrastructure/storage/s3-video.storage';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    { provide: InjectionTokens.COURSE_ACCESS_REPOSITORY, useClass: PrismaCourseAccessRepository },
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
  ],
})
export class AppModule {}
