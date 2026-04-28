import { inject } from '@vercel/analytics';
import { initAboutPage, initChangelogPage, initStatsPage } from './ui-about';

if (import.meta.env.VITE_VERCEL_ANALYTICS) inject();

// detect which page we're on and initialize accordingly
const path = location.pathname;

// `./ui` pulls in player → howler (~36 KB). About / Changelog / Stats don't
// need it, so play.html is the only page that statically loads it.
if (path.endsWith('play.html')) {
  import('./ui').then(m => m.initPlayPage());
} else if (path.endsWith('bubudle.html')) {
  import('./bubudle').then(m => m.initBubudlePage());
} else if (path.endsWith('submission.html')) {
  import('./submission').then(m => m.initSubmissionPage());
} else if (path.endsWith('changelog.html')) {
  initChangelogPage();
} else if (path.endsWith('stats.html')) {
  initStatsPage();
} else {
  // index.html or /
  initAboutPage();
}
