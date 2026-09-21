'use client';

import type { MenuActionsSectionProps } from '../types';

import React from 'react';

export function MenuActionsSection({
  isEditor,
  isLocal,
  muted,
  setGrabbed,
  onFullReset,
  resetLevel,
  playSound,
  setIsMenuOpen,
  onBackToStageSelect,
  handleGoHome,
  onClearAllBlocks,
}: MenuActionsSectionProps) {
  return (
    <div className="flex flex-col gap-1.5 relative z-10">
      {/* 다시 도전 & 문제로 이동 (50/50 분할) */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full">
        <button
          type="button"
          onClick={() => {
            setGrabbed(false);
            if (!isEditor && onFullReset) {
              onFullReset();
            } else {
              resetLevel();
            }
            playSound('select', muted);
            setIsMenuOpen(false);
          }}
          className="w-full py-2 px-2 bg-amber-100/80 hover:bg-amber-200/90 active:scale-[0.98] text-amber-950 font-black text-xs sm:text-sm rounded-2xl border border-amber-300/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <span>🔄 다시 도전</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playSound('select', muted);
            setIsMenuOpen(false);
            if (onBackToStageSelect) {
              onBackToStageSelect();
            } else {
              handleGoHome();
            }
          }}
          className="w-full py-2 px-2 bg-amber-100/80 hover:bg-amber-200/90 active:scale-[0.98] text-amber-950 font-black text-xs sm:text-sm rounded-2xl border border-amber-300/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <span>🧩 문제 이동</span>
        </button>
      </div>

      {/* 모든 블럭 제거 (isLocal인 경우만) */}
      {isLocal && (
        <button
          type="button"
          onClick={() => {
            playSound('break', muted);
            setIsMenuOpen(false);
            onClearAllBlocks?.();
          }}
          className="w-full py-2 px-3.5 bg-rose-100/90 hover:bg-rose-200 active:scale-[0.98] text-rose-950 font-black text-xs sm:text-sm rounded-2xl border border-rose-300 flex items-center justify-between transition-all cursor-pointer shadow-xs"
        >
          <span className="flex items-center gap-2">
            <span>🧹</span> 모든 블럭 제거
          </span>
          <span className="text-xs bg-rose-500 text-white px-1.5 py-0.5 rounded-md font-extrabold">
            LOCAL
          </span>
        </button>
      )}
    </div>
  );
}
