import { SetRepository } from './set.repository.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Set } from '@prisma/client';
import { CreateSetDto } from '../dto/create-set.dto';
import { cloneDeep } from 'lodash';
import { UpdateSetDto } from '../dto/update-set.dto';
@Injectable()
export class SetRepositoryImplement implements SetRepository {
  constructor(private prisma: PrismaService) {}

  assignPrisma(prisma: any) {
    this.prisma = prisma;
  }

  getPrisma(): PrismaService {
    return this.prisma;
  }

  async get(id: string): Promise<Set> {
    return await this.prisma.set.findFirst({ where: { id } });
  }

  async list({ page = 1, take = 20 }: any): Promise<any> {
    const where = {};

    const list = await this.prisma.set.findMany({
      skip: (page - 1) * take,
      take,
      where,
    });

    return {
      list,
    };
  }

  async create(data: CreateSetDto): Promise<any> {
    const cardCount = data.cards.length;
    const setData = cloneDeep(data);
    delete setData.cards;

    return await this.prisma.set.create({
      data: {
        ...setData,
        cardCount,
        setCardJunction: {
          create: data.cards.map((card, index) => ({
            orderId: index + 1,
            card: {
              create: card,
            },
          })),
        },
      },
    });
  }

  async update(id: string, data: UpdateSetDto): Promise<any> {
    const cardCount = data.cards.length;
    const setData = cloneDeep(data);
    delete setData.cards;

    return await this.prisma.set.update({
      where: { id },
      data: {
        ...setData,
        cardCount,
      },
    });
  }

  async delete(id: string): Promise<any> {
    return await this.prisma.set.delete({ where: { id } });
  }

  async deleteJunctions(setId: string): Promise<any> {
    return await this.prisma.setCardJunction.deleteMany({
      where: { setId },
    });
  }
}
