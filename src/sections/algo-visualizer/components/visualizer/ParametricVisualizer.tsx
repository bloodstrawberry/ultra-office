'use client';

import React from 'react';
import { Step } from '../../lib/algorithms/types';

interface ParametricVisualizerProps {
  step: Step;
}

export const ParametricVisualizer: React.FC<ParametricVisualizerProps> = ({ step }) => {
  const trees = step.array || [];
  const low = step.searchLow ?? 0;
  const high = step.searchHigh ?? 20;
  const mid = step.searchMid ?? 10;
  const isMidFeasible = step.isMidFeasible;
  const bestAnswer = step.bestAnswer;
  const maxTreeH = Math.max(...trees, 20);

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 select-none relative overflow-y-auto bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner gap-4">
      {/* 상단 범위 & 결정 상태 배너 */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400">Low:</span>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded-lg border border-blue-500/40">
              {low}m
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-amber-400 font-bold">Mid (검사 높이):</span>
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-black rounded-lg border border-amber-500/50 scale-105">
              {mid}m
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400">High:</span>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 font-bold rounded-lg border border-purple-500/40">
              {high}m
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isMidFeasible !== null && isMidFeasible !== undefined && (
            <span
              className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${
                isMidFeasible
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
              }`}
            >
              {isMidFeasible ? '✓ 목재 충족 (가능)' : '✗ 목재 부족 (불가능)'}
            </span>
          )}
          {bestAnswer !== null && bestAnswer !== undefined && (
            <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-black">
              현재 최적해: {bestAnswer}m
            </span>
          )}
        </div>
      </div>

      {/* 나무 절단 시뮬레이션 캔버스 */}
      <div className="w-full flex-1 min-h-[200px] flex items-end justify-around relative px-4 pb-6 pt-10 border-b border-slate-800">
        {/* 절단 높이 수평선 (Mid Cut Line) */}
        <div
          style={{ bottom: `${Math.max(8, Math.min(90, (mid / maxTreeH) * 85))}%` }}
          className="absolute left-0 right-0 border-b-2 border-dashed border-amber-400 z-20 flex items-center justify-between px-4 transition-all duration-300 pointer-events-none"
        >
          <span className="bg-slate-900 border border-amber-400 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md">
            절단기 톱날 높이 = {mid}m
          </span>
          <span className="text-[10px] text-amber-300 font-mono">✂️ Cutting Line</span>
        </div>

        {trees.map((height, idx) => {
          const totalHeightPercent = Math.max(10, (height / maxTreeH) * 85);
          const cutObtained = Math.max(0, height - mid);

          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-end h-full relative group w-14"
            >
              {/* 잘려 나간 목재 라벨 */}
              {cutObtained > 0 && (
                <div className="absolute -top-7 text-[10px] font-black text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 px-1.5 py-0.5 rounded-md animate-bounce">
                  +{cutObtained}m
                </div>
              )}

              <div className="text-xs font-mono font-bold text-slate-300 mb-1">{height}m</div>

              {/* 나무 몸통 Bar */}
              <div
                style={{ height: `${totalHeightPercent}%` }}
                className="w-10 rounded-t-2xl bg-gradient-to-t from-emerald-900 via-emerald-700 to-emerald-500 border border-emerald-400/50 shadow-lg relative overflow-hidden flex flex-col justify-between"
              >
                {/* 상단 잘리는 영역 표시 */}
                {cutObtained > 0 && (
                  <div
                    style={{ height: `${(cutObtained / height) * 100}%` }}
                    className="w-full bg-amber-400/40 border-b border-amber-300/80 animate-pulse"
                  />
                )}
              </div>

              <div className="text-[10px] font-mono text-slate-500 mt-2">나무 #{idx + 1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
