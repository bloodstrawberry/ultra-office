'use client';

import type { SnakebirdGameState, SnakebirdLevelData } from './snakebird-types';

import React from 'react';

import { setSfxMuted } from '../utils/sound';

export interface SnakebirdHudProps {
  level: SnakebirdLevelData;
  levelIndex: number;
  totalLevels: number;
  gameState: SnakebirdGameState;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onOpenLevelSelect: () => void;
  onNavigateHome: () => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
}

export const SnakebirdHud: React.FC<SnakebirdHudProps> = ({
  level,
  levelIndex,
  totalLevels,
  gameState,
  canUndo: _canUndo,
  onUndo: _onUndo,
  onReset,
  onOpenLevelSelect,
  onNavigateHome,
  muted,
  setMuted,
}) => {
  const toggleSound = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setSfxMuted(nextMuted);
  };

  const livingBirds = gameState.birds.filter((b) => !b.isExited && !b.isDead);

  return (
    <header className="w-full max-w-lg mx-auto flex flex-col gap-2 p-2 z-30 select-none">
      {/* Top Bar: Nav buttons & Title */}
      <div className="flex items-center justify-between gap-2">
        {/* Home & Stage Select Button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-9 h-9 rounded-xl bg-white/90 hover:bg-white text-stone-800 font-black shadow-md border border-stone-300 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            title="홈으로"
          >
            🏠
          </button>
          <button
            type="button"
            onClick={onOpenLevelSelect}
            className="h-9 px-3 rounded-xl bg-white/90 hover:bg-white text-stone-800 font-bold text-xs shadow-md border border-stone-300 flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
          >
            <span>📜</span>
            <span className="truncate max-w-[100px] sm:max-w-[140px]">
              {level.name || `Level ${levelIndex + 1} / ${totalLevels}`}
            </span>
          </button>
        </div>

        {/* Level Counter & Sound Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleSound}
            className="w-9 h-9 rounded-xl bg-white/90 hover:bg-white text-stone-800 font-black shadow-md border border-stone-300 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            title={muted ? '음소거 해제' : '음소거'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black shadow-md border border-rose-300 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
            title="재시작 (R)"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Info Bar: Remaining Fruits, Moves, Bird Info */}
      <div className="flex items-center justify-between bg-stone-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 shadow-sm text-xs text-white">
        {/* Fruits Remaining */}
        <div className="flex items-center gap-1.5 font-bold">
          <span>🍓</span>
          <span className="text-pink-300">
            {gameState.fruits.length === 0 ? '포털 개방! ✨' : `${gameState.fruits.length}개 남음`}
          </span>
        </div>

        {/* Birds status */}
        {gameState.birds.length > 1 && (
          <div className="flex items-center gap-1 font-semibold text-[11px]">
            <span>🐦</span>
            <span>
              {livingBirds.length} / {gameState.birds.length}마리
            </span>
          </div>
        )}

        {/* Move Count */}
        <div className="flex items-center gap-1 font-bold text-amber-300">
          <span>이동:</span>
          <span>{gameState.moveCount}</span>
        </div>
      </div>
    </header>
  );
};
