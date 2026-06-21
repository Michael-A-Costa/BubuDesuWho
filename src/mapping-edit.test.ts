import { describe, expect, it } from 'vitest';
import { withInsertedAfter, withRemovedAt } from './mapping-edit';
import { MappingEntry } from './types';

function make(n: number): MappingEntry[] {
  return Array.from({ length: n }, (_, i) => ({ range: [i, i + 1] as [number, number], ans: [i], diff: 1, id: i }));
}

describe('withInsertedAfter', () => {
  it('returns a new array (never splices in place)', () => {
    const before = make(3);
    const entry: MappingEntry = { range: [9, 11], ans: [], diff: 1, id: 0 };
    const after = withInsertedAfter(before, 1, entry);
    expect(after).not.toBe(before);
    expect(before).toHaveLength(3); // original untouched
    expect(after).toHaveLength(4);
  });

  it('inserts directly after the index and renumbers ids densely', () => {
    const entry: MappingEntry = { range: [9, 11], ans: [7], diff: 1, id: 99 };
    const after = withInsertedAfter(make(3), 1, entry);
    expect(after.map(m => m.id)).toEqual([0, 1, 2, 3]);
    expect(after[2].ans).toEqual([7]); // the inserted entry sits at slot 2
  });

  it('inserts at the front when the anchor index is -1', () => {
    const entry: MappingEntry = { range: [0, 1], ans: [5], diff: 1, id: 0 };
    const after = withInsertedAfter(make(2), -1, entry);
    expect(after[0].ans).toEqual([5]);
    expect(after.map(m => m.id)).toEqual([0, 1, 2]);
  });
});

describe('withRemovedAt', () => {
  it('returns a new array with the entry removed and ids renumbered', () => {
    const before = make(3);
    const after = withRemovedAt(before, 1);
    expect(after).not.toBe(before);
    expect(before).toHaveLength(3);
    expect(after).toHaveLength(2);
    expect(after.map(m => m.id)).toEqual([0, 1]);
    expect(after.map(m => m.ans?.[0])).toEqual([0, 2]); // middle entry gone
  });

  it('is a no-op copy when index is -1', () => {
    const before = make(2);
    const after = withRemovedAt(before, -1);
    expect(after).not.toBe(before);
    expect(after.map(m => m.id)).toEqual([0, 1]);
  });
});
