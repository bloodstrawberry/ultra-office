'use client';

import { getLocalSync, setLocalSync } from './local-storage';

const SFX_MUTED_STORAGE_KEY = 'multi_touch_sound_muted';
const BGM_MUTED_STORAGE_KEY = 'berry_puzzle_bgm_muted';
const BGM_VOLUME_STORAGE_KEY = 'berry_puzzle_bgm_volume';

export const BGM_CHANGE_EVENT = 'berry_puzzle_bgm_change';
export const BGM_VOLUME_CHANGE_EVENT = 'berry_puzzle_bgm_volume_change';
export const SFX_CHANGE_EVENT = 'berry_puzzle_sfx_change';

let isSfxMutedState = false;
let isBgmMutedState = false;
let bgmVolumeState = 0.018;

// Synchronize state on load in browser
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
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      bgmVolumeState = parsed;
    }
  }
}

// ----------------------------------------------------
// SFX (Sound Effects) State Management
// ----------------------------------------------------
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
  if (!next) {
    playCuteTouchSound(0);
  }
  return next;
}

// Backward compatibility aliases for existing components
export const isSoundMuted = isSfxMuted;
export const setSoundMuted = setSfxMuted;
export const toggleSoundMuted = toggleSfxMuted;

// ----------------------------------------------------
// BGM (Background Music) State Management
// ----------------------------------------------------
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
    const savedVol = getLocalSync(BGM_VOLUME_STORAGE_KEY);
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        bgmVolumeState = parsed;
      }
    }
  }
  return bgmVolumeState;
}

export function setBgmVolume(volume: number): void {
  const clamped = Math.max(0, Math.min(1, volume));
  bgmVolumeState = clamped;
  setLocalSync(BGM_VOLUME_STORAGE_KEY, String(clamped));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BGM_VOLUME_CHANGE_EVENT, { detail: { volume: clamped } }));
  }
}

// ----------------------------------------------------
// Web Audio Context Synthesizer Helpers
// ----------------------------------------------------
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

export function suspendAudioContext(): void {
  if (audioCtx && audioCtx.state === 'running') {
    audioCtx.suspend().catch(() => {});
  }
}

// ----------------------------------------------------
// TOUCH SOUND SYNTHESIZER
// ----------------------------------------------------
export function playCuteTouchSound(soundIndex: number = 0): void {
  if (isSfxMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Cute organic pentatonic marimba / bubble pop pitches
    const freqs = [523.25, 659.25, 783.99, 880.0, 1046.5]; // C5, E5, G5, A5, C6
    const baseFreq = freqs[Math.abs(Math.floor(soundIndex)) % freqs.length];

    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    oscHarmonic.type = 'triangle';

    // Cute pitch pop sweep
    osc.frequency.setValueAtTime(baseFreq * 0.85, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.025);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.06);

    oscHarmonic.frequency.setValueAtTime(baseFreq * 2, now);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 0.07);
    oscHarmonic.stop(now + 0.07);
  } catch {
    // ignore audio synthesis error
  }
}

// ----------------------------------------------------
// COUNTDOWN TICK SYNTHESIZER (3... 2... 1...)
// ----------------------------------------------------
export function playCountdownTickSound(count: number): void {
  if (isSfxMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Cute bouncy tick pitches (3 -> G5, 2 -> C6, 1 -> E6)
    const pitchMap: Record<number, number> = {
      3: 783.99,
      2: 1046.5,
      1: 1318.51,
    };
    const freq = pitchMap[count] || 1318.51;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.9, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.02);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.07);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // ignore audio synthesis error
  }
}

// ----------------------------------------------------
// RESULT FANFARE SYNTHESIZER
// ----------------------------------------------------
export function playResultFanfareSound(): void {
  if (isSfxMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Bouncy cute victory fanfare: C5, E5, G5, C6, E6
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      const startTime = now + i * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.16, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.23);
    });
  } catch {
    // ignore audio synthesis error
  }
}

/**
 * Plays a soft descending drop sound when countdown is canceled.
 */
export function playCountdownCancelSound(): void {
  if (isSfxMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  } catch {
    // ignore audio synthesis error
  }
}
