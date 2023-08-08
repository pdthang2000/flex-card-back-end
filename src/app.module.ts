import { Module, OnModuleInit } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CardModule } from "./modules/card/card.module";
import { MongooseModule } from "@nestjs/mongoose";
import { config } from "dotenv";
import * as process from "process";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { HttpExceptionFilter } from "./modules/common/filters/http-exception-filter.filter";
import { TransformResponseInterceptor } from "./modules/common/interceptors/transform-response-interceptor.interceptor";
config();
@Module({
  imports: [CardModule, MongooseModule.forRoot(process?.env?.DATABASE_URL),
  ],
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
  constructor() {}

  async onModuleInit() {
    try {
      MongooseModule.forRoot(process?.env?.DATABASE_URL);
      console.log('Connected to the database successfully!');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
    }
  }
}






