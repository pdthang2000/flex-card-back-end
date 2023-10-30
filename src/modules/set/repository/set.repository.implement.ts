import { SetRepository } from './set.repository.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Set } from '@prisma/client';

@Injectable()
export class SetRepositoryImplement implements SetRepository {
  constructor(private prisma: PrismaService) {}
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
}
