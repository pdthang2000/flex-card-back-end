import { CardRepository } from './card.repository.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateCardDto } from '../dto/create-card.dto';
import { ListCardDto } from '../dto/list-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { Card } from '@prisma/client';
import { UpdateCardAndJunctionDto } from '../dto/update-card-and-junction.dto';
import { cloneDeep } from 'lodash';
import { CreateCardAndJunctionDto } from '../dto/create-card-and-junction.dto';

@Injectable()
export class CardRepositoryImplement implements CardRepository {
  constructor(private prisma: PrismaService) {}
  assignPrisma(prisma: any) {
    this.prisma = prisma;
  }

  getPrisma(): PrismaService {
    return this.prisma;
  }

  async list({ page = 1, take = 20 }: ListCardDto): Promise<any> {
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

  async get(id: string): Promise<any> {
    return await this.prisma.card.findFirst({
      where: { id },
    });
  }

  async getCardsInSet(setId: string): Promise<any> {
    const junctions = await this.prisma.setCardJunction.findMany({
      where: {
        setId,
      },
      include: {
        card: true,
      },
      orderBy: { orderId: 'asc' },
    });

    return junctions.map((junction) => ({
      ...junction.card,
      orderId: junction.orderId,
    }));
  }

  async create(data: CreateCardDto) {
    return await this.prisma.card.create({
      data,
    });
  }

  async createWithSetJunction(
    setId: string,
    data: CreateCardAndJunctionDto,
  ): Promise<Card> {
    return await this.prisma.card.create({
      data: {
        ...data.card,
        setCardJunction: {
          create: {
            ...data.setCardJunction,
            setId,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateCardDto): Promise<Card> {
    return await this.prisma.card.update({
      where: { id },
      data,
    });
  }

  async updateWithSetJunction(
    id: string,
    data: UpdateCardAndJunctionDto,
  ): Promise<any> {
    const updateCardData = cloneDeep(data.card);
    delete updateCardData.id;
    const junction = await this.prisma.setCardJunction.findFirst({
      where: { cardId: id },
    });

    await this.prisma.card.update({
      where: { id },
      data: {
        ...updateCardData,
        setCardJunction: {
          update: {
            where: { id: junction.id },
            data: data.setCardJunction,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<any> {
    return await this.prisma.card.delete({ where: { id } });
  }

  async deleteWithSetJunction(id: string): Promise<any> {
    const junction = await this.prisma.setCardJunction.findFirst({
      where: { cardId: id },
    });
    await this.prisma.setCardJunction.delete({
      where: { id: junction.id },
    });

    return await this.prisma.card.delete({ where: { id } });
  }

  async deleteMany(ids: string[]): Promise<any> {
    return await this.prisma.card.deleteMany({ where: { id: { in: ids } } });
  }
}
