import { describe, expect, it } from 'vitest';
import { classifyGuess, parseGuessKey, buildShareText, MAX_ATTEMPTS } from './bubudle-share';

describe('parseGuessKey', () => {
  it('parses a sorted member-id key into numbers', () => {
    expect(parseGuessKey('1,3,5')).toEqual([1, 3, 5]);
  });

  it('parses a single-member key', () => {
    expect(parseGuessKey('7')).toEqual([7]);
  });
});

describe('classifyGuess', () => {
  const ans = [1, 2];
  const songSingers = [1, 2, 3, 4];

  it('marks a hit/near/miss mix', () => {
    expect(classifyGuess([1, 3, 9], ans, songSingers)).toEqual(['hit', 'near', 'miss']);
  });

  it('marks all-hit when every guessed member sings the line', () => {
    expect(classifyGuess([1, 2], ans, songSingers)).toEqual(['hit', 'hit']);
  });

  it('marks a subunit-style multi-member guess where none sing the line', () => {
    expect(classifyGuess([3, 4], ans, songSingers)).toEqual(['near', 'near']);
  });

  it('marks a member outside the song entirely as miss', () => {
    expect(classifyGuess([9], ans, songSingers)).toEqual(['miss']);
  });
});

describe('buildShareText', () => {
  const base = {
    label: 'Aqours',
    date: '2026-07-01',
    ans: [1, 2],
    songSingers: [1, 2, 3, 4],
    streak: 7,
    url: 'bubudesuwho.github.io/bubudle.html?daily=aqours',
  };

  it('shows n/MAX_ATTEMPTS on a win, with one emoji row per guess', () => {
    const text = buildShareText({
      ...base,
      guesses: [[1, 3], [1, 2]],
      correct: true,
    });
    const lines = text.split('\n');
    expect(lines[0]).toBe(`Bubudle (Aqours) 2026-07-01 · 2/${MAX_ATTEMPTS}`);
    expect(lines[1]).toBe('');
    expect(lines[2]).toBe('\u{1F7E9}\u{1F7E8}');
    expect(lines[3]).toBe('\u{1F7E9}\u{1F7E9}');
  });

  it('shows X/MAX_ATTEMPTS on a fail', () => {
    const text = buildShareText({
      ...base,
      guesses: [[3], [4], [1], [2]],
      correct: false,
    });
    expect(text.split('\n')[0]).toBe(`Bubudle (Aqours) 2026-07-01 · X/${MAX_ATTEMPTS}`);
  });

  it('includes the streak and url on their own trailing lines', () => {
    const text = buildShareText({
      ...base,
      guesses: [[1, 2]],
      correct: true,
    });
    const lines = text.split('\n');
    expect(lines[lines.length - 2]).toBe('Streak: 7');
    expect(lines[lines.length - 1]).toBe(base.url);
  });

  it('uses the given label for a K-pop scope', () => {
    const text = buildShareText({
      ...base,
      label: 'K-pop',
      guesses: [[1, 2]],
      correct: true,
      url: 'bubudesuwho.github.io/bubudle.html',
    });
    expect(text.split('\n')[0]).toBe(`Bubudle (K-pop) 2026-07-01 · 1/${MAX_ATTEMPTS}`);
    expect(text).toContain('bubudesuwho.github.io/bubudle.html');
  });
});
