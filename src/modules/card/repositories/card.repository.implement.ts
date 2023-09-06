import { CardRepository } from "./card.repository.interface";
import { PrismaService } from "../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateCardDto } from "../../dto/create-card.dto";
import { ListCardDto } from "../../dto/list-card.dto";

@Injectable()
export class CardRepositoryImplement implements CardRepository {
  constructor(private prisma: PrismaService) {}
  async findCardById(id: string): Promise<any> {
    return await this.prisma.card.findFirst({
      where: { id }
    });
  }

  async create(data: CreateCardDto) {
    return await this.prisma.card.create({
      data,
    });
  }

  async list({
    skip = 0,
    take = 20,
  }: ListCardDto): Promise<any> {
    return await this.prisma.card.findMany({
      skip,
      take,
    });
  }

  async getCardsInSet(setId: string): Promise<any> {
    const junctions = await this.prisma.setCardJunction.findMany({
      where: {
        setId: setId,
      },
      include: {
        card: true,
      },
    });

    return junctions.map(junction => junction.card);
  }
}