import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Role } from '../src/domain/enums';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL ?? 'admin@dance.com';
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists');
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 12);

  await prisma.user.create({
    data: {
      email,
      username,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      passwordHash,
    },
  });

  console.log('Admin created');
}

main()
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
