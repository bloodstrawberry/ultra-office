'use client';

import type { MenuEditorSectionProps } from '../types';

import React from 'react';

export function MenuEditorSection({
  editorActiveIndex,
  editorLevels,
  editorUpdateTurnLimit,
  editorMapType,
  setEditorMapType,
  changeMapType,
  playSound,
  muted,
  togglePlayTest,
  playTestMode,
  setIsMenuOpen,
}: MenuEditorSectionProps) {
  const currentTurnLimit =
    editorActiveIndex !== undefined && editorLevels?.[editorActiveIndex]
      ? (editorLevels[editorActiveIndex].turnLimit ?? 50)
      : 50;

  return (
    <div className="flex flex-col gap-2 p-2.5 bg-amber-100/80 rounded-2xl border border-amber-300 shadow-xs relative z-10 mt-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-amber-950 font-extrabold">에디터 맵 타입</span>
        <div className="flex items-center bg-white border border-amber-300 rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => {
              if (editorMapType !== 'real') {
                setEditorMapType?.('real');
                changeMapType?.('real');
                playSound('select', muted);
              }
            }}
            className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              editorMapType === 'real'
                ? 'bg-amber-800 text-white'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            REAL
          </button>
          <button
            type="button"
            onClick={() => {
              if (editorMapType !== 'test') {
                setEditorMapType?.('test');
                changeMapType?.('test');
                playSound('select', muted);
              }
            }}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              editorMapType === 'test'
                ? 'bg-amber-800 text-white'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            TEST
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-amber-950 font-extrabold">턴 수 제한</span>
        <div className="flex items-center gap-1 bg-white border border-amber-300 rounded-xl px-1.5 py-0.5">
          <button
            type="button"
            onClick={() => {
              if (currentTurnLimit > 1) {
                editorUpdateTurnLimit?.(currentTurnLimit - 5 > 0 ? currentTurnLimit - 5 : 1);
                playSound('select', muted);
              }
            }}
            className="w-5 h-5 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-md text-xs font-black cursor-pointer"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={999}
            value={currentTurnLimit}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1) {
                editorUpdateTurnLimit?.(val);
              }
            }}
            className="w-10 text-center text-xs font-extrabold text-amber-950 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              editorUpdateTurnLimit?.(currentTurnLimit + 5);
              playSound('select', muted);
            }}
            className="w-5 h-5 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-md text-xs font-black cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          togglePlayTest?.();
          setIsMenuOpen(false);
        }}
        className="w-full py-2 bg-amber-200/80 hover:bg-amber-300/80 text-amber-950 font-black text-xs rounded-xl border border-amber-300/80 cursor-pointer transition-all flex items-center justify-center gap-1.5"
      >
        {playTestMode ? '⏹ 테스트 중단' : '▶ 레벨 테스트'}
      </button>
    </div>
  );
}
