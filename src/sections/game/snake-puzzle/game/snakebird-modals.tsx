'use client';

import type { SnakebirdLevelData } from './snakebird-types';

import React from 'react';

export interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  levels: SnakebirdLevelData[];
  currentLevelIndex: number;
  onSelectLevel: (index: number) => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  levels,
  currentLevelIndex,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border-4 border-stone-800 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h2 className="text-lg font-black text-stone-800 flex items-center gap-2">
            <span>📜</span>
            <span>스테이지 선택</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Level List */}
        <div className="flex-1 overflow-y-auto py-3 grid grid-cols-1 gap-2 pr-1">
          {levels.map((lvl, idx) => {
            const isCurrent = idx === currentLevelIndex;
            return (
              <button
                key={`lvl-sel-${idx}`}
                type="button"
                onClick={() => {
                  onSelectLevel(idx);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-md font-black'
                    : 'bg-stone-50 border-stone-200 hover:bg-amber-50 hover:border-amber-300 text-stone-700 font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                      isCurrent ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs truncate max-w-[180px] text-left">
                    {lvl.name || `Level ${idx + 1}`}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-stone-500">
                  <span>🍓 {lvl.fruits.length}</span>
                  <span>🐦 {lvl.birds.length}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export interface StageClearModalProps {
  isOpen: boolean;
  levelIndex: number;
  totalLevels: number;
  moveCount: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  isOpen,
  levelIndex,
  totalLevels,
  moveCount,
  onNextLevel,
  onReplay,
  onHome,
}) => {
  if (!isOpen) return null;
  const isLast = levelIndex >= totalLevels - 1;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-4 border-emerald-600 flex flex-col items-center text-center">
        <div className="text-5xl mb-2 animate-bounce">🏆</div>
        <h2 className="text-2xl font-black text-emerald-800 mb-1">스테이지 클리어!</h2>
        <p className="text-xs text-stone-600 font-semibold mb-4">
          총 <span className="text-rose-600 font-black">{moveCount}</span>수 만에 무지개 포털을
          통과했습니다!
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {!isLast ? (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer"
            >
              다음 스테이지 🚀
            </button>
          ) : (
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-2xl text-amber-900 font-black text-xs">
              🎉 모든 스테이지를 정복하셨습니다! 축하합니다!
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReplay}
              className="flex-1 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-300 transition-transform active:scale-95 cursor-pointer"
            >
              🔄 다시하기
            </button>
            <button
              type="button"
              onClick={onHome}
              className="flex-1 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-300 transition-transform active:scale-95 cursor-pointer"
            >
              🏠 홈으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
