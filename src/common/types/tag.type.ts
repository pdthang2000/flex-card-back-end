import { PaginatedResult } from './pagination-result.type';
import { Flashcard } from '../../modules/flashcards/domain/entities/flashcard.entity';
import { Tag } from '../../modules/flashcards/domain/entities/tag.entity';

export interface ListAllFlashcardsInTag extends PaginatedResult<Flashcard> {
  tag: Tag;
}
