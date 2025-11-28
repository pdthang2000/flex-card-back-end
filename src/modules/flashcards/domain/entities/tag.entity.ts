const SET_NAME_MAX_LENGTH = 50;

export class Tag {
  constructor(
    public readonly id: string | undefined,
    public name: string,
    public readonly createdBy: string,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null = null,
    public flashcardCount?: number,
  ) {
    if (name.length > SET_NAME_MAX_LENGTH) {
      throw new Error(`Set name must be <= ${SET_NAME_MAX_LENGTH} characters`);
    }
  }

  rename(newName: string) {
    if (newName.length > SET_NAME_MAX_LENGTH) {
      throw new Error(`Set name must be <= ${SET_NAME_MAX_LENGTH} characters`);
    }
    this.name = newName;
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
