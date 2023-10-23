import { CardRepository } from './card.repository.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateCardDto } from '../../dto/create-card.dto';
import { ListCardDto } from '../../dto/list-card.dto';
import { UpdateCardDto } from '../../dto/update-card.dto';
import { Card, Set } from '@prisma/client';

@Injectable()
export class CardRepositoryImplement implements CardRepository {
  constructor(private prisma: PrismaService) {}
  async getCard(id: string): Promise<any> {
    return await this.prisma.card.findFirst({
      where: { id },
    });
  }

  async create(data: CreateCardDto) {
    return await this.prisma.card.create({
      data,
    });
  }

  async list({ page = 0, take = 20 }: ListCardDto): Promise<any> {
    const where = {};

    const total = await this.prisma.card.count({ where });

    const list = await this.prisma.card.findMany({
      skip: (page - 1) * take,
      take,
      where,
    });

    const totalPages = Math.ceil(total / take);

    return {
      list,
      pagination: {
        total,
        take,
        page,
        totalPages,
      },
    };
  }

  async getCardsInSet(setId: string): Promise<any> {
    const junctions = await this.prisma.setCardJunction.findMany({
      where: {
        setId,
      },
      include: {
        card: true,
      },
    });

    return junctions.map((junction) => junction.card);
  }

  async updateCard(id: string, data: UpdateCardDto): Promise<Card> {
    return await this.prisma.card.update({
      where: { id },
      data,
    });
  }

  async getSet(id: string): Promise<Set> {
    return await this.prisma.set.findFirst({ where: { id } });
  }
}
