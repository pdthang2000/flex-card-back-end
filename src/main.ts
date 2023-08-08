import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from "dotenv";
import * as process from "process";
import { ValidationPipe } from "@nestjs/common";
config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
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
