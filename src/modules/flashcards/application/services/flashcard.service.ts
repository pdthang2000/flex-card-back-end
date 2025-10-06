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
import { normalizePagination } from '../../../../common/utils/pagination.helper';
import { ListAllFlashcardsInTag } from '../../../../common/types/tag.type';
import { PaginatedResult } from '../../../../common/types/pagination-result.type';

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

  async assignTag(
    userId: string,
    flashcardId: string,
    tagId: string,
  ): Promise<void> {
    const card = await this.flashcardRepo.findByIdAndUser(flashcardId, userId);
    if (!card || !card.isActive())
      throw new NotFoundException('Flashcard not found');

    const tag = await this.tagRepo.findByIdAndUser(tagId, userId);
    if (!tag || !tag.isActive()) throw new NotFoundException('Tag not found');

    const alreadyLinked = await this.flashcardTagRepo.exists(
      flashcardId,
      tagId,
    );
    if (alreadyLinked) {
      // Could add log for { idempotent: true };
      return;
    }

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
      if (e?.code === 'P2002') {
        // Could add log for return { idempotent: true };
        return;
      }
      throw e;
    }
  }

  async removeTag(
    userId: string,
    flashcardId: string,
    tagId: string,
  ): Promise<void> {
    // Validate ownership for safety (prevents removing someone else’s link)
    const card = await this.flashcardRepo.findByIdAndUser(flashcardId, userId);
    if (!card) throw new NotFoundException('Flashcard not found');

    const tag = await this.tagRepo.findByIdAndUser(tagId, userId);
    if (!tag) throw new NotFoundException('Tag not found');

    try {
      TaggingPolicy.ensureCanRemove({
        cardActive: card.isActive(),
      });
    } catch (e: any) {
      throw new BadRequestException(e?.message ?? 'Cannot remove tag');
    }

    await this.flashcardTagRepo.remove(flashcardId, tagId);
  }

  async softDelete(userId: string, flashcardId: string): Promise<void> {
    const flashcard = await this.flashcardRepo.findByIdAndUser(
      flashcardId,
      userId,
    );

    if (!flashcard) throw new NotFoundException('Flashcard not found');

    flashcard.softDelete();
    await this.flashcardRepo.update(flashcard);
    await this.flashcardTagRepo.removeAllForFlashcard(flashcardId);
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

    return await this.flashcardRepo.create(flashcard);
  }

  async edit(
    userId: string,
    flashcardId: string,
    front: string,
    back: string,
  ): Promise<Flashcard> {
    const flashcard = await this.flashcardRepo.findByIdAndUser(
      flashcardId,
      userId,
    );
    if (!flashcard) throw new NotFoundException('Flashcard not found');
    flashcard.edit(front, back);
    await this.flashcardRepo.update(flashcard);
    return flashcard;
  }

  async list(
    userId: string,
    rawPage = 1,
    rawSize = 20,
  ): Promise<PaginatedResult<Flashcard>> {
    const { page, size, skip } = normalizePagination(rawPage, rawSize);

    const items = await this.flashcardRepo.findManyByUser(userId, skip, size);

    const total = await this.flashcardRepo.count();

    return {
      items,
      pagination: {
        page,
        size,
        total,
      },
    };
  }

  async listByTag(
    userId: string,
    tagId: string,
    rawPage = 1,
    rawSize = 20,
  ): Promise<ListAllFlashcardsInTag> {
    const tag = await this.tagRepo.findByIdAndUser(tagId, userId);
    if (!tag || !tag.isActive()) {
      throw new NotFoundException('Tag not found');
    }

    const { page, size, skip } = normalizePagination(rawPage, rawSize);

    const total = await this.flashcardTagRepo.countByTag(tagId);

    const flashcardIds = await this.flashcardTagRepo.listFlashcardIdsByTag(
      tagId,
      skip,
      size,
    );
    const items = await this.flashcardRepo.findManyByIdsAndUser(
      flashcardIds,
      userId,
    );

    return {
      tag,
      pagination: { page, size, total },
      items,
    };
  }
}
