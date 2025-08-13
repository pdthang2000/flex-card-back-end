import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { FlashcardRepository } from '../../domain/repositories/flashcard.repository.interface';
import { Flashcard } from '../../domain/entities/flashcard.entity';

@Injectable()
export class PrismaFlashcardRepository implements FlashcardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdAndUser(id: string, userId: string): Promise<Flashcard | null> {
    const data = await this.prisma.flashcard.findFirst({
      where: { id, createdBy: userId },
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
}
