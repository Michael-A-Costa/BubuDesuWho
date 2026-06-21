import { BubudleDifficulty, SongDifficulty } from './bubudle-config';

// The eligibility filter for the Bubudle candidate pool, lifted out of the page
// module as a pure function: given the full pool and the four active filter
// values, which clips are playable right now? Keeping it parameterised (no
// module-level reads) makes the difficulty × song-difficulty × subunit
// interactions a unit-test surface.

/** Lyric range duration thresholds per clip difficulty (seconds).
 *  All: any length · Normal: clips > 2s · Hard: clips ≤ 2s · Insane: clips ≤ 1s. */
const RANGE_CAPS: Record<BubudleDifficulty, number> = {
  all: Infinity,
  normal: 2,
  hard: 2,
  insane: 1,
};

export interface CandidateFilters {
  clipDiff: BubudleDifficulty;
  songDiff: SongDifficulty;
  subunitInclude: string[];
  subunitExclude: string[];
}

/** The minimal shape the filter reads. A full LyricCandidate satisfies it. */
export interface FilterableCandidate {
  range: [number, number];
  diff: number;
  allSingers: number[];
  song: { group: string };
}

export function eligibleCandidates<T extends FilterableCandidate>(
  candidates: T[],
  f: CandidateFilters,
): T[] {
  const cap = RANGE_CAPS[f.clipDiff];
  const diffFilter = f.songDiff === 'all' ? 0 : parseInt(f.songDiff, 10);
  const includeSet = f.subunitInclude.length > 0 ? new Set(f.subunitInclude) : null;
  const excludeSet = f.subunitExclude.length > 0 ? new Set(f.subunitExclude) : null;
  return candidates.filter((c) => {
    const dur = c.range[1] - c.range[0];
    const clipOk = f.clipDiff === 'all' ? true : f.clipDiff === 'normal' ? dur > cap : dur <= cap;
    if (!clipOk) return false;
    if (diffFilter !== 0 && c.diff !== diffFilter) return false;
    const key = c.allSingers.join(',');
    // Saint Snow ("10,11") subunit filter also covers saint-aqours-snow songs
    // (their allSingers usually span 1–11, so wouldn't match the "10,11" key on their own).
    const saintSnowMatch = c.song.group === 'saint-aqours-snow';
    const matchesKey = (set: Set<string>): boolean =>
      set.has(key) || (saintSnowMatch && set.has('10,11'));
    if (includeSet && !matchesKey(includeSet)) return false;
    if (excludeSet && matchesKey(excludeSet)) return false;
    return true;
  });
}
