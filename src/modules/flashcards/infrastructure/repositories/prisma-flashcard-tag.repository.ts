import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { FlashcardTagRepository } from '../../domain/repositories/flashcard-tag.repository.interface';

@Injectable()
export class PrismaFlashcardTagRepository implements FlashcardTagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(flashcardId: string, tagId: string): Promise<void> {
    // unique pair enforced by @@unique([flashcardId, tagId]) in Prisma
    await this.prisma.flashcardTag.create({ data: { flashcardId, tagId } });
  }

  async remove(flashcardId: string, tagId: string): Promise<void> {
    await this.prisma.flashcardTag.deleteMany({
      where: { flashcardId, tagId },
    });
  }

  async removeAllForFlashcard(flashcardId: string): Promise<void> {
    await this.prisma.flashcardTag.deleteMany({ where: { flashcardId } });
  }

  async removeAllForTag(tagId: string): Promise<void> {
    await this.prisma.flashcardTag.deleteMany({ where: { tagId } });
  }

  async countForFlashcard(flashcardId: string): Promise<number> {
    return this.prisma.flashcardTag.count({ where: { flashcardId } });
  }

  async exists(flashcardId: string, tagId: string): Promise<boolean> {
    const n = await this.prisma.flashcardTag.count({
      where: { flashcardId, tagId },
    });
    return n > 0;
  }

  async listTagIdsForFlashcard(flashcardId: string): Promise<string[]> {
    const rows = await this.prisma.flashcardTag.findMany({
      where: { flashcardId },
      select: { tagId: true },
    });
    return rows.map((row) => row.tagId);
  }

  async listFlashcardIdsByTag(
    tagId: string,
    skip = 0,
    take = 20,
  ): Promise<string[]> {
    const rows = await this.prisma.flashcardTag.findMany({
      where: { tagId },
      select: { flashcardId: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    return rows.map((row) => row.flashcardId);
  }
}
