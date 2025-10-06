export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
}

export interface PaginatedResult<T> {
  pagination: PaginationMeta;
  items: T[];
}
