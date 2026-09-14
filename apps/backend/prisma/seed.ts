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
}

main()
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
