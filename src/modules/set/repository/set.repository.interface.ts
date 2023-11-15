import { Set } from '@prisma/client';
import { ListSetDto } from '../dto/list-set.dto';
import { CreateSetDto } from '../dto/create-set.dto';
import { UpdateSetDto } from '../dto/update-set.dto';
import { PrismaService } from '../../../prisma/prisma.service';

export const SET_REPOSITORY = 'SetRepository';

export interface SetRepository {
  assignPrisma(prisma: any): void;

  getPrisma(): PrismaService;

  get(id: string): Promise<Set>;

  list(data: ListSetDto): Promise<any>;

  create(data: CreateSetDto): Promise<any>;

  delete(id: string): Promise<any>;

  deleteJunctions(setId: string): Promise<any>;

  update(id: string, data: UpdateSetDto): Promise<any>;
}
