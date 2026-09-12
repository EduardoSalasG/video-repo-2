import { User, Course, CourseModule, Section, VideoFile, VideoMetadata, CourseAccess, UserSectionProgress } from '../../domain/entities';
import { AccessLevel, Difficulty, PrimaryStyle, Role, VideoType, LabelType } from '../../domain/enums';

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
  imageStorageKey?: string;
}

export interface UpdateCourseInput {
  name?: string;
  description?: string;
  imageStorageKey?: string;
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
  updatePassword(id: string, passwordHash: string): Promise<User>;
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
  findByVideoFileId(videoFileId: string): Promise<Section | null>;
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

export interface VideoSearchOptions {
  courseIds?: string[];
  style?: PrimaryStyle;
  tagNames?: string[];
  stepNames?: string[];
}

export interface IVideoMetadataRepository {
  create(input: CreateVideoMetadataInput): Promise<VideoMetadata>;
  findBySectionId(sectionId: string): Promise<VideoMetadata | null>;
  search(options: VideoSearchOptions): Promise<VideoSearchResult[]>;
}

export interface LabelWithStyles {
  id: string;
  name: string;
  styles: PrimaryStyle[];
}

export interface IVideoLabelRepository {
  findByType(type: LabelType, query?: string, styles?: PrimaryStyle[]): Promise<string[]>;
  ensureMany(type: LabelType, names: string[], styles?: PrimaryStyle[]): Promise<void>;
  findWithStyles(type: LabelType, style?: PrimaryStyle): Promise<LabelWithStyles[]>;
  create(type: LabelType, name: string, styles: PrimaryStyle[]): Promise<LabelWithStyles>;
  delete(id: string): Promise<void>;
}

export interface ICourseAccessRepository {
  findByUserAndCourse(userId: string, courseId: string): Promise<CourseAccess | null>;
  grant(userId: string, courseId: string, level: AccessLevel): Promise<CourseAccess>;
  findByUser(userId: string): Promise<CourseAccess[]>;
  findByCourse(courseId: string): Promise<CourseAccess[]>;
  revoke(userId: string, courseId: string): Promise<void>;
}

export interface PrimaryStyleRecord {
  value: PrimaryStyle;
  label: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePrimaryStyleInput {
  value: PrimaryStyle;
  label: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface UpdatePrimaryStyleInput {
  label?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface IPrimaryStyleRepository {
  findAll(): Promise<PrimaryStyleRecord[]>;
  findByValue(value: PrimaryStyle): Promise<PrimaryStyleRecord | null>;
  create(input: CreatePrimaryStyleInput): Promise<PrimaryStyleRecord>;
  update(value: PrimaryStyle, input: UpdatePrimaryStyleInput): Promise<PrimaryStyleRecord>;
  delete(value: PrimaryStyle): Promise<void>;
}

export interface DifficultyRecord {
  value: Difficulty;
  label: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDifficultyInput {
  value: Difficulty;
  label: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface UpdateDifficultyInput {
  label?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface IDifficultyRepository {
  findAll(): Promise<DifficultyRecord[]>;
  findByValue(value: Difficulty): Promise<DifficultyRecord | null>;
  create(input: CreateDifficultyInput): Promise<DifficultyRecord>;
  update(value: Difficulty, input: UpdateDifficultyInput): Promise<DifficultyRecord>;
  delete(value: Difficulty): Promise<void>;
}

export interface VideoTypeRecord {
  value: VideoType;
  label: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVideoTypeInput {
  value: VideoType;
  label: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface UpdateVideoTypeInput {
  label?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface IVideoTypeRepository {
  findAll(): Promise<VideoTypeRecord[]>;
  findByValue(value: VideoType): Promise<VideoTypeRecord | null>;
  create(input: CreateVideoTypeInput): Promise<VideoTypeRecord>;
  update(value: VideoType, input: UpdateVideoTypeInput): Promise<VideoTypeRecord>;
  delete(value: VideoType): Promise<void>;
}

export interface LabelTypeRecord {
  value: LabelType;
  label: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLabelTypeInput {
  value: LabelType;
  label: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface UpdateLabelTypeInput {
  label?: string;
  orderIndex?: number;
  isActive?: boolean;
}

export interface ILabelTypeRepository {
  findAll(): Promise<LabelTypeRecord[]>;
  findByValue(value: LabelType): Promise<LabelTypeRecord | null>;
  create(input: CreateLabelTypeInput): Promise<LabelTypeRecord>;
  update(value: LabelType, input: UpdateLabelTypeInput): Promise<LabelTypeRecord>;
  delete(value: LabelType): Promise<void>;
}

export interface IProgressRepository {
  findByUserAndSection(userId: string, sectionId: string): Promise<UserSectionProgress | null>;
  findCompletedByCourse(userId: string, courseId: string): Promise<string[]>;
  markCompleted(userId: string, sectionId: string): Promise<UserSectionProgress>;
}

export interface IVideoStorage {
  upload(file: StorageFile, folder?: string): Promise<UploadedFile>;
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
