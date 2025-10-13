import { Tag } from "./tag.entity";

const CONTENT_MAX_LENGTH = 1000;

export class Flashcard {
  constructor(
    public readonly id: string | null,
    public front: string,
    public back: string,
    public readonly createdBy: string,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
    private _tags: ReadonlyArray<Tag> | null = null,
  ) {
    if (front.length > CONTENT_MAX_LENGTH) {
      throw new Error(`Front must be <= ${CONTENT_MAX_LENGTH} chars`);
    }
    if (back.length > CONTENT_MAX_LENGTH) {
      throw new Error(`Back must be <= ${CONTENT_MAX_LENGTH} chars`);
    }
  }

  edit(front: string, back: string) {
    if (front.length > CONTENT_MAX_LENGTH) {
      throw new Error(`Front must be <= ${CONTENT_MAX_LENGTH} chars`);
    }
    if (back.length > CONTENT_MAX_LENGTH) {
      throw new Error(`Back must be <= ${CONTENT_MAX_LENGTH} chars`);
    }
    this.front = front;
    this.back = back;
    this.updatedAt = new Date();
  }

  softDelete() {
    this.deletedAt = new Date();
  }

  restore() {
    this.deletedAt = null;
    this.updatedAt = new Date();
  }

  isActive(): boolean {
    return this.deletedAt === null;
  }

  get tags(): ReadonlyArray<Tag> | null {
    return this._tags;
  }
}
