export class Tag {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly createdBy: string,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  rename(newName: string) {
    this.name = newName;
    this.updatedAt = new Date();
  }

  softDelete() {
    this.deletedAt = new Date();
  }

  isActive(): boolean {
    return this.deletedAt === null;
  }
}
