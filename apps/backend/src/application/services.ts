import { Inject, Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role, AccessLevel } from '../domain/enums';
import { User, Course, CourseModule, Section, VideoFile, VideoMetadata, CourseAccess, UserSectionProgress } from '../domain/entities';
import { InjectionTokens } from './tokens';
import {
  IUserRepository,
  ICourseRepository,
  IModuleRepository,
  ISectionRepository,
  IVideoFileRepository,
  IVideoMetadataRepository,
  ICourseAccessRepository,
  IProgressRepository,
  IVideoStorage,
  IPasswordHasher,
  ITokenService,
  TokenPayload,
  CreateUserInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateModuleInput,
  UpdateModuleInput,
  CreateSectionInput,
  UpdateSectionInput,
  CreateVideoMetadataInput,
  StorageFile,
  VideoSearchResult,
} from './ports';

export type SafeUser = Omit<User, 'passwordHash'>;

function stripPassword(user: User): SafeUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(InjectionTokens.USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(InjectionTokens.PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(InjectionTokens.TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async register(input: CreateUserInput): Promise<SafeUser> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictException('Email already in use');

    const existingUsername = await this.users.findByUsername(input.username);
    if (existingUsername) throw new ConflictException('Username already in use');

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({ ...input, role: input.role ?? Role.STUDENT }, passwordHash);
    return stripPassword(user);
  }

  async login(email: string, password: string): Promise<{ user: SafeUser; token: string }> {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.hasher.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.tokenService.sign({ sub: user.id, email: user.email, role: user.role });
    return { user: stripPassword(user), token };
  }
}

@Injectable()
export class CourseService {
  constructor(
    @Inject(InjectionTokens.COURSE_REPOSITORY) private readonly courses: ICourseRepository,
  ) {}

  async list(): Promise<Course[]> {
    return this.courses.findAll();
  }

  async getById(id: string): Promise<Course> {
    const course = await this.courses.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(input: CreateCourseInput): Promise<Course> {
    return this.courses.create(input);
  }

  async update(id: string, input: UpdateCourseInput): Promise<Course> {
    await this.getById(id);
    return this.courses.update(id, input);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    return this.courses.delete(id);
  }
}

@Injectable()
export class ModuleService {
  constructor(
    @Inject(InjectionTokens.MODULE_REPOSITORY) private readonly modules: IModuleRepository,
    @Inject(InjectionTokens.COURSE_REPOSITORY) private readonly courses: ICourseRepository,
  ) {}

  async listByCourse(courseId: string): Promise<CourseModule[]> {
    await this.ensureCourseExists(courseId);
    return this.modules.findByCourseId(courseId);
  }

  async getById(id: string): Promise<CourseModule> {
    const module = await this.modules.findById(id);
    if (!module) throw new NotFoundException('Module not found');
    return module;
  }

  async create(input: CreateModuleInput): Promise<CourseModule> {
    await this.ensureCourseExists(input.courseId);
    return this.modules.create(input);
  }

  async update(id: string, input: UpdateModuleInput): Promise<CourseModule> {
    await this.getById(id);
    return this.modules.update(id, input);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    return this.modules.delete(id);
  }

  private async ensureCourseExists(courseId: string): Promise<void> {
    const course = await this.courses.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
  }
}

@Injectable()
export class SectionService {
  constructor(
    @Inject(InjectionTokens.SECTION_REPOSITORY) private readonly sections: ISectionRepository,
    @Inject(InjectionTokens.MODULE_REPOSITORY) private readonly modules: IModuleRepository,
  ) {}

  async listByModule(moduleId: string): Promise<Section[]> {
    await this.ensureModuleExists(moduleId);
    return this.sections.findByModuleId(moduleId);
  }

  async getById(id: string): Promise<Section> {
    const section = await this.sections.findById(id);
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async create(input: CreateSectionInput): Promise<Section> {
    await this.ensureModuleExists(input.moduleId);
    return this.sections.create(input);
  }

  async update(id: string, input: UpdateSectionInput): Promise<Section> {
    await this.getById(id);
    return this.sections.update(id, input);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    return this.sections.delete(id);
  }

  private async ensureModuleExists(moduleId: string): Promise<void> {
    const module = await this.modules.findById(moduleId);
    if (!module) throw new NotFoundException('Module not found');
  }
}

@Injectable()
export class VideoService {
  constructor(
    @Inject(InjectionTokens.VIDEO_STORAGE) private readonly storage: IVideoStorage,
    @Inject(InjectionTokens.VIDEO_FILE_REPOSITORY) private readonly videoFiles: IVideoFileRepository,
    @Inject(InjectionTokens.VIDEO_METADATA_REPOSITORY) private readonly videoMetadata: IVideoMetadataRepository,
    @Inject(InjectionTokens.SECTION_REPOSITORY) private readonly sections: ISectionRepository,
  ) {}

  async upload(sectionId: string, file: StorageFile, metadata: CreateVideoMetadataInput): Promise<{ videoFile: VideoFile; videoMetadata: VideoMetadata }> {
    const section = await this.sections.findById(sectionId);
    if (!section) throw new NotFoundException('Section not found');

    const uploaded = await this.storage.upload(file);
    const videoFile = await this.videoFiles.create(uploaded);
    await this.sections.attachVideoFile(sectionId, videoFile.id);

    const videoMetadata = await this.videoMetadata.create({
      ...metadata,
      sectionId,
    });

    return { videoFile, videoMetadata };
  }

  async attachLink(sectionId: string, url: string, metadata: CreateVideoMetadataInput): Promise<{ videoFile: VideoFile; videoMetadata: VideoMetadata }> {
    const section = await this.sections.findById(sectionId);
    if (!section) throw new NotFoundException('Section not found');

    const videoFile = await this.videoFiles.createFromUrl(url);
    await this.sections.attachVideoFile(sectionId, videoFile.id);

    const videoMetadata = await this.videoMetadata.create({
      ...metadata,
      sectionId,
    });

    return { videoFile, videoMetadata };
  }

  async getSignedUrl(videoFileId: string): Promise<string> {
    const file = await this.videoFiles.findById(videoFileId);
    if (!file) throw new NotFoundException('Video file not found');
    if (file.url) return file.url;
    return this.storage.getUrl(file.storageKey);
  }

  async searchByTags(tags: string[]): Promise<VideoSearchResult[]> {
    return this.videoMetadata.findByTags(tags);
  }
}

@Injectable()
export class CourseAccessService {
  constructor(
    @Inject(InjectionTokens.COURSE_ACCESS_REPOSITORY) private readonly access: ICourseAccessRepository,
    @Inject(InjectionTokens.USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  async requireAccess(userId: string, courseId: string, minimum: AccessLevel): Promise<void> {
    const granted = await this.access.findByUserAndCourse(userId, courseId);
    if (!granted || !this.satisfies(granted.accessLevel, minimum)) {
      throw new UnauthorizedException('Insufficient access to course');
    }
  }

  async requireWriteOrMaintain(userId: string, courseId: string): Promise<void> {
    const granted = await this.access.findByUserAndCourse(userId, courseId);
    if (!granted || (granted.accessLevel !== AccessLevel.WRITE && granted.accessLevel !== AccessLevel.MAINTAIN)) {
      throw new UnauthorizedException('Insufficient access to course');
    }
  }

  async requireMaintain(userId: string, courseId: string): Promise<void> {
    const granted = await this.access.findByUserAndCourse(userId, courseId);
    if (!granted || granted.accessLevel !== AccessLevel.MAINTAIN) {
      throw new UnauthorizedException('Insufficient access to course');
    }
  }

  async hasAccess(userId: string, courseId: string, minimum: AccessLevel): Promise<boolean> {
    const granted = await this.access.findByUserAndCourse(userId, courseId);
    if (!granted) return false;
    return this.satisfies(granted.accessLevel, minimum);
  }

  async grant(
    actor: { userId: string; role: Role },
    targetUserId: string,
    courseId: string,
    level?: AccessLevel,
  ): Promise<void> {
    if (actor.role === Role.INSTRUCTOR) {
      if (actor.userId === targetUserId) {
        throw new UnauthorizedException('Instructor cannot grant access to themselves');
      }
      const target = await this.users.findById(targetUserId);
      if (!target || target.role !== Role.STUDENT) {
        throw new UnauthorizedException('Instructor can only grant access to students');
      }
      const myAccess = await this.access.findByUserAndCourse(actor.userId, courseId);
      if (!myAccess) {
        throw new UnauthorizedException('Instructor does not have access to this course');
      }
    }
    await this.access.grant(targetUserId, courseId, level ?? AccessLevel.READ);
  }

  async getByUser(userId: string): Promise<CourseAccess[]> {
    return this.access.findByUser(userId);
  }

  async getByCourse(courseId: string): Promise<CourseAccess[]> {
    return this.access.findByCourse(courseId);
  }

  async getInstructorStudentIds(instructorId: string): Promise<Set<string>> {
    const myAccess = await this.access.findByUser(instructorId);
    const courseIds = [...new Set(myAccess.map((a) => a.courseId))];
    const members = await Promise.all(courseIds.map((id) => this.access.findByCourse(id)));
    const userIds = new Set<string>();
    members.flat().forEach((a) => {
      if (a.userId !== instructorId) userIds.add(a.userId);
    });
    return userIds;
  }

  async revoke(userId: string, courseId: string): Promise<void> {
    await this.access.revoke(userId, courseId);
  }

  private satisfies(level: AccessLevel, minimum: AccessLevel): boolean {
    const hierarchy = [AccessLevel.READ, AccessLevel.WRITE, AccessLevel.MAINTAIN];
    return hierarchy.indexOf(level) >= hierarchy.indexOf(minimum);
  }
}

@Injectable()
export class UserService {
  constructor(
    @Inject(InjectionTokens.USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  async getById(id: string): Promise<SafeUser> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return stripPassword(user);
  }

  async updateRole(id: string, role: Role): Promise<SafeUser> {
    const user = await this.users.updateRole(id, role);
    return stripPassword(user);
  }

  async search(query: string): Promise<SafeUser[]> {
    const users = await this.users.search(query);
    return users.map(stripPassword);
  }
}

@Injectable()
export class ProgressService {
  constructor(
    @Inject(InjectionTokens.PROGRESS_REPOSITORY) private readonly progress: IProgressRepository,
  ) {}

  async getProgress(userId: string, sectionId: string): Promise<UserSectionProgress | null> {
    return this.progress.findByUserAndSection(userId, sectionId);
  }

  async markCompleted(userId: string, sectionId: string): Promise<UserSectionProgress> {
    return this.progress.markCompleted(userId, sectionId);
  }
}

@Injectable()
export class DashboardService {
  constructor(
    @Inject(InjectionTokens.USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(InjectionTokens.COURSE_REPOSITORY) private readonly courses: ICourseRepository,
    @Inject(InjectionTokens.COURSE_ACCESS_REPOSITORY) private readonly access: ICourseAccessRepository,
  ) {}

  async getDashboard(userId: string, role: Role): Promise<{ courses: number; users: number }> {
    if (role === Role.ADMIN) {
      const [courseList, userList] = await Promise.all([
        this.courses.findAll(),
        this.users.search(''),
      ]);
      return { courses: courseList.length, users: userList.length };
    }

    if (role === Role.INSTRUCTOR) {
      const myAccess = await this.access.findByUser(userId);
      const courseIds = [...new Set(myAccess.map((a) => a.courseId))];
      const members = await Promise.all(courseIds.map((id) => this.access.findByCourse(id)));
      const userIds = new Set<string>();
      members.flat().forEach((a) => {
        if (a.userId !== userId) userIds.add(a.userId);
      });
      return { courses: courseIds.length, users: userIds.size };
    }

    return { courses: 0, users: 0 };
  }
}
