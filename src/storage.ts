const MAXHIST = 100;

export function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function getStorage(key: string): string | null {
  if (!hasLocalStorage()) return null;
  return localStorage.getItem(key);
}

export function setStorage(key: string, value: string): boolean {
  if (!hasLocalStorage()) return false;
  localStorage.setItem(key, value);
  return true;
}

export interface HistRecord {
  date: string;
  songName: string;
  slots: [number[], number[]][];
}

export function loadHistory(): HistRecord[] {
  const raw = getStorage('hist') || '[]';
  const arr = JSON.parse(raw) as [string, string, [number[], number[]][]][];
  return arr.map(([date, songName, slots]) => ({ date, songName, slots }));
}

export function saveHistory(record: HistRecord): void {
  const raw = getStorage('hist') || '[]';
  const arr = JSON.parse(raw) as unknown[];
  while (arr.length >= MAXHIST) arr.shift();
  arr.push([record.date, record.songName, record.slots]);
  setStorage('hist', JSON.stringify(arr));
}

export function loadChoicesForSong(songId: string): Record<string, number[]> {
  const raw = getStorage(songId + '-selections') || '{}';
  return JSON.parse(raw);
}

export function saveChoicesForSong(songId: string, choices: Record<string, number[]>): void {
  setStorage(songId + '-selections', JSON.stringify(choices));
}
