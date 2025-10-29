import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { FlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { Flashcard } from '../../domain/entities/flashcard.entity';
import { Tag } from '../../domain/entities/tag.entity';

@Injectable()
export class PrismaFlashcardRepository implements FlashcardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdAndUser(id: string, userId: string): Promise<Flashcard | null> {
    const data = await this.prisma.flashcard.findFirst({
      where: { id, createdBy: userId, deletedAt: null },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!data) return null;
    return new Flashcard(
      data.id,
      data.front,
      data.back,
      data.createdBy,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
      data.tags
        .map((flashcardTag) => flashcardTag.tag)
        .filter((tag) => tag && tag.deletedAt === null)
        .map(
          (tag) =>
            new Tag(
              tag.id,
              tag.name,
              tag.createdBy,
              tag.createdAt,
              tag.updatedAt,
              tag.deletedAt ?? null,
            ),
        ),
    );
  }

  async create(flashcard: Flashcard): Promise<Flashcard> {
    const created = await this.prisma.flashcard.create({
      data: {
        front: flashcard.front,
        back: flashcard.back,
        createdBy: flashcard.createdBy,
        createdAt: flashcard.createdAt,
        updatedAt: flashcard.updatedAt,
        deletedAt: flashcard.deletedAt,
      },
    });
    // Assign id from DB to entity
    return new Flashcard(
      created.id,
      created.front,
      created.back,
      created.createdBy,
      created.createdAt,
      created.updatedAt,
      created.deletedAt,
    );
  }

  async update(flashcard: Flashcard): Promise<void> {
    await this.prisma.flashcard.update({
      where: { id: flashcard.id },
      data: {
        front: flashcard.front,
        back: flashcard.back,
        updatedAt: flashcard.updatedAt,
        deletedAt: flashcard.deletedAt,
      },
    });
  }

  async findManyByUser(userId: string, skip = 0, take = 20) {
    const rows = await this.prisma.flashcard.findMany({
      where: { createdBy: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return rows.map(
      (row) =>
        new Flashcard(
          row.id,
          row.front,
          row.back,
          row.createdBy,
          row.createdAt,
          row.updatedAt,
          row.deletedAt,
          row.tags
            .map((flashcardTag) => flashcardTag.tag)
            .filter((tag) => tag && tag.deletedAt === null)
            .map(
              (tag) =>
                new Tag(
                  tag.id,
                  tag.name,
                  tag.createdBy,
                  tag.createdAt,
                  tag.updatedAt,
                  tag.deletedAt ?? null,
                ),
            ),
        ),
    );
  }

  async findManyByIdsAndUser(
    ids: string[],
    userId: string,
  ): Promise<Flashcard[]> {
    if (!ids.length) return [];
    const rows = await this.prisma.flashcard.findMany({
      where: { id: { in: ids }, createdBy: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return rows.map(
      (row) =>
        new Flashcard(
          row.id,
          row.front,
          row.back,
          row.createdBy,
          row.createdAt,
          row.updatedAt,
          row.deletedAt ?? null,
          row.tags
            .map((flashcardTag) => flashcardTag.tag)
            .filter((tag) => tag && tag.deletedAt === null)
            .map(
              (tag) =>
                new Tag(
                  tag.id,
                  tag.name,
                  tag.createdBy,
                  tag.createdAt,
                  tag.updatedAt,
                  tag.deletedAt ?? null,
                ),
            ),
        ),
    );
  }

  async count(): Promise<number> {
    return await this.prisma.flashcard.count({});
  }

  async countByUser(userId: string): Promise<number> {
    return await this.prisma.flashcard.count({
      where: { createdBy: userId, deletedAt: null },
    });
  }

  async findManyByIdsAndUserKeepOrder(
    idsOrdered: string[],
    userId: string,
  ): Promise<Flashcard[]> {
    if (!idsOrdered.length) return [];
    const rows = await this.prisma.flashcard.findMany({
      where: { id: { in: idsOrdered }, createdBy: userId, deletedAt: null },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    // Re-map to the same order the aggregate returned
    const ordered = idsOrdered
      .map((id) => byId.get(id))
      .filter(Boolean) as typeof rows; // This removes any undefined results in case some ID in idsOrdered isn’t found in rows.

    return ordered.map(
      (row) =>
        new Flashcard(
          row.id,
          row.front,
          row.back,
          row.createdBy,
          row.createdAt,
          row.updatedAt,
          row.deletedAt ?? null,
          row.tags
            .map((flashcardTag) => flashcardTag.tag)
            .filter((tag) => tag && tag.deletedAt === null)
            .map(
              (tag) =>
                new Tag(
                  tag.id,
                  tag.name,
                  tag.createdBy,
                  tag.createdAt,
                  tag.updatedAt,
                  tag.deletedAt ?? null,
                ),
            ),
        ),
    );
  }

  async searchIdsByTextPaged(
    userId: string,
    {
      frontContains,
      backContains,
      skip,
      take,
      tagIds = [],
      mode = 'all',
    }: {
      frontContains?: string;
      backContains?: string;
      skip: number;
      take: number;
      tagIds?: string[];
      mode?: 'all' | 'any';
    },
  ): Promise<{ ids: string[]; total: number }> {
    // Build $search compound.must
    const must: any[] = [
      {
        equals: { path: 'createdBy', value: { $oid: userId } },
      },
      {
        // exclude soft-deleted
        exists: { path: '_id' }, // placeholder to allow mustNot below
      },
    ];

    // add field-specific text clauses (AND if both present)
    if (frontContains && frontContains.trim().length) {
      must.push({
        text: { query: frontContains.trim(), path: 'front' },
      });
    }
    if (backContains && backContains.trim().length) {
      must.push({
        text: { query: backContains.trim(), path: 'back' },
      });
    }

    const pipeline: any[] = [
      {
        $search: {
          index: 'default', // the Atlas Search index name shown in UI
          compound: {
            must,
            mustNot: [{ exists: { path: 'deletedAt' } }],
          },
        },
      },
      { $sort: { score: { $meta: 'searchScore' }, _id: 1 } },
    ];

    // Optional tag filter after search
    if (tagIds.length) {
      pipeline.push(
        {
          $lookup: {
            from: 'FlashcardTag',
            localField: '_id',
            foreignField: 'flashcardId',
            as: 'links',
          },
        },
        {
          $addFields: {
            tagHits: {
              $setIntersection: [
                tagIds.map((id) => ({ $oid: id })),
                { $map: { input: '$links', as: 'l', in: '$$l.tagId' } },
              ],
            },
          },
        },
        mode === 'all'
          ? {
              $match: {
                $expr: { $eq: [{ $size: '$tagHits' }, tagIds.length] },
              },
            }
          : { $match: { $expr: { $gte: [{ $size: '$tagHits' }, 1] } } },
      );
    }

    pipeline.push({
      $facet: {
        total: [{ $count: 'count' }],
        data: [{ $skip: skip }, { $limit: take }, { $project: { _id: 1 } }],
      },
    });

    const agg: any = await this.prisma.flashcard.aggregateRaw({ pipeline });
    const bucket =
      Array.isArray(agg) && agg.length ? agg[0] : { total: [], data: [] };
    const total = bucket.total?.[0]?.count ?? 0;
    const ids: string[] = (bucket.data ?? []).map(
      (row: any) => row._id?.$oid ?? row._id,
    );
    return { ids, total };
  }
}
