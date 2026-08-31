/**
 * Web Audio API Synthesizer and Player for Morse Code
 * Provides zero-latency real-time tone generation, timing player state machine,
 * and live signal callback triggers for visual lamp synchronization.
 */

import { getMorseTimingEvents, type MorseSignalEvent } from './morse-core';

export interface MorsePlayerCallbacks {
  onSignalChange?: (active: boolean, symbol: string, eventIndex: number) => void;
  onProgress?: (currentTimeMs: number, totalTimeMs: number) => void;
  onComplete?: () => void;
}

export class MorseAudioPlayer {
  private audioCtx: AudioContext | null = null;

  private activeOsc: OscillatorNode | null = null;

  private activeGain: GainNode | null = null;

  private isPlaying = false;

  private isPaused = false;

  private timerId: number | null = null;

  private events: MorseSignalEvent[] = [];

  private currentEventIndex = 0;

  private totalDurationMs = 0;

  private elapsedMs = 0;

  private callbacks: MorsePlayerCallbacks = {};

  private loop = false;

  private wpm = 20;

  private frequency = 700;

  private volume = 0.8;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setOptions(options: {
    wpm?: number;
    frequency?: number;
    volume?: number;
    loop?: boolean;
  }) {
    if (options.wpm !== undefined) this.wpm = options.wpm;
    if (options.frequency !== undefined) this.frequency = options.frequency;
    if (options.volume !== undefined) this.volume = options.volume;
    if (options.loop !== undefined) this.loop = options.loop;
  }

  /**
   * Load and prepare Morse string for playback.
   */
  public load(morse: string, callbacks: MorsePlayerCallbacks = {}) {
    this.stop();
    this.callbacks = callbacks;
    this.events = getMorseTimingEvents(morse, this.wpm);
    this.totalDurationMs = this.events.reduce((acc, ev) => acc + ev.durationMs, 0);
    this.currentEventIndex = 0;
    this.elapsedMs = 0;
  }

  /**
   * Play or resume playback.
   */
  public play() {
    if (this.events.length === 0) return;
    this.isPlaying = true;
    this.isPaused = false;
    this.runEventLoop();
  }

  /**
   * Pause playback.
   */
  public pause() {
    if (!this.isPlaying) return;
    this.isPaused = true;
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.stopContinuousTone();
    this.callbacks.onSignalChange?.(false, '', this.currentEventIndex);
  }

  /**
   * Stop playback and reset to start.
   */
  public stop() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.stopContinuousTone();
    this.currentEventIndex = 0;
    this.elapsedMs = 0;
    this.callbacks.onSignalChange?.(false, '', 0);
    this.callbacks.onProgress?.(0, this.totalDurationMs);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  private runEventLoop() {
    if (!this.isPlaying) return;

    if (this.currentEventIndex >= this.events.length) {
      // Finished
      this.stopContinuousTone();
      this.callbacks.onSignalChange?.(false, '', this.events.length);
      this.callbacks.onProgress?.(this.totalDurationMs, this.totalDurationMs);

      if (this.loop) {
        // Loop again after 1.5s gap
        this.currentEventIndex = 0;
        this.elapsedMs = 0;
        this.timerId = window.setTimeout(() => {
          this.runEventLoop();
        }, 1500);
      } else {
        this.isPlaying = false;
        this.callbacks.onComplete?.();
      }
      return;
    }

    const currentEvent = this.events[this.currentEventIndex];
    const duration = currentEvent.durationMs;

    if (currentEvent.type === 'on') {
      this.startContinuousTone(this.frequency, this.volume);
      this.callbacks.onSignalChange?.(true, currentEvent.symbol || '.', this.currentEventIndex);
    } else {
      this.stopContinuousTone();
      this.callbacks.onSignalChange?.(false, currentEvent.symbol || '', this.currentEventIndex);
    }

    this.callbacks.onProgress?.(this.elapsedMs, this.totalDurationMs);

    this.timerId = window.setTimeout(() => {
      this.elapsedMs += duration;
      this.currentEventIndex += 1;
      this.runEventLoop();
    }, duration);
  }

  // ----------------------------------------------------------------------
  // Manual / Real-time Tone Output (For straight key & paddle keyer)
  // ----------------------------------------------------------------------

  public startContinuousTone(freq = this.frequency, vol = this.volume) {
    try {
      const ctx = this.getAudioContext();
      if (this.activeOsc) {
        return; // already active
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Smooth attack ramp to prevent popping sound
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol), ctx.currentTime + 0.005);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      this.activeOsc = osc;
      this.activeGain = gain;
    } catch {
      // Audio context might fail on uninitiated user action
    }
  }

  public stopContinuousTone() {
    try {
      if (this.activeOsc && this.activeGain && this.audioCtx) {
        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        // Smooth release ramp
        this.activeGain.gain.setValueAtTime(this.activeGain.gain.value, now);
        this.activeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.005);

        const oscToStop = this.activeOsc;
        setTimeout(() => {
          try {
            oscToStop.stop();
            oscToStop.disconnect();
          } catch {
            // Already stopped
          }
        }, 10);

        this.activeOsc = null;
        this.activeGain = null;
      }
    } catch {
      this.activeOsc = null;
      this.activeGain = null;
    }
  }
}

// Global Singleton for immediate manual clicks / keyer
let sharedPlayer: MorseAudioPlayer | null = null;

export function getSharedMorsePlayer(): MorseAudioPlayer {
  if (!sharedPlayer) {
    sharedPlayer = new MorseAudioPlayer();
  }
  return sharedPlayer;
}
