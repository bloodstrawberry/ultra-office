'use client';

import type { HintViewModalProps } from '../game-view-types';

import React from 'react';

import BlockRenderer from '../../objects';

export function HintViewModal({
  isHintModalOpen,
  onClose,
  isEditor,
  editorActiveIndex,
  editorLevels,
  levelIndex: _levelIndex,
  builtinLevelName,
  activeHints,
  currentHintIndex,
  setCurrentHintIndex,
  editorDeleteHint,
  playSound,
  muted,
  onToast,
  onStartFromHint,
}: HintViewModalProps) {
  if (!isHintModalOpen) return null;

  const hints = activeHints || [];
  const currentGrid = hints[currentHintIndex];
  const currentLevelName = isEditor ? editorLevels[editorActiveIndex]?.name : builtinLevelName;

  return (
    <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-[4px] z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-[24px] sm:rounded-[28px] max-w-lg w-full p-3 sm:p-4 shadow-2xl relative text-stone-800 flex flex-col gap-2.5 sm:gap-3 animate-slide-up max-h-[95vh]">
        {/* Header */}
        <div className="border-b border-stone-200 pb-2 px-1 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-amber-800 flex items-center gap-1.5">
              <span>💡</span> 힌트 보기 ({currentLevelName})
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 font-black text-base sm:text-lg p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 font-medium">
            다음과 같은 상황을 만들어보세요.
          </p>
        </div>

        {!currentGrid || hints.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-500 font-bold">
            저장된 힌트가 없습니다.
          </div>
        ) : (
          (() => {
            const cols = currentGrid[0]?.length || 8;
            const rows = currentGrid.length || 8;
            const ratio = cols / rows;

            return (
              <div className="w-full flex flex-col items-center gap-2.5 sm:gap-3 min-h-0">
                {/* Grid Preview Box */}
                <div className="w-full bg-[#59341c] p-1.5 sm:p-2.5 rounded-2xl border-4 border-[#3d200e] shadow-inner flex items-center justify-center overflow-hidden">
                  <div
                    className="grid gap-0.5 bg-[#784826] p-1 rounded-xl w-full"
                    style={{
                      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                      maxWidth: `min(100%, calc((68vh - 110px) * ${ratio}), ${cols * 44}px)`,
                    }}
                  >
                    {currentGrid.map((row, y) =>
                      row.map((cell, x) => (
                        <div
                          key={`${y}-${x}`}
                          className="aspect-square flex items-center justify-center bg-[#42240f]/40 rounded-sm p-0.5"
                        >
                          <BlockRenderer id={cell} />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Modal Action Buttons & Navigation Controls */}
                <div className="w-full flex items-center justify-between gap-2 pt-2 border-t border-stone-200 px-1">
                  {/* Left: Navigation Controls */}
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200 shadow-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentHintIndex((prev) => Math.max(0, prev - 1));
                        playSound('select', muted);
                      }}
                      disabled={currentHintIndex === 0}
                      className="w-6 h-6 rounded-lg bg-amber-100 hover:bg-amber-200 active:bg-amber-300 border border-amber-300 text-amber-900 font-black flex items-center justify-center disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[10px]"
                      title="이전 힌트"
                    >
                      ◀
                    </button>

                    <span className="text-xs font-black text-amber-950 px-1 select-none">
                      {currentHintIndex + 1} / {hints.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentHintIndex((prev) => Math.min(hints.length - 1, prev + 1));
                        playSound('select', muted);
                      }}
                      disabled={currentHintIndex === hints.length - 1}
                      className="w-6 h-6 rounded-lg bg-amber-100 hover:bg-amber-200 active:bg-amber-300 border border-amber-300 text-amber-900 font-black flex items-center justify-center disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[10px]"
                      title="다음 힌트"
                    >
                      ▶
                    </button>
                  </div>

                  {/* Right: Delete (if editor) & Close Button */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-end">
                    {isEditor && (
                      <button
                        type="button"
                        onClick={() => {
                          editorDeleteHint(currentHintIndex);
                          if (hints.length - 1 <= 0) {
                            onClose();
                          } else if (currentHintIndex >= hints.length - 1) {
                            setCurrentHintIndex(hints.length - 2);
                          }
                          onToast('힌트가 삭제되었습니다.');
                        }}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs rounded-xl cursor-pointer shadow-xs flex items-center gap-1 active:scale-95 shrink-0"
                      >
                        🗑️ 힌트 삭제
                      </button>
                    )}

                    {isEditor && onStartFromHint && currentGrid && (
                      <button
                        type="button"
                        onClick={() => {
                          onStartFromHint(currentGrid);
                          onClose();
                          playSound('start', !!muted);
                        }}
                        className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs flex items-center gap-1 active:scale-95 shrink-0"
                        title="현재 힌트 화면에서 테스트 시작"
                      >
                        ▶ 이 화면부터 시작하기
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs active:scale-95 shrink-0"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
