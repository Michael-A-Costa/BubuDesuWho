import { GameState } from './types';

// Pulled out of `game.ts` so non-play modules (e.g. `ui-menu.ts`) can read
// game state without dragging the player → howler chain into their bundle.
/** Pick the song title to display given the current JP-toggle state.
 *  Falls back to `name` when the song has no `name_jp` (e.g. K-pop, or a
 *  Liella song whose romaji and JP titles match). Lives here (not in
 *  game.ts) so non-play bundles like ui-menu.ts can call it without
 *  pulling howler/player into their tree. */
export function getSongTitle(song: { name: string; name_jp?: string }): string {
  if (state.jpLyrics && song.name_jp) return song.name_jp;
  return song.name;
}

// ─── Active pool ────────────────────────────────────────────────────
// The members in play for the current mode (CONTEXT.md §Active pool). It is
// reset wholesale on each (re)load — the play page sets it from the song
// roster, Bubudle from the current clip's singers, and Bubudle narrows it on a
// hint. Going through this one write path keeps every mutation in a single,
// greppable seam instead of scattered `state.singers = …` assignments, and
// gives the named concept somewhere to grow an invariant later.

/** Read the active pool — the canonical input to reveal decisions. */
export function getActivePool(): number[] {
  return state.singers;
}

/** Replace the active pool. The only sanctioned way to write `state.singers`. */
export function setActivePool(members: number[]): void {
  state.singers = members;
}

export const state: GameState = {
  group: 'aqours',
  song: null,
  mapping: [],
  singers: [],
  slots: [],
  lyrics: [],
  diff: 1,
  autoscroll: true,
  themed: true,
  lyricsMode: 0,
  calls: false,
  callSFX: false,
  globalReveal: false,
  hints: false,
  inline: false,
  loaded: null,
  assObjectURL: '',
  lastProgressUpdate: null,
  lastThemeUpdate: null,
  scrollSlotLock: null,
  scrollLyricLock: null,
  sortMode: 'index',
  groupBy: { subunit: false, album: false },
  editMode: false,
  recordProgress: true,
  jpLyrics: false,
  callSFXch: 0,
  controls: { lastSlotScroll: 0, lastLyricScroll: 0 },
};
