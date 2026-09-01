import type { Course, User, Access } from '../types';

export const MOCK_COURSES: Course[] = [
  {
    id: 'ballet-basico',
    title: 'Ballet Básico',
    description: 'Fundamentos de ballet para principiantes.',
    thumbnail: '/icon.svg',
    modules: [
      {
        id: 'intro-ballet',
        title: 'Introducción',
        sections: [
          {
            id: 'presentacion-ballet',
            title: 'Presentación',
            videoUrl:
              'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            content:
              '# Bienvenida al curso\nAprenderás postura, pies y brazos básicos.',
          },
        ],
      },
    ],
  },
  {
    id: 'salsa-1',
    title: 'Salsa Nivel 1',
    description: 'Ritmo, pasos básicos y giros.',
    thumbnail: '/icon.svg',
    modules: [
      {
        id: 'ritmo-salsa',
        title: 'Ritmo',
        sections: [
          {
            id: 'contar-ocho',
            title: 'Contar ocho tiempos',
            videoUrl:
              'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            content:
              '## Contar la música\n1. Encuentra el golpe.\n2. Cuenta hasta ocho.',
          },
        ],
      },
    ],
  },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'student@example.com', name: 'Ana', role: 'student' },
  { id: 'u2', email: 'admin@example.com', name: 'Luis', role: 'admin' },
];

export const MOCK_ACCESSES: Access[] = [
  {
    id: 'a1',
    userId: 'u1',
    courseId: 'ballet-basico',
    grantedAt: new Date().toISOString(),
  },
];
