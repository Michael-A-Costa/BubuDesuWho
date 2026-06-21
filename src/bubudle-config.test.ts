import { describe, expect, it } from 'vitest';
import { parseBubudleDiff, parseSongDiff } from './bubudle-config';

describe('parseBubudleDiff', () => {
  it('accepts the four known clip difficulties', () => {
    expect(parseBubudleDiff('all')).toBe('all');
    expect(parseBubudleDiff('normal')).toBe('normal');
    expect(parseBubudleDiff('hard')).toBe('hard');
    expect(parseBubudleDiff('insane')).toBe('insane');
  });

  it('rejects unknown / empty / nullish values', () => {
    expect(parseBubudleDiff('easy')).toBeNull();
    expect(parseBubudleDiff('')).toBeNull();
    expect(parseBubudleDiff(null)).toBeNull();
    expect(parseBubudleDiff(undefined)).toBeNull();
  });
});

describe('parseSongDiff', () => {
  it('accepts all + the three numeric tiers', () => {
    expect(parseSongDiff('all')).toBe('all');
    expect(parseSongDiff('1')).toBe('1');
    expect(parseSongDiff('2')).toBe('2');
    expect(parseSongDiff('3')).toBe('3');
  });

  it('rejects out-of-range and nullish values', () => {
    expect(parseSongDiff('4')).toBeNull();
    expect(parseSongDiff('hard')).toBeNull();
    expect(parseSongDiff(null)).toBeNull();
    expect(parseSongDiff(undefined)).toBeNull();
  });
});
