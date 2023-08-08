import { CreateCardDto } from "../../dto/create-card.dto";
import { ListCardDto } from "../../dto/list-card.dto";

export abstract class CardService {
  abstract findCardById(id: string): Promise<any>;

  abstract create(data: CreateCardDto): Promise<any>;

  abstract list(data: ListCardDto): Promise<any>;
}