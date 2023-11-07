import { Inject, Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class SetServiceImplement implements SetService {
  private logger = new Logger(SetServiceImplement.name);

  constructor(
    @Inject(SET_REPOSITORY) private readonly setRepo: SetRepository,
    @Inject(CARD_REPOSITORY) private readonly cardRepo: CardRepository,
  ) {}

  async get(id: string): Promise<any> {
    // const delay = (ms: number) =>
    //   new Promise((resolve) => setTimeout(resolve, ms));
    // await delay(2000);
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
      this.logger.error(`Failed to create set:\n${data}\n${error}`);
    }
  }

  async update(id: string, data: UpdateSetDto): Promise<any> {
    await this.setRepo.update(id, data);
    const cards = await this.cardRepo.getCardsInSet(id);

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
        await this.cardRepo.updateWithSetJunction(card.id, updateData);
        delete cardIdsObj[card.id];
      } else {
        const createData = {
          card,
          setCardJunction: {
            orderId: i,
          },
        };
        await this.cardRepo.createWithSetJunction(id, createData);
      }
    }
    // TODO: Delete redundant cards
    // Get all cardIds in set
    // Update cards which have id
    // Create cards which don't have id
    // Delete cards don't existed
  }
}
