import { User, Course, CourseModule, Section, VideoFile, VideoMetadata, CourseAccess } from '../../domain/entities';
import { AccessLevel, Difficulty, PrimaryStyle, Role, VideoType } from '../../domain/enums';

export interface CreateUserInput {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: Role;
}

export interface CreateCourseInput {
  name: string;
  description?: string;
}

export interface UpdateCourseInput {
  name?: string;
  description?: string;
}

export interface CreateModuleInput {
  title: string;
  description?: string;
  orderIndex?: number;
  courseId: string;
}

export interface UpdateModuleInput {
  title?: string;
  description?: string;
  orderIndex?: number;
}

export interface CreateSectionInput {
  title: string;
  description?: string;
  orderIndex?: number;
  markdownContent?: string;
  moduleId: string;
}

export interface UpdateSectionInput {
  title?: string;
  description?: string;
  orderIndex?: number;
  markdownContent?: string;
}

export interface CreateVideoMetadataInput {
  sectionId: string;
  difficulty: Difficulty;
  primaryStyle: PrimaryStyle;
  videoType: VideoType;
  durationCounts: number;
  steps: string[];
  influences: string[];
  tags: string[];
}

export interface StorageFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface UploadedFile {
  storageKey: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  durationSeconds?: number;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  search(query: string): Promise<User[]>;
  create(input: CreateUserInput, passwordHash: string): Promise<User>;
  updateRole(id: string, role: Role): Promise<User>;
}

export interface ICourseRepository {
  findAll(): Promise<Course[]>;
  findById(id: string): Promise<Course | null>;
  findByName(name: string): Promise<Course | null>;
  create(input: CreateCourseInput): Promise<Course>;
  update(id: string, input: UpdateCourseInput): Promise<Course>;
  delete(id: string): Promise<void>;
}

export interface IModuleRepository {
  findById(id: string): Promise<CourseModule | null>;
  findByCourseId(courseId: string): Promise<CourseModule[]>;
  create(input: CreateModuleInput): Promise<CourseModule>;
  update(id: string, input: UpdateModuleInput): Promise<CourseModule>;
  delete(id: string): Promise<void>;
}

export interface ISectionRepository {
  findById(id: string): Promise<Section | null>;
  findByModuleId(moduleId: string): Promise<Section[]>;
  create(input: CreateSectionInput): Promise<Section>;
  update(id: string, input: UpdateSectionInput): Promise<Section>;
  delete(id: string): Promise<void>;
  attachVideoFile(sectionId: string, videoFileId: string): Promise<Section>;
}

export interface IVideoFileRepository {
  create(file: UploadedFile): Promise<VideoFile>;
  createFromUrl(url: string): Promise<VideoFile>;
  findById(id: string): Promise<VideoFile | null>;
  delete(id: string): Promise<void>;
}

export interface VideoSearchResult {
  course: Course;
  module: CourseModule;
  section: Section;
  metadata: VideoMetadata;
}

export interface IVideoMetadataRepository {
  create(input: CreateVideoMetadataInput): Promise<VideoMetadata>;
  findBySectionId(sectionId: string): Promise<VideoMetadata | null>;
  findByTags(tags: string[]): Promise<VideoSearchResult[]>;
}

export interface ICourseAccessRepository {
  findByUserAndCourse(userId: string, courseId: string): Promise<CourseAccess | null>;
  grant(userId: string, courseId: string, level: AccessLevel): Promise<CourseAccess>;
  findByUser(userId: string): Promise<CourseAccess[]>;
  findByCourse(courseId: string): Promise<CourseAccess[]>;
  revoke(userId: string, courseId: string): Promise<void>;
}

export interface IVideoStorage {
  upload(file: StorageFile): Promise<UploadedFile>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface ITokenService {
  sign(payload: TokenPayload): string;
}
