'use client';

import type { Step } from '../../lib/algorithms/types';

import React from 'react';

interface PlaneSweepingVisualizerProps {
  step: Step;
}

export const PlaneSweepingVisualizer: React.FC<PlaneSweepingVisualizerProps> = ({ step }) => {
  const rectangles = step.rectangles || [];
  const sweepLineX = step.sweepLineX;
  const accumulatedArea = step.accumulatedArea ?? 0;
  const activeIntervals = step.activeIntervals || [];

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-5 select-none relative overflow-hidden bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner gap-3">
      {/* 상단 통계 바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">📐</span>
          <span className="text-sm font-extrabold text-amber-300">
            평면 스위핑 (직사각형 합집합 넓이 계산)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {sweepLineX !== null && sweepLineX !== undefined && (
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold">
              스위프 라인: x = {sweepLineX}
            </span>
          )}
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-mono font-black">
            누적 총면적 = {accumulatedArea} px²
          </span>
        </div>
      </div>

      {/* SVG 2D 평면 스위핑 캔버스 */}
      <div className="w-full flex-1 flex items-center justify-center pt-2 overflow-hidden bg-slate-900/60 rounded-2xl border border-slate-800/80">
        <svg viewBox="0 0 380 250" className="w-full max-w-[560px] h-full max-h-[320px]">
          {/* 그리드 보조선 */}
          <defs>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* 직사각형 렌더링 */}
          {rectangles.map((r) => {
            const width = r.x2 - r.x1;
            const height = r.y2 - r.y1;
            return (
              <g key={r.id}>
                <rect
                  x={r.x1}
                  y={r.y1}
                  width={width}
                  height={height}
                  fill={r.color}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  rx="4"
                  className="transition-all duration-300"
                />
                <text
                  x={r.x1 + 6}
                  y={r.y1 + 14}
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {r.label || r.id}
                </text>
              </g>
            );
          })}

          {/* 활성 Y 구간 하이라이트 (스위프 라인 위치) */}
          {sweepLineX !== null && sweepLineX !== undefined && (
            <g>
              {/* 수직 스위프 라인 */}
              <line
                x1={sweepLineX}
                y1={10}
                x2={sweepLineX}
                y2={240}
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                className="animate-pulse"
              />
              <circle cx={sweepLineX} cy={10} r="4" fill="#fbbf24" />
              <circle cx={sweepLineX} cy={240} r="4" fill="#fbbf24" />

              {/* 활성화된 Y 구간 바 */}
              {activeIntervals.map(([y1, y2], idx) => (
                <rect
                  key={idx}
                  x={sweepLineX - 4}
                  y={y1}
                  width="8"
                  height={y2 - y1}
                  fill="#ef4444"
                  rx="3"
                  className="animate-pulse opacity-85"
                />
              ))}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
