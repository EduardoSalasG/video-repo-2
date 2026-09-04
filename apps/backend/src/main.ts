import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'node:path';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');

  const rawCors = process.env.CORS_ORIGIN;
  const allowedOrigins = rawCors
    ? rawCors.split(',').map((o) => o.trim().replace(/\/$/, ''))
    : [];
  const allowAll = allowedOrigins.includes('*') || allowedOrigins.length === 0;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowAll || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Accept-Ranges', 'Content-Range', 'Content-Length'],
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const uploadsPath = path.resolve(process.env.VIDEO_STORAGE_LOCAL_PATH ?? 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  const config = new DocumentBuilder()
    .setTitle('Dance Platform API')
    .setDescription('Video dance learning platform')
    .setVersion('1.0.0')
    .addCookieAuth('access_token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

bootstrap();
