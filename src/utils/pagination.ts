export function calculatePagination(page: number, limit: number) {
  const pageNum = Math.max(1, page || 1);
  const limitNum = Math.min(100, Math.max(1, limit || 20));
  const skip = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, skip };
}

export function formatPaginationResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export function generateSKU(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(6, "0")}`;
}
