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

    // Common first stages — use the compound index:
    //   { createdBy, tagId, flashcardId, createdAt }
    const baseMatch = {
      createdBy: { $oid: userId },
      tagId: { $in: tagIds.map((id) => ({ $oid: id })) },
    };
    const groupStage = {
      $group: {
        _id: '$flashcardId',
        c: { $sum: 1 },
        latestLinkAt: { $max: '$createdAt' },
      },
    };
    const mustHaveAll = { $match: { c: { $gte: tagIds.length } } };

    // Branch sorting
    const sortAndFacetLink = [
      { $sort: { latestLinkAt: -1, _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          data: [{ $skip: skip }, { $limit: take }],
        },
      },
    ];

    // If you need to sort by Flashcard.createdAt, look up to Flashcard collection.
    // Note: this is heavier than 'link' sort.
    const sortAndFacetCard = [
      {
        $lookup: {
          from: 'Flashcard',
          localField: '_id',
          foreignField: '_id',
          as: 'f',
        },
      },
      { $unwind: '$f' },
      { $match: { 'f.createdBy': { $oid: userId }, 'f.deletedAt': null } },
      { $sort: { 'f.createdAt': -1, _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          data: [{ $skip: skip }, { $limit: take }],
        },
      },
    ];

    const pipeline =
      sort === 'card'
        ? [{ $match: baseMatch }, groupStage, mustHaveAll, ...sortAndFacetCard]
        : [{ $match: baseMatch }, groupStage, mustHaveAll, ...sortAndFacetLink];

    // Run aggregation on FlashcardTag
    const agg: any = await this.prisma.flashcardTag.aggregateRaw({
      pipeline,
    });

    // Normalize result
    const bucket =
      Array.isArray(agg) && agg.length > 0 ? agg[0] : { total: [], data: [] };
    const total = bucket.total?.[0]?.count ?? 0;

    // Extract ordered ids for the page
    const ids: string[] =
      (bucket.data ?? []).map((row: any) => row._id?.$oid ?? row._id) ?? [];

    return { ids, total };
  }

  async findFlashcardIdsByAnyTagPaged(
    userId: string,
    tagIds: string[],
    skip: number,
    take: number,
    sort: 'link' | 'card' = 'link',
  ): Promise<{ ids: string[]; total: number }> {
    if (!tagIds?.length) return { ids: [], total: 0 };

    const baseMatch = {
      createdBy: { $oid: userId },
      tagId: { $in: tagIds.map((id) => ({ $oid: id })) },
    };

    const groupStage = {
      $group: {
        _id: '$flashcardId',
        c: { $sum: 1 },
        latestLinkAt: { $max: '$createdAt' },
      },
    };

    // ANY = at least 1 match
    const mustHaveAny = { $match: { c: { $gte: 1 } } };

    const sortAndFacetLink = [
      { $sort: { latestLinkAt: -1, _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          data: [{ $skip: skip }, { $limit: take }],
        },
      },
    ];

    const sortAndFacetCard = [
      {
        $lookup: {
          from: 'Flashcard',
          localField: '_id',
          foreignField: '_id',
          as: 'f',
        },
      },
      { $unwind: '$f' },
      { $match: { 'f.createdBy': { $oid: userId }, 'f.deletedAt': null } },
      { $sort: { 'f.createdAt': -1, _id: 1 } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          data: [{ $skip: skip }, { $limit: take }],
        },
      },
    ];

    const pipeline =
      sort === 'card'
        ? [{ $match: baseMatch }, groupStage, mustHaveAny, ...sortAndFacetCard]
        : [{ $match: baseMatch }, groupStage, mustHaveAny, ...sortAndFacetLink];

    const agg: any = await this.prisma.flashcardTag.aggregateRaw({ pipeline });
    const bucket =
      Array.isArray(agg) && agg.length > 0 ? agg[0] : { total: [], data: [] };
    const total = bucket.total?.[0]?.count ?? 0;
    const ids: string[] =
      (bucket.data ?? []).map((row: any) => row._id?.$oid ?? row._id) ?? [];

    return { ids, total };
  }
}
