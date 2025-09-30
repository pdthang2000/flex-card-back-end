import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception-filter.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response-interceptor.interceptor';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';
config();
@Module({
  imports: [FlashcardsModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    try {
      console.log('Connected to the database successfully!');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
    }
  }
}
