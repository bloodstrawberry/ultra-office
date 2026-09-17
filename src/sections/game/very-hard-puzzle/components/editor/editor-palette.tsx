'use client';

import type { CellType } from '../../utils/types';
import type { EditorPaletteProps } from '../game-view-types';

import React from 'react';

import BlockRenderer, {
  BLOCK_NONE,
  BLOCK_WALL,
  BLOCK_BOMB,
  BLOCK_WALL_V,
  BLOCK_WALL_H,
  BLOCK_SPIKE_U,
  BLOCK_SPIKE_D,
  BLOCK_SPIKE_L,
  BLOCK_SPIKE_R,
  BLOCK_SHOOTER_L,
  BLOCK_SHOOTER_R,
  BLOCK_AUTO_WALL_V,
  BLOCK_AUTO_WALL_H,
  STRAW_BLOCK_TYPES,
  PUZZLE_BLOCK_TYPES,
  PORTAL_BLOCK_TYPES,
  BLOCK_SHOOTER_L_ONCE,
  BLOCK_SHOOTER_R_ONCE,
  BLACKHOLE_BLOCK_TYPES,
} from '../../objects';

export function EditorPalette({
  activeEditor,
  selectedPaint,
  setSelectedPaint,
  grid,
  editorResizeGrid,
  editorFillBorder,
  editorFlipHorizontal,
  editorClearGrid,
  handleExport,
  openImportModal,
  hasActiveHints,
  isHintAttention,
  activeHintsLength,
  onOpenHintModal,
  recordedStepsLength = 0,
  onOpenRecordModal,
  playSound,
  muted,
}: EditorPaletteProps) {
  if (!activeEditor) return null;

  return (
    <div className="flex flex-col gap-1 font-sans">
      <div className="hidden sm:flex text-[11px] text-stone-500 border-b border-stone-200 pb-0.5 justify-between items-center font-semibold">
        <span>그리기 도구를 선택하고 격자 셀을 클릭하거나 드래그하여 그려보세요.</span>
        <span className="text-emerald-700 font-bold">에디터 팔레트</span>
      </div>

      {/* Block Selection Palette */}
      <div className="flex flex-wrap gap-1 items-center">
        {/* Eraser */}
        <button
          type="button"
          onClick={() => setSelectedPaint('eraser')}
          className={`px-2 py-0.5 rounded-lg text-xs border cursor-pointer flex items-center gap-1 transition-all ${
            selectedPaint === 'eraser'
              ? 'bg-rose-600 border-rose-700 text-white shadow-md scale-102 font-black'
              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 font-bold'
          }`}
        >
          🧹 지우개
        </button>

        {/* Ice tool */}
        <button
          type="button"
          onClick={() => setSelectedPaint('ice')}
          className={`px-2 py-0.5 rounded-lg text-xs border cursor-pointer flex items-center gap-1 transition-all ${
            selectedPaint === 'ice'
              ? 'bg-cyan-600 border-cyan-700 text-white shadow-md scale-102 font-black'
              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 font-bold'
          }`}
          title="얼음 도구 (블럭을 얼리기/해제)"
        >
          🧊 얼음
        </button>

        {/* -1 Invisible Wall block */}
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_NONE)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_NONE
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Invisible Wall (-1)"
        >
          <BlockRenderer id={BLOCK_NONE} />
        </button>

        {/* Wall block */}
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_WALL)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_WALL
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
        >
          <BlockRenderer id={BLOCK_WALL} />
        </button>

        {/* Puzzle blocks */}
        {PUZZLE_BLOCK_TYPES.map((type: CellType) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedPaint(type)}
            className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
              selectedPaint === type
                ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
                : 'border-stone-200 hover:border-stone-300 bg-white/80'
            }`}
          >
            <BlockRenderer id={type} />
          </button>
        ))}

        {/* Bomb block */}
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_BOMB)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_BOMB
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Bomb Block"
        >
          <BlockRenderer id={BLOCK_BOMB} />
        </button>

        {/* Moving slider walls */}
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_WALL_V)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_WALL_V
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Vertical Moving Wall"
        >
          <BlockRenderer id={BLOCK_WALL_V} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_WALL_H)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_WALL_H
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Horizontal Moving Wall"
        >
          <BlockRenderer id={BLOCK_WALL_H} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_AUTO_WALL_V)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_AUTO_WALL_V
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Vertical Auto-Moving Wall"
        >
          <BlockRenderer id={BLOCK_AUTO_WALL_V} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_AUTO_WALL_H)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_AUTO_WALL_H
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Horizontal Auto-Moving Wall"
        >
          <BlockRenderer id={BLOCK_AUTO_WALL_H} />
        </button>

        {/* Shooter blocks */}
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_SHOOTER_L)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_SHOOTER_L
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Shooter Left (Repeated)"
        >
          <BlockRenderer id={BLOCK_SHOOTER_L} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_SHOOTER_R)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_SHOOTER_R
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Shooter Right (Repeated)"
        >
          <BlockRenderer id={BLOCK_SHOOTER_R} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_SHOOTER_L_ONCE)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_SHOOTER_L_ONCE
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Shooter Left (Once)"
        >
          <BlockRenderer id={BLOCK_SHOOTER_L_ONCE} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_SHOOTER_R_ONCE)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_SHOOTER_R_ONCE
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Shooter Right (Once)"
        >
          <BlockRenderer id={BLOCK_SHOOTER_R_ONCE} />
        </button>

        {/* Spike blocks */}
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_SPIKE_U)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_SPIKE_U
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Spike Up"
        >
          <BlockRenderer id={BLOCK_SPIKE_U} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_SPIKE_D)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_SPIKE_D
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Spike Down"
        >
          <BlockRenderer id={BLOCK_SPIKE_D} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_SPIKE_L)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_SPIKE_L
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Spike Left"
        >
          <BlockRenderer id={BLOCK_SPIKE_L} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_SPIKE_R)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_SPIKE_R
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Spike Right"
        >
          <BlockRenderer id={BLOCK_SPIKE_R} />
        </button>

        {/* Straw blocks (91 ~ 95) */}
        {STRAW_BLOCK_TYPES.map((type: CellType) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedPaint(type)}
            className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
              selectedPaint === type
                ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
                : 'border-stone-200 hover:border-stone-300 bg-white/80'
            }`}
            title={`Straw Block (${type})`}
          >
            <BlockRenderer id={type} />
          </button>
        ))}

        {/* Portal blocks (51 ~ 57) */}
        {PORTAL_BLOCK_TYPES.map((type: CellType) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedPaint(type)}
            className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
              selectedPaint === type
                ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
                : 'border-stone-200 hover:border-stone-300 bg-white/80'
            }`}
            title={`순간이동 포탈 (${type})`}
          >
            <BlockRenderer id={type} />
          </button>
        ))}

        {/* Blackhole blocks (61 ~ 67) */}
        {BLACKHOLE_BLOCK_TYPES.map((type: CellType) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedPaint(type)}
            className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
              selectedPaint === type
                ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
                : 'border-stone-200 hover:border-stone-300 bg-white/80'
            }`}
            title={`블랙홀 (${type})`}
          >
            <BlockRenderer id={type} />
          </button>
        ))}
      </div>

      {/* Map actions */}
      <div className="flex flex-wrap justify-between items-center gap-1.5 mt-0.5 pt-1 border-t border-stone-200">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Rows / Cols control */}
          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-stone-200 text-stone-800 select-none shadow-sm">
            <span className="text-[10px] text-stone-500 font-bold">행</span>
            <button
              type="button"
              onClick={() => editorResizeGrid(grid.length - 1, grid[0].length)}
              disabled={grid.length <= 4}
              className="w-4 h-4 flex items-center justify-center bg-stone-100 border border-stone-200 text-xs text-stone-700 hover:bg-stone-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-black rounded"
            >
              -
            </button>
            <span className="text-xs text-amber-700 font-black w-4 text-center">{grid.length}</span>
            <button
              type="button"
              onClick={() => editorResizeGrid(grid.length + 1, grid[0].length)}
              disabled={grid.length >= 12}
              className="w-4 h-4 flex items-center justify-center bg-stone-100 border border-stone-200 text-xs text-stone-700 hover:bg-stone-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-black rounded"
            >
              +
            </button>

            <span className="text-stone-300">|</span>

            <span className="text-[10px] text-stone-500 font-bold">열</span>
            <button
              type="button"
              onClick={() => editorResizeGrid(grid.length, grid[0].length - 1)}
              disabled={grid[0].length <= 4}
              className="w-4 h-4 flex items-center justify-center bg-stone-100 border border-stone-200 text-xs text-stone-700 hover:bg-stone-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-black rounded"
            >
              -
            </button>
            <span className="text-xs text-amber-700 font-black w-4 text-center">
              {grid[0].length}
            </span>
            <button
              type="button"
              onClick={() => editorResizeGrid(grid.length, grid[0].length + 1)}
              disabled={grid[0].length >= 16}
              className="w-4 h-4 flex items-center justify-center bg-stone-100 border border-stone-200 text-xs text-stone-700 hover:bg-stone-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-black rounded"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={editorFillBorder}
            className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold cursor-pointer shadow-sm"
          >
            🧱 테두리 벽 채우기
          </button>
          <button
            type="button"
            onClick={editorFlipHorizontal}
            className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold cursor-pointer shadow-sm"
          >
            ↔️ 좌우 뒤집기
          </button>
          <button
            type="button"
            onClick={editorClearGrid}
            className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer shadow-sm"
          >
            🗑 격자 비우기
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-2 py-0.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-lg text-xs font-bold cursor-pointer shadow-sm"
          >
            📥 JSON 내보내기
          </button>
          <button
            type="button"
            onClick={openImportModal}
            className="px-2 py-0.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-lg text-xs font-bold cursor-pointer shadow-sm"
          >
            📤 JSON 가져오기
          </button>
          {hasActiveHints && (
            <button
              type="button"
              onClick={() => {
                onOpenHintModal();
                playSound('select', muted);
              }}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-stone-900 border-2 border-amber-300 shadow-md cursor-pointer flex items-center justify-center text-[10px] sm:text-xs font-black transition-all duration-300 ${
                isHintAttention
                  ? 'scale-125 -translate-y-1 shadow-[0_0_18px_rgba(245,158,11,0.9)] ring-4 ring-amber-300/80 animate-bounce'
                  : 'hover:scale-110'
              }`}
              title={`힌트 보기 (${activeHintsLength}개)`}
            >
              💡
            </button>
          )}
          {recordedStepsLength > 0 && (
            <button
              type="button"
              onClick={() => {
                onOpenRecordModal?.();
                playSound('select', muted);
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-sky-500 via-sky-400 to-indigo-300 text-stone-900 border-2 border-sky-300 shadow-md cursor-pointer flex items-center justify-center text-[10px] sm:text-xs font-black transition-all duration-300 hover:scale-110 active:scale-95"
              title={`녹화 기록 보기 (${recordedStepsLength}단계)`}
            >
              📷
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
