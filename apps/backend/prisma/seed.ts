import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Role } from '../src/domain/enums';

const prisma = new PrismaClient();

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

async function main(): Promise<void> {
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

main()
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
