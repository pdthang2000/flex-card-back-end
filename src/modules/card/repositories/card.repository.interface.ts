import { CreateCardDto } from '../../dto/create-card.dto';
import { ListCardDto } from '../../dto/list-card.dto';
import { UpdateCardDto } from '../../dto/update-card.dto';
import { Card, Set } from '@prisma/client';

export const CARD_REPOSITORY = 'CardRepository';

export interface CardRepository {
  getCard(id: string): Promise<Card>;

  create(data: CreateCardDto): Promise<Card>;

  list(data: ListCardDto): Promise<any>;

  updateCard(id: string, data: UpdateCardDto): Promise<Card>;

  getCardsInSet(setId: string): Promise<any>;

  getSet(id: string): Promise<Set>;
}
