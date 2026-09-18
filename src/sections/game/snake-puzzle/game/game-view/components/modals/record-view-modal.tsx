'use client';

import type { RecordViewModalProps } from '../../types';

import React from 'react';

import BlockRenderer from '../../../../object';

export function RecordViewModal({
  isRecordModalOpen,
  onClose,
  isEditor,
  editorActiveIndex = 0,
  editorLevels = [],
  builtinLevelName,
  recordedSteps = [],
  currentRecordIndex,
  setCurrentRecordIndex,
  playSound,
  muted,
  onToast,
  onClearRecord,
  onDeleteSingleRecord,
  onAddHint,
}: RecordViewModalProps) {
  if (!isRecordModalOpen) return null;

  const currentGrid = recordedSteps[currentRecordIndex];
  const currentLevelName = isEditor
    ? editorLevels[editorActiveIndex]?.name || `Level ${editorActiveIndex + 1}`
    : builtinLevelName || 'Game Test';

  return (
    <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-[4px] z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-[24px] sm:rounded-[28px] max-w-lg w-full p-3 sm:p-4 shadow-2xl relative text-stone-800 flex flex-col gap-2.5 sm:gap-3 animate-slide-up max-h-[95vh]">
        {/* Header */}
        <div className="border-b border-stone-200 pb-2 px-1 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-sky-800 flex items-center gap-1.5">
              <span>📷</span> 녹화 기록 보기 ({currentLevelName})
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
            테스트 중 저장된 맵의 이동 과정입니다. (총 {recordedSteps.length}
            단계)
          </p>
        </div>

        {!currentGrid || recordedSteps.length === 0 ? (
          <div className="py-6 text-center text-xs text-stone-500 font-bold">
            저장된 녹화 기록이 없습니다.
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
                  <div className="flex items-center gap-1.5 bg-sky-50 px-2 py-1 rounded-xl border border-sky-200 shadow-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentRecordIndex((prev) => Math.max(0, prev - 1));
                        playSound('select', !!muted);
                      }}
                      disabled={currentRecordIndex === 0}
                      className="w-6 h-6 rounded-lg bg-sky-100 hover:bg-sky-200 active:bg-sky-300 border border-sky-300 text-sky-900 font-black flex items-center justify-center disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[10px]"
                      title="이전 단계"
                    >
                      ◀
                    </button>

                    <span className="text-xs font-black text-sky-950 px-1 select-none">
                      {currentRecordIndex + 1} / {recordedSteps.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentRecordIndex((prev) =>
                          Math.min(recordedSteps.length - 1, prev + 1)
                        );
                        playSound('select', !!muted);
                      }}
                      disabled={currentRecordIndex === recordedSteps.length - 1}
                      className="w-6 h-6 rounded-lg bg-sky-100 hover:bg-sky-200 active:bg-sky-300 border border-sky-300 text-sky-900 font-black flex items-center justify-center disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[10px]"
                      title="다음 단계"
                    >
                      ▶
                    </button>
                  </div>

                  {/* Right: Reset/Clear & Close Button */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-end">
                    {onDeleteSingleRecord && (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteSingleRecord(currentRecordIndex);
                          if (recordedSteps.length - 1 <= 0) {
                            onClose();
                          } else if (currentRecordIndex >= recordedSteps.length - 1) {
                            setCurrentRecordIndex(recordedSteps.length - 2);
                          }
                          onToast?.('현재 녹화 기록이 삭제되었습니다.');
                          playSound('select', !!muted);
                        }}
                        className="px-2 sm:px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs rounded-xl cursor-pointer shadow-xs flex items-center gap-1 active:scale-95 shrink-0"
                        title="현재 스텝 삭제"
                      >
                        🗑️ 현재 삭제
                      </button>
                    )}

                    {onClearRecord && (
                      <button
                        type="button"
                        onClick={() => {
                          onClearRecord();
                          onClose();
                          onToast?.('전체 녹화 기록이 초기화되었습니다.');
                          playSound('select', !!muted);
                        }}
                        className="px-2 sm:px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-bold text-xs rounded-xl cursor-pointer shadow-xs flex items-center gap-1 active:scale-95 shrink-0"
                        title="전체 녹화 기록 삭제"
                      >
                        🧹 전체 삭제
                      </button>
                    )}

                    {onAddHint && currentGrid && (
                      <button
                        type="button"
                        onClick={() => {
                          onAddHint(currentGrid);
                          onToast?.('현재 기록이 힌트로 추가되었습니다!');
                          playSound('select', !!muted);
                        }}
                        className="px-2 sm:px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs rounded-xl cursor-pointer shadow-xs flex items-center gap-1 active:scale-95 shrink-0"
                      >
                        💡 힌트 추가
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 bg-sky-800 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs active:scale-95 shrink-0"
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
