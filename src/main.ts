import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { setupSwagger } from './config/swagger.config';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  app.enableCors({
    origin: 
      [
        'http://sistira.local:3000',
        'http://localhost:3000', 
        'http://127.0.0.1:3000', 
        'http://liara.picos.ifpi.edu.br', 
        'http://10.1.15.9'
      ],
    credentials: true,
  });

  app.use(cookieParser());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const prismaService = app.get(PrismaService);
  await prismaService.onModuleInit();

  setupSwagger(app);

  await app.listen(port);
  console.log(`🚀 API rodando na porta ${port}`);
}
bootstrap();
