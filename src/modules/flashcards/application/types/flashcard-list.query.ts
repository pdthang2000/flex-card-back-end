export type FlashcardListQuery = {
  page?: number;
  size?: number;
  tagNames?: string[];
  mode?: 'all' | 'any';
  sort?: 'link' | 'card';
  frontContains?: string;
  backContains?: string;
};
