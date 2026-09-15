// Development seed: base platform data + test users + demo content
// Production uses prisma/seed.prod.ts (base data only)
import { prisma, seedBase } from './seed.common';
import { seedDemoContent } from './seed.demo';

async function main(): Promise<void> {
  await seedBase();
  await seedDemoContent();
}

main()
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
