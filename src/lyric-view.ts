// The lyric-text seam: deciding what a lyric line should show for the current
// JP-toggle state, separated from the DOM write. This is the same pure-decision
// + single-adapter shape as `reveal.ts` (which owns reveal colouring); here the
// concern is the romaji ⇄ Japanese text swap and the hidden-line gap.

/** The token fields the JP-toggle decision reads. A LyricToken satisfies it. */
export interface JpTextSource {
  text?: string;
  /** The line's Japanese text. `undefined` means "no JP variant for this line"
   *  (stay on romaji); `''` is a deliberate gap that hides the line in JP mode. */
  textJp?: string;
}

/** How a lyric line should present its text. Each variant maps to exactly the
 *  DOM writes the original inline toggle performed — so the adapter is a
 *  faithful translation, not a behavioural change:
 *   - `jp-hidden`: hide the line, leave its text node untouched (JP gap).
 *   - `jp-text`:   set the JP text, leave `display` untouched (it was visible).
 *   - `romaji`:    set the romaji text and force the line visible. */
export type LyricPresentation =
  | { kind: 'jp-hidden' }
  | { kind: 'jp-text'; text: string }
  | { kind: 'romaji'; text: string };

/** Decide a lyric line's text presentation for the current JP-toggle state. */
export function lyricPresentation(token: JpTextSource, jpMode: boolean): LyricPresentation {
  if (jpMode && token.textJp != null) {
    return token.textJp === '' ? { kind: 'jp-hidden' } : { kind: 'jp-text', text: token.textJp };
  }
  return { kind: 'romaji', text: token.text ?? '' };
}

/** Render a presentation onto a lyric element. The only code that writes a
 *  lyric line's text/visibility for the JP toggle. */
export function applyLyricPresentation(element: HTMLElement, p: LyricPresentation): void {
  if (p.kind === 'jp-hidden') {
    element.style.display = 'none';
  } else if (p.kind === 'jp-text') {
    element.textContent = p.text;
  } else {
    element.textContent = p.text;
    element.style.display = '';
  }
}
