import { describe, expect, it } from 'vitest';
import { state, getActivePool, setActivePool, getSongTitle } from './game-state';

describe('active pool seam', () => {
  it('reads back what was set', () => {
    setActivePool([3, 1, 2]);
    expect(getActivePool()).toEqual([3, 1, 2]);
    expect(state.singers).toEqual([3, 1, 2]); // same backing field
  });

  it('replaces wholesale rather than merging', () => {
    setActivePool([1, 2, 3]);
    setActivePool([9]);
    expect(getActivePool()).toEqual([9]);
  });
});

describe('getSongTitle', () => {
  it('uses name_jp only when JP lyrics are on and a JP title exists', () => {
    state.jpLyrics = false;
    expect(getSongTitle({ name: 'Aozora', name_jp: '青空' })).toBe('Aozora');
    state.jpLyrics = true;
    expect(getSongTitle({ name: 'Aozora', name_jp: '青空' })).toBe('青空');
    expect(getSongTitle({ name: 'Aozora' })).toBe('Aozora'); // no JP title → falls back
    state.jpLyrics = false; // restore shared state for other suites
  });
});
