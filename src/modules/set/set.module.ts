import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SET_REPOSITORY } from './repository/set.repository.interface';
import { SetRepositoryImplement } from './repository/set.repository.implement';
import { SET_SERVICE } from './service/set.service.interface';
import { SetServiceImplement } from './service/set.service.implement';
import { SetController } from './set.controller';
import { CARD_REPOSITORY } from '../card/repository/card.repository.interface';
import { CardRepositoryImplement } from '../card/repository/card.repository.implement';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: SET_REPOSITORY, useClass: SetRepositoryImplement },
    { provide: CARD_REPOSITORY, useClass: CardRepositoryImplement },
    { provide: SET_SERVICE, useClass: SetServiceImplement },
  ],
  exports: [SET_REPOSITORY, SET_SERVICE],
  controllers: [SetController],
})
export class SetModule {}
