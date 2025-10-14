export const FLASHCARD_TAG_REPOSITORY = 'FlashcardTagRepository';

export interface FlashcardTagRepository {
  listTagIdsForFlashcard(flashcardId: string): Promise<string[]>;

  listFlashcardIdsByTag(
    tagId: string,
    skip?: number,
    take?: number,
  ): Promise<string[]>;

  add(userId: string, flashcardId: string, tagId: string): Promise<void>;

  remove(flashcardId: string, tagId: string): Promise<void>;

  removeAllForFlashcard(flashcardId: string): Promise<void>; // used by flashcard soft-delete

  removeAllForTag(tagId: string): Promise<void>; // used by tag soft-delete (optional)

  countForFlashcard(flashcardId: string): Promise<number>;

  countByTag(tagId: string): Promise<number>;

  exists(flashcardId: string, tagId: string): Promise<boolean>;

  findFlashcardIdsByAllTagsPaged(
    userId: string,
    tagIds: string[],
    skip: number,
    take: number,
    sort?: 'link' | 'card',
  ): Promise<{ ids: string[]; total: number }>;
}
