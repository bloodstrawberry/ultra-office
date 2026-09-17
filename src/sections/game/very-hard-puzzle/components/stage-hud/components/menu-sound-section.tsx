'use client';

import type { MenuSoundSectionProps } from '../types';

import React from 'react';

export function MenuSoundSection({
  bgmMuted,
  bgmVolume,
  sfxMuted,
  touchMoveEnabled,
  handleToggleBgm,
  handleSliderVolumeChange,
  handleToggleSfx,
  handleToggleTouchMove,
  onOpenTouchGuide,
}: MenuSoundSectionProps) {
  const currentVolPercent = bgmMuted ? 0 : Math.round(bgmVolume * 100);

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 relative z-10">
      {/* 1. 배경음 (BGM) 볼륨 슬라이더 및 ON/OFF */}
      <div className="flex flex-col gap-1.5 p-2.5 bg-amber-100/70 rounded-2xl border border-amber-300/80 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl">{bgmMuted || bgmVolume === 0 ? '🔇' : '🎵'}</span>
            <span className="font-black text-sm sm:text-base text-amber-950">배경음 (BGM)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-900/80 w-8 text-right">
              {currentVolPercent}%
            </span>
            <button
              type="button"
              onClick={handleToggleBgm}
              className={`px-2.5 py-1 rounded-xl font-black text-[11px] transition-all cursor-pointer shadow-xs active:scale-95 ${
                bgmMuted
                  ? 'bg-amber-200 text-amber-800 border border-amber-300 hover:bg-amber-300'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
              }`}
            >
              {bgmMuted ? 'OFF' : 'ON'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-0.5 px-0.5">
          <span className="text-xs">🔈</span>
          <input
            type="range"
            min="0"
            max="100"
            value={currentVolPercent}
            onChange={handleSliderVolumeChange}
            className="w-full h-2 bg-amber-200/90 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            aria-label="배경음 음량 조절"
          />
          <span className="text-xs">🔊</span>
        </div>
      </div>

      {/* 2 & 3. 효과음 (SFX) & 화면 터치 이동 (50/50 분할) */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full">
        {/* 효과음 (SFX) ON/OFF */}
        <div
          onClick={handleToggleSfx}
          className="flex items-center justify-between p-2 sm:p-2.5 bg-amber-100/70 hover:bg-amber-200/80 active:scale-[0.99] rounded-2xl border border-amber-300/80 shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base sm:text-lg shrink-0">{sfxMuted ? '🔇' : '🔔'}</span>
            <span className="font-black text-sm sm:text-base text-amber-950 truncate">효과음</span>
          </div>
          <button
            type="button"
            className={`px-2 py-1 rounded-xl font-black text-[10px] sm:text-[11px] transition-all shadow-xs pointer-events-none shrink-0 ${
              sfxMuted
                ? 'bg-amber-200 text-amber-800 border border-amber-300'
                : 'bg-emerald-500 text-white shadow-emerald-500/20'
            }`}
          >
            {sfxMuted ? 'OFF' : 'ON'}
          </button>
        </div>

        {/* 화면 터치 이동 ON/OFF + ? 버튼 */}
        <div
          data-tutorial="touch-move-btn"
          onClick={handleToggleTouchMove}
          className="flex items-center justify-between p-2 sm:p-2.5 bg-gradient-to-r from-orange-200/90 to-amber-200/90 hover:from-orange-300/90 hover:to-amber-300/90 active:scale-[0.99] rounded-2xl border-2 border-orange-400 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-base sm:text-lg shrink-0">👆</span>
            <span className="font-black text-sm sm:text-base text-amber-950 truncate">
              터치 이동
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTouchGuide();
              }}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-orange-300/80 hover:bg-orange-400/90 active:scale-90 border border-orange-500/80 flex items-center justify-center font-black text-[10px] sm:text-[11px] text-amber-950 cursor-pointer shadow-xs transition-transform shrink-0"
              title="화면 터치 이동 설명 보기"
              aria-label="화면 터치 이동 설명 보기"
            >
              ?
            </button>
          </div>
          <button
            type="button"
            className={`px-2 py-1 rounded-xl font-black text-[10px] sm:text-[11px] transition-all shadow-xs pointer-events-none shrink-0 ${
              !touchMoveEnabled
                ? 'bg-amber-200 text-amber-900 border border-amber-400/80'
                : 'bg-emerald-500 text-white shadow-emerald-500/20'
            }`}
          >
            {!touchMoveEnabled ? 'OFF' : 'ON'}
          </button>
        </div>
      </div>
    </div>
  );
}
