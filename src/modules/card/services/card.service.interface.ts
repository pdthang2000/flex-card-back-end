import { CreateCardDto } from "../../dto/create-card.dto";
import { ListCardDto } from "../../dto/list-card.dto";

export const CARD_SERVICE = 'CardService';

export interface CardService {
  findCardById(id: string): Promise<any>;

  create(data: CreateCardDto): Promise<any>;

  list(data: ListCardDto): Promise<any>;

  getCardsInSet(setId: string): Promise<any>;
}