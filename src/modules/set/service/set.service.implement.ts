import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  SET_REPOSITORY,
  SetRepository,
} from '../repository/set.repository.interface';
import { SetService } from './set.service.interface';
import {
  CARD_REPOSITORY,
  CardRepository,
} from '../../card/repository/card.repository.interface';
import { ListSetDto } from '../dto/list-set.dto';
import { CreateSetDto } from '../dto/create-set.dto';
import { UpdateSetDto } from '../dto/update-set.dto';
import { Card } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { cloneDeep } from 'lodash';

@Injectable()
export class SetServiceImplement implements SetService {
  private logger = new Logger(SetServiceImplement.name);

  constructor(
    @Inject(SET_REPOSITORY) private readonly setRepo: SetRepository,
    @Inject(CARD_REPOSITORY) private readonly cardRepo: CardRepository,
    private prisma: PrismaService,
  ) {}
  assignPrisma(prisma: any) {
    this.prisma = prisma;
  }

  getPrisma(): PrismaService {
    return this.prisma;
  }

  async get(id: string): Promise<any> {
    const cards = await this.cardRepo.getCardsInSet(id);
    const set = await this.setRepo.get(id);
    return {
      ...set,
      cards,
    };
  }

  async list(data: ListSetDto): Promise<any> {
    return await this.setRepo.list(data);
  }

  async create(data: CreateSetDto): Promise<any> {
    try {
      const newSet = await this.setRepo.create(data);
      return await this.get(newSet.id);
    } catch (error) {
      this.logger.error(`create: ${error.message}`, error.stack);
      this.logger.error(`data:`, JSON.stringify(data));
      throw new InternalServerErrorException(error.stack);
    }
  }

  async update(id: string, data: UpdateSetDto): Promise<any> {
    try {
      await this.prisma.$transaction(async (transactionPrisma) => {
        const clonedCardRepo: CardRepository = cloneDeep(this.cardRepo);
        clonedCardRepo.assignPrisma(transactionPrisma);

        await this.setRepo.update(id, data);
        const cards = await clonedCardRepo.getCardsInSet(id);

        const cardIdsObj = {};
        cards.forEach((card: Card) => (cardIdsObj[card.id] = true));

        for (let i = 0; i < data.cards.length; ++i) {
          const card = data.cards[i];
          if (card?.id) {
            const updateData = {
              card,
              setCardJunction: {
                orderId: i,
              },
            };
            await clonedCardRepo.updateWithSetJunction(card.id, updateData);
            delete cardIdsObj[card.id];
          } else {
            const createData = {
              card,
              setCardJunction: {
                orderId: i,
              },
            };
            await clonedCardRepo.createWithSetJunction(id, createData);
          }
        }

        for (const key in cardIdsObj) {
          await clonedCardRepo.deleteWithSetJunction(key);
        }
      });

      return this.get(id);
    } catch (error) {
      this.logger.error(`update: ${error.message}`, error.stack);
      this.logger.error(`setId: ${id}`, JSON.stringify(data));
      throw new InternalServerErrorException(error.stack);
    }
  }

  async delete(id: string): Promise<any> {
    try {
      await this.prisma.$transaction(async (transactionPrisma) => {
        const clonedCardRepo: CardRepository = cloneDeep(this.cardRepo);
        const clonedSetRepo: SetRepository = cloneDeep(this.setRepo);
        clonedCardRepo.assignPrisma(transactionPrisma);
        clonedSetRepo.assignPrisma(transactionPrisma);

        const cards = await clonedCardRepo.getCardsInSet(id);
        const cardIds = cards.map((card: Card) => card.id);

        await clonedSetRepo.deleteJunctions(id);
        await clonedCardRepo.deleteMany(cardIds);
        await clonedSetRepo.delete(id);
      });
    } catch (error) {
      this.logger.error(`delete: ${error.message}`, error.stack);
      this.logger.error(`setId: ${id}`);
      throw new InternalServerErrorException(error.stack);
    }
  }
}
