import { describe, it, expect } from 'vitest';
import { chunkItems } from '../bulk';

describe('chunkItems', () => {
  it('chunks items into batches of the given size', () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    const chunks = chunkItems(items, 3);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toEqual([1, 2, 3]);
    expect(chunks[1]).toEqual([4, 5, 6]);
    expect(chunks[2]).toEqual([7]);
  });

  it('defaults to 100 items per chunk', () => {
    const items = Array.from({ length: 250 }, (_, i) => i);
    const chunks = chunkItems(items);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(100);
    expect(chunks[1]).toHaveLength(100);
    expect(chunks[2]).toHaveLength(50);
  });

  it('returns a single chunk when items are under the limit', () => {
    const items = [1, 2, 3];
    const chunks = chunkItems(items, 100);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toEqual([1, 2, 3]);
  });

  it('returns an empty array when given an empty array', () => {
    const chunks = chunkItems([], 50);
    expect(chunks).toHaveLength(0);
  });
});
