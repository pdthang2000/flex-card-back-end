import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  TAG_REPOSITORY,
  TagRepository,
} from '../../domain/repositories/tag.repository.interface';
import { Tag } from '../../domain/entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @Inject(TAG_REPOSITORY) private readonly tagRepo: TagRepository,
  ) {}

  async createTag(userId: string, name: string): Promise<Tag> {
    const exists = await this.tagRepo.findByNameAndUser(name, userId);
    if (exists) throw new BadRequestException('Tag name already exists');

    const now = new Date();
    const tag = new Tag(undefined, name, userId, now, now, null);
    return this.tagRepo.create(tag);
  }

  async renameTag(
    userId: string,
    tagId: string,
    newName: string,
  ): Promise<Tag> {
    const tag = await this.tagRepo.findByIdAndUser(tagId, userId);
    if (!tag) throw new NotFoundException('Tag not found');

    // domain rule (updates updatedAt internally)
    tag.rename(newName);

    // Optional uniqueness check before update
    const conflict = await this.tagRepo.findByNameAndUser(newName, userId);
    if (conflict && conflict.id !== tag.id) {
      throw new BadRequestException('Tag name already exists');
    }

    await this.tagRepo.update(tag);
    return tag;
  }

  async deleteTag(userId: string, tagId: string): Promise<void> {
    const tag = await this.tagRepo.findByIdAndUser(tagId, userId);
    if (!tag) throw new NotFoundException('Tag not found');
    tag.softDelete();
    await this.tagRepo.update(tag);
    // Optionally: remove tag assignments from flashcards in another use case
  }

  async listTags(userId: string): Promise<Tag[]> {
    // Add a repo method like findAllByUser if you need listing
    // return this.tagRepo.findAllByUser(userId);
    return []; // placeholder if you haven’t added it yet
  }
}
