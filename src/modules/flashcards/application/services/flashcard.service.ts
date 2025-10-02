import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import {
  FLASHCARD_TAG_REPOSITORY,
  FlashcardTagRepository,
} from '../../domain/repositories/flashcard-tag.repository.interface';
import { TaggingPolicy } from '../../domain/services/tagging-policy.domain-service';

@Injectable()
export class FlashcardService {
  constructor(
    @Inject(FLASHCARD_REPOSITORY)
    private readonly flashcardRepo: FlashcardRepository,
    @Inject(TAG_REPOSITORY)
    private readonly tagRepo: TagRepository,
    @Inject(FLASHCARD_TAG_REPOSITORY)
    private readonly flashcardTagRepo: FlashcardTagRepository,
  ) {}

  async assignTag(userId: string, flashcardId: string, tagId: string) {
    const card = await this.flashcardRepo.findByIdAndUser(flashcardId, userId);
    if (!card || !card.isActive())
      throw new NotFoundException('Flashcard not found');

    const tag = await this.tagRepo.findByIdAndUser(tagId, userId);
    if (!tag || !tag.isActive()) throw new NotFoundException('Tag not found');

    const alreadyLinked = await this.flashcardTagRepo.exists(
      flashcardId,
      tagId,
    );
    if (alreadyLinked) return { idempotent: true };

    const count = await this.flashcardTagRepo.countForFlashcard(flashcardId);

    // Domain policy (pure, framework-free)
    try {
      TaggingPolicy.ensureCanAssign({
        cardActive: card.isActive(),
        tagActive: tag.isActive(),
        currentTagCount: count,
      });
    } catch (e: any) {
      // Map domain error → HTTP 400
      throw new BadRequestException(e?.message ?? 'Cannot assign tag');
    }

    try {
      await this.flashcardTagRepo.add(flashcardId, tagId);
    } catch (e: any) {
      if (e?.code === 'P2002') return { idempotent: true };
      throw e;
    }
  }

  async removeTag(userId: string, flashcardId: string, tagId: string) {
    // Validate ownership for safety (prevents removing someone else’s link)
    const card = await this.flashcardRepo.findByIdAndUser(flashcardId, userId);
    if (!card) throw new NotFoundException('Flashcard not found');

    const tag = await this.tagRepo.findByIdAndUser(tagId, userId);
    if (!tag) throw new NotFoundException('Tag not found');

    try {
      TaggingPolicy.ensureCanRemove({
        cardActive: card.isActive(),
        tagActive: tag.isActive(),
      });
    } catch (e: any) {
      throw new BadRequestException(e?.message ?? 'Cannot remove tag');
    }

    await this.flashcardTagRepo.remove(flashcardId, tagId);
  }

  async softDelete(userId: string, flashcardId: string) {
    const flashcard = await this.flashcardRepo.findByIdAndUser(
      flashcardId,
      userId,
    );

    if (!flashcard) throw new NotFoundException('Flashcard not found');

    flashcard.softDelete();
    await this.flashcardRepo.update(flashcard);
    await this.flashcardTagRepo.removeAllForFlashcard(flashcardId);
    return true;
  }

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

  async list(userId: string, skip: number, take: number) {
    return this.flashcardRepo.findManyByUser(userId, skip, take);
  }

  // Add more use cases: restore, assignTag, removeTag, etc.
}
