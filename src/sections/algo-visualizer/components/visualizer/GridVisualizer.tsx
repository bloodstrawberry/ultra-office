'use client';

import React, { useState } from 'react';
import { Step } from '../../lib/algorithms/types';
import { useVisualizerStore } from '../../store/visualizerStore';

interface GridVisualizerProps {
  step: Step;
}

export const GridVisualizer: React.FC<GridVisualizerProps> = ({ step }) => {
  const {
    gridRows,
    gridCols,
    gridStart,
    gridTarget,
    gridWalls,
    gridDrawMode,
    toggleGridWall,
    clearGridWalls,
    generateRandomGridWalls,
    generateRecursiveMaze,
    setGridDrawMode,
  } = useVisualizerStore();

  const [isMouseDown, setIsMouseDown] = useState(false);

  const currentCellCoord = step.currentCellCoord;
  const pathCells = new Set((step.pathCellCoords || []).map(([r, c]) => `${r},${c}`));
  const visitedCells = new Set((step.visitedCellCoords || []).map(([r, c]) => `${r},${c}`));

  const handleCellClick = (r: number, c: number) => {
    toggleGridWall(r, c);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (isMouseDown) {
      toggleGridWall(r, c);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col p-3 sm:p-4 select-none relative bg-slate-950/70 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner overflow-hidden"
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onMouseLeave={() => setIsMouseDown(false)}
    >
      {/* 상단 툴바: 모드 선택 & 미로 생성 버튼군 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 z-10">
        {/* 드로잉 모드 선택 */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-700/80">
          <button
            onClick={() => setGridDrawMode('wall')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              gridDrawMode === 'wall'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🧱</span>
            <span>벽 그리기</span>
          </button>
          <button
            onClick={() => setGridDrawMode('erase')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              gridDrawMode === 'erase'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🧹</span>
            <span>지우개</span>
          </button>
          <button
            onClick={() => setGridDrawMode('start')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              gridDrawMode === 'start'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🚀</span>
            <span>출발지(S)</span>
          </button>
          <button
            onClick={() => setGridDrawMode('target')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              gridDrawMode === 'target'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🎯</span>
            <span>도착지(E)</span>
          </button>
        </div>

        {/* 미로 생성 액션 */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => generateRecursiveMaze()}
            className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-600/60 text-purple-300 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
          >
            <span>🌀</span>
            <span>재귀 미로</span>
          </button>
          <button
            onClick={() => generateRandomGridWalls(0.28)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
          >
            <span>🎲</span>
            <span>랜덤 장애물</span>
          </button>
          <button
            onClick={() => clearGridWalls()}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            벽 전체 삭제
          </button>
        </div>
      </div>

      {/* 2D 그리드 보드 */}
      <div className="flex-1 w-full flex items-center justify-center overflow-auto p-1">
        <div
          className="grid gap-[2px] bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-2xl"
          style={{
            gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: '680px',
            aspectRatio: `${gridCols} / ${gridRows}`,
          }}
        >
          {Array.from({ length: gridRows }).map((_, r) =>
            Array.from({ length: gridCols }).map((_, c) => {
              const isStart = r === gridStart[0] && c === gridStart[1];
              const isTarget = r === gridTarget[0] && c === gridTarget[1];
              const isWall = gridWalls.has(`${r},${c}`);
              const isCurrent =
                currentCellCoord && currentCellCoord[0] === r && currentCellCoord[1] === c;
              const isPath = pathCells.has(`${r},${c}`);
              const isVisited = visitedCells.has(`${r},${c}`);

              let cellBg = 'bg-slate-800/80 hover:bg-slate-700/80';
              let content: React.ReactNode = null;
              let extraClasses = '';

              if (isStart) {
                cellBg = 'bg-blue-600 border-blue-400 text-white';
                content = <span className="text-[12px] sm:text-sm">🚀</span>;
                extraClasses = 'shadow-[0_0_10px_rgba(59,130,246,0.8)] z-10';
              } else if (isTarget) {
                cellBg = 'bg-rose-600 border-rose-400 text-white';
                content = <span className="text-[12px] sm:text-sm">🎯</span>;
                extraClasses = 'shadow-[0_0_10px_rgba(244,63,94,0.8)] z-10';
              } else if (isWall) {
                cellBg = 'bg-slate-950 border-slate-700';
                extraClasses = 'scale-95';
              } else if (isCurrent) {
                cellBg = 'bg-amber-400 border-amber-200';
                extraClasses =
                  'shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-110 z-10 animate-pulse';
              } else if (isPath) {
                cellBg = 'bg-gradient-to-tr from-amber-400 to-yellow-300 border-yellow-200';
                extraClasses =
                  'shadow-[0_0_8px_rgba(253,224,71,0.8)] scale-105 z-10 animate-fade-in';
              } else if (isVisited) {
                cellBg = 'bg-teal-700/80 border-teal-500/50';
                extraClasses = 'animate-fade-in';
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={() => handleCellClick(r, c)}
                  onMouseEnter={() => handleMouseEnter(r, c)}
                  className={`w-full h-full rounded-md flex items-center justify-center cursor-pointer transition-all duration-150 border border-transparent ${cellBg} ${extraClasses}`}
                >
                  {content}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
