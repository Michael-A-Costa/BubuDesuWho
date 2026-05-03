import { getStorage, setStorage, hasLocalStorage } from './storage';
import { GroupName } from './types';

// One favorite member at a time, identified by canonical {group, id}.
// Stored as JSON in 'favorite-member'. Null/missing means no favorite.

const KEY = 'favorite-member';

export interface FavoriteMember {
  group: GroupName;
  id: number;
}

export function getFavorite(): FavoriteMember | null {
  const raw = getStorage(KEY);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (v && typeof v.group === 'string' && typeof v.id === 'number') {
      return { group: v.group as GroupName, id: v.id };
    }
  } catch { /* fall through */ }
  return null;
}

export function setFavorite(group: GroupName, id: number): void {
  setStorage(KEY, JSON.stringify({ group, id }));
}

export function clearFavorite(): void {
  if (!hasLocalStorage()) return;
  localStorage.removeItem(KEY);
}

export function isFavorite(group: GroupName, id: number): boolean {
  const fav = getFavorite();
  return !!fav && fav.group === group && fav.id === id;
}
