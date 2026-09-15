import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const defaultRoles: Record<string, string> = {
  ADMIN: 'Admin',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Estudiante',
};

const defaultPrimaryStyles: Record<string, string> = {
  MAMBO_ON2: 'Mambo',
  CASINO: 'Casino',
  SENSUAL_BACHATA: 'Bachata Sensual',
  MODERN_BACHATA: 'Bachata Moderna',
};

const defaultDifficulties: Record<string, string> = {
  BEGINNER: 'Principiante',
  BASIC: 'Básico',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
};

const defaultVideoTypes: Record<string, string> = {
  STEP: 'Paso',
  SEQUENCE: 'Secuencia',
  CHOREOGRAPHY: 'Coreografía',
};

const defaultLabelTypes: Record<string, string> = {
  STEP: 'Paso',
  INFLUENCE: 'Influencia',
  TAG: 'Tag',
};

const defaultAccessLevels: Record<string, string> = {
  READ: 'Lectura',
  WRITE: 'Escritura',
  MAINTAIN: 'Mantener',
};

const defaultPermissions: { value: string; label: string; category: string }[] = [
  { value: 'admin.panel.access', label: 'Acceder al panel de administración', category: 'Panel' },
  { value: 'admin.dashboard.view', label: 'Ver dashboard', category: 'Panel' },
  { value: 'admin.users.view', label: 'Ver usuarios', category: 'Usuarios' },
  { value: 'admin.users.manage', label: 'Gestionar usuarios y roles', category: 'Usuarios' },
  { value: 'admin.params.manage', label: 'Gestionar parámetros', category: 'Parámetros' },
  { value: 'admin.roles.manage', label: 'Gestionar roles y permisos', category: 'Parámetros' },
  { value: 'content.courses.manage', label: 'Crear y editar cursos', category: 'Contenido' },
  { value: 'content.access.manage', label: 'Otorgar acceso a cursos', category: 'Contenido' },
  { value: 'content.labels.manage', label: 'Gestionar pasos y etiquetas', category: 'Contenido' },
];

const defaultRolePermissions: Record<string, string[]> = {
  ADMIN: defaultPermissions.map((p) => p.value),
  INSTRUCTOR: [
    'admin.panel.access',
    'admin.dashboard.view',
    'admin.users.view',
    'admin.params.manage',
    'content.courses.manage',
    'content.access.manage',
    'content.labels.manage',
  ],
  STUDENT: [],
};

interface SeedUser {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
}

const defaultUsers: SeedUser[] = [
  {
    email: 'admin@dance.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    password: process.env.ADMIN_PASSWORD ?? 'admin123',
  },
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

const baseSteps = [
  'Follower Right Turn',
  'Follower Left Turn',
  'Leader Right Turn',
  'Leader Left Turn',
];

const mamboExtraSteps = ['Cross Body Lead', 'New York Walk', 'Cross Body Lead Reverse'];

const defaultStepsByStyle: Record<string, string[]> = {
  MAMBO_ON2: [...baseSteps, ...mamboExtraSteps],
  SENSUAL_BACHATA: [...baseSteps],
  MODERN_BACHATA: [...baseSteps],
  CASINO: [],
};

async function seedRoles(): Promise<void> {
  let orderIndex = 0;
  for (const [value, label] of Object.entries(defaultRoles)) {
    await prisma.role.upsert({
      where: { value },
      update: {},
      create: { value, label, orderIndex, isActive: true },
    });
    orderIndex += 1;
    console.log(`Role ${value} seeded`);
  }
}

async function seedUsers(): Promise<void> {
  for (const user of defaultUsers) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      console.log(`User ${user.email} already exists`);
      continue;
    }

    const passwordHash = bcrypt.hashSync(user.password, 12);
    await prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        passwordHash,
      },
    });
    console.log(`User ${user.email} created`);
  }
}

async function seedPrimaryStyles(): Promise<void> {
  for (const [value, label] of Object.entries(defaultPrimaryStyles)) {
    await prisma.primaryStyle.upsert({
      where: { value },
      update: {},
      create: { value, label, orderIndex: 0, isActive: true },
    });
    console.log(`Primary style ${value} seeded`);
  }
}

async function seedDifficulties(): Promise<void> {
  let orderIndex = 0;
  for (const [value, label] of Object.entries(defaultDifficulties)) {
    await prisma.difficulty.upsert({
      where: { value },
      update: {},
      create: { value, label, orderIndex, isActive: true },
    });
    orderIndex += 1;
    console.log(`Difficulty ${value} seeded`);
  }
}

async function seedVideoTypes(): Promise<void> {
  let orderIndex = 0;
  for (const [value, label] of Object.entries(defaultVideoTypes)) {
    await prisma.videoType.upsert({
      where: { value },
      update: {},
      create: { value, label, orderIndex, isActive: true },
    });
    orderIndex += 1;
    console.log(`Video type ${value} seeded`);
  }
}

async function seedLabelTypes(): Promise<void> {
  let orderIndex = 0;
  for (const [value, label] of Object.entries(defaultLabelTypes)) {
    await prisma.labelType.upsert({
      where: { value },
      update: {},
      create: { value, label, orderIndex, isActive: true },
    });
    orderIndex += 1;
    console.log(`Label type ${value} seeded`);
  }
}

async function seedAccessLevels(): Promise<void> {
  let orderIndex = 0;
  for (const [value, label] of Object.entries(defaultAccessLevels)) {
    await prisma.accessLevel.upsert({
      where: { value },
      update: {},
      create: { value, label, orderIndex, isActive: true },
    });
    orderIndex += 1;
    console.log(`Access level ${value} seeded`);
  }
}

async function seedPermissions(): Promise<void> {
  let orderIndex = 0;
  for (const permission of defaultPermissions) {
    await prisma.permission.upsert({
      where: { value: permission.value },
      update: {},
      create: { ...permission, orderIndex, isActive: true },
    });
    orderIndex += 1;
    console.log(`Permission ${permission.value} seeded`);
  }

  await prisma.role.update({
    where: { value: 'ADMIN' },
    data: { isSuperuser: true },
  });
  console.log('Role ADMIN marked as superuser');

  for (const [roleValue, permissions] of Object.entries(defaultRolePermissions)) {
    if (permissions.length === 0) continue;
    await prisma.rolePermission.createMany({
      data: permissions.map((permissionValue) => ({ roleValue, permissionValue })),
      skipDuplicates: true,
    });
    console.log(`Role ${roleValue} permissions seeded`);
  }
}

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

async function seedDemoContent(): Promise<void> {
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

async function seedSteps(): Promise<void> {
  const styleData: { labelId: string; style: string }[] = [];
  for (const [style, steps] of Object.entries(defaultStepsByStyle)) {
    for (const step of steps) {
      const label = await prisma.videoLabel.upsert({
        where: { name_type: { name: step, type: 'STEP' } },
        update: {},
        create: { name: step, type: 'STEP' },
      });

      styleData.push({ labelId: label.id, style });
      console.log(`Step "${step}" for ${style} seeded`);
    }
  }

  if (styleData.length > 0) {
    await prisma.videoLabelStyle.createMany({
      data: styleData,
      skipDuplicates: true,
    });
  }
}

async function main(): Promise<void> {
  await seedRoles();
  await seedUsers();
  await seedPrimaryStyles();
  await seedDifficulties();
  await seedVideoTypes();
  await seedLabelTypes();
  await seedAccessLevels();
  await seedPermissions();
  await seedSteps();

  const isProduction = process.env.NODE_ENV === 'production';
  const demoEnabled = process.env.SEED_DEMO_CONTENT !== 'false';
  if (!isProduction && demoEnabled) {
    await seedDemoContent();
  }
}

main()
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
