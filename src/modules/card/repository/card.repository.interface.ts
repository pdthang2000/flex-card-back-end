import { CreateCardDto } from '../dto/create-card.dto';
import { ListCardDto } from '../dto/list-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { Card } from '@prisma/client';
import { UpdateCardAndJunctionDto } from '../dto/update-card-and-junction.dto';
import { CreateCardAndJunctionDto } from '../dto/create-card-and-junction.dto';
import { PrismaService } from '../../../prisma/prisma.service';

export const CARD_REPOSITORY = 'CardRepository';

export interface CardRepository {
  assignPrisma(prisma: any): void;

  getPrisma(): PrismaService;

  get(id: string): Promise<Card>;

  create(data: CreateCardDto): Promise<Card>;

  list(data: ListCardDto): Promise<any>;

  update(id: string, data: UpdateCardDto): Promise<Card>;

  getCardsInSet(setId: string): Promise<any>;

  deleteWithSetJunction(id: string): Promise<any>;

  updateWithSetJunction(
    id: string,
    data: UpdateCardAndJunctionDto,
  ): Promise<any>;

  createWithSetJunction(
    setId: string,
    data: CreateCardAndJunctionDto,
  ): Promise<Card>;
}
