const isBrowser = typeof window !== 'undefined';

/**
 * Storage API 및 브라우저 localStorage 호환 래퍼 함수들
 */
export const getItem = async (key: string): Promise<string | null> => {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('localStorage.getItem failed', e);
    return null;
  }
};

export const setItem = async (key: string, value: string): Promise<void> => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn('localStorage.setItem failed', err);
  }
};

export const removeItem = async (key: string): Promise<void> => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('localStorage.removeItem failed', err);
  }
};

export const clear = async (): Promise<void> => {
  if (!isBrowser) return;
  try {
    localStorage.clear();
  } catch (err) {
    console.warn('localStorage.clear failed', err);
  }
};

export const clearItems = clear;

/**
 * JSON 객체를 위한 Helper 함수
 */
export const getStorageJSON = async <T>(key: string): Promise<T | null> => {
  const value = await getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.warn('Failed to parse storage JSON', e);
    return null;
  }
};

export const setStorageJSON = async <T>(key: string, value: T): Promise<void> => {
  await setItem(key, JSON.stringify(value));
};

/**
 * 동기식 처리가 필요한 경우를 위한 localStorage 헬퍼
 */
export const getLocalSync = (key: string): string | null => {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('localStorage.getItem failed', e);
    return null;
  }
};

export const setLocalSync = (key: string, value: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('localStorage.setItem failed', e);
  }
};

export const removeLocalSync = (key: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('localStorage.removeItem failed', e);
  }
};

/**
 * 힌트 확인 문제 Storage 헬퍼
 */
const WATCHED_HINT_STAGES_KEY = 'puzznic_watched_hint_stages';

export const getWatchedHintStagesSync = (): Record<number, boolean> => {
  const val = getLocalSync(WATCHED_HINT_STAGES_KEY);
  if (!val) return {};
  try {
    return JSON.parse(val);
  } catch {
    return {};
  }
};

export const getWatchedHintStages = async (): Promise<Record<number, boolean>> => {
  const data = await getStorageJSON<Record<number, boolean>>(WATCHED_HINT_STAGES_KEY);
  if (data) return data;
  return getWatchedHintStagesSync();
};

export const setWatchedHintStage = async (levelIndex: number): Promise<void> => {
  const current = getWatchedHintStagesSync();
  const next = { ...current, [levelIndex]: true };
  setLocalSync(WATCHED_HINT_STAGES_KEY, JSON.stringify(next));
  await setStorageJSON(WATCHED_HINT_STAGES_KEY, next);
};

export const clearWatchedHintStages = async (): Promise<void> => {
  removeLocalSync(WATCHED_HINT_STAGES_KEY);
  await removeItem(WATCHED_HINT_STAGES_KEY);
};

// Stub ad methods for compatibility if any component calls them
export const incrementAdEventCountSync = (): number => 0;
export const resetAdCountsSync = (): void => {};
export const isAdPendingSync = (): boolean => false;
export const clearAdPendingSync = (): void => {};
