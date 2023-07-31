export abstract class CardRepository {
  abstract findCardById(id: string): Promise<any>;
}