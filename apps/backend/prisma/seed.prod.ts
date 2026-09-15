// Production seed: base platform data only (roles, admin, params, permissions, steps)
import { prisma, seedBase } from './seed.common';

seedBase()
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
