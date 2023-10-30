import { Set } from '@prisma/client';
export const SET_SERVICE = 'SetService';

export interface SetService {
  get(id: string): Promise<any>;

  list(data: any): Promise<Set[]>;
}
