import { CardRepository } from "./card.repository.abstract";
import { PrismaService } from "../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateCardDto } from "../../dto/create-card.dto";
import { ListCardDto } from "../../dto/list-card.dto";

@Injectable()
export class CardRepositoryImplement implements CardRepository {
  constructor(private prisma: PrismaService) {}
  async findCardById(id: string): Promise<any> {
    return await this.prisma.cards.findFirst({
      where: { id }
    });
  }

  async create(data: CreateCardDto) {
    return await this.prisma.cards.create({
      data,
    });
  }

  async list({
    skip = 20,
    take = 20,
  }: ListCardDto): Promise<any> {
    return await this.prisma.cards.findMany({
      skip,
      take,
    });
  }
}