export interface LinePart {
  lyric: string;
  range: [number, number];
  ans?: number[];
}

export interface LineObject {
  lyric?: string;           // required when no parts; omitted when parts is present
  lyric_jp?: string;        // Japanese lyrics (display-only)
  range?: [number, number]; // required when no parts; omitted when parts is present
  ans?: number[];
  parts?: LinePart[];
  diff?: number;
  tail?: string;
}

export type LineEntry = string | LineObject;

/** Raw song config as loaded from config.json */
export interface SongConfig {
  name: string;
  ogg: string;
  mp3?: string;
  id: string;
  group: GroupName;
  mapping?: MappingEntry[];
  lyrics?: string | string[];
  lines?: LineEntry[];
  slots?: SlotDetail[];
  singers?: number[];
  calls?: MappingEntry[];
  theme?: string;
  hidden?: boolean;
  added?: string;
  released?: string;
  subunit?: string;
  menu?: GroupName;
  cover?: string;
}

export interface MappingEntry {
  range: [number, number];
  ans?: number[];
  diff?: number;
  kdur?: number;
  id: number; // assigned during preprocessing
  lyric?: string; // user-edited lyric text (edit mode only, not persisted in JSON)
}

export interface SlotDetail {
  command: 'group' | 'ignore';
  members?: number[];
  slots?: number[];
}

export type GroupName = 'muse' | 'aqours' | 'saint-aqours-snow' | 'aqours-miku' | 'wug';
export type SortMode = 'index' | 'date' | 'alpha';

/** Processed slot ready for gameplay */
export interface Slot {
  id: number;
  mapping: MappingEntry & { members?: number[] };
  range: [number, number];
  ans: number[];
  diff: number;
  active: boolean;
  revealed: boolean;
  choices: number[];
  state: SlotState;
  element: HTMLElement | null;
}

export enum SlotState {
  Idle = 0,
  Correct = 1,
  Wrong = 2,
}

/** Processed lyric token */
export interface LyricToken {
  id: number;
  type: 'text' | 'newline' | 'lyric' | 'next-col';
  text?: string;
  textJp?: string;
  mapping?: MappingEntry;
  src?: 'mapping' | 'calls';
  push?: string;
  together?: boolean;
  active?: boolean;
  element?: HTMLElement;
}

/** Preprocessed song with derived game data */
export interface Song extends SongConfig {
  singers: number[];
  slotsBase: SlotBase[];
  lyricsBase: LyricToken[];
  calls: MappingEntry[];
}

export interface SlotBase {
  id: number;
  mapping: MappingEntry & { members?: number[] };
}

/** Global game state */
export interface GameState {
  group: GroupName;
  song: Song | null;
  mapping: MappingEntry[];
  singers: number[];
  slots: Slot[];
  lyrics: LyricToken[];
  reverseMap: Record<number, { slot?: Slot; lyric?: LyricToken }>;
  diff: number;
  autoscroll: boolean;
  themed: boolean;
  lyricsMode: number; // 0=off, 1=side, 2=full
  calls: boolean;
  callSFX: boolean;
  globalReveal: boolean;
  loaded: Date | null;
  assObjectURL: string;
  lastProgressUpdate: number | null;
  lastThemeUpdate: number | null;
  scrollSlotLock: number | null;
  scrollLyricLock: number | null;
  callSFXch: number;
  sortMode: SortMode;
  groupBySubunit: boolean;
  editMode: boolean;
  jpLyrics: boolean;
  controls: {
    lastSlotScroll: number;
    lastLyricScroll: number;
  };
}

export interface ChangelogEntry {
  date: string;
  change: string;
}

export interface HistoryEntry {
  date: string;
  songName: string;
  record: [number[], number[]][];
}

/** Member glow colors per group (from CSS text-shadow, used for sub-group gradients) */
export const MEMBER_COLORS: Record<string, Record<number, string>> = {
  muse: {
    1: '#F28541', 2: '#00B2DC', 3: '#8A9294', 4: '#0D72BA',
    5: '#F6C62A', 6: '#CC1C36', 7: '#935BAF', 8: '#45AE4D', 9: '#DD418A',
  },
  aqours: {
    1: '#F0A20B', 2: '#49B9F9', 3: '#E9A9E8', 4: '#E6D617',
    5: '#FB75E4', 6: '#898989', 7: '#F23B4C', 8: '#13E8AE', 9: '#AE58EB',
  },
  'saint-aqours-snow': {
    1: '#F0A20B', 2: '#49B9F9', 3: '#E9A9E8', 4: '#E6D617',
    5: '#FB75E4', 6: '#898989', 7: '#F23B4C', 8: '#13E8AE', 9: '#AE58EB',
    10: '#3AA5DC', 11: '#FFFFFF',
  },
  'aqours-miku': {
    1: '#F0A20B', 2: '#49B9F9', 3: '#E9A9E8', 4: '#E6D617',
    5: '#FB75E4', 6: '#898989', 7: '#F23B4C', 8: '#13E8AE', 9: '#AE58EB',
    12: '#39C5BB',
  },
  wug: {
    1: '#45AE4D', 2: '#DD418A', 3: '#F6C62A', 4: '#0D72BA',
    5: '#CC1C36', 6: '#935BAF', 7: '#00B2DC',
  },
};

/** Member name mappings per group */
export const MEMBER_MAPPING: Record<GroupName, Record<number, string>> = {
  muse: {
    1: 'Honoka', 2: 'Eli', 3: 'Kotori', 4: 'Umi',
    5: 'Rin', 6: 'Maki', 7: 'Nozomi', 8: 'Hanayo', 9: 'Nico',
  },
  aqours: {
    1: 'Chika', 2: 'You', 3: 'Riko', 4: 'Hanamaru',
    5: 'Ruby', 6: 'Yoshiko', 7: 'Dia', 8: 'Kanan', 9: 'Mari',
  },
  'saint-aqours-snow': {
    1: 'Chika', 2: 'You', 3: 'Riko', 4: 'Hanamaru',
    5: 'Ruby', 6: 'Yoshiko', 7: 'Dia', 8: 'Kanan', 9: 'Mari',
    10: 'Sarah', 11: 'Leah',
  },
  'aqours-miku': {
    1: 'Chika', 2: 'You', 3: 'Riko', 4: 'Hanamaru',
    5: 'Ruby', 6: 'Yoshiko', 7: 'Dia', 8: 'Kanan', 9: 'Mari',
    12: 'Miku',
  },
  wug: {
    1: 'Mayu', 2: 'Airi', 3: 'Minami', 4: 'Yoshino',
    5: 'Nanami', 6: 'Kaya', 7: 'Miyu',
  },
};
