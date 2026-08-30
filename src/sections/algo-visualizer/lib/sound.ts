'use client';

import { setSfxMutedStorage, getSoundSettingsSync } from './storage';

// ============================================================
// SFX State
// ============================================================
let sfxMutedState = false;
let lastSfxPlayTime = 0;
let audioCtx: AudioContext | null = null;

if (typeof window !== 'undefined') {
  const { sfxMuted: savedMuted } = getSoundSettingsSync();
  sfxMutedState = savedMuted;
}

export function isSfxMuted(): boolean {
  return sfxMutedState;
}

export function setSfxMuted(muted: boolean): void {
  sfxMutedState = muted;
  setSfxMutedStorage(muted);
}

export function toggleSfxMuted(): boolean {
  const next = !isSfxMuted();
  setSfxMuted(next);
  if (!next) {
    playButtonClickSound();
  }
  return next;
}

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

/** 일반 버튼 클릭음 */
export function playButtonClickSound(): void {
  if (isSfxMuted()) return;
  lastSfxPlayTime = Date.now();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch {
    // Audio context error
  }
}

/** 알고리즘 비교 음향 (값의 크기에 따라 주파수 매핑: 260Hz ~ 1100Hz) */
export function playCompareSound(value: number = 50, maxVal: number = 100): void {
  if (isSfxMuted()) return;
  lastSfxPlayTime = Date.now();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const ratio = Math.max(0, Math.min(1, value / (maxVal || 1)));
    const freq = 260 + ratio * 840;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // Audio context error
  }
}

/** 스왑 (교환) 음향 */
export function playSwapSound(): void {
  if (isSfxMuted()) return;
  lastSfxPlayTime = Date.now();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // Audio context error
  }
}

/** 피벗 또는 마커 지정 음향 */
export function playPivotSound(): void {
  if (isSfxMuted()) return;
  lastSfxPlayTime = Date.now();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // Audio context error
  }
}

/** 탐색 성공 / 타겟 발견 음향 */
export function playFoundSound(): void {
  if (isSfxMuted()) return;
  lastSfxPlayTime = Date.now();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const t = now + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  } catch {
    // Audio context error
  }
}

/** 그리드 / 트리 노드 방문 음향 */
export function playVisitSound(pitchIndex: number = 0): void {
  if (isSfxMuted()) return;
  const nowMs = Date.now();
  if (nowMs - lastSfxPlayTime < 30) return;
  lastSfxPlayTime = nowMs;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const scale = [330, 392, 440, 523, 587, 659, 784, 880];
    const freq = scale[Math.abs(pitchIndex) % scale.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Audio context error
  }
}

/** 완료 축하 팡파르 */
export function playSuccessFanfare(): void {
  if (isSfxMuted()) return;
  lastSfxPlayTime = Date.now();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chords = [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 0.08 },
      { freq: 783.99, time: 0.16 },
      { freq: 1046.5, time: 0.24 },
      { freq: 1318.5, time: 0.32 },
    ];

    chords.forEach(({ freq, time }) => {
      const t = now + time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  } catch {
    // Audio context error
  }
}
