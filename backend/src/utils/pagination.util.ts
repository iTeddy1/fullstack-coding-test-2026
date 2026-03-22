import type { Model, QueryFilter as FilterQuery } from 'mongoose';

export interface PaginateWithCursorOptions<T> {
  query: FilterQuery<T>;
  cursor?: string | undefined;
  limit?: number | undefined;
  cursorField?: string | undefined;
  sortOrder?: 1 | -1 | undefined;
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: unknown | null;
  hasNextPage: boolean;
}

export const paginateWithCursor = async <T extends Record<string, any>>(
  model: Model<T>,
  options: PaginateWithCursorOptions<T>,
): Promise<CursorPaginationResult<T>> => {
  const {
    query,
    cursor,
    limit = 20,
    cursorField = '_id',
    sortOrder = -1,
  } = options;

  const cursorCondition = cursor
    ? ({ [cursorField]: sortOrder === -1 ? { $lt: cursor } : { $gt: cursor } } as Record<string, unknown>)
    : {};

  const paginatedQuery = {
    ...query,
    ...cursorCondition,
  } as FilterQuery<T>;

  const results = await model
    .find(paginatedQuery)
    .sort({ [cursorField]: sortOrder })
    .limit(limit + 1)
    .lean() as T[];

  const hasNextPage = results.length > limit;

  if (hasNextPage) {
    results.pop();
  }

  const nextCursor = hasNextPage ? results[results.length - 1]?.[cursorField as keyof T] ?? null : null;

  return {
    data: results,
    nextCursor,
    hasNextPage,
  };
};
