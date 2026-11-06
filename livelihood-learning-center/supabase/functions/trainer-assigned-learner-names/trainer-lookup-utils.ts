export type PageResult<T> = {
  data: T[] | null;
  error: unknown | null;
};

export type PagedRowsResult<T> =
  | { kind: "ok"; rows: T[] }
  | { kind: "query_error" }
  | { kind: "too_many" };

export function chunks<T>(items: T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError("Chunk size must be a positive integer");
  }
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

/**
 * Fetches rows in stable caller-defined pages.
 * A query error is returned without exposing the underlying database error.
 * The maxRows check happens as soon as the cap is exceeded.
 */
export async function collectPagedRows<T>(
  fetchPage: (from: number, to: number) => Promise<PageResult<T>>,
  pageSize: number,
  maxRows: number,
): Promise<PagedRowsResult<T>> {
  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new RangeError("Page size must be a positive integer");
  }
  if (!Number.isInteger(maxRows) || maxRows < 0) {
    throw new RangeError("Maximum row count must be a non-negative integer");
  }

  const rows: T[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const result = await fetchPage(offset, offset + pageSize - 1);
    if (result.error) return { kind: "query_error" };
    const page = result.data ?? [];
    rows.push(...page);
    if (rows.length > maxRows) return { kind: "too_many" };
    if (page.length < pageSize) return { kind: "ok", rows };
  }
}
