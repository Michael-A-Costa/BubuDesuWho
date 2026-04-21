import { initPlayPage, initAboutPage, initChangelogPage, initStatsPage } from './ui';

// detect which page we're on and initialize accordingly
const path = location.pathname;

if (path.endsWith('play.html')) {
  initPlayPage();
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
