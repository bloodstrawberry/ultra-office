'use client';

const STORAGE_PREFIX = 'ultra-office:push-push:';
const storageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

export const getLocalSync = (key: string): string | null => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(storageKey(key));
  } catch {
    return null;
  }
};

export const setLocalSync = (key: string, value: string): void => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey(key), value);
  } catch {
    // Ignore quota errors
  }
};

export const removeLocalSync = (key: string): void => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(storageKey(key));
  } catch {
    // Ignore errors
  }
};
