'use client';

import React, { useEffect } from 'react';

import type { Direction } from './push-push-types';

interface PushPushControlsProps {
  onMove: (dir: Direction) => void;
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
}

export function PushPushControls({ onMove, onUndo, onReset, canUndo }: PushPushControlsProps) {
  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing input if an input/textarea is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          onMove('up');
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          onMove('down');
          break;
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          onMove('left');
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          onMove('right');
          break;
        case 'KeyU':
        case 'KeyZ':
          e.preventDefault();
          if (canUndo) onUndo();
          break;
        case 'KeyR':
          e.preventDefault();
          onReset();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, onUndo, onReset, canUndo]);

  return (
    <div className="w-full max-w-sm flex items-center justify-between px-4 py-2 select-none">
      {/* Side Action Buttons (Undo & Reset) */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
            canUndo
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border border-amber-300/40'
              : 'bg-stone-800/60 text-stone-500 border border-stone-700/40 cursor-not-allowed'
          }`}
          title="되돌리기 (U / Z)"
        >
          <span>↩️</span> 되돌리기
        </button>

        <button
          type="button"
          onClick={onReset}
          className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-black text-xs sm:text-sm bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-200 border border-stone-600/50 flex items-center gap-1.5 shadow-md transition-all"
          title="재시작 (R)"
        >
          <span>🔄</span> 다시하기
        </button>
      </div>

      {/* D-Pad Controller */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Up */}
        <button
          type="button"
          onClick={() => onMove('up')}
          className="absolute top-0 w-12 h-12 rounded-xl bg-amber-500/90 hover:bg-amber-400 active:bg-amber-600 text-white font-black text-xl flex items-center justify-center shadow-lg border-2 border-amber-300/60 active:scale-95 transition-all"
          aria-label="위로 이동"
        >
          ▲
        </button>

        {/* Down */}
        <button
          type="button"
          onClick={() => onMove('down')}
          className="absolute bottom-0 w-12 h-12 rounded-xl bg-amber-500/90 hover:bg-amber-400 active:bg-amber-600 text-white font-black text-xl flex items-center justify-center shadow-lg border-2 border-amber-300/60 active:scale-95 transition-all"
          aria-label="아래로 이동"
        >
          ▼
        </button>

        {/* Left */}
        <button
          type="button"
          onClick={() => onMove('left')}
          className="absolute left-0 w-12 h-12 rounded-xl bg-amber-500/90 hover:bg-amber-400 active:bg-amber-600 text-white font-black text-xl flex items-center justify-center shadow-lg border-2 border-amber-300/60 active:scale-95 transition-all"
          aria-label="왼쪽으로 이동"
        >
          ◀
        </button>

        {/* Right */}
        <button
          type="button"
          onClick={() => onMove('right')}
          className="absolute right-0 w-12 h-12 rounded-xl bg-amber-500/90 hover:bg-amber-400 active:bg-amber-600 text-white font-black text-xl flex items-center justify-center shadow-lg border-2 border-amber-300/60 active:scale-95 transition-all"
          aria-label="오른쪽으로 이동"
        >
          ▶
        </button>

        {/* Center Pad Accent */}
        <div className="w-8 h-8 rounded-lg bg-amber-900/60 border border-amber-700/50 flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-amber-400/80" />
        </div>
      </div>
    </div>
  );
}
