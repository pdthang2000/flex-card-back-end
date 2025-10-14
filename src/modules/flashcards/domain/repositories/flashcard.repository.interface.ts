import { Flashcard } from '../entities/flashcard.entity';

export const FLASHCARD_REPOSITORY = 'FlashcardRepository';

export interface FlashcardRepository {
  findByIdAndUser(id: string, userId: string): Promise<Flashcard | null>;

  findManyByUser(
    userId: string,
    skip: number,
    take: number,
  ): Promise<Flashcard[]>;

  findManyByIdsAndUser(ids: string[], userId: string): Promise<Flashcard[]>;

  create(flashcard: Flashcard): Promise<Flashcard>;

  update(flashcard: Flashcard): Promise<void>;

  count(): Promise<number>;

  findManyByIdsAndUserKeepOrder(
    idsOrdered: string[],
    userId: string,
  ): Promise<Flashcard[]>;
}
