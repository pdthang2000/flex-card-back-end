import { Set } from '@prisma/client';
import { ListSetDto } from '../dto/list-set.dto';

export const SET_REPOSITORY = 'SetRepository';

export interface SetRepository {
  get(id: string): Promise<Set>;

  list(data: ListSetDto): Promise<any>;
}
