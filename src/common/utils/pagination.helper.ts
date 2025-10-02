export interface PaginationParams {
  page: number;
  size: number;
  skip: number;
  take: number;
}

export function normalizePagination(
  page: number | undefined,
  size: number | undefined,
  maxSize = 100,
): PaginationParams {
  const p = Math.max(1, Number(page) || 1);
  const s = Math.max(1, Math.min(maxSize, Number(size) || 20));
  return {
    page: p,
    size: s,
    skip: (p - 1) * s,
    take: s,
  };
}
