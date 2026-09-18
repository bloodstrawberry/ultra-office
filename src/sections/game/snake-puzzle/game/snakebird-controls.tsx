'use client';

import type { Direction } from './snakebird-types';

import React, { useEffect } from 'react';

export interface SnakebirdControlsProps {
  onMove: (dir: Direction) => void;
  onSwitchBird: () => void;
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
  hasMultipleBirds: boolean;
}

export const SnakebirdControls: React.FC<SnakebirdControlsProps> = ({
  onMove,
  onSwitchBird,
  onUndo,
  onReset,
  canUndo,
  hasMultipleBirds,
}) => {
  // Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in inputs/textareas
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onMove('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onMove('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onMove('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onMove('right');
          break;
        case 'Tab':
        case ' ':
          e.preventDefault();
          if (hasMultipleBirds) {
            onSwitchBird();
          }
          break;
        case 'z':
        case 'Z':
        case 'u':
        case 'U':
        case 'Backspace':
          e.preventDefault();
          if (canUndo) {
            onUndo();
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          onReset();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, onSwitchBird, onUndo, onReset, canUndo, hasMultipleBirds]);

  return (
    <div className="w-full max-w-sm mx-auto flex items-center justify-between px-4 py-2 z-30 select-none">
      {/* Undo & Switch Bird Utility Buttons (Left) */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-xs border shadow-lg transition-all active:scale-95 cursor-pointer ${
            canUndo
              ? 'bg-amber-500 hover:bg-amber-400 border-amber-600 text-white shadow-amber-600/30'
              : 'bg-stone-300 border-stone-400 text-stone-500 opacity-50 cursor-not-allowed'
          }`}
          title="되돌리기 (Z / U)"
        >
          <span className="text-lg">↩️</span>
          <span className="text-[10px]">Undo</span>
        </button>

        {hasMultipleBirds && (
          <button
            type="button"
            onClick={onSwitchBird}
            className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs border border-indigo-700 shadow-lg shadow-indigo-600/30 flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="새 전환 (Space / Tab)"
          >
            <span className="text-lg">🔄</span>
            <span className="text-[10px]">새 전환</span>
          </button>
        )}
      </div>

      {/* Virtual D-Pad (Right) */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* D-Pad Background Circle */}
        <div className="absolute w-34 h-34 rounded-full bg-stone-900/40 backdrop-blur-sm border-2 border-white/20 shadow-inner pointer-events-none" />

        {/* Up */}
        <button
          type="button"
          onClick={() => onMove('up')}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-black text-base border-2 border-stone-400 shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          aria-label="위로 이동"
        >
          ▲
        </button>

        {/* Down */}
        <button
          type="button"
          onClick={() => onMove('down')}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-black text-base border-2 border-stone-400 shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          aria-label="아래로 이동"
        >
          ▼
        </button>

        {/* Left */}
        <button
          type="button"
          onClick={() => onMove('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-black text-base border-2 border-stone-400 shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          aria-label="왼쪽으로 이동"
        >
          ◀
        </button>

        {/* Right */}
        <button
          type="button"
          onClick={() => onMove('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-black text-base border-2 border-stone-400 shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
          aria-label="오른쪽으로 이동"
        >
          ▶
        </button>
      </div>
    </div>
  );
};
