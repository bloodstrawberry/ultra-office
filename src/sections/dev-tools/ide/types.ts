import type { KeyboardSoundType } from './sound-effect';

import { ALL_LANGUAGE_PRESETS } from './data/ide-languages';

export interface IdeFile {
  id: string;
  name: string;
  language: string;
  category?: 'Frontend' | 'Backend' | 'DevOps & Config' | 'Data & Query';
  content: string;
  description?: string;
  tag?: string;
}

export type TypingStatus = 'idle' | 'playing' | 'paused' | 'completed';

export interface TypingConfig {
  speedPreset: 'slow' | 'normal' | 'fast' | 'turbo' | 'hacker' | 'lightning';
  speedMs: number;
  charsPerTick: number;
  soundEnabled: boolean;
  soundType: KeyboardSoundType;
  naturalJitter: boolean;
  autoRunTerminal: boolean;
  fontSize: number;
  minimap: boolean;
  themeId: string;
}

export interface TerminalLog {
  id: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'command';
  text: string;
  timestamp: string;
}

// ----------------------------------------------------------------------
// Preset Templates (25 Languages)
// ----------------------------------------------------------------------

export const PRESET_FILES: IdeFile[] = ALL_LANGUAGE_PRESETS;
