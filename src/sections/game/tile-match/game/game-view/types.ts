import type React from 'react';
import type { CellType } from '../game-engine';

export interface GameViewProps {
  isEditor?: boolean;
}

export interface GameContentProps extends GameViewProps {
  onFullReset?: (stage?: number) => void;
  onStageClearAd?: (stage?: number) => void;
  onStageSelect?: (stage?: number) => void;
}

export interface UndoGuideModalProps {
  showUndoGuideModal: boolean;
  remainingUndos: number;
  onClose: () => void;
}

export interface CheaterDetectModalProps {
  cheaterPopupOpen: boolean;
  onConfirm: () => void;
}

export interface JsonExportImportModalProps {
  exportModalContent: string | null;
  importText: string;
  setImportText: (text: string) => void;
  onClose: () => void;
  handleDownload: () => void;
  handleImport: (jsonStr: string) => void;
  onCopyText: () => void;
  playSound: (type: 'select' | 'start' | 'error', muted: boolean) => void;
  muted: boolean;
}

export interface HintViewModalProps {
  isHintModalOpen: boolean;
  onClose: () => void;
  isEditor: boolean;
  editorActiveIndex: number;
  editorLevels: Array<{
    name: string;
    turnLimit?: number;
    grid: CellType[][];
    hint?: CellType[][][];
  }>;
  levelIndex: number;
  builtinLevelName?: string;
  activeHints?: CellType[][][];
  currentHintIndex: number;
  setCurrentHintIndex: React.Dispatch<React.SetStateAction<number>>;
  editorDeleteHint: (index: number) => void;
  playSound: (type: 'select' | 'start' | 'error', muted: boolean) => void;
  muted: boolean;
  onToast: (msg: string) => void;
}

export interface RecordViewModalProps {
  isRecordModalOpen: boolean;
  onClose: () => void;
  isEditor?: boolean;
  editorActiveIndex?: number;
  editorLevels?: Array<{
    name: string;
    turnLimit?: number;
    grid: CellType[][];
    hint?: CellType[][][];
  }>;
  levelIndex?: number;
  builtinLevelName?: string;
  recordedSteps: CellType[][][];
  currentRecordIndex: number;
  setCurrentRecordIndex: React.Dispatch<React.SetStateAction<number>>;
  playSound: (type: 'select' | 'start' | 'error', muted: boolean) => void;
  muted?: boolean;
  onToast?: (msg: string) => void;
  onClearRecord?: () => void;
  onDeleteSingleRecord?: (index: number) => void;
  onAddHint?: (grid: CellType[][]) => void;
}

export interface EditorPaletteProps {
  activeEditor: boolean;
  selectedPaint: CellType | 'eraser' | 'ice' | string;
  setSelectedPaint: (paint: CellType | 'eraser' | 'ice' | string) => void;
  grid: CellType[][];
  editorResizeGrid: (rows: number, cols: number) => void;
  editorFillBorder: () => void;
  editorFlipHorizontal: () => void;
  editorClearGrid: () => void;
  handleExport: () => void;
  openImportModal: () => void;
  hasActiveHints: boolean;
  isHintAttention: boolean;
  activeHintsLength: number;
  onOpenHintModal: () => void;
  recordedStepsLength?: number;
  onOpenRecordModal?: () => void;
  playSound: (type: 'select' | 'start' | 'error', muted: boolean) => void;
  muted: boolean;
}

export interface ToastNotificationProps {
  toastText: string | null;
}
