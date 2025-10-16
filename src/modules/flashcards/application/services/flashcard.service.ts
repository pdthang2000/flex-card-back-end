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
import { Tag } from '../../domain/entities/tag.entity';
import { CreateFlashcardDto } from '../dto/create-flashcard.dto';
import { UpdateFlashcardDto } from '../dto/update-flashcard.dto';
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
import { FlashcardListQuery } from '../types/flashcard-list.query';

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
      await this.flashcardTagRepo.add(userId, flashcardId, tagId);
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

    const created = await this.flashcardRepo.create(flashcard);

    if (dto.tagIds && dto.tagIds.length > 0) {
      await Promise.all(
        dto.tagIds.map(async (tagId) => {
          try {
            await this.assignTag(userId, created.id, tagId);
          } catch (e) {
            console.error("Can't create FlashcardTag", e);
            console.error('userId: ', userId);
            console.error('tagId: ', tagId);
            console.error('cardId: ', created.id);
          }
        }),
      );
    }

    return created;
  }

  async edit(
    userId: string,
    flashcardId: string,
    dto: UpdateFlashcardDto,
  ): Promise<Flashcard> {
    const flashcard = await this.flashcardRepo.findByIdAndUser(
      flashcardId,
      userId,
    );
    if (!flashcard) throw new NotFoundException('Flashcard not found');
    flashcard.edit(dto.front, dto.back);
    await this.flashcardRepo.update(flashcard);

    if (dto.tagNames !== undefined) {
      await this.syncFlashcardTagsByNames(userId, flashcard, dto.tagNames);
    }

    const updated = await this.flashcardRepo.findByIdAndUser(
      flashcardId,
      userId,
    );
    return updated ?? flashcard;
  }

  private async syncFlashcardTagsByNames(
    userId: string,
    flashcard: Flashcard,
    rawTagNames: string[],
  ): Promise<void> {
    if (!flashcard.id) {
      throw new BadRequestException('Flashcard is missing identifier');
    }
    console.log(rawTagNames);

    const normalizedTagNames =
      rawTagNames
        ?.map((name) => (typeof name === 'string' ? name.trim() : ''))
        .filter((name) => !!name) ?? [];

    if (!normalizedTagNames.length) {
      await this.flashcardTagRepo.removeAllForFlashcard(flashcard.id);
      return;
    }

    const uniqueTagNames = Array.from(new Set(normalizedTagNames));
    if (uniqueTagNames.length > TaggingPolicy.maxTagsPerCard()) {
      throw new BadRequestException('Tag limit reached');
    }

    const existingTags = await this.tagRepo.findByNamesAndUser(
      uniqueTagNames,
      userId,
    );

    const tagByName = new Map<string, Tag>();
    const tagsToRestore: Tag[] = [];
    for (const tag of existingTags) {
      if (!tag) continue;
      if (!tag.isActive()) {
        tag.restore();
        tagsToRestore.push(tag);
      }
      tagByName.set(tag.name, tag);
    }

    if (tagsToRestore.length) {
      await Promise.all(tagsToRestore.map((tag) => this.tagRepo.update(tag)));
    }

    const missingNames = uniqueTagNames.filter((name) => !tagByName.has(name));
    if (missingNames.length) {
      const createdTags = await Promise.all(
        missingNames.map((name) => {
          const now = new Date();
          const tag = new Tag(undefined, name, userId, now, now, null);
          return this.tagRepo.create(tag);
        }),
      );
      for (const tag of createdTags) {
        tagByName.set(tag.name, tag);
      }
    }

    const desiredTagIds = uniqueTagNames.map((name) => {
      const tag = tagByName.get(name);
      if (!tag?.id) {
        throw new BadRequestException(`Tag "${name}" could not be resolved`);
      }
      return tag.id;
    });

    if (desiredTagIds.length > TaggingPolicy.maxTagsPerCard()) {
      throw new BadRequestException('Tag limit reached');
    }

    const flashcardId = flashcard.id as string;
    const currentTagIds = await this.flashcardTagRepo.listTagIdsForFlashcard(
      flashcardId,
    );

    const desiredSet = new Set(desiredTagIds);
    const toRemove = currentTagIds.filter((tagId) => !desiredSet.has(tagId));
    if (toRemove.length) {
      await Promise.all(
        toRemove.map((tagId) =>
          this.flashcardTagRepo.remove(flashcardId, tagId),
        ),
      );
    }

    const currentSet = new Set(currentTagIds);
    const toAdd = desiredTagIds.filter((tagId) => !currentSet.has(tagId));
    if (toAdd.length) {
      for (const tagId of toAdd) {
        await this.assignTag(userId, flashcardId, tagId);
      }
    }
  }

  async list(
    userId: string,
    {
      page: rawPage = 1,
      size: rawSize = 20,
      tagNames = [],
      mode = 'all',
      sort = 'link',
    }: FlashcardListQuery,
  ): Promise<PaginatedResult<Flashcard>> {
    const { page, size, skip, take } = normalizePagination(rawPage, rawSize);

    const normalizedTagNames =
      tagNames?.map((name) => name?.trim()).filter((name) => !!name) ?? [];

    // Fast path: no tag filters
    if (!normalizedTagNames.length) {
      const [items, total] = await Promise.all([
        this.flashcardRepo.findManyByUser(userId, skip, take),
        this.flashcardRepo.countByUser(userId),
      ]);
      return { items, pagination: { page, size, total } };
    }

    const uniqueTagNames = Array.from(new Set(normalizedTagNames));
    const tags = await this.tagRepo.findByNamesAndUser(uniqueTagNames, userId);
    const tagByName = new Map(tags.map((tag) => [tag.name, tag]));
    const tagIds: string[] = [];
    for (const tagName of uniqueTagNames) {
      const tag = tagByName.get(tagName);
      if (!tag || !tag.isActive() || !tag.id) {
        return { items: [], pagination: { page, size, total: 0 } };
      }
      tagIds.push(tag.id);
    }

    // With tag filters
    const finder =
      mode === 'all'
        ? this.flashcardTagRepo.findFlashcardIdsByAllTagsPaged.bind(
            this.flashcardTagRepo,
          )
        : this.flashcardTagRepo.findFlashcardIdsByAnyTagPaged.bind(
            this.flashcardTagRepo,
          );

    const { ids, total } = await finder(userId, tagIds, skip, take, sort);
    if (!ids.length) {
      return { items: [], pagination: { page, size, total } };
    }

    const items = await this.flashcardRepo.findManyByIdsAndUserKeepOrder(
      ids,
      userId,
    );
    return { items, pagination: { page, size, total } };
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
