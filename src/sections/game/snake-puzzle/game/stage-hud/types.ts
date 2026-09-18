import type React from 'react';
import type { CellType } from '../types';

export interface WoodSignBoardProps {
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface EditorStageControlsProps {
  editorActiveIndex?: number;
  editorLevels?: Array<{ name: string; timeLimit: number; grid: CellType[][] }>;
  stageInputValue: string;
  setStageInputValue: (val: string) => void;
  selectEditorLevel?: (index: number) => void;
  editorAddLevel?: () => void;
  editorDeleteLevel?: () => void;
  playSound: (
    type: 'coin' | 'select' | 'start' | 'error' | 'match' | 'fall' | 'shoot' | 'break',
    muted: boolean
  ) => void;
  muted: boolean;
}

export interface MenuSoundSectionProps {
  bgmMuted: boolean;
  bgmVolume: number;
  sfxMuted: boolean;
  touchMoveEnabled: boolean;
  handleToggleBgm: () => void;
  handleSliderVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleToggleSfx: () => void;
  handleToggleTouchMove: () => void;
  onOpenTouchGuide: () => void;
}

export interface MenuActionsSectionProps {
  isEditor: boolean;
  isLocal: boolean;
  muted: boolean;
  setGrabbed: (grabbed: boolean) => void;
  onFullReset?: () => void;
  resetLevel: () => void;
  playSound: (
    type: 'coin' | 'select' | 'start' | 'error' | 'match' | 'fall' | 'shoot' | 'break',
    muted: boolean
  ) => void;
  setIsMenuOpen: (open: boolean) => void;
  onBackToStageSelect?: () => void;
  handleGoHome: () => void;
  onClearAllBlocks?: () => void;
}

export interface MenuEditorSectionProps {
  editorMapType?: 'real' | 'test';
  setEditorMapType?: (type: 'real' | 'test') => void;
  changeMapType?: (type: 'real' | 'test') => void;
  playSound: (
    type: 'coin' | 'select' | 'start' | 'error' | 'match' | 'fall' | 'shoot' | 'break',
    muted: boolean
  ) => void;
  muted: boolean;
  togglePlayTest?: () => void;
  playTestMode: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export interface GameMenuModalProps {
  isMenuOpen: boolean;
  mounted: boolean;
  setIsMenuOpen: (open: boolean) => void;
  bgmMuted: boolean;
  bgmVolume: number;
  sfxMuted: boolean;
  touchMoveEnabled: boolean;
  handleToggleBgm: () => void;
  handleSliderVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleToggleSfx: () => void;
  handleToggleTouchMove: () => void;
  onOpenTouchGuide: () => void;
  isEditor: boolean;
  isLocal: boolean;
  muted: boolean;
  setGrabbed: (grabbed: boolean) => void;
  onFullReset?: () => void;
  resetLevel: () => void;
  playSound: (
    type: 'coin' | 'select' | 'start' | 'error' | 'match' | 'fall' | 'shoot' | 'break',
    muted: boolean
  ) => void;
  onBackToStageSelect?: () => void;
  handleGoHome: () => void;
  onClearAllBlocks?: () => void;
  editorMapType?: 'real' | 'test';
  setEditorMapType?: (type: 'real' | 'test') => void;
  changeMapType?: (type: 'real' | 'test') => void;
  togglePlayTest?: () => void;
  playTestMode: boolean;
}

export interface GameStageHudProps {
  levelIndex: number;
  totalRemainingBlocks: number;
  isEditor: boolean;
  activeEditor: boolean;
  editorActiveIndex?: number;
  editorLevels?: Array<{ name: string; timeLimit: number; grid: CellType[][] }>;
  muted: boolean;
  showTimer?: boolean;
  timeLeft?: number;
  playTestMode: boolean;
  editorMapType?: 'real' | 'test';
  selectEditorLevel?: (index: number) => void;
  editorAddLevel?: () => void;
  editorDeleteLevel?: () => void;
  setMuted?: (muted: boolean) => void;
  onFullReset?: () => void;
  resetLevel: () => void;
  setGrabbed: (grabbed: boolean) => void;
  playSound: (
    type: 'coin' | 'select' | 'start' | 'error' | 'match' | 'fall' | 'shoot' | 'break',
    muted: boolean
  ) => void;
  togglePlayTest?: () => void;
  setEditorMapType?: (type: 'real' | 'test') => void;
  changeMapType?: (type: 'real' | 'test') => void;
  onBackToStageSelect?: () => void;
  onClearAllBlocks?: () => void;
  onMenuToggle?: (isOpen: boolean) => void;
  externalMenuOpen?: boolean;
  externalShowTouchGuideModal?: boolean;
  onCloseTouchGuide?: () => void;
  grid?: CellType[][];
  editorAddHint?: (grid: CellType[][]) => void;
  onToast?: (msg: string) => void;
  hasActiveHints?: boolean;
  activeHintsLength?: number;
  onOpenHintModal?: () => void;
  recordedStepsLength?: number;
  onOpenRecordModal?: () => void;
  isHintAttention?: boolean;
  hasWatchedHintAd?: boolean;
}
