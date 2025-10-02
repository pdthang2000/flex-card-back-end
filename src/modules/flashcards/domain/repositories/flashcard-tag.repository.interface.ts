export const FLASHCARD_TAG_REPOSITORY = 'FlashcardTagRepository';

export interface FlashcardTagRepository {
  add(flashcardId: string, tagId: string): Promise<void>; // id pair created (unique)

  remove(flashcardId: string, tagId: string): Promise<void>; // id pair deleted

  removeAllForFlashcard(flashcardId: string): Promise<void>; // used by flashcard soft-delete

  removeAllForTag(tagId: string): Promise<void>; // used by tag soft-delete (optional)

  countForFlashcard(flashcardId: string): Promise<number>;

  exists(flashcardId: string, tagId: string): Promise<boolean>;

  listTagIdsForFlashcard(flashcardId: string): Promise<string[]>; // for display/restore

  listFlashcardIdsByTag(
    tagId: string,
    skip?: number,
    take?: number,
  ): Promise<string[]>; // reverse lookup
}
