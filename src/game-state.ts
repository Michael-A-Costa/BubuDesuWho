import { GameState } from './types';

// Pulled out of `game.ts` so non-play modules (e.g. `ui-menu.ts`) can read
// game state without dragging the player → howler chain into their bundle.
export const state: GameState = {
  group: 'aqours',
  song: null,
  mapping: [],
  singers: [],
  slots: [],
  lyrics: [],
  reverseMap: {},
  diff: 1,
  autoscroll: true,
  themed: true,
  lyricsMode: 0,
  calls: false,
  callSFX: false,
  globalReveal: false,
  hints: false,
  loaded: null,
  assObjectURL: '',
  lastProgressUpdate: null,
  lastThemeUpdate: null,
  scrollSlotLock: null,
  scrollLyricLock: null,
  sortMode: 'index',
  groupBySubunit: false,
  editMode: false,
  jpLyrics: false,
  callSFXch: 0,
  controls: { lastSlotScroll: 0, lastLyricScroll: 0 },
};
