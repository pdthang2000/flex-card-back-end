export abstract class CardService {
  abstract findCardById(id: string): Promise<any>;
}