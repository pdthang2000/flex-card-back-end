import { Flashcard } from '../entities/flashcard.entity';

export const FLASHCARD_REPOSITORY = 'FlashcardRepository';

export interface FlashcardRepository {
  findByIdAndUser(id: string, userId: string): Promise<Flashcard | null>;
  create(flashcard: Flashcard): Promise<Flashcard>;
  update(flashcard: Flashcard): Promise<void>;
  // Add more as needed (delete, list, etc.)
}
