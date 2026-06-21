import { MappingEntry } from './types';

// Pure mapping-array edits for edit mode. Each returns a NEW array with ids
// renumbered to match position — the same "produce a new array, never splice in
// place" discipline the slot graph relies on (see CONTEXT.md §Slot graph), so a
// caller can reassign `state.mapping` and trust ids stay dense and ordered.

/** Renumber entries' `id` to their index, in place, and return the array. */
function renumber(mapping: MappingEntry[]): MappingEntry[] {
  mapping.forEach((m, i) => { m.id = i; });
  return mapping;
}

/** New array with `entry` inserted directly after `index`, ids renumbered.
 *  An `index` of -1 (entry not found) inserts at the front, matching
 *  Array.splice semantics on a missing anchor. */
export function withInsertedAfter(
  mapping: MappingEntry[],
  index: number,
  entry: MappingEntry,
): MappingEntry[] {
  const next = mapping.slice();
  next.splice(index + 1, 0, entry);
  return renumber(next);
}

/** New array with the entry at `index` removed, ids renumbered. An `index` of
 *  -1 (not found) is a no-op copy. */
export function withRemovedAt(mapping: MappingEntry[], index: number): MappingEntry[] {
  const next = mapping.slice();
  if (index !== -1) next.splice(index, 1);
  return renumber(next);
}
