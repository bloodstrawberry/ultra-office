'use client';

import type { CellType } from './types';

import React, { useState } from 'react';

import { BLOCK_EMPTY, STAGE_GRID_GAP_REM } from '../object';

export interface EditorColControlsProps {
  grid: CellType[][];
  cols: number;
  stageMaxWidth: string;
  editorDeleteCol?: (x: number) => void;
  editorInsertColLeft?: (x: number) => void;
  editorInsertColRight?: (x: number) => void;
  copiedCol?: CellType[] | null;
  editorCopyCol?: (x: number) => void;
  editorPasteCol?: (x: number) => void;
  setHoveredCol: (col: number | null) => void;
}

export function EditorColControls({
  grid,
  cols,
  stageMaxWidth,
  editorDeleteCol,
  editorInsertColLeft,
  editorInsertColRight,
  copiedCol,
  editorCopyCol,
  editorPasteCol,
  setHoveredCol,
}: EditorColControlsProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);

  return (
    <div className="flex w-full justify-center mb-0.5 min-h-0">
      <div className="w-[28px] md:w-[32px] mr-1 flex-shrink-0" />
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: stageMaxWidth,
          gap: `${STAGE_GRID_GAP_REM}rem`,
        }}
      >
        {Array.from({ length: cols }).map((_, x) => {
          const isColEmpty = grid.every((row) => row[x] === BLOCK_EMPTY);
          return (
            <button
              key={`col-del-${x}`}
              type="button"
              onClick={() => editorDeleteCol?.(x)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({ x: e.clientX, y: e.clientY, index: x });
              }}
              onMouseEnter={() => setHoveredCol(x)}
              onMouseLeave={() => setHoveredCol(null)}
              className={`w-full h-6 sm:h-7 rounded-md flex items-center justify-center transition-all border text-xs md:text-sm font-black cursor-pointer shadow-sm select-none p-0 ${
                isColEmpty
                  ? 'bg-rose-100 border-rose-200 text-rose-700 hover:bg-rose-200 active:scale-95'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 active:scale-95'
              }`}
              title={
                isColEmpty
                  ? '이 열 완전히 지우기 (우클릭: 열 메뉴)'
                  : '이 열 비우기 (우클릭: 열 메뉴)'
              }
            >
              {isColEmpty ? '❌' : '⬇️'}
            </button>
          );
        })}
      </div>

      {/* Column Right-Click Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50 bg-transparent"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            className="fixed z-50 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl shadow-xl p-1.5 min-w-[170px] animate-fade-in text-stone-700 text-xs font-semibold select-none"
            style={{
              top: Math.min(
                contextMenu.y,
                (typeof window !== 'undefined' ? window.innerHeight : 600) - 220
              ),
              left: Math.min(
                contextMenu.x,
                (typeof window !== 'undefined' ? window.innerWidth : 800) - 190
              ),
            }}
          >
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                editorInsertColLeft?.(contextMenu.index);
                setContextMenu(null);
              }}
            >
              <span>⬅️</span>
              <span>왼쪽에 빈 열 추가</span>
            </button>
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                editorInsertColRight?.(contextMenu.index);
                setContextMenu(null);
              }}
            >
              <span>➡️</span>
              <span>오른쪽에 빈 열 추가</span>
            </button>
            <div className="my-1 border-t border-stone-100" />
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                editorCopyCol?.(contextMenu.index);
                setContextMenu(null);
              }}
            >
              <span>📋</span>
              <span>이 열 복사하기</span>
            </button>
            <button
              type="button"
              disabled={!copiedCol}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                copiedCol
                  ? 'hover:bg-sky-50 hover:text-sky-700 cursor-pointer text-stone-700'
                  : 'opacity-40 cursor-not-allowed text-stone-400'
              }`}
              onClick={() => {
                if (copiedCol) {
                  editorPasteCol?.(contextMenu.index);
                  setContextMenu(null);
                }
              }}
            >
              <span>📥</span>
              <span>여기에 열 붙여넣기</span>
            </button>
            <div className="my-1 border-t border-stone-100" />
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                editorDeleteCol?.(contextMenu.index);
                setContextMenu(null);
              }}
            >
              <span>❌</span>
              <span>이 열 비우기</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export interface EditorRowControlsProps {
  grid: CellType[][];
  rows: number;
  editorDeleteRow?: (y: number) => void;
  editorInsertRowAbove?: (y: number) => void;
  editorInsertRowBelow?: (y: number) => void;
  copiedRow?: CellType[] | null;
  editorCopyRow?: (y: number) => void;
  editorPasteRow?: (y: number) => void;
  setHoveredRow: (row: number | null) => void;
}

export function EditorRowControls({
  grid,
  rows,
  editorDeleteRow,
  editorInsertRowAbove,
  editorInsertRowBelow,
  copiedRow,
  editorCopyRow,
  editorPasteRow,
  setHoveredRow,
}: EditorRowControlsProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);

  return (
    <div
      className="grid mr-1 flex-shrink-0 w-[28px] md:w-[32px] min-h-0"
      style={{
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        gap: `${STAGE_GRID_GAP_REM}rem`,
      }}
    >
      {Array.from({ length: rows }).map((_, y) => {
        const isRowEmpty = grid[y]?.every((cell) => cell === BLOCK_EMPTY);
        return (
          <button
            key={`row-del-${y}`}
            type="button"
            onClick={() => editorDeleteRow?.(y)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ x: e.clientX, y: e.clientY, index: y });
            }}
            onMouseEnter={() => setHoveredRow(y)}
            onMouseLeave={() => setHoveredRow(null)}
            className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all border text-xs md:text-sm font-black cursor-pointer shadow-sm select-none p-0 ${
              isRowEmpty
                ? 'bg-rose-100 border-rose-200 text-rose-700 hover:bg-rose-200 active:scale-95'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 active:scale-95'
            }`}
            title={
              isRowEmpty
                ? '이 행 완전히 지우기 (우클릭: 행 메뉴)'
                : '이 행 비우기 (우클릭: 행 메뉴)'
            }
          >
            {isRowEmpty ? '❌' : '➡️'}
          </button>
        );
      })}

      {/* Row Right-Click Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50 bg-transparent"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            className="fixed z-50 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl shadow-xl p-1.5 min-w-[170px] animate-fade-in text-stone-700 text-xs font-semibold select-none"
            style={{
              top: Math.min(
                contextMenu.y,
                (typeof window !== 'undefined' ? window.innerHeight : 600) - 220
              ),
              left: Math.min(
                contextMenu.x,
                (typeof window !== 'undefined' ? window.innerWidth : 800) - 190
              ),
            }}
          >
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                editorInsertRowAbove?.(contextMenu.index);
                setContextMenu(null);
              }}
            >
              <span>⬆️</span>
              <span>위에 빈 행 추가</span>
            </button>
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                editorInsertRowBelow?.(contextMenu.index);
                setContextMenu(null);
              }}
            >
              <span>⬇️</span>
              <span>아래에 빈 행 추가</span>
            </button>
            <div className="my-1 border-t border-stone-100" />
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                editorCopyRow?.(contextMenu.index);
                setContextMenu(null);
              }}
            >
              <span>📋</span>
              <span>이 행 복사하기</span>
            </button>
            <button
              type="button"
              disabled={!copiedRow}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                copiedRow
                  ? 'hover:bg-sky-50 hover:text-sky-700 cursor-pointer text-stone-700'
                  : 'opacity-40 cursor-not-allowed text-stone-400'
              }`}
              onClick={() => {
                if (copiedRow) {
                  editorPasteRow?.(contextMenu.index);
                  setContextMenu(null);
                }
              }}
            >
              <span>📥</span>
              <span>여기에 행 붙여넣기</span>
            </button>
            <div className="my-1 border-t border-stone-100" />
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                editorDeleteRow?.(contextMenu.index);
                setContextMenu(null);
              }}
            >
              <span>❌</span>
              <span>이 행 비우기</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
