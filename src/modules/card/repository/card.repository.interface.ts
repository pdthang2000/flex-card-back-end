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

  list(data: ListCardDto): Promise<any>;

  get(id: string): Promise<Card>;

  getCardsInSet(setId: string): Promise<any>;

  create(data: CreateCardDto): Promise<Card>;

  createWithSetJunction(
    setId: string,
    data: CreateCardAndJunctionDto,
  ): Promise<Card>;

  update(id: string, data: UpdateCardDto): Promise<Card>;

  updateWithSetJunction(
    id: string,
    data: UpdateCardAndJunctionDto,
  ): Promise<any>;

  delete(id: string): Promise<any>;

  deleteMany(ids: string[]): Promise<any>;

  deleteWithSetJunction(id: string): Promise<any>;
}
