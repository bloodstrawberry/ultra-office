const STORAGE_PREFIX = 'ultra-office:snake-puzzle:';
const storageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

function clearSnakePuzzleStorage() {
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
  clearItems: async () => clearSnakePuzzleStorage(),
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
    clearSnakePuzzleStorage();
  } catch {
    try {
      clearSnakePuzzleStorage();
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

/**
 * 워터마크 공유/결과 횟수 관련 Storage 헬퍼
 */
const WATERMARK_SHARE_COUNT_KEY = 'ai_watermark_share_count';

export const getShareCountSync = (): number => {
  const val = getLocalSync(WATERMARK_SHARE_COUNT_KEY);
  if (!val) return 0;
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const getShareCount = async (): Promise<number> => {
  const val = await getItem(WATERMARK_SHARE_COUNT_KEY);
  if (!val) return 0;
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const setShareCount = async (count: number): Promise<void> => {
  setLocalSync(WATERMARK_SHARE_COUNT_KEY, String(count));
  await setItem(WATERMARK_SHARE_COUNT_KEY, String(count));
};

export const incrementShareCount = async (): Promise<number> => {
  const current = await getShareCount();
  const next = current + 1;
  await setShareCount(next);
  return next;
};

/**
 * 전면형 광고 이벤트(문제 진입 + 문제 클리어) 카운트 Storage 헬퍼
 */
const GAME_AD_EVENT_COUNT_KEY = 'game_ad_event_count';

export const getAdEventCountSync = (): number => {
  const val = getLocalSync(GAME_AD_EVENT_COUNT_KEY);
  if (!val) return 0;
  const parsed = parseInt(val, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const incrementAdEventCountSync = (): number => {
  const current = getAdEventCountSync();
  const next = current + 1;
  setLocalSync(GAME_AD_EVENT_COUNT_KEY, String(next));
  setItem(GAME_AD_EVENT_COUNT_KEY, String(next)).catch(() => {});
  return next;
};

/** 하위 호환성을 위한 기존 헬퍼 */
export const incrementRetryCountSync = (): number => incrementAdEventCountSync();

export const incrementStageClearCountSync = (): number => incrementAdEventCountSync();

/**
 * 전면형 광고 시청 완료 시 이벤트 카운트를 초기화
 */
export const resetAdCountsSync = (): void => {
  setLocalSync(GAME_AD_EVENT_COUNT_KEY, '0');
  setItem(GAME_AD_EVENT_COUNT_KEY, '0').catch(() => {});
};

/**
 * 전면형 광고 시청 미완료(중도 종료 등) 여부 Storage 헬퍼
 */
const GAME_AD_PENDING_KEY = 'interstitial_ad_pending';

export const isAdPendingSync = (): boolean => getLocalSync(GAME_AD_PENDING_KEY) === 'true';

export const setAdPendingSync = (pending: boolean): void => {
  const val = pending ? 'true' : 'false';
  setLocalSync(GAME_AD_PENDING_KEY, val);
  setItem(GAME_AD_PENDING_KEY, val).catch(() => {});
};

export const clearAdPendingSync = (): void => {
  setAdPendingSync(false);
};

/**
 * 힌트 광고 시청 완료 문제 Storage 헬퍼
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

// ============================================================
// NEW_ADS & Logo Image Caching Storage 헬퍼
// ============================================================
const NEW_ADS_SAVED_IDS_KEY = 'new_ads_saved_ids_v1';
const NEW_AD_LOGO_PREFIX = 'new_ad_logo_v1_';
const NEW_ADS_CACHED_LIST_KEY = 'new_ads_cached_list_v1';
const NEW_ADS_LAST_FETCH_DATE_KEY = 'new_ads_last_fetch_date_v1';

export interface CachedNewAdData {
  id: string;
  title: string;
  subtitle: string;
  logoImage: string;
  linkUrl: string;
  buttonText: string;
  theme: string;
  duration?: number;
}

/** 오늘 날짜 문자열 반환 (YYYY-MM-DD) */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** 마지막으로 NEW_ADS를 가져온 날짜 읽기 */
export const getLastAdFetchDate = async (): Promise<string | null> =>
  await getItem(NEW_ADS_LAST_FETCH_DATE_KEY);

export const getLastAdFetchDateSync = (): string | null =>
  getLocalSync(NEW_ADS_LAST_FETCH_DATE_KEY);

/** 마지막으로 NEW_ADS를 가져온 날짜 저장 */
export const setLastAdFetchDate = async (dateStr: string): Promise<void> => {
  setLocalSync(NEW_ADS_LAST_FETCH_DATE_KEY, dateStr);
  await setItem(NEW_ADS_LAST_FETCH_DATE_KEY, dateStr);
};

/** 광고 관련 localStorage 데이터 모두 초기화 */
export const clearAdRelatedStorage = async (): Promise<void> => {
  const idsRaw = getLocalSync(NEW_ADS_SAVED_IDS_KEY);
  if (idsRaw) {
    try {
      const ids: string[] = JSON.parse(idsRaw);
      if (Array.isArray(ids)) {
        for (const id of ids) {
          removeLocalSync(`${NEW_AD_LOGO_PREFIX}${id}`);
          await removeItem(`${NEW_AD_LOGO_PREFIX}${id}`);
        }
      }
    } catch {
      // ignore
    }
  }

  removeLocalSync(NEW_ADS_SAVED_IDS_KEY);
  removeLocalSync(NEW_ADS_CACHED_LIST_KEY);
  await removeItem(NEW_ADS_SAVED_IDS_KEY);
  await removeItem(NEW_ADS_CACHED_LIST_KEY);
};

export const getSavedAdLogo = async (id: string): Promise<string | null> =>
  await getItem(`${NEW_AD_LOGO_PREFIX}${id}`);

export const getSavedAdLogoSync = (id: string): string | null =>
  getLocalSync(`${NEW_AD_LOGO_PREFIX}${id}`);

export const setSavedAdLogo = async (id: string, logoData: string): Promise<void> => {
  setLocalSync(`${NEW_AD_LOGO_PREFIX}${id}`, logoData);
  await setItem(`${NEW_AD_LOGO_PREFIX}${id}`, logoData);
};

export const getSavedNewAds = async (): Promise<CachedNewAdData[] | null> =>
  await getStorageJSON<CachedNewAdData[]>(NEW_ADS_CACHED_LIST_KEY);

export const getSavedNewAdsSync = (): CachedNewAdData[] | null => {
  const raw = getLocalSync(NEW_ADS_CACHED_LIST_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setSavedNewAds = async (ads: CachedNewAdData[]): Promise<void> => {
  const ids = ads.map((ad) => ad.id);
  setLocalSync(NEW_ADS_SAVED_IDS_KEY, JSON.stringify(ids));
  setLocalSync(NEW_ADS_CACHED_LIST_KEY, JSON.stringify(ads));

  await setStorageJSON(NEW_ADS_CACHED_LIST_KEY, ads);
  await setStorageJSON(NEW_ADS_SAVED_IDS_KEY, ids);
};
