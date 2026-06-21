import { describe, expect, it } from 'vitest';
import { eligibleCandidates, FilterableCandidate, CandidateFilters } from './candidate-pool';

type C = FilterableCandidate & { label: string };

function cand(label: string, dur: number, diff: number, allSingers: number[], group = 'aqours'): C {
  return { label, range: [0, dur], diff, allSingers, song: { group } };
}

const NO_FILTER: CandidateFilters = { clipDiff: 'all', songDiff: 'all', subunitInclude: [], subunitExclude: [] };

function labels(pool: C[], f: Partial<CandidateFilters>): string[] {
  return eligibleCandidates(pool, { ...NO_FILTER, ...f }).map((c) => c.label);
}

describe('eligibleCandidates — clip difficulty', () => {
  const pool = [cand('short', 0.8, 1, [1]), cand('mid', 1.5, 1, [1]), cand('long', 3, 1, [1])];

  it('all keeps every clip length', () => {
    expect(labels(pool, { clipDiff: 'all' })).toEqual(['short', 'mid', 'long']);
  });
  it('normal keeps only clips longer than 2s', () => {
    expect(labels(pool, { clipDiff: 'normal' })).toEqual(['long']);
  });
  it('hard keeps clips at or under 2s', () => {
    expect(labels(pool, { clipDiff: 'hard' })).toEqual(['short', 'mid']);
  });
  it('insane keeps clips at or under 1s', () => {
    expect(labels(pool, { clipDiff: 'insane' })).toEqual(['short']);
  });
});

describe('eligibleCandidates — song difficulty', () => {
  const pool = [cand('d1', 3, 1, [1]), cand('d2', 3, 2, [1]), cand('d3', 3, 3, [1])];

  it('all keeps every tier', () => {
    expect(labels(pool, { songDiff: 'all' })).toEqual(['d1', 'd2', 'd3']);
  });
  it('a numeric tier keeps only that tier', () => {
    expect(labels(pool, { songDiff: '2' })).toEqual(['d2']);
  });
});

describe('eligibleCandidates — subunit include/exclude', () => {
  const pool = [cand('duo', 3, 1, [1, 2]), cand('trio', 3, 1, [3, 4, 5])];

  it('include keeps only matching singer-key', () => {
    expect(labels(pool, { subunitInclude: ['1,2'] })).toEqual(['duo']);
  });
  it('exclude drops the matching singer-key', () => {
    expect(labels(pool, { subunitExclude: ['1,2'] })).toEqual(['trio']);
  });
  it('saint-aqours-snow matches the "10,11" Saint Snow key by group', () => {
    const ss = [cand('ss', 3, 1, [1, 2, 3, 10, 11], 'saint-aqours-snow')];
    expect(labels(ss, { subunitInclude: ['10,11'] })).toEqual(['ss']);
    expect(labels(ss, { subunitExclude: ['10,11'] })).toEqual([]);
  });
});

describe('eligibleCandidates — combined filters', () => {
  it('applies clip, song-diff, and subunit together', () => {
    const pool = [
      cand('keep', 3, 2, [1, 2]),
      cand('wrongClip', 1, 2, [1, 2]),
      cand('wrongDiff', 3, 1, [1, 2]),
      cand('wrongUnit', 3, 2, [7, 8]),
    ];
    expect(labels(pool, { clipDiff: 'normal', songDiff: '2', subunitInclude: ['1,2'] })).toEqual(['keep']);
  });
});
