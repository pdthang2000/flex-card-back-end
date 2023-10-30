import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CardController } from './card.controller';
import { CardServiceImplement } from './service/card.service.implement';
import { CardRepositoryImplement } from './repository/card.repository.implement';
import { CARD_SERVICE } from './service/card.service.interface';
import { CARD_REPOSITORY } from './repository/card.repository.interface';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: CARD_REPOSITORY, useClass: CardRepositoryImplement },
    { provide: CARD_SERVICE, useClass: CardServiceImplement },
  ],
  exports: [CARD_REPOSITORY, CARD_SERVICE],
  controllers: [CardController],
})
export class CardModule {}
