'use client';

import React from 'react';

import type { GameState, ParsedLevel } from './push-push-types';
import SoundToggleButton from '../components/sound-toggle-button';

interface PushPushHudProps {
  level: ParsedLevel;
  levelIndex: number;
  totalLevels: number;
  gameState: GameState;
  onOpenStageSelect: () => void;
  onNavigateHome: () => void;
  onOpenHint?: () => void;
}

export function PushPushHud({
  level,
  levelIndex,
  totalLevels,
  gameState,
  onOpenStageSelect,
  onNavigateHome,
  onOpenHint,
}: PushPushHudProps) {
  const { moves, pushes, targetsRemaining, totalTargets } = gameState;
  const completedTargets = totalTargets - targetsRemaining;

  return (
    <header className="w-full max-w-2xl px-3 py-2 flex items-center justify-between gap-2 select-none z-30">
      {/* Left Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onNavigateHome}
          className="p-2 rounded-xl bg-black/30 hover:bg-black/45 active:scale-95 text-white transition-all text-sm font-bold flex items-center justify-center backdrop-blur-sm shadow-sm border border-white/10"
          title="홈으로 이동"
          aria-label="홈으로 이동"
        >
          🏠
        </button>

        <button
          type="button"
          onClick={onOpenStageSelect}
          className="px-2.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/45 active:scale-95 text-amber-200 transition-all text-xs font-black flex items-center gap-1 backdrop-blur-sm shadow-sm border border-white/10"
          title="스테이지 선택"
        >
          <span>📋</span>
          <span className="hidden sm:inline">목록</span>
        </button>

        <SoundToggleButton />

        {level.hint && onOpenHint && (
          <button
            type="button"
            onClick={onOpenHint}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/80 hover:bg-amber-500 active:scale-95 text-amber-950 transition-all text-xs font-black flex items-center gap-1 shadow-sm border border-amber-300/40"
            title="힌트 보기"
          >
            <span>💡</span>
            <span className="hidden sm:inline">힌트</span>
          </button>
        )}
      </div>

      {/* Center: Stage Number & Progress */}
      <div className="flex flex-col items-center">
        <div className="text-white font-black text-sm sm:text-base tracking-wide drop-shadow-md flex items-center gap-1.5">
          <span className="bg-amber-500/80 text-amber-950 px-2 py-0.5 rounded-lg text-xs font-black">
            STAGE {levelIndex + 1}
          </span>
          <span className="hidden sm:inline text-xs text-amber-200/90 font-bold">
            / {totalLevels}
          </span>
        </div>

        <div className="text-[11px] text-amber-200/80 font-bold flex items-center gap-1 mt-0.5">
          <span>목표:</span>
          <span
            className={`font-black ${
              targetsRemaining === 0 ? 'text-emerald-400' : 'text-amber-300'
            }`}
          >
            {completedTargets} / {totalTargets}
          </span>
        </div>
      </div>

      {/* Right Stats: Moves & Pushes */}
      <div className="flex items-center gap-2 text-xs font-black">
        <div className="bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm flex flex-col items-end">
          <span className="text-[10px] text-stone-300 font-semibold leading-tight">이동</span>
          <span className="text-amber-300 font-black">{moves}</span>
        </div>

        <div className="bg-black/30 px-2.5 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm flex flex-col items-end">
          <span className="text-[10px] text-stone-300 font-semibold leading-tight">푸시</span>
          <span className="text-orange-300 font-black">{pushes}</span>
        </div>
      </div>
    </header>
  );
}
