import { describe, expect, it } from 'vitest';
import { lyricPresentation, applyLyricPresentation } from './lyric-view';

describe('lyricPresentation', () => {
  it('shows romaji when JP mode is off', () => {
    expect(lyricPresentation({ text: 'aozora', textJp: '青空' }, false)).toEqual({ kind: 'romaji', text: 'aozora' });
  });

  it('stays on romaji in JP mode when the line has no JP variant', () => {
    expect(lyricPresentation({ text: 'oi oi', textJp: undefined }, true)).toEqual({ kind: 'romaji', text: 'oi oi' });
  });

  it('shows the JP text in JP mode when present', () => {
    expect(lyricPresentation({ text: 'aozora', textJp: '青空' }, true)).toEqual({ kind: 'jp-text', text: '青空' });
  });

  it('treats an empty JP string as a deliberate hidden gap', () => {
    expect(lyricPresentation({ text: 'la la', textJp: '' }, true)).toEqual({ kind: 'jp-hidden' });
  });

  it('falls back to empty romaji text when the token has none', () => {
    expect(lyricPresentation({}, false)).toEqual({ kind: 'romaji', text: '' });
  });
});

// Minimal element stand-in recording the text/display writes (no jsdom).
function fakeEl(initial: { text?: string; display?: string } = {}) {
  const el = { textContent: initial.text ?? null, style: { display: initial.display ?? '' } };
  return el as unknown as HTMLElement & { textContent: string | null; style: { display: string } };
}

describe('applyLyricPresentation', () => {
  it('romaji sets text and forces the line visible', () => {
    const el = fakeEl({ display: 'none' });
    applyLyricPresentation(el, { kind: 'romaji', text: 'aozora' });
    expect(el.textContent).toBe('aozora');
    expect(el.style.display).toBe('');
  });

  it('jp-text sets text and leaves display untouched', () => {
    const el = fakeEl({ text: 'old', display: 'block' });
    applyLyricPresentation(el, { kind: 'jp-text', text: '青空' });
    expect(el.textContent).toBe('青空');
    expect(el.style.display).toBe('block'); // not reset — matches original
  });

  it('jp-hidden hides the line and leaves its text node untouched', () => {
    const el = fakeEl({ text: 'romaji-still-here', display: '' });
    applyLyricPresentation(el, { kind: 'jp-hidden' });
    expect(el.style.display).toBe('none');
    expect(el.textContent).toBe('romaji-still-here'); // untouched — matches original
  });
});
