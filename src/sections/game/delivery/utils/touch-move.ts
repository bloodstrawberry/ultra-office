'use client';

import { getLocalSync, setLocalSync } from './local-storage';

export const TOUCH_MOVE_STORAGE_KEY = 'puzznic_touch_move_enabled';
export const TOUCH_MOVE_CHANGE_EVENT = 'puzznic_touch_move_change';

let touchMoveEnabledState = false;

if (typeof window !== 'undefined') {
  const saved = getLocalSync(TOUCH_MOVE_STORAGE_KEY);
  touchMoveEnabledState = saved === 'true';
}

export function isTouchMoveEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = getLocalSync(TOUCH_MOVE_STORAGE_KEY);
    touchMoveEnabledState = saved === 'true';
  }
  return touchMoveEnabledState;
}

export function setTouchMoveEnabled(enabled: boolean): void {
  touchMoveEnabledState = enabled;
  setLocalSync(TOUCH_MOVE_STORAGE_KEY, String(enabled));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TOUCH_MOVE_CHANGE_EVENT, { detail: { enabled } }));
  }
}

export function toggleTouchMoveEnabled(): boolean {
  const next = !isTouchMoveEnabled();
  setTouchMoveEnabled(next);
  return next;
}
