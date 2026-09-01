import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    this.runMigrations();
    await this.$connect();
    await this.seedIfEmpty();
  }

  private runMigrations(): void {
    const backendRoot = resolve(dirname(__dirname), '..', '..');
    this.logger.log(`Running Prisma migrations from ${backendRoot}`);
    try {
      execSync('npx prisma migrate deploy', {
        cwd: backendRoot,
        stdio: 'inherit',
      });
      this.logger.log('Migrations applied successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Migration failed: ${message}`);
      throw error;
    }
  }

  private async seedIfEmpty(): Promise<void> {
    try {
      const count = await this.user.count();
      if (count === 0) {
        this.logger.log('Database is empty, running seed...');
        const backendRoot = resolve(dirname(__dirname), '..', '..');
        execSync('npx prisma db seed', {
          cwd: backendRoot,
          stdio: 'inherit',
        });
        this.logger.log('Seed completed');
      } else {
        this.logger.log(`Database already has ${count} user(s), skipping seed`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Seed failed: ${message}`);
      throw error;
    }
  }
}
