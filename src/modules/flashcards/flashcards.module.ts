import { Module } from '@nestjs/common';
import { FlashcardService } from './application/services/flashcard.service';
import { PrismaFlashcardRepository } from './infrastructure/repositories/prisma-flashcard.repository';
import { FLASHCARD_REPOSITORY } from './domain/repositories/flashcard.repository.interface';
import { TAG_REPOSITORY } from './domain/repositories/tag.repository.interface';
import { PrismaTagRepository } from './infrastructure/repositories/prisma-tag.repository';
import { FlashcardController } from './presentation/controllers/flashcard.controller';
import { PrismaModule } from '../../shared/prisma.module';
import { TagController } from './presentation/controllers/tag.controller';
import { TagService } from './application/services/tag.service';

@Module({
  imports: [PrismaModule],
  providers: [
    FlashcardService,
    TagService,
    {
      provide: FLASHCARD_REPOSITORY,
      useClass: PrismaFlashcardRepository,
    },
    {
      provide: TAG_REPOSITORY,
      useClass: PrismaTagRepository,
    },
  ],
  exports: [FlashcardService, TagService],
  controllers: [FlashcardController, TagController],
})
export class FlashcardsModule {}
