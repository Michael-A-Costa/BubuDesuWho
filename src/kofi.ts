// Opens the Ko-fi tip jar in a modal iframe instead of navigating away.
// The iframe src is set on open (not in HTML) so Ko-fi isn't loaded until
// the user actually clicks, and cleared on close so the panel resets next
// time.

const EMBED_URL =
  'https://ko-fi.com/bubudesuwho/?hidefeed=true&widget=true&embed=true&preview=true';
const DISMISS_KEY = 'kofi-dismissed';

// Reset the dismiss flag on actual reload — sessionStorage normally survives
// reloads, but the user wants the button back after refresh while still
// staying hidden across in-site navigation (index.html ↔ play.html).
const navEntry = performance.getEntriesByType('navigation')[0] as
  | PerformanceNavigationTiming
  | undefined;
if (navEntry?.type === 'reload') sessionStorage.removeItem(DISMISS_KEY);

// Mobile parks the Ko-fi button after the Edit button in misc-controls so the
// title row stays compact; desktop returns it to song-title-utils.
function attachKofiToBreakpoint(wrap: HTMLElement): void {
  const desktop = document.querySelector<HTMLElement>('.song-title-utils');
  const mobileHost = document.getElementById('misc-controls');
  const editBtn = document.getElementById('edit-toggle');
  if (!desktop || !mobileHost || !editBtn) return;

  const mql = window.matchMedia('(max-width: 600px)');
  const place = (): void => {
    if (mql.matches) {
      if (wrap.parentElement !== mobileHost || wrap.previousElementSibling !== editBtn) {
        editBtn.after(wrap);
      }
    } else if (wrap.parentElement !== desktop) {
      desktop.appendChild(wrap);
    }
  };
  place();
  mql.addEventListener('change', place);
}

export function initKofi(): void {
  const btn = document.getElementById('kofi-button');
  const wrap = document.querySelector<HTMLElement>('.kofi-button-wrap');
  const dismiss = document.getElementById('kofi-dismiss');
  const modal = document.getElementById('kofi-modal');
  const iframe = document.getElementById('kofi-iframe') as HTMLIFrameElement | null;
  if (!btn || !modal || !iframe) return;

  if (wrap) attachKofiToBreakpoint(wrap);
  if (wrap && sessionStorage.getItem(DISMISS_KEY) === '1') wrap.hidden = true;
  dismiss?.addEventListener('click', (e) => {
    e.stopPropagation();
    sessionStorage.setItem(DISMISS_KEY, '1');
    if (wrap) wrap.hidden = true;
  });
  const closeBtn = modal.querySelector<HTMLElement>('.kofi-modal-close');

  const open = (): void => {
    iframe.src = EMBED_URL;
    modal.hidden = false;
  };
  const close = (): void => {
    modal.hidden = true;
    iframe.src = 'about:blank';
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (modal.hidden) open();
    else close();
  });
  closeBtn?.addEventListener('click', close);
  // Click-outside-to-close: the panel has no backdrop, so listen on the
  // document and close if the click didn't land inside it.
  document.addEventListener('click', (e) => {
    if (modal.hidden) return;
    if (!modal.contains(e.target as Node)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
}
