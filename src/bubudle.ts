import { Song, Slot, SlotState, LineObject, MappingEntry, MEMBER_MAPPING } from './types';
import { loadConfig } from './config';
import { state, initGameState, loadSong, checkSlot, toggleChoice, toggleReveal } from './game';
import { buildMenu, toggleMenu, initThemeToggle, switchTheme } from './ui';
import * as player from './player';
import { getStorage, setStorage } from './storage';

interface LyricCandidate {
  lyric: string;
  lyricJp?: string;
  ans: number[];
  range: [number, number];
  song: Song;
  diff: number;
  sourceLine: LineObject;
  allSingers: number[];
}

/** Nickname labels for member buttons (seiyuu names in parentheses) */
const MEMBER_NICKNAMES: Record<number, string> = {
  1: 'Anchan', 2: 'Shukashuu', 3: 'Rikyako', 4: 'King',
  5: 'Furirin', 6: 'Aikyan', 7: 'Arisha', 8: 'Suwawa', 9: 'Ainya',
  10: 'Asamin', 11: 'Hinahina', 12: '',
};

/** Shortcut group buttons — label + member IDs. Only shown when all members are in the singer set. */
const SHORTCUT_GROUPS: { label: string; members: number[]; extraOnly?: boolean }[] = [
  { label: 'CYaRon', members: [1, 2, 5] },
  { label: 'Guilty Kiss', members: [3, 6, 9] },
  { label: 'AZALEA', members: [4, 7, 8] },
  { label: '1st years', members: [4, 5, 6] },
  { label: '2nd years', members: [1, 2, 3] },
  { label: '3rd years', members: [7, 8, 9] },
  { label: 'Aqours', members: [1, 2, 3, 4, 5, 6, 7, 8, 9], extraOnly: true },
  { label: 'Saint Snow', members: [10, 11] },
];

function createBubudleSlot(slot: Slot, singers: number[]): HTMLElement {
  const el = document.createElement('div');
  el.className = 'row slot';
  el.id = `slot${slot.id}`;
  el.dataset.diff = String(slot.diff);

  // Header (hidden in bubudle, but needed for toggleReveal structure)
  const header = document.createElement('div');
  header.className = 'col-xs-12 col-md-2 slot-header';
  header.style.display = 'none';
  header.innerHTML = `
    <span class="label label-default timerange"></span>
    <span class="jump-button glyphicon glyphicon-play" title="Jump" aria-hidden="true"></span>
    <span class="check-slot-button glyphicon glyphicon-ok" aria-hidden="true" title="Check this line"></span>
    <span class="reveal-button glyphicon glyphicon-search" title="Reveal answer" aria-hidden="true"></span>
    <span class="reveal-off-button glyphicon glyphicon-search" title="Unreveal" aria-hidden="true" style="display:none"></span>
    <span class="show-lyrics glyphicon glyphicon-question-sign" aria-hidden="true"></span>`;
  el.appendChild(header);

  // Body with member buttons
  const body = document.createElement('div');
  body.className = 'col-xs-12 col-md-10 slot-body';
  const row = document.createElement('div');
  row.className = 'row';
  body.appendChild(row);
  el.appendChild(body);

  const aqoursMembers = singers.filter(s => s <= 9);
  const extraMembers = singers.filter(s => s > 9);
  const memberMapping = MEMBER_MAPPING[state.group] ?? MEMBER_MAPPING.aqours;

  // Split aqours 9 into 3 columns of 3
  const cols: number[][] = [
    aqoursMembers.slice(0, 3),  // 1,2,3
    aqoursMembers.slice(3, 6),  // 4,5,6
    aqoursMembers.slice(6, 9),  // 7,8,9
  ];

  // Applicable shortcuts — only include if all members present in singer set
  const singerSet = new Set(singers);
  const hasExtras = extraMembers.length > 0;
  const shortcuts = SHORTCUT_GROUPS.filter(g =>
    g.members.every(m => singerSet.has(m)) && (!g.extraOnly || hasExtras));
  // Split shortcuts into two columns (subunits left, year-groups + extras right)
  const shortcutsLeft = shortcuts.filter(g => ['CYaRon', 'Guilty Kiss', 'AZALEA'].includes(g.label));
  const shortcutsRight = shortcuts.filter(g => !['CYaRon', 'Guilty Kiss', 'AZALEA'].includes(g.label));

  // If there are extra members but no subunit shortcuts, put extras in the left shortcut col
  // and year/group shortcuts in the right
  const hasSubunits = shortcutsLeft.length > 0;

  function makeBtn(value: string, label: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    btn.dataset.value = value;
    btn.textContent = label;
    return btn;
  }

  function makeCol(classes: string, buttons: HTMLButtonElement[]): HTMLElement {
    const col = document.createElement('div');
    col.className = classes;
    for (const btn of buttons) col.appendChild(btn);
    return col;
  }

  // Member columns (3 cols of individual members)
  const memberCols = cols.map(ids => {
    const buttons = ids.map(id => {
      const name = memberMapping[id] ?? `#${id}`;
      const nick = MEMBER_NICKNAMES[id];
      const label = nick ? `${name} (${nick})` : name;
      return makeBtn(String(id), label);
    });
    return buttons;
  });

  // Extra member buttons
  const extraBtns = extraMembers.map(id => {
    const name = memberMapping[id] ?? `#${id}`;
    const nick = MEMBER_NICKNAMES[id];
    const label = nick ? `${name} (${nick})` : name;
    return makeBtn(String(id), label);
  });

  // Shortcut buttons
  const leftShortcutBtns = (hasSubunits ? shortcutsLeft : shortcuts.filter(g => g.members.some(m => m > 9)))
    .map(g => makeBtn(g.members.join(','), g.label));
  const rightShortcutBtns = (hasSubunits ? shortcutsRight : shortcuts.filter(g => g.members.every(m => m <= 9)))
    .map(g => makeBtn(g.members.join(','), g.label));

  // Add extra member buttons to whichever shortcut column has room
  if (extraBtns.length > 0) {
    if (!hasSubunits) {
      leftShortcutBtns.unshift(...extraBtns);
    } else {
      leftShortcutBtns.push(...extraBtns);
    }
  }

  // Build layout: col1 | shortcutsLeft | col2 | shortcutsRight | col3
  // Using same Bootstrap grid as the templates
  row.appendChild(makeCol('col-xs-4 col-sm-offset-1 col-sm-2 btn-group-vertical', memberCols[0]));
  if (leftShortcutBtns.length > 0) {
    row.appendChild(makeCol('hidden-xs col-sm-push-4 col-sm-2 btn-group-vertical', leftShortcutBtns));
  }
  row.appendChild(makeCol('col-xs-4 col-sm-pull-2 col-sm-2 btn-group-vertical', memberCols[1]));
  if (rightShortcutBtns.length > 0) {
    row.appendChild(makeCol('hidden-xs col-sm-push-2 col-sm-2 btn-group-vertical', rightShortcutBtns));
  }
  row.appendChild(makeCol('col-xs-4 col-sm-pull-4 col-sm-2 btn-group-vertical', memberCols[2]));

  // Bind click handlers + disable non-singers
  el.querySelectorAll<HTMLElement>('.slot-body button[data-value]').forEach((btn) => {
    const members = btn.dataset.value!.split(',').map(Number);
    const disabled = members.some(m => !singerSet.has(m));
    if (disabled) {
      btn.classList.add('disabled');
    } else {
      btn.addEventListener('click', () => toggleChoice(btn, slot));
    }
    btn.addEventListener('mouseup', () => btn.blur());
  });

  // Bind reveal buttons
  el.querySelector('.reveal-button')!.addEventListener('click', () => toggleReveal(slot, true));
  const revealOffBtn = el.querySelector<HTMLElement>('.reveal-off-button')!;
  revealOffBtn.addEventListener('click', () => toggleReveal(slot, false));

  return el;
}

let candidates: LyricCandidate[] = [];
let current: LyricCandidate | null = null;
let checked = false;
let streak = 0;
let currentSlot: Slot | null = null;
let clipEnd: number | null = null;
let wrongCount = 0;
let previousGuesses: string[] = [];
let clipRange: [number, number] = [0, 0];
let songSingers: number[] = [];

type BubudleDifficulty = 'normal' | 'hard' | 'insane';
let bubudleDiff: BubudleDifficulty = 'normal';

// Max lyric range duration per difficulty (seconds) — filters which lyrics are eligible
const RANGE_CAPS: Record<BubudleDifficulty, number> = {
  normal: Infinity,
  hard: 3,
  insane: 1.5,
};

export async function initBubudlePage(): Promise<void> {
  player.initPlayer({
    onTick(currentTime) {
      if (clipEnd !== null && currentTime >= clipEnd) {
        clipEnd = null;
        player.pause();
      }
      updateSeekSlider(currentTime);
    },
  });

  initGameState();
  initBubudleDifficulty();
  const songs = await loadConfig();
  if (songs.length === 0) return;

  // Build sidebar menu (links go to play.html#song)
  buildMenu(songs);
  toggleMenu(window.innerWidth >= 1200);
  document.getElementById('menu-button')?.addEventListener('click', () => toggleMenu());
  initThemeToggle();
  initVolume();
  initSeekSlider();

  // Build candidate pool from all non-hidden songs with lines
  for (const song of songs) {
    if (!song.lines || song.hidden) continue;
    if (song.group !== 'aqours' && song.group !== 'saint-aqours-snow' && song.group !== 'aqours-miku') continue;

    const allSingers = new Set<number>();
    for (const line of song.lines) {
      if (typeof line === 'string') continue;
      const obj = line as LineObject;
      if (obj.parts) {
        for (const p of obj.parts) {
          if (p.ans) for (const a of p.ans) if (a > 0) allSingers.add(a);
        }
      } else if (obj.ans) {
        for (const a of obj.ans) if (a > 0) allSingers.add(a);
      }
    }
    const singerArr = Array.from(allSingers).sort((a, b) => a - b);

    for (const line of song.lines) {
      if (typeof line === 'string') continue;
      const obj = line as LineObject;

      const lineDiff = obj.diff ?? 1;

      if (obj.parts) {
        for (const part of obj.parts) {
          if (part.ans && part.ans.length > 0 && part.lyric.trim() && part.range) {
            const sorted = [...part.ans].filter(a => a > 0).sort((a, b) => a - b);
            if (sorted.length === 0) continue;
            if (arrEq(sorted, singerArr)) continue;
            candidates.push({ lyric: part.lyric, lyricJp: obj.lyric_jp, ans: sorted, range: part.range, song, diff: lineDiff, sourceLine: obj, allSingers: singerArr });
          }
        }
      } else if (obj.ans && obj.ans.length > 0 && obj.lyric?.trim() && obj.range) {
        const sorted = [...obj.ans].filter(a => a > 0).sort((a, b) => a - b);
        if (sorted.length === 0) continue;
        if (arrEq(sorted, singerArr)) continue;
        candidates.push({ lyric: obj.lyric, lyricJp: obj.lyric_jp, ans: sorted, range: obj.range, song, diff: lineDiff, sourceLine: obj, allSingers: singerArr });
      }
    }
  }

  streak = parseInt(getStorage('bubudle-streak') ?? '0', 10) || 0;
  updateStreak();

  // Bind controls
  document.getElementById('bubudle-check-bottom')!.addEventListener('click', checkAnswer);
  document.getElementById('bubudle-next-bottom')!.addEventListener('click', () => pickRandom());
  document.getElementById('bubudle-play')!.addEventListener('click', () => playClip());
  document.getElementById('bubudle-bad-timestamp')!.addEventListener('click', reportBadTimestamp);
  document.getElementById('bubudle-flag-diff')!.addEventListener('click', () => {
    const opts = document.getElementById('bubudle-diff-options')!;
    opts.style.display = opts.style.display === 'none' ? '' : 'none';
    document.getElementById('bubudle-singer-options')!.style.display = 'none';
  });
  document.querySelectorAll<HTMLElement>('.bubudle-diff-pick').forEach((btn) => {
    btn.addEventListener('click', () => flagDifficulty(parseInt(btn.dataset.diff!, 10)));
  });
  document.getElementById('bubudle-flag-singer')!.addEventListener('click', () => {
    const opts = document.getElementById('bubudle-singer-options')!;
    opts.style.display = opts.style.display === 'none' ? '' : 'none';
    document.getElementById('bubudle-diff-options')!.style.display = 'none';
  });
  document.querySelectorAll<HTMLElement>('.bubudle-singer-pick').forEach((btn) => {
    btn.addEventListener('click', () => btn.classList.toggle('active'));
  });
  document.getElementById('bubudle-singer-submit')!.addEventListener('click', flagSinger);
  document.getElementById('bubudle-singer-idk')!.addEventListener('click', flagSingerUnknown);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (!checked) checkAnswer();
      else pickRandom();
    } else if (e.key === 'c') {
      if (!checked) checkAnswer();
      else pickRandom();
    } else if (e.key === ' ') {
      e.preventDefault();
      playClip();
    }
  });

  pickRandom(true);

  if (logEntries.length > 0) renderLog();
}

function arrEq(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function saveCurrent(c: LyricCandidate, answered = false): void {
  setStorage(`bubudle-current-${bubudleDiff}`, JSON.stringify({
    songId: c.song.id,
    lyric: c.lyric,
    range: c.range,
    answered,
  }));
}

function restoreCurrent(): { candidate: LyricCandidate; answered: boolean } | null {
  const raw = getStorage(`bubudle-current-${bubudleDiff}`);
  if (!raw) return null;
  try {
    const { songId, lyric, range, answered } = JSON.parse(raw);
    const candidate = candidates.find(c =>
      c.song.id === songId && c.lyric === lyric &&
      c.range[0] === range[0] && c.range[1] === range[1]
    );
    if (!candidate) return null;
    return { candidate, answered: !!answered };
  } catch { return null; }
}

function eligibleCandidates(): LyricCandidate[] {
  const cap = RANGE_CAPS[bubudleDiff];
  if (cap === Infinity) return candidates;
  return candidates.filter(c => (c.range[1] - c.range[0]) <= cap);
}

function pickRandom(initial = false, tryRestore = false): void {
  let restoredAnswered = false;
  const pool = eligibleCandidates();
  if (initial || tryRestore) {
    const restored = restoreCurrent();
    if (restored) {
      current = restored.candidate;
      restoredAnswered = restored.answered;
    } else {
      current = pool[Math.floor(Math.random() * pool.length)];
    }
  } else {
    current = pool[Math.floor(Math.random() * pool.length)];
  }
  saveCurrent(current, restoredAnswered);
  checked = false;
  wrongCount = 0;
  previousGuesses = [];
  clipRange = calcClipRange(current.range);
  updateLyricMarker();

  // Load audio first — loadSong sets state.group/singers from the song config,
  // so we override those after with values derived from the actual lyrics.
  const song = current.song;
  loadSong(song);

  songSingers = current.allSingers;
  const aqoursBase = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const extras = current.allSingers.filter(s => s > 9);
  state.singers = [...aqoursBase, ...extras];
  // state.group must cover all members for toggleChoice color/ID lookups
  state.group = extras.includes(12) ? 'aqours-miku'
    : extras.some(s => s === 10 || s === 11) ? 'saint-aqours-snow'
    : 'aqours';
  state.editMode = false;
  state.lyrics = [];
  state.reverseMap = {};

  // Create a fake mapping entry for this lyric line
  const diff = current.diff;
  const mapping: MappingEntry = {
    range: current.range,
    ans: current.ans,
    diff,
    id: 0,
  };

  currentSlot = {
    id: 0,
    mapping,
    range: current.range,
    ans: current.ans,
    diff,
    active: false,
    revealed: false,
    choices: [],
    state: SlotState.Idle,
    element: null,
  };

  state.slots = [currentSlot];
  state.mapping = [mapping];

  // Build slot dynamically based on actual singers
  const container = document.getElementById('slots')!;
  container.innerHTML = '';
  const el = createBubudleSlot(currentSlot, state.singers);
  currentSlot.element = el;
  container.appendChild(el);

  // Update lyric card
  document.getElementById('bubudle-lyric')!.textContent = current.lyric;
  const jpEl = document.getElementById('bubudle-lyric-jp')!;
  if (current.lyricJp) {
    jpEl.textContent = current.lyricJp;
    jpEl.style.display = '';
  } else {
    jpEl.textContent = '';
    jpEl.style.display = 'none';
  }

  // Reset all hint lines
  resetHints();

  // Update difficulty badge
  const diffBadge = document.getElementById('bubudle-diff')!;
  const diffLabels = ['', 'Normal', 'Hard', 'Insane'];
  const diffClasses = ['', 'diff-normal', 'diff-hard', 'diff-insane'];
  diffBadge.textContent = diffLabels[diff] || `Diff ${diff}`;
  diffBadge.className = 'bubudle-diff ' + (diffClasses[diff] || '');

  // Reset theme and title
  switchTheme(null);
  document.getElementById('song-title')!.textContent = 'Bubudle';

  if (restoredAnswered) {
    // Already answered — show resolved state
    checked = true;
    revealSongName(current.song);
    switchTheme(current.song.id);
    toggleReveal(currentSlot!, true);
    document.getElementById('bubudle-check-bottom')!.style.display = 'none';
    document.getElementById('bubudle-next-bottom')!.style.display = '';
  } else {
    // Show check, hide next
    document.getElementById('bubudle-check-bottom')!.style.display = '';
    document.getElementById('bubudle-next-bottom')!.style.display = 'none';
  }

  if (!initial) playClip(true);
}

function playClip(forcePlay = false): void {
  if (!current) return;

  if (!forcePlay && player.isPlaying()) {
    player.pause();
    const playBtn = document.querySelector<HTMLElement>('.jp-play');
    const pauseBtn = document.querySelector<HTMLElement>('.jp-pause');
    if (playBtn) playBtn.style.display = 'inline-block';
    if (pauseBtn) pauseBtn.style.display = 'none';
    return;
  }

  clipEnd = clipRange[1] + 0.5;
  player.play(clipRange[0]);

  const playBtn = document.querySelector<HTMLElement>('.jp-play');
  const pauseBtn = document.querySelector<HTMLElement>('.jp-pause');
  if (playBtn) playBtn.style.display = 'none';
  if (pauseBtn) pauseBtn.style.display = 'inline-block';
}

function checkAnswer(): void {
  if (!current || !currentSlot || checked) return;
  if (currentSlot.choices.length === 0) return;

  const guessKey = [...currentSlot.choices].sort((a, b) => a - b).join(',');
  if (previousGuesses.includes(guessKey)) return;
  previousGuesses.push(guessKey);
  renderGuesses();

  checkSlot(currentSlot);

  const correct = currentSlot.state === SlotState.Correct;
  if (correct) {
    checked = true;
    streak++;
    setStorage('bubudle-streak', String(streak));
    updateStreak();

    revealSongName(current.song);
    switchTheme(current.song.id);
    saveCurrent(current, true);

    document.getElementById('bubudle-check-bottom')!.style.display = 'none';
    document.getElementById('bubudle-next-bottom')!.style.display = '';
    if (!player.isPlaying()) playClip(true);
    return;
  }

  // Wrong answer — apply progressive hints
  wrongCount++;

  if (wrongCount === 1) {
    // Hint 1: extend clip range by 1s each side
    clipRange[0] = Math.max(0, clipRange[0] - 1);
    clipRange[1] = clipRange[1] + 1;
    updateLyricMarker();
    revealHint('bubudle-hint-clip', 'Clip', '+1s each side');
    resetSlotForRetry(currentSlot);
  } else if (wrongCount === 2) {
    // Hint 2: reveal song name
    revealHint('bubudle-hint-song', 'Song', current.song.name);
    switchTheme(current.song.id);
    // Also reveal theme if available
    if (current.song.theme) {
      revealHint('bubudle-hint-theme', 'Theme', current.song.theme);
    }
    resetSlotForRetry(currentSlot);
  } else if (wrongCount === 3) {
    // Hint 3: narrow down to the song's actual singers (subgroup)
    if (songSingers.length < state.singers.length) {
      state.singers = songSingers;
      narrowToSingers(currentSlot, songSingers);
      revealHint('bubudle-hint-narrow', 'Singers', 'Narrowed to subgroup');
    } else {
      revealHint('bubudle-hint-narrow', 'Singers', 'Full group');
    }
    resetSlotForRetry(currentSlot);
  } else {
    // 4th wrong: give up, reveal answer
    checked = true;
    streak = 0;
    setStorage('bubudle-streak', String(streak));
    updateStreak();
    toggleReveal(currentSlot, true);

    revealSongName(current.song);
    saveCurrent(current, true);

    document.getElementById('bubudle-check-bottom')!.style.display = 'none';
    document.getElementById('bubudle-next-bottom')!.style.display = '';
  }

  if (!player.isPlaying()) playClip(true);
}

function resetSlotForRetry(slot: Slot): void {
  if (!slot.element) return;
  slot.element.classList.remove('slot-wrong', 'slot-correct');
  slot.state = SlotState.Idle;
  slot.choices = [];
  slot.element.querySelectorAll<HTMLElement>('button.active').forEach((btn) => {
    btn.classList.remove('active');
    btn.style.removeProperty('--member-accent');
    btn.style.removeProperty('--member-accent-border');
  });
}

function narrowToSingers(slot: Slot, singers: number[]): void {
  if (!slot.element) return;
  slot.element.querySelectorAll<HTMLElement>('.slot-body button[data-value]').forEach((btn) => {
    const members = btn.dataset.value!.split(',').map(Number);
    const outside = members.some((m) => !singers.includes(m));
    if (outside && !btn.classList.contains('disabled')) {
      btn.classList.add('disabled');
      btn.classList.remove('active');
      btn.style.removeProperty('--member-accent');
      btn.style.removeProperty('--member-accent-border');
      // Remove click handler by replacing with clone
      const clone = btn.cloneNode(true) as HTMLElement;
      btn.replaceWith(clone);
    }
  });
}

let logEntries: { tag: string; text: string; data: unknown }[] = loadLogEntries();

function loadLogEntries(): { tag: string; text: string; data: unknown }[] {
  const raw = getStorage('bubudle-flags');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveLogEntries(): void {
  setStorage('bubudle-flags', JSON.stringify(logEntries));
}

function appendToLog(tag: string, text: string, data: unknown): void {
  console.warn(`[${tag}]`, JSON.stringify(data, null, 2));
  logEntries.push({ tag, text, data });
  saveLogEntries();
  renderLog();
}

function renderLog(): void {
  let logEl = document.getElementById('bubudle-ts-log');
  if (!logEl) {
    const wrap = document.createElement('div');
    wrap.id = 'bubudle-log-wrap';
    wrap.className = 'bubudle-log-wrap';

    logEl = document.createElement('pre');
    logEl.id = 'bubudle-ts-log';
    logEl.className = 'bubudle-ts-log';

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-default btn-xs bubudle-export-btn';
    exportBtn.textContent = 'Export';
    exportBtn.addEventListener('click', exportLog);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-default btn-xs bubudle-export-btn';
    clearBtn.textContent = 'Clear';
    clearBtn.style.marginLeft = '4px';
    clearBtn.addEventListener('click', clearLog);

    wrap.appendChild(exportBtn);
    wrap.appendChild(clearBtn);
    wrap.appendChild(logEl);
    document.getElementById('slots-container')!.appendChild(wrap);
  }
  logEl.textContent = logEntries.map((e) => `[${e.tag}] ${e.text}`).join('\n');
}

function exportLog(): void {
  const lines = logEntries.map((e) => `[${e.tag}] ${e.text}`).join('\n');
  const blob = new Blob([lines + '\n'], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bubudle-flags-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearLog(): void {
  logEntries = [];
  saveLogEntries();
  const wrap = document.getElementById('bubudle-log-wrap');
  if (wrap) wrap.remove();
}

function candidateLine(c: LyricCandidate): Record<string, unknown> {
  const line: Record<string, unknown> = { lyric: c.lyric, ans: c.ans, range: c.range };
  if (c.lyricJp) line.lyric_jp = c.lyricJp;
  if (c.diff > 1) line.diff = c.diff;
  return line;
}

function reportBadTimestamp(): void {
  if (!current) return;
  const line = candidateLine(current);
  appendToLog('BAD TS', `${current.song.id} | ${JSON.stringify(line)}`, {
    song: current.song.name,
    songId: current.song.id,
    line,
  });
  pickRandom();
}

function flagDifficulty(shouldBe: number): void {
  if (!current) return;
  const updated = candidateLine(current);
  if (shouldBe > 1) updated.diff = shouldBe; else delete updated.diff;
  appendToLog('FLAG DIFF', `${current.song.id} | ${JSON.stringify(updated)}`, {
    song: current.song.name,
    songId: current.song.id,
    currentDiff: current.diff,
    shouldBe,
    updatedLine: updated,
  });
  document.getElementById('bubudle-diff-options')!.style.display = 'none';
  pickRandom();
}

function flagSinger(): void {
  if (!current) return;
  const picked = Array.from(document.querySelectorAll<HTMLElement>('.bubudle-singer-pick.active'))
    .map((btn) => parseInt(btn.dataset.singer!, 10))
    .sort((a, b) => a - b);
  if (picked.length === 0) return;

  const updated = candidateLine(current);
  updated.ans = picked;
  appendToLog('FLAG SINGER', `${current.song.id} | ${JSON.stringify(updated)}`, {
    song: current.song.name,
    songId: current.song.id,
    currentAns: current.ans,
    shouldBe: picked,
    updatedLine: updated,
  });

  // Reset singer picks
  document.querySelectorAll<HTMLElement>('.bubudle-singer-pick.active').forEach((b) => b.classList.remove('active'));
  document.getElementById('bubudle-singer-options')!.style.display = 'none';
  pickRandom();
}

function flagSingerUnknown(): void {
  if (!current) return;
  const line = candidateLine(current);
  appendToLog('FLAG SINGER', `${current.song.id} | IDK | ${JSON.stringify(line)}`, {
    song: current.song.name,
    songId: current.song.id,
    currentAns: current.ans,
    shouldBe: 'unknown',
    line,
  });
  document.querySelectorAll<HTMLElement>('.bubudle-singer-pick.active').forEach((b) => b.classList.remove('active'));
  document.getElementById('bubudle-singer-options')!.style.display = 'none';
  pickRandom();
}

function revealSongName(song: Song): void {
  const el = document.getElementById('bubudle-hint-song')!;
  el.innerHTML = '';
  const label = document.createElement('span');
  label.className = 'hint-label';
  label.textContent = 'Song:';
  const value = document.createElement('span');
  value.className = 'hint-value';
  const a = document.createElement('a');
  a.href = `play.html#${song.id}`;
  a.textContent = song.name;
  value.appendChild(a);
  el.appendChild(label);
  el.appendChild(value);
  el.classList.add('revealed');

  if (song.theme) {
    revealHint('bubudle-hint-theme', 'Theme', song.theme);
  }
}

function revealHint(id: string, label: string, value: string): void {
  const el = document.getElementById(id)!;
  el.innerHTML = `<span class="hint-label">${label}:</span> <span class="hint-value">${value}</span>`;
  el.classList.add('revealed');
}

function resetHints(): void {
  for (const id of ['bubudle-hint-clip', 'bubudle-hint-song', 'bubudle-hint-narrow', 'bubudle-hint-theme']) {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = '';
      el.classList.remove('revealed');
    }
  }
  const guessEl = document.getElementById('bubudle-guesses');
  if (guessEl) guessEl.innerHTML = '';
}

function renderGuesses(): void {
  const el = document.getElementById('bubudle-guesses');
  if (!el || !current || previousGuesses.length === 0) return;
  const group = current.song.group;
  const names = MEMBER_MAPPING[group] || {};
  el.innerHTML = '<span class="hint-label">Guessed:</span>' +
    previousGuesses.map(g => {
      const label = g.split(',').map(n => names[parseInt(n, 10)] || n).join(', ');
      return `<div class="bubudle-guess">${label}</div>`;
    }).join('');
}

function initBubudleDifficulty(): void {
  const saved = getStorage('bubudle-diff') as BubudleDifficulty | null;
  if (saved && saved in RANGE_CAPS) bubudleDiff = saved;

  // Sync button state
  document.querySelectorAll<HTMLElement>('.bubudle-diff-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.bdiff === bubudleDiff);
    btn.addEventListener('click', () => {
      bubudleDiff = btn.dataset.bdiff as BubudleDifficulty;
      setStorage('bubudle-diff', bubudleDiff);
      document.querySelectorAll<HTMLElement>('.bubudle-diff-btn').forEach((b) =>
        b.classList.toggle('active', b.dataset.bdiff === bubudleDiff)
      );
      // Restore saved quiz for this level, or pick a new one
      pickRandom(false, true);
    });
  });

  // Hover tooltip on (?)
  const helpEl = document.getElementById('bubudle-diff-help');
  if (helpEl) {
    let tip: HTMLElement | null = null;
    helpEl.addEventListener('mouseenter', () => {
      tip = document.createElement('div');
      tip.className = 'slot-tooltip';
      tip.innerHTML = '<b>Normal</b> — any lyric<br><b>Hard</b> — short lyrics (≤3s)<br><b>Insane</b> — very short lyrics (≤1.5s)';
      document.body.appendChild(tip);
      const rect = helpEl.getBoundingClientRect();
      tip.style.top = `${rect.bottom + window.scrollY + 4}px`;
      tip.style.left = `${rect.left + window.scrollX + rect.width / 2 - tip.offsetWidth / 2}px`;
    });
    helpEl.addEventListener('mouseleave', () => {
      tip?.remove();
      tip = null;
    });
  }
}

function calcClipRange(range: [number, number]): [number, number] {
  const start = Math.max(0, range[0] - 0.5);
  const end = range[1] + 1;
  return [start, end];
}

function updateLyricMarker(): void {
  const marker = document.getElementById('bubudle-lyric-marker');
  if (!marker || !current) return;
  const clipDur = clipRange[1] - clipRange[0];
  if (clipDur <= 0) return;
  const lyricStart = current.range[0] - clipRange[0];
  const lyricEnd = current.range[1] - clipRange[0];
  const leftPct = Math.max(0, (lyricStart / clipDur) * 100);
  const widthPct = Math.min(100 - leftPct, ((lyricEnd - lyricStart) / clipDur) * 100);
  marker.style.left = `${leftPct}%`;
  marker.style.width = `${widthPct}%`;
}

function updateStreak(): void {
  const el = document.getElementById('bubudle-streak')!;
  if (streak > 0) {
    el.textContent = `Streak: ${streak}`;
    el.style.display = '';
  } else {
    el.style.display = 'none';
  }
}

let seekDragging = false;

function initSeekSlider(): void {
  const slider = document.getElementById('bubudle-seek-slider') as HTMLInputElement | null;
  if (!slider) return;
  slider.addEventListener('mousedown', () => { seekDragging = true; });
  slider.addEventListener('touchstart', () => { seekDragging = true; });
  slider.addEventListener('change', () => {
    seekDragging = false;
    const clipDur = clipRange[1] - clipRange[0];
    if (clipDur > 0) {
      const t = clipRange[0] + (parseInt(slider.value, 10) / 1000) * clipDur;
      player.play(t);
      clipEnd = clipRange[1] + 0.5;
    }
  });
}

function updateSeekSlider(currentTime: number): void {
  if (seekDragging) return;
  const slider = document.getElementById('bubudle-seek-slider') as HTMLInputElement | null;
  const timeEl = document.getElementById('bubudle-time');
  const clipDur = clipRange[1] - clipRange[0];
  const relative = Math.max(0, Math.min(currentTime - clipRange[0], clipDur));
  if (slider && clipDur > 0) {
    slider.value = String(Math.round((relative / clipDur) * 1000));
  }
  if (timeEl) {
    const mins = Math.floor(relative / 60);
    const secs = Math.floor(relative % 60);
    timeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

function initVolume(): void {
  const savedVol = getStorage('volume');
  if (savedVol) player.setVolume(parseFloat(savedVol));

  const slider = document.getElementById('bubudle-volume-slider') as HTMLInputElement | null;
  if (slider) {
    slider.value = String(Math.round(player.getVolume() * 100));
    slider.addEventListener('input', () => {
      const vol = parseInt(slider.value, 10) / 100;
      player.setVolume(vol);
      setStorage('volume', String(vol));
    });
  }
}
