import { Set } from '@prisma/client';
import { ListSetDto } from '../dto/list-set.dto';
import { CreateSetDto } from '../dto/create-set.dto';
import { UpdateSetDto } from '../dto/update-set.dto';

export const SET_REPOSITORY = 'SetRepository';

export interface SetRepository {
  get(id: string): Promise<Set>;

  list(data: ListSetDto): Promise<any>;

  create(data: CreateSetDto): Promise<any>;

  update(id: string, data: UpdateSetDto): Promise<any>;
}
