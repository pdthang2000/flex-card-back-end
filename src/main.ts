import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from "dotenv";
import * as process from "process";
config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process?.env?.PORT || 3000;
  await app.listen(PORT, () => {
    console.log(`Nest application is running on port ${PORT}`);
  });
}
bootstrap();
