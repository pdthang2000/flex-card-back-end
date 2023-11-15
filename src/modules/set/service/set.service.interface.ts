import { Set } from '@prisma/client';
import { CreateSetDto } from '../dto/create-set.dto';
import { UpdateSetDto } from '../dto/update-set.dto';
export const SET_SERVICE = 'SetService';

export interface SetService {
  get(id: string): Promise<any>;

  list(data: any): Promise<Set[]>;

  create(data: CreateSetDto): Promise<any>;

  update(id: string, data: UpdateSetDto): Promise<any>;

  delete(id: string): Promise<any>;
}
