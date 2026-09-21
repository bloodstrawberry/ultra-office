'use client';

import type { EditorStageControlsProps } from '../types';

import React from 'react';

export function EditorStageControls({
  editorActiveIndex,
  editorLevels,
  stageInputValue,
  setStageInputValue,
  selectEditorLevel,
  editorAddLevel,
  editorDeleteLevel,
  playSound,
  muted,
}: EditorStageControlsProps) {
  return (
    <div className="flex items-center justify-center gap-1 w-full">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (editorActiveIndex !== undefined && editorActiveIndex > 0) {
            playSound('select', muted);
            selectEditorLevel?.(editorActiveIndex - 1);
          }
        }}
        disabled={editorActiveIndex === 0}
        className="px-1 py-0.5 bg-[#4a2506] border border-[#a35617] rounded-md hover:bg-[#6e3709] text-white text-xs font-black disabled:opacity-30 cursor-pointer"
        title="이전 단계"
      >
        ◀
      </button>
      <div className="flex items-center gap-0.5">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={stageInputValue}
          onChange={(e) => setStageInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          onBlur={() => {
            const num = parseInt(stageInputValue, 10);
            if (!isNaN(num) && num >= 1 && editorLevels && num <= editorLevels.length) {
              if (num - 1 !== editorActiveIndex) {
                playSound('select', muted);
                selectEditorLevel?.(num - 1);
              }
            } else {
              playSound('error', muted);
              setStageInputValue(((editorActiveIndex ?? 0) + 1).toString());
            }
          }}
          onFocus={(e) => e.target.select()}
          onClick={(e) => e.stopPropagation()}
          className="w-10 sm:w-12 px-1 py-0.5 text-center bg-[#4a2506] text-white font-black text-xs sm:text-sm border border-[#a35617] rounded-md focus:outline-none focus:ring-1 focus:ring-amber-300"
          title="문제 번호 직접 입력"
        />
        <span className="text-xs sm:text-base font-black text-white px-0.5">
          /{editorLevels?.length ?? 1}
        </span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (
            editorActiveIndex !== undefined &&
            editorLevels &&
            editorActiveIndex < editorLevels.length - 1
          ) {
            playSound('select', muted);
            selectEditorLevel?.(editorActiveIndex + 1);
          }
        }}
        disabled={editorActiveIndex === (editorLevels?.length ?? 1) - 1}
        className="px-1 py-0.5 bg-[#4a2506] border border-[#a35617] rounded-md hover:bg-[#6e3709] text-white text-xs font-black disabled:opacity-30 cursor-pointer"
        title="다음 단계"
      >
        ▶
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          editorAddLevel?.();
        }}
        className="px-1 py-0.5 bg-emerald-700 border border-emerald-500 rounded-md hover:bg-emerald-600 text-white text-xs font-black cursor-pointer"
        title="단계 추가"
      >
        ➕
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          editorDeleteLevel?.();
        }}
        disabled={(editorLevels?.length ?? 1) <= 1}
        className="px-1 py-0.5 bg-rose-700 border border-rose-500 rounded-md hover:bg-rose-600 text-white text-xs font-black disabled:opacity-30 cursor-pointer"
        title="단계 삭제"
      >
        🗑️
      </button>
    </div>
  );
}
