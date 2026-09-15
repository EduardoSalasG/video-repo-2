import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { User, Course, CourseModule, Section, VideoFile, VideoMetadata, CourseAccess, UserSectionProgress } from '../../domain/entities';
import { Role, AccessLevel, Difficulty, PrimaryStyle, VideoType, LabelType } from '../../domain/enums';
import {
  IUserRepository,
  ICourseRepository,
  IModuleRepository,
  ISectionRepository,
  IVideoFileRepository,
  IVideoMetadataRepository,
  VideoSearchResult,
  IVideoLabelRepository,
  LabelWithStyles,
  VideoSearchOptions,
  ICourseAccessRepository,
  IProgressRepository,
  CreateUserInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateModuleInput,
  UpdateModuleInput,
  CreateSectionInput,
  UpdateSectionInput,
  CreateVideoMetadataInput,
  UploadedFile,
  IPrimaryStyleRepository,
  PrimaryStyleRecord,
  CreatePrimaryStyleInput,
  UpdatePrimaryStyleInput,
  IDifficultyRepository,
  DifficultyRecord,
  CreateDifficultyInput,
  UpdateDifficultyInput,
  IVideoTypeRepository,
  VideoTypeRecord,
  CreateVideoTypeInput,
  UpdateVideoTypeInput,
  ILabelTypeRepository,
  LabelTypeRecord,
  CreateLabelTypeInput,
  UpdateLabelTypeInput,
  IAccessLevelRepository,
  AccessLevelRecord,
  CreateAccessLevelInput,
  UpdateAccessLevelInput,
  IRoleRepository,
  RoleRecord,
  CreateRoleInput,
  UpdateRoleInput,
  IRolePermissionRepository,
  PermissionRecord,
  RoleGrantRow,
  RoleFlagsRow,
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

  async search(query: string): Promise<User[]> {
    const q = query.trim();
    const where: Record<string, unknown> = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
      ];
    }
    const rows = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return rows.map((row) => new User({ ...row, role: row.role as Role }));
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

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    const user = await this.prisma.user.update({ where: { id }, data: { passwordHash } });
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
      data: { name: input.name, description: input.description ?? null, imageStorageKey: input.imageStorageKey ?? null },
    });
    return new Course(course);
  }

  async update(id: string, input: UpdateCourseInput): Promise<Course> {
    const course = await this.prisma.course.update({
      where: { id },
      data: { name: input.name, description: input.description, imageStorageKey: input.imageStorageKey },
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
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((row) => new CourseModule(row));
  }

  async create(input: CreateModuleInput): Promise<CourseModule> {
    const nextIndex =
      input.orderIndex ??
      ((await this.prisma.module.aggregate({
        where: { courseId: input.courseId },
        _max: { orderIndex: true },
      }))._max.orderIndex ??
        -1) + 1;
    const module = await this.prisma.module.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        orderIndex: nextIndex,
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

  async reorder(orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.module.update({ where: { id }, data: { orderIndex: index } }),
      ),
    );
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
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
      include: { videoMetadata: true },
    });
    return rows.map(
      (row) =>
        new Section({
          ...row,
          videoMetadata: row.videoMetadata ? new VideoMetadata(row.videoMetadata) : null,
        }),
    );
  }

  async findByVideoFileId(videoFileId: string): Promise<Section | null> {
    const section = await this.prisma.section.findUnique({
      where: { videoFileId },
      include: { module: true },
    });
    return section
      ? new Section({
          ...section,
          module: new CourseModule(section.module),
        })
      : null;
  }

  async create(input: CreateSectionInput): Promise<Section> {
    const nextIndex =
      input.orderIndex ??
      ((await this.prisma.section.aggregate({
        where: { moduleId: input.moduleId },
        _max: { orderIndex: true },
      }))._max.orderIndex ??
        -1) + 1;
    const section = await this.prisma.section.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        orderIndex: nextIndex,
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

  async reorder(orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.section.update({ where: { id }, data: { orderIndex: index } }),
      ),
    );
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

  async createFromUrl(url: string): Promise<VideoFile> {
    const videoFile = await this.prisma.videoFile.create({
      data: {
        storageKey: '',
        url,
        filename: 'external',
        mimeType: 'video/mp4',
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
    const meta = await this.prisma.videoMetadata.upsert({
      where: { sectionId: input.sectionId },
      update: {
        difficulty: input.difficulty,
        primaryStyle: input.primaryStyle,
        videoType: input.videoType,
        durationCounts: input.durationCounts,
        steps: input.steps,
        influences: input.influences,
        tags: input.tags,
      },
      create: {
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

  async search(options: VideoSearchOptions): Promise<VideoSearchResult[]> {
    const where: Record<string, unknown> = {};
    if (options.style) where.primaryStyle = options.style;
    if (options.courseIds?.length) {
      where.section = { module: { courseId: { in: options.courseIds } } };
    }
    const conditions: Record<string, unknown>[] = [];
    if (options.tagNames?.length) conditions.push({ tags: { hasSome: options.tagNames } });
    if (options.stepNames?.length) conditions.push({ steps: { hasSome: options.stepNames } });
    if (conditions.length) where.OR = conditions;

    const rows = await this.prisma.videoMetadata.findMany({
      where,
      include: {
        section: {
          include: {
            module: {
              include: { course: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => ({
      course: new Course(row.section.module.course),
      module: new CourseModule(row.section.module),
      section: new Section(row.section),
      metadata: new VideoMetadata({
        ...row,
        difficulty: row.difficulty as Difficulty,
        primaryStyle: row.primaryStyle as PrimaryStyle,
        videoType: row.videoType as VideoType,
      }),
    }));
  }
}

@Injectable()
export class PrismaVideoLabelRepository implements IVideoLabelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByType(type: LabelType, query?: string, styles?: PrimaryStyle[]): Promise<string[]> {
    const rows = await this.prisma.videoLabel.findMany({
      where: {
        type,
        ...(query && { name: { contains: query, mode: 'insensitive' } }),
        ...(styles && styles.length > 0 && {
          styles: { some: { style: { in: styles } } },
        }),
      },
      select: { name: true },
      orderBy: { name: 'asc' },
      take: 100,
    });
    return rows.map((row) => row.name);
  }

  async ensureMany(type: LabelType, names: string[], styles: PrimaryStyle[] = []): Promise<void> {
    const unique = [...new Set(names.filter(Boolean))];
    if (unique.length === 0) return;

    await this.prisma.videoLabel.createMany({
      data: unique.map((name) => ({ name, type })),
      skipDuplicates: true,
    });

    if (styles.length === 0) return;

    const labels = await this.prisma.videoLabel.findMany({
      where: { type, name: { in: unique } },
      select: { id: true },
    });

    const styleData = labels.flatMap((label) =>
      styles.map((style) => ({ labelId: label.id, style })),
    );

    if (styleData.length === 0) return;
    await this.prisma.videoLabelStyle.createMany({ data: styleData, skipDuplicates: true });
  }

  async findWithStyles(type: LabelType, style?: PrimaryStyle): Promise<LabelWithStyles[]> {
    const rows = await this.prisma.videoLabel.findMany({
      where: {
        type,
        ...(style && {
          styles: { some: { style } },
        }),
      },
      include: { styles: { select: { style: true } } },
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      styles: row.styles.map((s) => s.style as PrimaryStyle),
    }));
  }

  async create(type: LabelType, name: string, styles: PrimaryStyle[]): Promise<LabelWithStyles> {
    const label = await this.prisma.videoLabel.create({
      data: {
        name,
        type,
        styles: {
          create: styles.map((style) => ({ style })),
        },
      },
      include: { styles: { select: { style: true } } },
    });
    return {
      id: label.id,
      name: label.name,
      styles: label.styles.map((s) => s.style as PrimaryStyle),
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.videoLabel.delete({ where: { id } });
  }
}

@Injectable()
export class PrismaPrimaryStyleRepository implements IPrimaryStyleRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(row: {
    value: string;
    label: string;
    orderIndex: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PrimaryStyleRecord {
    return {
      value: row.value as PrimaryStyle,
      label: row.label,
      orderIndex: row.orderIndex,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<PrimaryStyleRecord[]> {
    const rows = await this.prisma.primaryStyle.findMany({
      orderBy: [{ orderIndex: 'asc' }, { label: 'asc' }],
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findByValue(value: PrimaryStyle): Promise<PrimaryStyleRecord | null> {
    const row = await this.prisma.primaryStyle.findUnique({ where: { value } });
    return row ? this.toRecord(row) : null;
  }

  async create(input: CreatePrimaryStyleInput): Promise<PrimaryStyleRecord> {
    const row = await this.prisma.primaryStyle.create({
      data: {
        value: input.value,
        label: input.label,
        orderIndex: input.orderIndex ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return this.toRecord(row);
  }

  async update(value: PrimaryStyle, input: UpdatePrimaryStyleInput): Promise<PrimaryStyleRecord> {
    const row = await this.prisma.primaryStyle.update({
      where: { value },
      data: input,
    });
    return this.toRecord(row);
  }

  async delete(value: PrimaryStyle): Promise<void> {
    await this.prisma.primaryStyle.delete({ where: { value } });
  }
}

@Injectable()
export class PrismaDifficultyRepository implements IDifficultyRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(row: {
    value: string;
    label: string;
    orderIndex: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): DifficultyRecord {
    return {
      value: row.value as Difficulty,
      label: row.label,
      orderIndex: row.orderIndex,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<DifficultyRecord[]> {
    const rows = await this.prisma.difficulty.findMany({
      orderBy: [{ orderIndex: 'asc' }, { label: 'asc' }],
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findByValue(value: Difficulty): Promise<DifficultyRecord | null> {
    const row = await this.prisma.difficulty.findUnique({ where: { value } });
    return row ? this.toRecord(row) : null;
  }

  async create(input: CreateDifficultyInput): Promise<DifficultyRecord> {
    const row = await this.prisma.difficulty.create({
      data: {
        value: input.value,
        label: input.label,
        orderIndex: input.orderIndex ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return this.toRecord(row);
  }

  async update(value: Difficulty, input: UpdateDifficultyInput): Promise<DifficultyRecord> {
    const row = await this.prisma.difficulty.update({
      where: { value },
      data: input,
    });
    return this.toRecord(row);
  }

  async delete(value: Difficulty): Promise<void> {
    await this.prisma.difficulty.delete({ where: { value } });
  }
}

@Injectable()
export class PrismaVideoTypeRepository implements IVideoTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(row: {
    value: string;
    label: string;
    orderIndex: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): VideoTypeRecord {
    return {
      value: row.value as VideoType,
      label: row.label,
      orderIndex: row.orderIndex,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<VideoTypeRecord[]> {
    const rows = await this.prisma.videoType.findMany({
      orderBy: [{ orderIndex: 'asc' }, { label: 'asc' }],
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findByValue(value: VideoType): Promise<VideoTypeRecord | null> {
    const row = await this.prisma.videoType.findUnique({ where: { value } });
    return row ? this.toRecord(row) : null;
  }

  async create(input: CreateVideoTypeInput): Promise<VideoTypeRecord> {
    const row = await this.prisma.videoType.create({
      data: {
        value: input.value,
        label: input.label,
        orderIndex: input.orderIndex ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return this.toRecord(row);
  }

  async update(value: VideoType, input: UpdateVideoTypeInput): Promise<VideoTypeRecord> {
    const row = await this.prisma.videoType.update({
      where: { value },
      data: input,
    });
    return this.toRecord(row);
  }

  async delete(value: VideoType): Promise<void> {
    await this.prisma.videoType.delete({ where: { value } });
  }
}

@Injectable()
export class PrismaLabelTypeRepository implements ILabelTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(row: {
    value: string;
    label: string;
    orderIndex: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): LabelTypeRecord {
    return {
      value: row.value as LabelType,
      label: row.label,
      orderIndex: row.orderIndex,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<LabelTypeRecord[]> {
    const rows = await this.prisma.labelType.findMany({
      orderBy: [{ orderIndex: 'asc' }, { label: 'asc' }],
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findByValue(value: LabelType): Promise<LabelTypeRecord | null> {
    const row = await this.prisma.labelType.findUnique({ where: { value } });
    return row ? this.toRecord(row) : null;
  }

  async create(input: CreateLabelTypeInput): Promise<LabelTypeRecord> {
    const row = await this.prisma.labelType.create({
      data: {
        value: input.value,
        label: input.label,
        orderIndex: input.orderIndex ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return this.toRecord(row);
  }

  async update(value: LabelType, input: UpdateLabelTypeInput): Promise<LabelTypeRecord> {
    const row = await this.prisma.labelType.update({
      where: { value },
      data: input,
    });
    return this.toRecord(row);
  }

  async delete(value: LabelType): Promise<void> {
    await this.prisma.labelType.delete({ where: { value } });
  }
}

@Injectable()
export class PrismaAccessLevelRepository implements IAccessLevelRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(row: {
    value: string;
    label: string;
    orderIndex: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): AccessLevelRecord {
    return {
      value: row.value as AccessLevel,
      label: row.label,
      orderIndex: row.orderIndex,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<AccessLevelRecord[]> {
    const rows = await this.prisma.accessLevel.findMany({
      orderBy: [{ orderIndex: 'asc' }, { label: 'asc' }],
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findByValue(value: AccessLevel): Promise<AccessLevelRecord | null> {
    const row = await this.prisma.accessLevel.findUnique({ where: { value } });
    return row ? this.toRecord(row) : null;
  }

  async create(input: CreateAccessLevelInput): Promise<AccessLevelRecord> {
    const row = await this.prisma.accessLevel.create({
      data: {
        value: input.value,
        label: input.label,
        orderIndex: input.orderIndex ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return this.toRecord(row);
  }

  async update(value: AccessLevel, input: UpdateAccessLevelInput): Promise<AccessLevelRecord> {
    const row = await this.prisma.accessLevel.update({
      where: { value },
      data: input,
    });
    return this.toRecord(row);
  }

  async delete(value: AccessLevel): Promise<void> {
    await this.prisma.accessLevel.delete({ where: { value } });
  }
}

@Injectable()
export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(row: {
    value: string;
    label: string;
    orderIndex: number;
    isActive: boolean;
    isSuperuser: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): RoleRecord {
    return {
      value: row.value as Role,
      label: row.label,
      orderIndex: row.orderIndex,
      isActive: row.isActive,
      isSuperuser: row.isSuperuser,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAll(): Promise<RoleRecord[]> {
    const rows = await this.prisma.role.findMany({
      orderBy: [{ orderIndex: 'asc' }, { label: 'asc' }],
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findByValue(value: Role): Promise<RoleRecord | null> {
    const row = await this.prisma.role.findUnique({ where: { value } });
    return row ? this.toRecord(row) : null;
  }

  async create(input: CreateRoleInput): Promise<RoleRecord> {
    const row = await this.prisma.role.create({
      data: {
        value: input.value,
        label: input.label,
        orderIndex: input.orderIndex ?? 0,
        isActive: input.isActive ?? true,
      },
    });
    return this.toRecord(row);
  }

  async update(value: Role, input: UpdateRoleInput): Promise<RoleRecord> {
    const row = await this.prisma.role.update({
      where: { value },
      data: input,
    });
    return this.toRecord(row);
  }

  async delete(value: Role): Promise<void> {
    await this.prisma.role.delete({ where: { value } });
  }
}

@Injectable()
export class PrismaRolePermissionRepository implements IRolePermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toRecord(row: {
    value: string;
    label: string;
    category: string;
    orderIndex: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PermissionRecord {
    return {
      value: row.value,
      label: row.label,
      category: row.category,
      orderIndex: row.orderIndex,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findAllPermissions(): Promise<PermissionRecord[]> {
    const rows = await this.prisma.permission.findMany({
      orderBy: [{ orderIndex: 'asc' }, { label: 'asc' }],
    });
    return rows.map((row) => this.toRecord(row));
  }

  async findAllRoleGrants(): Promise<RoleGrantRow[]> {
    return this.prisma.rolePermission.findMany({
      select: { roleValue: true, permissionValue: true },
    });
  }

  async findAllRoleFlags(): Promise<RoleFlagsRow[]> {
    return this.prisma.role.findMany({
      select: { value: true, isActive: true, isSuperuser: true },
    });
  }

  async setRolePermissions(roleValue: Role, permissionValues: string[], isSuperuser: boolean): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleValue } }),
      this.prisma.rolePermission.createMany({
        data: permissionValues.map((permissionValue) => ({ roleValue, permissionValue })),
      }),
      this.prisma.role.update({ where: { value: roleValue }, data: { isSuperuser } }),
    ]);
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
    const rows = await this.prisma.courseAccess.findMany({
      where: { userId },
      include: { course: true },
    });
    return rows.map((row) =>
      new CourseAccess({
        ...row,
        course: row.course ? new Course(row.course) : undefined,
        accessLevel: row.accessLevel as AccessLevel,
      })
    );
  }

  async findByCourse(courseId: string): Promise<CourseAccess[]> {
    const rows = await this.prisma.courseAccess.findMany({
      where: { courseId },
      include: { course: true },
    });
    return rows.map((row) =>
      new CourseAccess({
        ...row,
        course: row.course ? new Course(row.course) : undefined,
        accessLevel: row.accessLevel as AccessLevel,
      })
    );
  }

  async revoke(userId: string, courseId: string): Promise<void> {
    await this.prisma.courseAccess.delete({
      where: { userId_courseId: { userId, courseId } },
    });
  }
}

@Injectable()
export class PrismaProgressRepository implements IProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndSection(userId: string, sectionId: string): Promise<UserSectionProgress | null> {
    const row = await this.prisma.userSectionProgress.findUnique({
      where: { userId_sectionId: { userId, sectionId } },
    });
    return row
      ? new UserSectionProgress({
          ...row,
          completedAt: row.completedAt ?? null,
        })
      : null;
  }

  async findCompletedByCourse(userId: string, courseId: string): Promise<string[]> {
    const rows = await this.prisma.userSectionProgress.findMany({
      where: {
        userId,
        completed: true,
        section: { module: { courseId } },
      },
      select: { sectionId: true },
    });
    return rows.map((r) => r.sectionId);
  }

  async markCompleted(userId: string, sectionId: string): Promise<UserSectionProgress> {
    const row = await this.prisma.userSectionProgress.upsert({
      where: { userId_sectionId: { userId, sectionId } },
      create: {
        userId,
        sectionId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });
    return new UserSectionProgress({
      ...row,
      completedAt: row.completedAt ?? null,
    });
  }
}
