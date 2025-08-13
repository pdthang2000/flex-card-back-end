import { Tag } from '../entities/tag.entity';

export const TAG_REPOSITORY = 'TagRepository';

export interface TagRepository {
  findByIdAndUser(id: string, userId: string): Promise<Tag | null>;
  findByNameAndUser(name: string, userId: string): Promise<Tag | null>;
  create(tag: Tag): Promise<Tag>; // returns Tag with generated id
  update(tag: Tag): Promise<void>; // updates by id
}
