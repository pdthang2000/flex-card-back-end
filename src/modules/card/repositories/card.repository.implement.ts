import { CardRepository } from "./card.repository.abstract";
import { PrismaService } from "../../prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CardRepositoryImplement implements CardRepository {
  constructor(private prisma: PrismaService) {}
  async findCardById(id: string): Promise<any> {
    return await this.prisma.cards.findFirst({
      where: { id }
    });
  }
}