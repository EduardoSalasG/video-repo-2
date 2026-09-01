import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Course, CourseModule, Section, VideoFile, VideoMetadata, CourseAccess } from '../../domain/entities';
import { Role, AccessLevel, Difficulty, PrimaryStyle, VideoType } from '../../domain/enums';
import {
  IUserRepository,
  ICourseRepository,
  IModuleRepository,
  ISectionRepository,
  IVideoFileRepository,
  IVideoMetadataRepository,
  ICourseAccessRepository,
  CreateUserInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateModuleInput,
  UpdateModuleInput,
  CreateSectionInput,
  UpdateSectionInput,
  CreateVideoMetadataInput,
  UploadedFile,
} from '../../application/ports';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? new User({ ...user, role: user.role as Role }) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? new User({ ...user, role: user.role as Role }) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    return user ? new User({ ...user, role: user.role as Role }) : null;
  }

  async create(input: CreateUserInput, passwordHash: string): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role ?? Role.STUDENT,
        passwordHash,
      },
    });
    return new User({ ...user, role: user.role as Role });
  }

  async updateRole(id: string, role: Role): Promise<User> {
    const user = await this.prisma.user.update({ where: { id }, data: { role } });
    return new User({ ...user, role: user.role as Role });
  }
}

@Injectable()
export class PrismaCourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Course[]> {
    const rows = await this.prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map((row) => new Course(row));
  }

  async findById(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({ where: { id } });
    return course ? new Course(course) : null;
  }

  async findByName(name: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({ where: { name } });
    return course ? new Course(course) : null;
  }

  async create(input: CreateCourseInput): Promise<Course> {
    const course = await this.prisma.course.create({
      data: { name: input.name, description: input.description ?? null },
    });
    return new Course(course);
  }

  async update(id: string, input: UpdateCourseInput): Promise<Course> {
    const course = await this.prisma.course.update({
      where: { id },
      data: { name: input.name, description: input.description },
    });
    return new Course(course);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({ where: { id } });
  }
}

@Injectable()
export class PrismaModuleRepository implements IModuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CourseModule | null> {
    const module = await this.prisma.module.findUnique({ where: { id } });
    return module ? new CourseModule(module) : null;
  }

  async findByCourseId(courseId: string): Promise<CourseModule[]> {
    const rows = await this.prisma.module.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
    });
    return rows.map((row) => new CourseModule(row));
  }

  async create(input: CreateModuleInput): Promise<CourseModule> {
    const module = await this.prisma.module.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        orderIndex: input.orderIndex ?? 0,
        courseId: input.courseId,
      },
    });
    return new CourseModule(module);
  }

  async update(id: string, input: UpdateModuleInput): Promise<CourseModule> {
    const module = await this.prisma.module.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        orderIndex: input.orderIndex,
      },
    });
    return new CourseModule(module);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.module.delete({ where: { id } });
  }
}

@Injectable()
export class PrismaSectionRepository implements ISectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Section | null> {
    const section = await this.prisma.section.findUnique({ where: { id } });
    return section ? new Section(section) : null;
  }

  async findByModuleId(moduleId: string): Promise<Section[]> {
    const rows = await this.prisma.section.findMany({
      where: { moduleId },
      orderBy: { orderIndex: 'asc' },
    });
    return rows.map((row) => new Section(row));
  }

  async create(input: CreateSectionInput): Promise<Section> {
    const section = await this.prisma.section.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        orderIndex: input.orderIndex ?? 0,
        moduleId: input.moduleId,
        markdownContent: input.markdownContent ?? null,
      },
    });
    return new Section(section);
  }

  async update(id: string, input: UpdateSectionInput): Promise<Section> {
    const section = await this.prisma.section.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        orderIndex: input.orderIndex,
        markdownContent: input.markdownContent,
      },
    });
    return new Section(section);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.section.delete({ where: { id } });
  }

  async attachVideoFile(sectionId: string, videoFileId: string): Promise<Section> {
    const section = await this.prisma.section.update({
      where: { id: sectionId },
      data: { videoFileId },
    });
    return new Section(section);
  }
}

@Injectable()
export class PrismaVideoFileRepository implements IVideoFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(file: UploadedFile): Promise<VideoFile> {
    const videoFile = await this.prisma.videoFile.create({
      data: {
        storageKey: file.storageKey,
        filename: file.filename,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        durationSeconds: file.durationSeconds ?? null,
      },
    });
    return new VideoFile(videoFile);
  }

  async findById(id: string): Promise<VideoFile | null> {
    const file = await this.prisma.videoFile.findUnique({ where: { id } });
    return file ? new VideoFile(file) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.videoFile.delete({ where: { id } });
  }
}

@Injectable()
export class PrismaVideoMetadataRepository implements IVideoMetadataRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateVideoMetadataInput): Promise<VideoMetadata> {
    const meta = await this.prisma.videoMetadata.create({
      data: {
        sectionId: input.sectionId,
        difficulty: input.difficulty,
        primaryStyle: input.primaryStyle,
        videoType: input.videoType,
        durationCounts: input.durationCounts,
        steps: input.steps,
        influences: input.influences,
        tags: input.tags,
      },
    });
    return new VideoMetadata({
      ...meta,
      difficulty: meta.difficulty as Difficulty,
      primaryStyle: meta.primaryStyle as PrimaryStyle,
      videoType: meta.videoType as VideoType,
    });
  }

  async findBySectionId(sectionId: string): Promise<VideoMetadata | null> {
    const meta = await this.prisma.videoMetadata.findUnique({ where: { sectionId } });
    if (!meta) return null;
    return new VideoMetadata({
      ...meta,
      difficulty: meta.difficulty as Difficulty,
      primaryStyle: meta.primaryStyle as PrimaryStyle,
      videoType: meta.videoType as VideoType,
    });
  }
}

@Injectable()
export class PrismaCourseAccessRepository implements ICourseAccessRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndCourse(userId: string, courseId: string): Promise<CourseAccess | null> {
    const access = await this.prisma.courseAccess.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    return access ? new CourseAccess({ ...access, accessLevel: access.accessLevel as AccessLevel }) : null;
  }

  async grant(userId: string, courseId: string, level: AccessLevel): Promise<CourseAccess> {
    const access = await this.prisma.courseAccess.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, accessLevel: level },
      update: { accessLevel: level },
    });
    return new CourseAccess({ ...access, accessLevel: access.accessLevel as AccessLevel });
  }

  async findByUser(userId: string): Promise<CourseAccess[]> {
    const rows = await this.prisma.courseAccess.findMany({ where: { userId } });
    return rows.map((row) => new CourseAccess({ ...row, accessLevel: row.accessLevel as AccessLevel }));
  }
}
