"use client";

import React, { useEffect, useRef, useState } from "react";
import { LevelData } from "../game/types";
import BlockRenderer, {
  BLOCK_NONE,
  BLOCK_EMPTY,
  SoilTileDark,
  SoilTileLight,
  STAGE_GRID_GAP_REM,
} from "../object";

export interface StagePreviewModalProps {
  isOpen: boolean;
  stageIndex: number;
  levelData: LevelData | null;
  onClose: () => void;
  onStart: () => void;
  onPrevStage?: () => void;
  onNextStage?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

function LeftArrowIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function RightArrowIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function StagePreviewModal({
  isOpen,
  stageIndex,
  levelData,
  onClose,
  onStart,
  onPrevStage,
  onNextStage,
  hasPrev = false,
  hasNext = false,
}: StagePreviewModalProps) {
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 240, height: 260 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev && onPrevStage) {
        onPrevStage();
      } else if (e.key === "ArrowRight" && hasNext && onNextStage) {
        onNextStage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, hasPrev, hasNext, onPrevStage, onNextStage]);

  useEffect(() => {
    if (!isOpen || !previewContainerRef.current) return;
    const updateSize = () => {
      if (previewContainerRef.current) {
        const rect = previewContainerRef.current.getBoundingClientRect();
        setContainerSize({
          width: Math.max(60, rect.width - 20),
          height: Math.max(60, rect.height - 20),
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen || !levelData) return null;

  const grid = levelData.grid;
  const rows = grid.length || 8;
  const cols = grid[0]?.length || 8;
  const stageNum = stageIndex + 1;

  // Calculate pixel size for square cells so board fits container perfectly without gaps
  const maxCellWidth = containerSize.width / cols;
  const maxCellHeight = containerSize.height / rows;
  const cellSize = Math.floor(Math.min(maxCellWidth, maxCellHeight));
  const boardWidth = Math.max(1, cellSize * cols);
  const boardHeight = Math.max(1, cellSize * rows);

  return (
    <div
      className="fixed inset-0 pt-[80px] z-50 flex items-center justify-center p-3 sm:p-4 bg-amber-950/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md h-[440px] sm:h-[480px] max-h-[calc(100dvh-96px)] bg-[#FFFDF6] border-2 border-amber-400/90 rounded-3xl p-4 sm:p-5 shadow-2xl text-amber-950 flex flex-col justify-between items-center text-center animate-pop-in relative overflow-hidden my-auto shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glows */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-300/30 rounded-full blur-2xl pointer-events-none" />

        {/* Compact Header Stage Badge */}
        <div className="flex items-center justify-center z-10 w-full shrink-0 pt-0.5">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-sky-100 border border-sky-300 rounded-full text-sky-950 font-black text-sm sm:text-base shadow-xs">
            <span>🚚</span>
            <span>{stageNum}번 배송지</span>
          </div>
        </div>

        {/* Mini Stage Grid Preview Container */}
        <div className="w-full flex-1 flex items-center justify-between gap-2 sm:gap-3 z-10 min-h-0 my-2">
          {/* Previous Stage SVG Button */}
          <button
            type="button"
            onClick={onPrevStage}
            disabled={!hasPrev}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all border-2 shrink-0 ${
              hasPrev
                ? "bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600 border-blue-700 text-white shadow-md shadow-blue-500/30 hover:scale-110 active:scale-90 hover:brightness-110 cursor-pointer"
                : "bg-slate-100 border-slate-200 text-slate-300 opacity-30 cursor-not-allowed shadow-none"
            }`}
            aria-label="이전 배송지"
            title={hasPrev ? "이전 배송지 보기" : "첫 번째 배송지입니다"}
          >
            <LeftArrowIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3.5]" />
          </button>

          {/* Grid Preview Display Area */}
          <div
            ref={previewContainerRef}
            className="flex-1 h-full max-h-[290px] sm:max-h-[330px] flex items-center justify-center p-2 sm:p-3 bg-slate-900/10 rounded-2xl border-2 border-sky-400/50 shadow-inner overflow-hidden min-w-0"
          >
            <div
              className="relative flex items-center justify-center m-auto"
              style={{
                width: `${boardWidth}px`,
                height: `${boardHeight}px`,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              {/* Road Background Layer */}
              <div className="relative w-full h-full flex justify-center">
                <div
                  className="grid w-full h-full pointer-events-none rounded-xl overflow-hidden shadow-sm"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                    gap: `${STAGE_GRID_GAP_REM}rem`,
                  }}
                >
                  {grid.map((row, y) =>
                    row.map((cell, x) => {
                      const isNone = cell === BLOCK_NONE;
                      if (isNone) {
                        return (
                          <div
                            key={`preview-bg-${y}-${x}`}
                            className="w-full h-full opacity-0 pointer-events-none"
                          />
                        );
                      }

                      const borderTop =
                        y === 0 ||
                        grid[y - 1]?.[x] === BLOCK_NONE ||
                        grid[y - 1]?.[x] === undefined;
                      const borderBottom =
                        y === grid.length - 1 ||
                        grid[y + 1]?.[x] === BLOCK_NONE ||
                        grid[y + 1]?.[x] === undefined;
                      const borderLeft =
                        x === 0 ||
                        grid[y]?.[x - 1] === BLOCK_NONE ||
                        grid[y]?.[x - 1] === undefined;
                      const borderRight =
                        x === row.length - 1 ||
                        grid[y]?.[x + 1] === BLOCK_NONE ||
                        grid[y]?.[x + 1] === undefined;

                      const TileComponent =
                        (x + y) % 2 === 0 ? SoilTileDark : SoilTileLight;

                      return (
                        <div
                          key={`preview-bg-${y}-${x}`}
                          className="w-full h-full relative flex items-center justify-center overflow-visible"
                        >
                          <TileComponent
                            borderTop={borderTop}
                            borderBottom={borderBottom}
                            borderLeft={borderLeft}
                            borderRight={borderRight}
                          />
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>

              {/* Blocks Layer (Overlaid with absolute inset-0) */}
              <div
                className="grid absolute inset-0 z-10 w-full h-full justify-center pointer-events-none"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                  gap: `${STAGE_GRID_GAP_REM}rem`,
                }}
              >
                {grid.map((row, y) =>
                  row.map((cell, x) => {
                    return (
                      <div
                        key={`preview-cell-${y}-${x}`}
                        className="w-full h-full relative flex items-center justify-center overflow-visible p-[8%]"
                      >
                        {cell !== BLOCK_EMPTY && cell !== BLOCK_NONE && (
                          <BlockRenderer id={cell} x={x} y={y} grid={grid} />
                        )}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          </div>

          {/* Next Stage SVG Button */}
          <button
            type="button"
            onClick={onNextStage}
            disabled={!hasNext}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all border-2 shrink-0 ${
              hasNext
                ? "bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600 border-blue-700 text-white shadow-md shadow-blue-500/30 hover:scale-110 active:scale-90 hover:brightness-110 cursor-pointer"
                : "bg-slate-100 border-slate-200 text-slate-300 opacity-30 cursor-not-allowed shadow-none"
            }`}
            aria-label="다음 배송지"
            title={hasNext ? "다음 배송지 보기" : "다음 배송지가 잠겨있습니다"}
          >
            <RightArrowIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3.5]" />
          </button>
        </div>

        {/* Buttons Section (Fixed bottom shrink-0) */}
        <div className="flex items-center gap-3 w-full pt-1.5 z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-black text-sm sm:text-base rounded-2xl border-2 border-slate-300 shadow-md transition-all cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onStart}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 active:scale-95 text-white font-black text-sm sm:text-base rounded-2xl border-2 border-sky-400/80 shadow-xl shadow-blue-600/40 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>🚚</span>
            <span>배송 출발!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
