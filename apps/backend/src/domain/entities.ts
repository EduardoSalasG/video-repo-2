import { Role, AccessLevel, Difficulty, PrimaryStyle, VideoType } from './enums';

export class User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

export class Course {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Course>) {
    Object.assign(this, partial);
  }
}

export class CourseModule {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CourseModule>) {
    Object.assign(this, partial);
  }
}

export class Section {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  moduleId: string;
  markdownContent: string | null;
  videoFileId: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Section>) {
    Object.assign(this, partial);
  }
}

export class VideoFile {
  id: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  fileSize: number | null;
  durationSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<VideoFile>) {
    Object.assign(this, partial);
  }
}

export class VideoMetadata {
  id: string;
  sectionId: string;
  difficulty: Difficulty;
  primaryStyle: PrimaryStyle;
  videoType: VideoType;
  durationCounts: number;
  steps: string[];
  influences: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<VideoMetadata>) {
    Object.assign(this, partial);
  }
}

export class CourseAccess {
  id: string;
  userId: string;
  courseId: string;
  accessLevel: AccessLevel;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<CourseAccess>) {
    Object.assign(this, partial);
  }
}
