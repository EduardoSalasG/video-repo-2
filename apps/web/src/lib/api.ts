import type {
  Course,
  CourseModule,
  Section,
  VideoFile,
  VideoMetadata,
  User,
  CourseAccess,
  VideoSearchResult,
} from '../types';

import { ApiError } from './error';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

export { ApiError } from './error';

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    throw new ApiError(401, null, 'No autenticado');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data, data.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: isFormData ? (body as FormData) : body === undefined ? undefined : JSON.stringify(body),
  });

  return handleResponse<T>(res);
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<unknown>('DELETE', path),

  login: (email: string, password: string) =>
    request<{ id: string; email: string; role: string }>('POST', '/auth/login', { email, password }),

  register: (data: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: string;
  }) => request<User>('POST', '/auth/register', data),

  logout: () => request<{ ok: boolean }>('POST', '/auth/logout'),

  me: () => request<{ userId: string; email: string; role: string }>('GET', '/auth/me'),

  getCourses: () => request<Course[]>('GET', '/courses'),
  getCourse: (courseId: string) => request<Course>('GET', `/courses/${courseId}`),
  createCourse: (data: { name: string; description?: string }) =>
    request<Course>('POST', '/courses', data),
  updateCourse: (courseId: string, data: { name?: string; description?: string }) =>
    request<Course>('PATCH', `/courses/${courseId}`, data),
  deleteCourse: (courseId: string) => request<void>('DELETE', `/courses/${courseId}`),

  getModules: (courseId: string) => request<CourseModule[]>('GET', `/courses/${courseId}/modules`),
  createModule: (courseId: string, data: { title: string; description?: string; orderIndex?: number }) =>
    request<CourseModule>('POST', `/courses/${courseId}/modules`, data),

  getModule: (moduleId: string) => request<CourseModule>('GET', `/modules/${moduleId}`),
  updateModule: (moduleId: string, data: { title?: string; description?: string; orderIndex?: number }) =>
    request<CourseModule>('PATCH', `/modules/${moduleId}`, data),
  deleteModule: (moduleId: string) => request<void>('DELETE', `/modules/${moduleId}`),

  getSections: (moduleId: string) => request<Section[]>('GET', `/modules/${moduleId}/sections`),
  createSection: (moduleId: string, data: { title: string; description?: string; orderIndex?: number; markdownContent?: string }) =>
    request<Section>('POST', `/modules/${moduleId}/sections`, data),

  getSection: (sectionId: string) => request<Section>('GET', `/sections/${sectionId}`),
  updateSection: (sectionId: string, data: { title?: string; description?: string; orderIndex?: number; markdownContent?: string }) =>
    request<Section>('PATCH', `/sections/${sectionId}`, data),
  deleteSection: (sectionId: string) => request<void>('DELETE', `/sections/${sectionId}`),

  getVideoUrl: (videoFileId: string) => request<{ url: string }>('GET', `/video-files/${videoFileId}`),

  uploadVideo: (
    sectionId: string,
    file: File,
    metadata: Omit<VideoMetadata, 'id' | 'sectionId' | 'createdAt' | 'updatedAt'>,
  ) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('metadata', JSON.stringify(metadata));
    return request<{ videoFile: VideoFile; videoMetadata: VideoMetadata }>(
      'POST',
      `/sections/${sectionId}/videos`,
      formData,
      true,
    );
  },

  attachVideoLink: (
    sectionId: string,
    url: string,
    metadata: Omit<VideoMetadata, 'id' | 'sectionId' | 'createdAt' | 'updatedAt'>,
  ) =>
    request<{ videoFile: VideoFile; videoMetadata: VideoMetadata }>('POST', `/sections/${sectionId}/videos/link`, {
      url,
      metadata,
    }),

  searchUsers: (q: string) => request<User[]>('GET', `/users?q=${encodeURIComponent(q)}`),

  getUser: (id: string) => request<User>('GET', `/users/${id}`),
  getUserAccesses: (id: string) => request<CourseAccess[]>('GET', `/users/${id}/accesses`),
  updateUserRole: (id: string, role: string) =>
    request<User>('PATCH', `/users/${id}/role`, { role }),
  revokeAccess: (userId: string, courseId: string) =>
    request<void>('DELETE', `/users/${userId}/accesses/${courseId}`),

  grantAccess: (courseId: string, data: { userId: string; courseId: string }) =>
    request<{ ok: boolean }>('POST', `/courses/${courseId}/access`, data),

  getAccesses: (_courseId?: string) => {
    void _courseId;
    return Promise.resolve([] as CourseAccess[]);
  },

  searchVideos: (tags: string[]) =>
    request<{ results: VideoSearchResult[] }>(
      'GET',
      `/videos/search?tags=${encodeURIComponent(tags.join(','))}`,
    ).then((data) => data.results),
};
