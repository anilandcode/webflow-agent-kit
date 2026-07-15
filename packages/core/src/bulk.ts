const CMS_BATCH_MAX = 100;

export function chunkItems<T>(
  items: T[],
  chunkSize: number = CMS_BATCH_MAX,
): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function executeBulkChunked<T>(
  items: Array<{ fieldData: Record<string, unknown>; isDraft?: boolean }>,
  chunkSize: number = CMS_BATCH_MAX,
  executor: (chunk: Array<{ fieldData: Record<string, unknown>; isDraft?: boolean }>) => Promise<T>,
): Promise<{ results: T[]; totalItems: number; chunks: number }> {
  const chunks = chunkItems(items, chunkSize);
  const results: T[] = [];

  for (const chunk of chunks) {
    const result = await executor(chunk);
    results.push(result);
  }

  return {
    results,
    totalItems: items.length,
    chunks: chunks.length,
  };
}
