'use client';

import {
  setItem,
  getLocalSync,
  setLocalSync,
  isAdPendingSync,
  setAdPendingSync,
  clearAdPendingSync,
} from './local-storage';

export { isAdPendingSync, setAdPendingSync, clearAdPendingSync };

/**
 * 전면형 광고가 노출되었지만 시청이 완료되지 않은 상태(pending)인지 확인합니다.
 */
export function isAdPending(): boolean {
  return isAdPendingSync();
}

/**
 * 전면형 광고가 노출되었을 때 시청 미완료(pending) 상태로 기록합니다.
 */
export function recordAdPending(): void {
  setAdPendingSync(true);
}

/**
 * 전면형 광고 시청이 완료되었을 때 pending 상태를 해제합니다.
 */
export function clearAdPending(): void {
  clearAdPendingSync();
}

/** 전면형 광고 노출 기준 카운트 (문제 진입 및 클리어 횟수 합산, 기본값: 7회) */
export const AD_TRIGGER_COUNT = 10;

/** 광고 시청 후 쿨다운 시간 (1분 = 60초) */
const AD_COOLDOWN_MS = 60 * 1000;
const STORAGE_KEY = 'last_ad_shown_timestamp';

let memoryLastAdShownTimestamp = 0;

/**
 * 마지막으로 광고를 시청(또는 실행)한 후 1분(60초)이 지나지 않았는지 확인합니다.
 */
export function isAdOnCooldown(): boolean {
  let lastTime = memoryLastAdShownTimestamp;
  if (!lastTime && typeof window !== 'undefined') {
    try {
      const storedLocal = getLocalSync(STORAGE_KEY);
      lastTime = storedLocal ? parseInt(storedLocal, 10) || 0 : 0;
    } catch {
      // Storage 접근 예외 처리
    }
  }
  if (!lastTime) return false;
  return Date.now() - lastTime < AD_COOLDOWN_MS;
}

/**
 * 광고 시청 시점(실행/노출 시작 시점)을 기록합니다.
 */
export function recordAdShown(): void {
  const now = Date.now();
  memoryLastAdShownTimestamp = now;
  if (typeof window !== 'undefined') {
    try {
      setLocalSync(STORAGE_KEY, String(now));
      setItem(STORAGE_KEY, String(now)).catch(() => {});
    } catch {
      // Storage 접근 예외 처리
    }
  }
}
