'use client';

import type { CellType } from '../../game-engine';
import type { EditorPaletteProps } from '../types';

import React from 'react';

import BlockRenderer, {
  WATER_R,
  WATER_L,
  WATER_D,
  WATER_U,
  PathTile,
  BLOCK_EGG,
  BLOCK_NONE,
  BLOCK_WALL,
  BLOCK_BOMB,
  BLOCK_PATH,
  WATER_END_R,
  WATER_END_L,
  WATER_END_D,
  WATER_END_U,
  BLOCK_SPIKE_U,
  BLOCK_SPIKE_D,
  BLOCK_SPIKE_L,
  BLOCK_SPIKE_R,
  WATER_START_R,
  WATER_START_L,
  WATER_START_D,
  WATER_START_U,
  BLOCK_CHICKEN_D,
  BLOCK_CHICKEN_U,
  BLOCK_CHICKEN_L,
  BLOCK_CHICKEN_R,
  STRAW_BLOCK_TYPES,
  PUZZLE_BLOCK_TYPES,
  PORTAL_BLOCK_TYPES,
  WATER_CORNER_TL_CW,
  WATER_CORNER_TR_CW,
  WATER_CORNER_BR_CW,
  WATER_CORNER_BL_CW,
  WATER_CORNER_TL_CCW,
  WATER_CORNER_TR_CCW,
  WATER_CORNER_BR_CCW,
  WATER_CORNER_BL_CCW,
  BLACKHOLE_BLOCK_TYPES,
} from '../../../object';

const PATH_TILES_PALETTE = [
  { id: 'path_1', name: '가로길 (─)', type: 1 },
  { id: 'path_2', name: '세로길 (│)', type: 2 },
  { id: 'path_3', name: '귀퉁이 (┌)', type: 3 },
  { id: 'path_4', name: '귀퉁이 (┐)', type: 4 },
  { id: 'path_5', name: '귀퉁이 (┘)', type: 5 },
  { id: 'path_6', name: '귀퉁이 (└)', type: 6 },
  { id: 'path_7', name: '십자로 (┼)', type: 7 },
  { id: 'path_8', name: '삼거리 (┬)', type: 8 },
  { id: 'path_9', name: '삼거리 (┴)', type: 9 },
  { id: 'path_10', name: '삼거리 (├)', type: 10 },
  { id: 'path_11', name: '삼거리 (┤)', type: 11 },
];

const WATER_TILES_PALETTE = [
  // Straight
  { id: `path_${WATER_R}`, name: '직선 수로 (오른쪽 →)', type: WATER_R },
  { id: `path_${WATER_L}`, name: '직선 수로 (왼쪽 ←)', type: WATER_L },
  { id: `path_${WATER_D}`, name: '직선 수로 (아래 ↓)', type: WATER_D },
  { id: `path_${WATER_U}`, name: '직선 수로 (위 ↑)', type: WATER_U },

  // Corners CW
  {
    id: `path_${WATER_CORNER_TL_CW}`,
    name: '코너 ┌ (아래→우, 시계방향)',
    type: WATER_CORNER_TL_CW,
  },
  {
    id: `path_${WATER_CORNER_TR_CW}`,
    name: '코너 ┐ (좌→아래, 시계방향)',
    type: WATER_CORNER_TR_CW,
  },
  { id: `path_${WATER_CORNER_BR_CW}`, name: '코너 ┘ (위→좌, 시계방향)', type: WATER_CORNER_BR_CW },
  { id: `path_${WATER_CORNER_BL_CW}`, name: '코너 └ (우→위, 시계방향)', type: WATER_CORNER_BL_CW },

  // Corners CCW
  {
    id: `path_${WATER_CORNER_TL_CCW}`,
    name: '코너 ┌ (우→아래, 반시계)',
    type: WATER_CORNER_TL_CCW,
  },
  {
    id: `path_${WATER_CORNER_TR_CCW}`,
    name: '코너 ┐ (아래→좌, 반시계)',
    type: WATER_CORNER_TR_CCW,
  },
  { id: `path_${WATER_CORNER_BR_CCW}`, name: '코너 ┘ (좌→위, 반시계)', type: WATER_CORNER_BR_CCW },
  { id: `path_${WATER_CORNER_BL_CCW}`, name: '코너 └ (위→우, 반시계)', type: WATER_CORNER_BL_CCW },

  // Ends (흐름 막힘)
  { id: `path_${WATER_END_R}`, name: '수로 끝 (우측 돌 막힘 →[돌])', type: WATER_END_R },
  { id: `path_${WATER_END_L}`, name: '수로 끝 (좌측 돌 막힘 ←[돌])', type: WATER_END_L },
  { id: `path_${WATER_END_D}`, name: '수로 끝 (하단 돌 막힘 ↓[돌])', type: WATER_END_D },
  { id: `path_${WATER_END_U}`, name: '수로 끝 (상단 돌 막힘 ↑[돌])', type: WATER_END_U },

  // Starts (돌에서 시작)
  { id: `path_${WATER_START_R}`, name: '수로 시작 ([돌]좌측 → 우로 흐름)', type: WATER_START_R },
  { id: `path_${WATER_START_L}`, name: '수로 시작 ([돌]우측 → 좌로 흐름)', type: WATER_START_L },
  { id: `path_${WATER_START_D}`, name: '수로 시작 ([돌]상단 → 아래로 흐름)', type: WATER_START_D },
  { id: `path_${WATER_START_U}`, name: '수로 시작 ([돌]하단 → 위로 흐름)', type: WATER_START_U },
];

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

      {/* Waterway Tile Selection Palette (statusMap) */}
      <div className="flex flex-wrap gap-1 items-center bg-sky-500/10 p-1 rounded-xl border border-sky-600/30">
        <span className="text-[11px] font-bold text-sky-800 px-1">🌊 수로 타일:</span>
        <button
          type="button"
          onClick={() => setSelectedPaint('path_0')}
          className={`px-2 py-0.5 rounded-lg text-xs border cursor-pointer flex items-center gap-1 transition-all ${
            selectedPaint === 'path_0'
              ? 'bg-sky-700 border-sky-800 text-white shadow-md font-black'
              : 'bg-white border-sky-200 text-sky-900 hover:bg-sky-100 font-bold'
          }`}
          title="길/수로 지우개 (statusMap 타일 제거)"
        >
          🚫 지우개
        </button>
        {WATER_TILES_PALETTE.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => setSelectedPaint(tile.id)}
            className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
              selectedPaint === tile.id
                ? 'border-sky-700 bg-sky-200 scale-105 shadow-md ring-2 ring-sky-500'
                : 'border-sky-200 hover:border-sky-400 bg-white'
            }`}
            title={tile.name}
          >
            <PathTile type={tile.type} />
          </button>
        ))}
      </div>

      {/* Path Tile Selection Palette (statusMap) */}
      <div className="flex flex-wrap gap-1 items-center bg-amber-500/10 p-1 rounded-xl border border-amber-600/30">
        <span className="text-[11px] font-bold text-amber-800 px-1">🛣️ 흙길 타일:</span>
        <button
          type="button"
          onClick={() => setSelectedPaint('path_0')}
          className={`px-2 py-0.5 rounded-lg text-xs border cursor-pointer flex items-center gap-1 transition-all ${
            selectedPaint === 'path_0'
              ? 'bg-amber-700 border-amber-800 text-white shadow-md font-black'
              : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100 font-bold'
          }`}
          title="길 지우개 (statusMap 타일 제거)"
        >
          🚫 길 지우개
        </button>
        {PATH_TILES_PALETTE.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={() => setSelectedPaint(tile.id)}
            className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
              selectedPaint === tile.id
                ? 'border-amber-700 bg-amber-200 scale-105 shadow-md ring-2 ring-amber-500'
                : 'border-amber-200 hover:border-amber-400 bg-white'
            }`}
            title={tile.name}
          >
            <PathTile type={tile.type} />
          </button>
        ))}
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

        {/* Egg & Path blocks */}
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_EGG)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_EGG
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Egg Block (알)"
        >
          <BlockRenderer id={BLOCK_EGG} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_PATH)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_PATH
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Chicken Path Tile (경로)"
        >
          <BlockRenderer id={BLOCK_PATH} />
        </button>

        {/* 4-Direction Chicken Tools */}
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_CHICKEN_D)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_CHICKEN_D
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md ring-2 ring-emerald-500'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Chicken Down (닭 - 아래)"
        >
          <BlockRenderer id={BLOCK_CHICKEN_D} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_CHICKEN_U)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_CHICKEN_U
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md ring-2 ring-emerald-500'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Chicken Up (닭 - 위)"
        >
          <BlockRenderer id={BLOCK_CHICKEN_U} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_CHICKEN_L)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_CHICKEN_L
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md ring-2 ring-emerald-500'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Chicken Left (닭 - 왼쪽)"
        >
          <BlockRenderer id={BLOCK_CHICKEN_L} />
        </button>
        <button
          type="button"
          onClick={() => setSelectedPaint(BLOCK_CHICKEN_R)}
          className={`w-7 h-7 p-0.5 rounded-lg border cursor-pointer transition-all ${
            selectedPaint === BLOCK_CHICKEN_R
              ? 'border-emerald-600 bg-emerald-50 scale-105 shadow-md ring-2 ring-emerald-500'
              : 'border-stone-200 hover:border-stone-300 bg-white/80'
          }`}
          title="Chicken Right (닭 - 오른쪽)"
        >
          <BlockRenderer id={BLOCK_CHICKEN_R} />
        </button>

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
