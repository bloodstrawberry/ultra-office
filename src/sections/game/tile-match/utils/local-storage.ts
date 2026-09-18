const STORAGE_PREFIX = 'ultra-office:tile-match:';
const storageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

function clearTileMatchStorage() {
  if (typeof localStorage === 'undefined') return;
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key);
  }
}

const Storage = {
  getItem: async (key: string) =>
    typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey(key)) : null,
  setItem: async (key: string, value: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(storageKey(key), value);
  },
  removeItem: async (key: string) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(storageKey(key));
  },
  clearItems: async () => clearTileMatchStorage(),
};

const isBrowser = typeof window !== 'undefined';

/**
 * Storage API 및 브라우저 localStorage 호환 래퍼 함수들
 */

export const getItem = async (key: string): Promise<string | null> => {
  if (!isBrowser) return null;
  try {
    const val = await Storage.getItem(key);
    if (val !== null && val !== undefined) return val;
  } catch (e) {
    console.warn('Storage.getItem failed, fallback to localStorage', e);
  }

  try {
    return localStorage.getItem(storageKey(key));
  } catch (e) {
    console.warn('localStorage.getItem failed', e);
    return null;
  }
};

export const setItem = async (key: string, value: string): Promise<void> => {
  if (!isBrowser) return;
  try {
    await Storage.setItem(key, value);
    localStorage.setItem(storageKey(key), value);
  } catch {
    try {
      localStorage.setItem(storageKey(key), value);
    } catch (err) {
      console.warn('localStorage.setItem failed', err);
    }
  }
};

export const removeItem = async (key: string): Promise<void> => {
  if (!isBrowser) return;
  try {
    await Storage.removeItem(key);
    localStorage.removeItem(storageKey(key));
  } catch {
    try {
      localStorage.removeItem(storageKey(key));
    } catch (err) {
      console.warn('localStorage.removeItem failed', err);
    }
  }
};

/**
 * 모든 Storage 데이터를 초기화
 */
export const clear = async (): Promise<void> => {
  if (!isBrowser) return;
  try {
    await Storage.clearItems();
    clearTileMatchStorage();
  } catch {
    try {
      clearTileMatchStorage();
    } catch (err) {
      console.warn('localStorage.clear failed', err);
    }
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
 * 브라우저 웹 환경에서 동기식 처리가 필요한 경우를 위한 localStorage 헬퍼
 */
export const getLocalSync = (key: string): string | null => {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(storageKey(key));
  } catch (e) {
    console.warn('localStorage.getItem failed', e);
    return null;
  }
};

export const setLocalSync = (key: string, value: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(storageKey(key), value);
  } catch (e) {
    console.warn('localStorage.setItem failed', e);
  }
};

export const removeLocalSync = (key: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(storageKey(key));
  } catch (e) {
    console.warn('localStorage.removeItem failed', e);
  }
};

export const getStorageJSONSync = <T>(key: string): T | null => {
  const val = getLocalSync(key);
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch (e) {
    console.warn('Failed to parse storage JSON sync', e);
    return null;
  }
};

export const setStorageJSONSync = <T>(key: string, value: T): void => {
  setLocalSync(key, JSON.stringify(value));
};

// ============================================================================
// 전면 광고(Interstitial Ad) 전용 로컬 카운트 관리 헬퍼
// ============================================================================

const AD_EVENT_COUNT_KEY = 'berry_hard_puzzle_ad_event_count';
const AD_PENDING_KEY = 'berry_hard_puzzle_ad_pending';

/**
 * 광고 트리거 이벤트 카운트를 1 증가시키고 새 카운트 값을 반환합니다.
 */
export const incrementAdEventCountSync = (): number => {
  const current = getLocalSync(AD_EVENT_COUNT_KEY);
  const nextCount = (current ? parseInt(current, 10) || 0 : 0) + 1;
  setLocalSync(AD_EVENT_COUNT_KEY, nextCount.toString());
  return nextCount;
};

/**
 * 광고 시청이 완료된 후 카운트 관련 상태를 초기화합니다.
 */
export const resetAdCountsSync = (): void => {
  setLocalSync(AD_EVENT_COUNT_KEY, '0');
};

/**
 * 쿨다운 등으로 미뤄진 광고가 대기 중인지 확인합니다.
 */
export const isAdPendingSync = (): boolean => getLocalSync(AD_PENDING_KEY) === 'true';

/**
 * 쿨다운 등의 이유로 광고를 지금 띄울 수 없을 때 대기 상태로 마킹합니다.
 */
export const setAdPendingSync = (value: boolean = true): void => {
  setLocalSync(AD_PENDING_KEY, value ? 'true' : 'false');
};

/**
 * 대기 중이던 광고가 성공적으로 소비되었을 때 플래그를 해제합니다.
 */
export const clearAdPendingSync = (): void => {
  removeLocalSync(AD_PENDING_KEY);
};

// ============================================================================
// 힌트 광고 시청 완료 문제 Storage 헬퍼
// ============================================================================
const WATCHED_HINT_STAGES_KEY = 'ultra-office:tile-match:watched_hint_stages';

export const getWatchedHintStagesSync = (): Record<number, boolean> => {
  const val = getLocalSync(WATCHED_HINT_STAGES_KEY);
  if (!val) return {};
  try {
    return JSON.parse(val) as Record<number, boolean>;
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
