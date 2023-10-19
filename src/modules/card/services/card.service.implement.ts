import { CardService } from './card.service.interface';
import {
  CARD_REPOSITORY,
  CardRepository,
} from '../repositories/card.repository.interface';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateCardDto } from '../../dto/create-card.dto';
import { ListCardDto } from '../../dto/list-card.dto';
import { UpdateCardDto } from '../../dto/update-card.dto';
import { Card } from '@prisma/client';

@Injectable()
export class CardServiceImplement implements CardService {
  private logger = new Logger(CardServiceImplement.name);

  constructor(
    @Inject(CARD_REPOSITORY) private readonly cardRepo: CardRepository,
  ) {}

  async findCardById(id: string): Promise<any> {
    return await this.cardRepo.findCard(id);
  }

  async create(data: CreateCardDto) {
    return await this.cardRepo.create(data);
  }

  async list(data: ListCardDto): Promise<any> {
    return await this.cardRepo.list(data);
  }

  async getCardsInSet(setId: string): Promise<any> {
    return await this.cardRepo.getCardsInSet(setId);
  }

  async update(id: string, data: UpdateCardDto): Promise<Card> {
    if (!data.front && !data.back) {
      throw new BadRequestException('Missing data');
    }

    try {
      return await this.cardRepo.updateCard(id, data);
    } catch (error) {
      this.logger.error(`updateCard: id: ${id}\ndata: ${data}\n${error}`);
      throw new InternalServerErrorException(error);
    }
  }
}
