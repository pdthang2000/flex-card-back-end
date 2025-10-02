const MAX_TAGS_PER_CARD = 100;

export class TaggingPolicy {
  /**
   * Ensures we can assign a tag to a flashcard.
   * Throws an Error (domain error) if a rule is violated.
   */
  static ensureCanAssign(params: {
    cardActive: boolean;
    tagActive: boolean;
    currentTagCount: number;
  }) {
    const { cardActive, tagActive, currentTagCount } = params;
    if (!cardActive) throw new Error('Flashcard is deleted');
    if (!tagActive) throw new Error('Tag is deleted');
    if (currentTagCount >= MAX_TAGS_PER_CARD)
      throw new Error('Tag limit reached');
  }

  /**
   * Ensures we can remove a tag from a flashcard.
   * Typically only guards that the card exists and isn’t deleted.
   * (Removal should be idempotent; missing link is OK.)
   */
  static ensureCanRemove(params: { cardActive: boolean }) {
    const { cardActive } = params;
    if (!cardActive) throw new Error('Flashcard is deleted');
  }
}
