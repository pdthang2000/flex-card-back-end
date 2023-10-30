import { CreateCardDto } from '../dto/create-card.dto';
import { ListCardDto } from '../dto/list-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { Card } from '@prisma/client';

export const CARD_SERVICE = 'CardService';

export interface CardService {
  get(id: string): Promise<any>;

  create(data: CreateCardDto): Promise<any>;

  list(data: ListCardDto): Promise<any>;

  update(id: string, data: UpdateCardDto): Promise<Card>;

  getCardsInSet(setId: string): Promise<any>;
}
