'use client';

import { useMemo, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'ultra-office:tool-favorites';
const CHANGE_EVENT = 'ultra-office:tool-favorites-change';
const EMPTY_SNAPSHOT = '[]';

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT;
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

function parseFavorites(snapshot: string): string[] {
  try {
    const value: unknown = JSON.parse(snapshot);
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function useToolFavorites() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const favorites = useMemo(() => parseFavorites(snapshot), [snapshot]);

  const toggleFavorite = (path: string) => {
    const current = parseFavorites(getSnapshot());
    const next = current.includes(path)
      ? current.filter((item) => item !== path)
      : [...current, path];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return { favorites, toggleFavorite };
}
