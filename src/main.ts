import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as process from 'process';
import { ValidationPipe } from '@nestjs/common';
config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', // must match frontend URL exactly
    credentials: true, // allow cookies/auth headers
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const PORT = process?.env?.PORT || 3000;
  await app.listen(PORT, () => {
    console.log(`Nest application is running on port ${PORT}`);
  });
}
bootstrap();
