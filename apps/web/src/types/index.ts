export type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
export type AccessLevel = 'READ' | 'WRITE' | 'MAINTAIN';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type PrimaryStyle = 'MAMBO_ON2' | 'CASINO' | 'SENSUAL_BACHATA' | 'MODERN_BACHATA';
export type VideoType = 'STEP' | 'SEQUENCE' | 'CHOREOGRAPHY';

export interface Course {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  moduleId: string;
  markdownContent: string | null;
  videoFileId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoFile {
  id: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoMetadata {
  id: string;
  sectionId: string;
  difficulty: Difficulty;
  primaryStyle: PrimaryStyle;
  videoType: VideoType;
  durationCounts: number;
  steps: string[];
  influences: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CourseAccess {
  id: string;
  userId: string;
  courseId: string;
  accessLevel: AccessLevel;
  createdAt: string;
  updatedAt: string;
}
