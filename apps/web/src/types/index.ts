export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  videoUrl: string;
  content: string;
  duration?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
}

export interface Access {
  id: string;
  courseId: string;
  userId: string;
  grantedAt: string;
}

export interface VideoMetadata {
  sectionId: string;
  fileSize: number;
  mimeType: string;
  resolution: string;
  duration: number;
  posterUrl?: string;
}
