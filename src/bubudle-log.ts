import { getStorage, setStorage } from './storage';

type LogEntry = { tag: string; text: string; display?: string; data: unknown };

let logEntries: LogEntry[] = loadLogEntries();

function loadLogEntries(): LogEntry[] {
  const raw = getStorage('bubudle-flags');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveLogEntries(): void {
  setStorage('bubudle-flags', JSON.stringify(logEntries));
}

export function appendToLog(tag: string, text: string, data: unknown, display?: string): void {
  console.warn(`[${tag}]`, JSON.stringify(data, null, 2));
  logEntries.push({ tag, text, display, data });
  saveLogEntries();
  renderLog();
}

export function renderLog(): void {
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
  logEl.textContent = logEntries.map((e) => `[${e.tag}] ${e.display ?? e.text}`).join('\n');
}

export function hasLogEntries(): boolean {
  return logEntries.length > 0;
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
