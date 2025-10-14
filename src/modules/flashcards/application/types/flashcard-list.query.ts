export type FlashcardListQuery = {
  page?: number;
  size?: number;
  tagIds?: string[];
  mode?: 'all' | 'any';
  sort?: 'link' | 'card';
};
