'use client';

import { getLocalSync, setLocalSync } from './local-storage';

const SFX_MUTED_STORAGE_KEY = 'sfx_muted';
const BGM_MUTED_STORAGE_KEY = 'bgm_muted';
const BGM_VOLUME_STORAGE_KEY = 'bgm_volume';

export const BGM_CHANGE_EVENT = 'push_push_bgm_change';
export const BGM_VOLUME_CHANGE_EVENT = 'push_push_bgm_volume_change';
export const SFX_CHANGE_EVENT = 'push_push_sfx_change';

let isSfxMutedState = false;
let isBgmMutedState = false;
let bgmVolumeState = 0.5;

// Synchronize initial values in browser
if (typeof window !== 'undefined') {
  const savedSfx = getLocalSync(SFX_MUTED_STORAGE_KEY);
  if (savedSfx === 'true') {
    isSfxMutedState = true;
  }

  const savedBgm = getLocalSync(BGM_MUTED_STORAGE_KEY);
  if (savedBgm === 'true') {
    isBgmMutedState = true;
  }

  const savedVol = getLocalSync(BGM_VOLUME_STORAGE_KEY);
  if (savedVol !== null) {
    const parsed = parseFloat(savedVol);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      bgmVolumeState = parsed;
    }
  }
}

export function isSfxMuted(): boolean {
  if (typeof window !== 'undefined') {
    const saved = getLocalSync(SFX_MUTED_STORAGE_KEY);
    if (saved !== null) {
      isSfxMutedState = saved === 'true';
    }
  }
  return isSfxMutedState;
}

export function setSfxMuted(muted: boolean): void {
  isSfxMutedState = muted;
  setLocalSync(SFX_MUTED_STORAGE_KEY, String(muted));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SFX_CHANGE_EVENT, { detail: { muted } }));
  }
}

export function toggleSfxMuted(): boolean {
  const next = !isSfxMuted();
  setSfxMuted(next);
  return next;
}

export function isBgmMuted(): boolean {
  if (typeof window !== 'undefined') {
    const saved = getLocalSync(BGM_MUTED_STORAGE_KEY);
    if (saved !== null) {
      isBgmMutedState = saved === 'true';
    }
  }
  return isBgmMutedState;
}

export function setBgmMuted(muted: boolean): void {
  isBgmMutedState = muted;
  setLocalSync(BGM_MUTED_STORAGE_KEY, String(muted));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BGM_CHANGE_EVENT, { detail: { muted } }));
  }
}

export function toggleBgmMuted(): boolean {
  const next = !isBgmMuted();
  setBgmMuted(next);
  return next;
}

export function getBgmVolume(): number {
  if (typeof window !== 'undefined') {
    const saved = getLocalSync(BGM_VOLUME_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        bgmVolumeState = parsed;
      }
    }
  }
  return bgmVolumeState;
}

export function setBgmVolume(volume: number): void {
  const clamped = Math.max(0, Math.min(1, volume));
  bgmVolumeState = clamped;
  setLocalSync(BGM_VOLUME_STORAGE_KEY, clamped.toFixed(2));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BGM_VOLUME_CHANGE_EVENT, { detail: { volume: clamped } }));
  }
}
