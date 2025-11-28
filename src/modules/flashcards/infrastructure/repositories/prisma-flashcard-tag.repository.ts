import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { FlashcardTagRepository } from '../../domain/repositories/flashcard-tag.repository.interface';

@Injectable()
export class PrismaFlashcardTagRepository implements FlashcardTagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, flashcardId: string, tagId: string): Promise<void> {
    await this.prisma.flashcardTag.create({
      data: { createdBy: userId, flashcardId, tagId },
    });
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

  async countByTag(tagId: string): Promise<number> {
    return this.prisma.flashcardTag.count({ where: { tagId } });
  }

  async findFlashcardIdsByAllTagsPaged(
    userId: string,
    tagIds: string[],
    skip: number,
    take: number,
    sort: 'link' | 'card' = 'link',
  ): Promise<{ ids: string[]; total: number }> {
    if (!tagIds?.length) return { ids: [], total: 0 };

    const tagIdArray = tagIds; // uuid strings

    // Total count (ALL)
    const totalRows = await this.prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count FROM (
      SELECT ft."flashcardId"
      FROM "FlashcardTag" ft
      WHERE ft."createdBy" = ${userId}::uuid
          AND ft."tagId" = ANY(${tagIdArray}::uuid[])
      GROUP BY ft."flashcardId"
      HAVING COUNT(DISTINCT ft."tagId") = ${tagIdArray.length}
    ) s;
  `;
    const total = Number(totalRows[0]?.count ?? 0);

    if (total === 0) return { ids: [], total };

    if (sort === 'link') {
      // Sort by latest link time then id
      const data = await this.prisma.$queryRaw<{ flashcardId: string }[]>`
      SELECT s."flashcardId"
      FROM (
        SELECT ft."flashcardId", MAX(ft."createdAt") AS latest_link_at
        FROM "FlashcardTag" ft
        WHERE ft."createdBy" = ${userId}::uuid AND ft."tagId" = ANY(${tagIdArray}::uuid[])
        GROUP BY ft."flashcardId"
        HAVING COUNT(DISTINCT ft."tagId") = ${tagIdArray.length}
      ) s
      ORDER BY s.latest_link_at DESC, s."flashcardId" ASC
      OFFSET ${skip} LIMIT ${take};
    `;
      return { ids: data.map((r) => r.flashcardId), total };
    } else {
      // Sort by Flashcard.createdAt (heavier join)
      const data = await this.prisma.$queryRaw<{ flashcardId: string }[]>`
      SELECT f.id AS "flashcardId"
      FROM "Flashcard" f
      WHERE f."createdBy" = ${userId}
        AND f."deletedAt" IS NULL
        AND f.id IN (
          SELECT ft."flashcardId"
          FROM "FlashcardTag" ft
          WHERE ft."createdBy" = ${userId} AND ft."tagId" = ANY(${tagIdArray}::uuid[])
          GROUP BY ft."flashcardId"
          HAVING COUNT(DISTINCT ft."tagId") = ${tagIdArray.length}
        )
      ORDER BY f."createdAt" DESC, f.id ASC
      OFFSET ${skip} LIMIT ${take};
    `;
      return { ids: data.map((r) => r.flashcardId), total };
    }
  }
  async findFlashcardIdsByAnyTagPaged(
    userId: string,
    tagIds: string[],
    skip: number,
    take: number,
    sort: 'link' | 'card' = 'link',
  ): Promise<{ ids: string[]; total: number }> {
    if (!tagIds?.length) return { ids: [], total: 0 };

    const tagIdArray = tagIds;

    const totalRows = await this.prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count FROM (
      SELECT DISTINCT ft."flashcardId"
      FROM "FlashcardTag" ft
      WHERE ft."createdBy" = ${userId} AND ft."tagId" = ANY(${tagIdArray}::uuid[])
    ) s;
  `;
    const total = Number(totalRows[0]?.count ?? 0);
    if (total === 0) return { ids: [], total };

    if (sort === 'link') {
      const data = await this.prisma.$queryRaw<{ flashcardId: string }[]>`
      SELECT s."flashcardId"
      FROM (
        SELECT ft."flashcardId", MAX(ft."createdAt") AS latest_link_at
        FROM "FlashcardTag" ft
        WHERE ft."createdBy" = ${userId} AND ft."tagId" = ANY(${tagIdArray}::uuid[])
        GROUP BY ft."flashcardId"
      ) s
      ORDER BY s.latest_link_at DESC, s."flashcardId" ASC
      OFFSET ${skip} LIMIT ${take};
    `;
      return { ids: data.map((r) => r.flashcardId), total };
    } else {
      const data = await this.prisma.$queryRaw<{ flashcardId: string }[]>`
      SELECT f.id AS "flashcardId"
      FROM "Flashcard" f
      WHERE f."createdBy" = ${userId}
        AND f."deletedAt" IS NULL
        AND EXISTS (
          SELECT 1 FROM "FlashcardTag" ft
          WHERE ft."flashcardId" = f.id
            AND ft."createdBy" = ${userId}
            AND ft."tagId" = ANY(${tagIdArray}::uuid[])
        )
      ORDER BY f."createdAt" DESC, f.id ASC
      OFFSET ${skip} LIMIT ${take};
    `;
      return { ids: data.map((r) => r.flashcardId), total };
    }
  }
}
