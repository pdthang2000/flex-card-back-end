import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  FLASHCARD_REPOSITORY,
  FlashcardRepository,
} from '../../domain/repositories/flashcard.repository.interface';
import { Flashcard } from '../../domain/entities/flashcard.entity';
import { CreateFlashcardDto } from '../dto/create-flashcard.dto';
import {
  TAG_REPOSITORY,
  TagRepository,
} from '../../domain/repositories/tag.repository.interface';

@Injectable()
export class FlashcardService {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly flashcardRepo: FlashcardRepository,
    @Inject(TAG_REPOSITORY)
    private readonly tagRepo: TagRepository,
  ) {}

  async create(userId: string, dto: CreateFlashcardDto): Promise<Flashcard> {
    // (Optional) Enforce tag/card limits per user here if you want

    const now = new Date();
    const flashcard = new Flashcard(
      null,
      dto.front,
      dto.back,
      userId,
      now,
      now,
      null,
    );

    const createdFlashcard = await this.flashcardRepo.create(flashcard);

    return createdFlashcard;
  }

  async edit(userId: string, flashcardId: string, front: string, back: string) {
    const flashcard = await this.flashcardRepo.findByIdAndUser(
      flashcardId,
      userId,
    );
    if (!flashcard) throw new NotFoundException('Flashcard not found');
    flashcard.edit(front, back);
    await this.flashcardRepo.update(flashcard);
    return flashcard;
  }

  async softDelete(userId: string, flashcardId: string) {
    const flashcard = await this.flashcardRepo.findByIdAndUser(
      flashcardId,
      userId,
    );
    if (!flashcard) throw new NotFoundException('Flashcard not found');
    flashcard.softDelete();
    await this.flashcardRepo.update(flashcard);
    // Remove tag associations if needed
    // to await this.tagAssignmentRepo.removeAllForFlashcard(flashcardId);
    return true;
  }

  async list(userId: string, skip: number, take: number) {
    return this.flashcardRepo.findManyByUser(userId, skip, take);
  }

  // Add more use cases: restore, assignTag, removeTag, etc.
}
