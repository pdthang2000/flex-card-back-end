import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from '@prisma/client';

@Module({
  exports: [PrismaService],
  providers: [PrismaService],
})
export class PrismaModule {
  static forTest(prismaClient: PrismaClient): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: PrismaService,
          useFactory: () => prismaClient as PrismaService,
        },
      ],
      exports: [PrismaService],
    };
  }
}
