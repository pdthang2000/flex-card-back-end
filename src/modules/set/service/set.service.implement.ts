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
}
