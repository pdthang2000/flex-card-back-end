export class Flashcard {
  constructor(
    public readonly id: string | null,
    public front: string,
    public back: string,
    public readonly createdBy: string,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  edit(front: string, back: string) {
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
}
