import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { TagRepository } from '../../domain/repositories/tag.repository.interface';
import { Tag } from '../../domain/entities/tag.entity';
import { Tag as TagModel } from '@prisma/client';
import { Prisma } from '@prisma/client';
function mapDbToDomain(tag: TagModel & { _count?: Prisma.TagCountOutputType }): Tag {
  return new Tag(
    tag.id,
    tag.name,
    tag.createdBy,
    tag.createdAt,
    tag.updatedAt,
    tag.deletedAt ?? null,
    typeof tag._count?.flashcards === 'number' ? tag._count.flashcards : undefined,
  );
}

@Injectable()
export class PrismaTagRepository implements TagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdAndUser(id: string, userId: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findFirst({
      where: { id, createdBy: userId },
    });
    return tag ? mapDbToDomain(tag) : null;
  }

  async findByNameAndUser(name: string, userId: string): Promise<Tag | null> {
    const tag = await this.prisma.tag.findFirst({
      where: { name, createdBy: userId },
    });
    return tag ? mapDbToDomain(tag) : null;
  }

  async findByNamesAndUser(names: string[], userId: string): Promise<Tag[]> {
    if (!names.length) {
      return [];
    }
    const rows = await this.prisma.tag.findMany({
      where: { name: { in: names }, createdBy: userId },
      include: {
        _count: {
          select: {
            flashcards: {
              where: { 
                createdBy: userId,
              },
            },
          },
        },
      },
    });
    return rows.map(mapDbToDomain);
  }

  async create(tag: Tag): Promise<Tag> {
    const created = await this.prisma.tag.create({
      data: {
        name: tag.name,
        createdBy: tag.createdBy,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
        deletedAt: tag.deletedAt,
      },
    });
    return mapDbToDomain(created);
  }

  async update(tag: Tag): Promise<void> {
    await this.prisma.tag.update({
      where: { id: tag.id },
      data: {
        name: tag.name,
        updatedAt: tag.updatedAt,
        deletedAt: tag.deletedAt,
      },
    });
  }

  async findAllByUser(userId: string, skip = 0, take = 20): Promise<Tag[]> {
    const rows = await this.prisma.tag.findMany({
      where: { createdBy: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        _count: {
          select: {
            flashcards: {
              where: { createdBy: userId },
            },
          },
        },
      },
    });
    return rows.map(mapDbToDomain);
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.tag.count({
      where: { createdBy: userId, deletedAt: null },
    });
  }
}
