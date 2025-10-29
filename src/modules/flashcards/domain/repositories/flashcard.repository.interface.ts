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

  countByUser(userId: string): Promise<number>;

  findManyByIdsAndUserKeepOrder(
    idsOrdered: string[],
    userId: string,
  ): Promise<Flashcard[]>;

  /**
   * Atlas Search over front/back with field-specific contains.
   * AND semantics when both are provided.
   */
  searchIdsByTextPaged(
    userId: string,
    params: {
      frontContains?: string;
      backContains?: string;
      skip: number;
      take: number;
      tagIds?: string[];
      mode?: 'all' | 'any';
    },
  ): Promise<{ ids: string[]; total: number }>;
}
