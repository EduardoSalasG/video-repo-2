import { Inject, Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role, AccessLevel, PrimaryStyle, LabelType } from '../domain/enums';
import { User, Course, CourseModule, Section, VideoFile, VideoMetadata, CourseAccess, UserSectionProgress } from '../domain/entities';
import { InjectionTokens } from './tokens';
import {
  IUserRepository,
  ICourseRepository,
  IModuleRepository,
  ISectionRepository,
  IVideoFileRepository,
  IVideoMetadataRepository,
  IVideoLabelRepository,
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
    @Inject(InjectionTokens.VIDEO_STORAGE) private readonly storage: IVideoStorage,
  ) {}

  private async hydrateImageUrl(course: Course): Promise<Course> {
    if (course.imageStorageKey) {
      course.imageUrl = await this.storage.getUrl(course.imageStorageKey);
    }
    return course;
  }

  async list(): Promise<Course[]> {
    const courses = await this.courses.findAll();
    return Promise.all(courses.map((course) => this.hydrateImageUrl(course)));
  }

  async getById(id: string): Promise<Course> {
    const course = await this.courses.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return this.hydrateImageUrl(course);
  }

  async create(input: CreateCourseInput, image?: StorageFile): Promise<Course> {
    if (image) {
      const uploaded = await this.storage.upload(image, 'thumbnails');
      input.imageStorageKey = uploaded.storageKey;
    }
    const course = await this.courses.create(input);
    return this.hydrateImageUrl(course);
  }

  async update(id: string, input: UpdateCourseInput, image?: StorageFile): Promise<Course> {
    const existing = await this.getById(id);
    if (image) {
      if (existing.imageStorageKey) {
        await this.storage.delete(existing.imageStorageKey);
      }
      const uploaded = await this.storage.upload(image, 'thumbnails');
      input.imageStorageKey = uploaded.storageKey;
    }
    const course = await this.courses.update(id, input);
    return this.hydrateImageUrl(course);
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
    @Inject(InjectionTokens.VIDEO_METADATA_REPOSITORY) private readonly videoMetadata: IVideoMetadataRepository,
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

  async getMetadata(sectionId: string): Promise<VideoMetadata | null> {
    return this.videoMetadata.findBySectionId(sectionId);
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
export class CourseAccessService {
  constructor(
    @Inject(InjectionTokens.COURSE_ACCESS_REPOSITORY) private readonly access: ICourseAccessRepository,
    @Inject(InjectionTokens.USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  async requireAccess(userId: string, courseId: string, minimum: AccessLevel): Promise<void> {
    const user = await this.users.findById(userId);
    if (user?.role === Role.ADMIN) return;
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
export class VideoService {
  constructor(
    @Inject(InjectionTokens.VIDEO_STORAGE) private readonly storage: IVideoStorage,
    @Inject(InjectionTokens.VIDEO_FILE_REPOSITORY) private readonly videoFiles: IVideoFileRepository,
    @Inject(InjectionTokens.VIDEO_METADATA_REPOSITORY) private readonly videoMetadata: IVideoMetadataRepository,
    @Inject(InjectionTokens.VIDEO_LABEL_REPOSITORY) private readonly videoLabels: IVideoLabelRepository,
    @Inject(InjectionTokens.SECTION_REPOSITORY) private readonly sections: ISectionRepository,
    private readonly courseAccess: CourseAccessService,
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
    await this.ensureLabels(metadata);

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
    await this.ensureLabels(metadata);

    return { videoFile, videoMetadata };
  }

  private async ensureLabels(metadata: CreateVideoMetadataInput): Promise<void> {
    await Promise.all([
      this.videoLabels.ensureMany(LabelType.STEP, metadata.steps),
      this.videoLabels.ensureMany(LabelType.INFLUENCE, metadata.influences),
      this.videoLabels.ensureMany(LabelType.TAG, metadata.tags),
    ]);
  }

  async getSignedUrl(videoFileId: string): Promise<string> {
    const file = await this.videoFiles.findById(videoFileId);
    if (!file) throw new NotFoundException('Video file not found');
    if (file.url) return file.url;
    return this.storage.getUrl(file.storageKey);
  }

  async stream(userId: string, videoFileId: string): Promise<{ type: 'url'; url: string } | { type: 'internal'; storageKey: string; mimeType: string }> {
    const file = await this.videoFiles.findById(videoFileId);
    if (!file) throw new NotFoundException('Video file not found');

    const section = await this.sections.findByVideoFileId(videoFileId);
    if (!section || !section.module) throw new NotFoundException('Video section not found');

    await this.courseAccess.requireAccess(userId, section.module.courseId, AccessLevel.READ);

    if (file.url) {
      return { type: 'url', url: file.url };
    }

    return { type: 'internal', storageKey: file.storageKey, mimeType: file.mimeType };
  }

  async getLabels(type: LabelType, query?: string): Promise<string[]> {
    return this.videoLabels.findByType(type, query);
  }

  async search(
    user: { userId: string; role: Role },
    options: { q?: string; style?: PrimaryStyle; courseId?: string },
  ): Promise<VideoSearchResult[]> {
    const accessibleCourseIds = user.role === Role.ADMIN
      ? undefined
      : (await this.courseAccess.getByUser(user.userId)).map((a) => a.courseId);

    if (options.courseId) {
      if (accessibleCourseIds && !accessibleCourseIds.includes(options.courseId)) {
        return [];
      }
    }

    const courseIds = options.courseId ? [options.courseId] : accessibleCourseIds;

    let tagNames: string[] | undefined;
    let stepNames: string[] | undefined;
    if (options.q) {
      const [tags, steps] = await Promise.all([
        this.videoLabels.findByType(LabelType.TAG, options.q),
        this.videoLabels.findByType(LabelType.STEP, options.q),
      ]);
      tagNames = tags;
      stepNames = steps;
      if (tagNames.length === 0 && stepNames.length === 0) return [];
    }

    return this.videoMetadata.search({
      courseIds,
      style: options.style,
      tagNames,
      stepNames,
    });
  }
}

@Injectable()
export class UserService {
  constructor(
    @Inject(InjectionTokens.USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(InjectionTokens.PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
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

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<SafeUser> {
    const user = await this.users.findById(id);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.hasher.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await this.hasher.hash(newPassword);
    const updated = await this.users.updatePassword(id, passwordHash);
    return stripPassword(updated);
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

  async getCompletedByCourse(userId: string, courseId: string): Promise<string[]> {
    return this.progress.findCompletedByCourse(userId, courseId);
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
