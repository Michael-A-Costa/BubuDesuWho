import { describe, expect, it, beforeEach } from 'vitest';
import { saveMasteryCache, loadMasteryCache, masteryPct, type MasteryCacheEntry } from './storage';

// vitest runs in node with no localStorage — install a minimal in-memory stub.
function installLocalStorage(): void {
  const store = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    get length() { return store.size; },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
  };
}

describe('mastery cache', () => {
  beforeEach(installLocalStorage);

  const sample: MasteryCacheEntry[] = [
    { group: 'aqours', id: 1, correct: 8, attempted: 10, totalLines: 20 },
    { group: 'liella', id: 11, correct: 0, attempted: 0, totalLines: 5 },
  ];

  it('round-trips entries through save/load', () => {
    saveMasteryCache(sample);
    expect(loadMasteryCache()).toEqual(sample);
  });

  it('returns [] when nothing has been written', () => {
    expect(loadMasteryCache()).toEqual([]);
  });

  it('returns [] on corrupt JSON instead of throwing', () => {
    (globalThis as { localStorage: { setItem(k: string, v: string): void } })
      .localStorage.setItem('mastery-cache', '{not json');
    expect(() => loadMasteryCache()).not.toThrow();
    expect(loadMasteryCache()).toEqual([]);
  });
});

describe('masteryPct', () => {
  it('returns 0 when total is below 1 (no division by zero)', () => {
    expect(masteryPct(0, 0)).toBe(0);
    expect(masteryPct(5, 0)).toBe(0);
  });

  it('rounds the ratio to a whole percent', () => {
    expect(masteryPct(8, 20)).toBe(40);
    expect(masteryPct(1, 3)).toBe(33);
    expect(masteryPct(2, 3)).toBe(67);
  });

  it('clamps above 100 (catalog drift guard)', () => {
    expect(masteryPct(25, 20)).toBe(100);
  });

  it('matches a fully-mastered member at exactly 100', () => {
    expect(masteryPct(20, 20)).toBe(100);
  });
});
