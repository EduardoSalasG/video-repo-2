import { PrismaClient, Role, LabelType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

interface SeedUser {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  password: string;
}

const defaultUsers: SeedUser[] = [
  {
    email: 'admin@dance.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: Role.ADMIN,
    password: process.env.ADMIN_PASSWORD ?? 'admin123',
  },
  {
    email: 'instructor@dance.com',
    username: 'instructor',
    firstName: 'Instructor',
    lastName: 'User',
    role: Role.INSTRUCTOR,
    password: process.env.INSTRUCTOR_PASSWORD ?? 'instructor123',
  },
  {
    email: 'student@dance.com',
    username: 'student',
    firstName: 'Student',
    lastName: 'User',
    role: Role.STUDENT,
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

async function seedSteps(): Promise<void> {
  const styleData: { labelId: string; style: string }[] = [];
  for (const [style, steps] of Object.entries(defaultStepsByStyle)) {
    for (const step of steps) {
      const label = await prisma.videoLabel.upsert({
        where: { name_type: { name: step, type: LabelType.STEP } },
        update: {},
        create: { name: step, type: LabelType.STEP },
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
  await seedUsers();
  await seedPrimaryStyles();
  await seedDifficulties();
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
