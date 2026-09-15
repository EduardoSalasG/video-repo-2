import { prisma, seedUser, SeedUser } from './seed.common';

export const devUsers: SeedUser[] = [
  {
    email: 'instructor@dance.com',
    username: 'instructor',
    firstName: 'Instructor',
    lastName: 'User',
    role: 'INSTRUCTOR',
    password: process.env.INSTRUCTOR_PASSWORD ?? 'instructor123',
  },
  {
    email: 'student@dance.com',
    username: 'student',
    firstName: 'Student',
    lastName: 'User',
    role: 'STUDENT',
    password: process.env.STUDENT_PASSWORD ?? 'student123',
  },
];

interface SeedVideo {
  url: string;
  difficulty: string;
  primaryStyle: string;
  videoType: string;
  durationCounts: number;
  steps: string[];
  influences: string[];
  tags: string[];
}

interface SeedSection {
  title: string;
  description?: string;
  markdownContent?: string;
  video?: SeedVideo;
}

interface SeedModule {
  title: string;
  description?: string;
  sections: SeedSection[];
}

interface SeedCourse {
  name: string;
  description: string;
  studentAccess?: boolean;
  modules: SeedModule[];
}

const lorem = (name: string, spec = '720p_h264_30fps_10s') => `https://lorem.video/${name}_${spec}`;

const demoCourses: SeedCourse[] = [
  {
    name: 'Mambo On2 — Fundamentos',
    description: 'Aprende la base del mambo on2: timing, paso básico y primeros giros.',
    studentAccess: true,
    modules: [
      {
        title: 'Primeros pasos',
        description: 'Timing, conteo y estructura del baile.',
        sections: [
          {
            title: 'Timing y conteo básico',
            description: 'Entiende el 1-2-3, 5-6-7 del mambo.',
            video: {
              url: lorem('bunny'),
              difficulty: 'BEGINNER',
              primaryStyle: 'MAMBO_ON2',
              videoType: 'STEP',
              durationCounts: 8,
              steps: ['Follower Right Turn'],
              influences: [],
              tags: ['timing', 'basico'],
            },
          },
          {
            title: 'Paso básico en línea',
            description: 'El paso fundamental sobre la línea de baile.',
            video: {
              url: lorem('cat'),
              difficulty: 'BEGINNER',
              primaryStyle: 'MAMBO_ON2',
              videoType: 'STEP',
              durationCounts: 8,
              steps: ['Follower Right Turn', 'Leader Left Turn'],
              influences: [],
              tags: ['basico', 'linea'],
            },
          },
          {
            title: 'Guía teórica: la clave',
            description: 'Lectura sin video sobre la estructura musical.',
            markdownContent:
              '## La clave son\n\nEl mambo se baila sobre la **clave 2-3**.\n\n- El *break* cae en el 2 y el 6.\n- Escucha la conga para ubicar el tiempo.\n\n> Tip: practica el conteo sin bailar primero.',
          },
        ],
      },
      {
        title: 'Giros fundamentales',
        description: 'Los giros esenciales del follow y el lead.',
        sections: [
          {
            title: 'Follower Right Turn',
            video: {
              url: lorem('corgi'),
              difficulty: 'BASIC',
              primaryStyle: 'MAMBO_ON2',
              videoType: 'STEP',
              durationCounts: 8,
              steps: ['Follower Right Turn', 'Cross Body Lead'],
              influences: ['Salsa Cubana'],
              tags: ['giro', 'follow'],
            },
          },
          {
            title: 'Cross Body Lead',
            video: {
              url: lorem('test'),
              difficulty: 'BASIC',
              primaryStyle: 'MAMBO_ON2',
              videoType: 'STEP',
              durationCounts: 8,
              steps: ['Cross Body Lead', 'Cross Body Lead Reverse'],
              influences: [],
              tags: ['cbl', 'lead'],
            },
          },
          {
            title: 'Combinado: básico + giro + CBL',
            video: {
              url: lorem('bunny', '720p_h264_30fps_15s'),
              difficulty: 'INTERMEDIATE',
              primaryStyle: 'MAMBO_ON2',
              videoType: 'SEQUENCE',
              durationCounts: 16,
              steps: ['Follower Right Turn', 'Cross Body Lead', 'New York Walk'],
              influences: [],
              tags: ['combo', 'social'],
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Bachata Sensual — Nivel 1',
    description: 'Base, conexión y ondas corporales para bachata sensual.',
    studentAccess: true,
    modules: [
      {
        title: 'Base y conexión',
        sections: [
          {
            title: 'Paso básico lateral',
            video: {
              url: lorem('cat', '480p_h264_30fps_10s'),
              difficulty: 'BEGINNER',
              primaryStyle: 'SENSUAL_BACHATA',
              videoType: 'STEP',
              durationCounts: 8,
              steps: ['Leader Right Turn'],
              influences: [],
              tags: ['basico'],
            },
          },
          {
            title: 'Ondas corporales',
            video: {
              url: lorem('corgi', '480p_h264_30fps_10s'),
              difficulty: 'BASIC',
              primaryStyle: 'SENSUAL_BACHATA',
              videoType: 'STEP',
              durationCounts: 8,
              steps: ['Follower Left Turn'],
              influences: ['Zouk'],
              tags: ['bodywave', 'conexion'],
            },
          },
        ],
      },
    ],
  },
  {
    name: 'Casino — Rueda básica',
    description: 'Pasos esenciales para bailar en rueda de casino.',
    studentAccess: false,
    modules: [
      {
        title: 'Pasos de rueda',
        sections: [
          {
            title: 'Enchufla',
            video: {
              url: lorem('test', '480p_h264_30fps_10s'),
              difficulty: 'BEGINNER',
              primaryStyle: 'CASINO',
              videoType: 'STEP',
              durationCounts: 8,
              steps: [],
              influences: [],
              tags: ['rueda'],
            },
          },
          {
            title: 'Dile que no',
            video: {
              url: lorem('bunny', '480p_h264_30fps_10s'),
              difficulty: 'BASIC',
              primaryStyle: 'CASINO',
              videoType: 'STEP',
              durationCounts: 8,
              steps: [],
              influences: [],
              tags: ['rueda', 'cierre'],
            },
          },
        ],
      },
    ],
  },
];

export async function seedDemoContent(): Promise<void> {
  for (const user of devUsers) {
    await seedUser(user);
  }

  const student = await prisma.user.findUnique({ where: { email: 'student@dance.com' } });
  const instructor = await prisma.user.findUnique({ where: { email: 'instructor@dance.com' } });

  for (const courseData of demoCourses) {
    const existing = await prisma.course.findUnique({ where: { name: courseData.name } });
    if (existing) {
      console.log(`Course "${courseData.name}" already exists, skipping`);
      continue;
    }

    const course = await prisma.course.create({
      data: { name: courseData.name, description: courseData.description },
    });
    console.log(`Course "${course.name}" created`);

    if (instructor) {
      await prisma.courseAccess.create({
        data: { userId: instructor.id, courseId: course.id, accessLevel: 'MAINTAIN' },
      });
    }
    if (student && courseData.studentAccess) {
      await prisma.courseAccess.create({
        data: { userId: student.id, courseId: course.id, accessLevel: 'READ' },
      });
    }

    let moduleIndex = 0;
    for (const moduleData of courseData.modules) {
      const module = await prisma.module.create({
        data: {
          title: moduleData.title,
          description: moduleData.description ?? null,
          orderIndex: moduleIndex,
          courseId: course.id,
        },
      });
      moduleIndex += 1;

      let sectionIndex = 0;
      for (const sectionData of moduleData.sections) {
        const section = await prisma.section.create({
          data: {
            title: sectionData.title,
            description: sectionData.description ?? null,
            orderIndex: sectionIndex,
            moduleId: module.id,
            markdownContent: sectionData.markdownContent ?? null,
          },
        });
        sectionIndex += 1;

        if (sectionData.video) {
          const { url, ...metadata } = sectionData.video;
          const videoFile = await prisma.videoFile.create({
            data: {
              storageKey: '',
              url,
              filename: 'external',
              mimeType: 'video/mp4',
            },
          });
          await prisma.section.update({
            where: { id: section.id },
            data: { videoFileId: videoFile.id },
          });
          await prisma.videoMetadata.upsert({
            where: { sectionId: section.id },
            update: {},
            create: { sectionId: section.id, ...metadata },
          });
        }
      }
      console.log(`  Module "${module.title}" with ${moduleData.sections.length} sections created`);
    }
  }

  // Demo progress: the student completed the first section of the first course
  if (student) {
    const firstCourse = await prisma.course.findUnique({ where: { name: demoCourses[0].name } });
    if (firstCourse) {
      const firstSection = await prisma.section.findFirst({
        where: { module: { courseId: firstCourse.id } },
        orderBy: [{ module: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
      });
      if (firstSection) {
        await prisma.userSectionProgress.upsert({
          where: { userId_sectionId: { userId: student.id, sectionId: firstSection.id } },
          update: {},
          create: {
            userId: student.id,
            sectionId: firstSection.id,
            completed: true,
            completedAt: new Date(),
          },
        });
        console.log('Student progress seeded');
      }
    }
  }
}
