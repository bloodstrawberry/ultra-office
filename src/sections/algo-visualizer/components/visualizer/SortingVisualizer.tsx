'use client';

import type { Step } from '../../lib/algorithms/types';

import React from 'react';

interface SortingVisualizerProps {
  step: Step;
}

export const SortingVisualizer: React.FC<SortingVisualizerProps> = ({ step }) => {
  const array = step.array || [];
  const comparingIndices = new Set(step.comparingIndices || []);
  const swappingIndices = new Set(step.swappingIndices || []);
  const sortedIndices = new Set(step.sortedIndices || []);
  const pivotIndex = step.pivotIndex;
  const pointers = step.pointers || [];

  const maxVal = Math.max(...array, 100);

  return (
    <div className="w-full h-full flex flex-col justify-end items-center p-4 sm:p-6 select-none relative overflow-hidden bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner">
      {/* 상단 범례 (Legend) */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>기본 원소</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 border border-amber-600/60 rounded-xl text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span>비교 중 (Comparing)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-950/80 border border-rose-600/60 rounded-xl text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce" />
            <span>교환 (Swap)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-600/60 rounded-xl text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>정렬 완료 (Sorted)</span>
          </div>
          {pivotIndex !== undefined && pivotIndex !== null && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/80 border border-purple-600/60 rounded-xl text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span>피벗 (Pivot)</span>
            </div>
          )}
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
          N = {array.length}
        </div>
      </div>

      {/* 막대 그래프 렌더링 컨테이너 */}
      <div className="w-full flex-1 min-h-[160px] flex items-end justify-center gap-1.5 sm:gap-2.5 pt-16 pb-8">
        {array.map((value, idx) => {
          const isComparing = comparingIndices.has(idx);
          const isSwapping = swappingIndices.has(idx);
          const isSorted = sortedIndices.has(idx);
          const isPivot = pivotIndex === idx;

          // 막대 높이 계산 (15% ~ 90%)
          const heightPercent = Math.max(12, Math.round((value / maxVal) * 88));

          // 막대 색상 & 스타일 클래스 결정
          let barBg = 'bg-gradient-to-t from-blue-700 to-blue-500 border-blue-400/50 text-blue-100';
          let glowEffect = '';

          if (isSorted) {
            barBg =
              'bg-gradient-to-t from-emerald-600 to-emerald-400 border-emerald-300 text-emerald-50';
            glowEffect = 'shadow-[0_0_12px_rgba(52,211,153,0.4)]';
          } else if (isSwapping) {
            barBg = 'bg-gradient-to-t from-rose-600 to-rose-400 border-rose-300 text-rose-50';
            glowEffect = 'shadow-[0_0_16px_rgba(244,63,94,0.7)] scale-[1.04]';
          } else if (isComparing) {
            barBg = 'bg-gradient-to-t from-amber-600 to-amber-400 border-amber-300 text-amber-50';
            glowEffect = 'shadow-[0_0_14px_rgba(251,191,36,0.6)] scale-[1.02]';
          } else if (isPivot) {
            barBg =
              'bg-gradient-to-t from-purple-600 to-purple-400 border-purple-300 text-purple-50';
            glowEffect = 'shadow-[0_0_14px_rgba(168,85,247,0.6)]';
          }

          // 해당 인덱스를 가리키는 포인터들
          const activePointers = pointers.filter((p) => p.index === idx);

          return (
            <div
              key={idx}
              className="flex-1 max-w-[54px] flex flex-col items-center justify-end h-full relative group transition-all duration-200"
            >
              {/* 상단 포인터 뱃지 */}
              {activePointers.length > 0 && (
                <div className="absolute -top-7 flex flex-col items-center animate-bounce z-20">
                  <div className="px-1.5 py-0.5 bg-slate-900 border border-amber-400 text-amber-300 font-extrabold text-[10px] rounded-md shadow-lg">
                    {activePointers.map((p) => p.label).join(',')}
                  </div>
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-amber-400" />
                </div>
              )}

              {/* 수치 라벨 */}
              <div
                className={`text-[11px] sm:text-xs font-black mb-1.5 transition-colors ${
                  isSwapping
                    ? 'text-rose-300 scale-110'
                    : isComparing
                      ? 'text-amber-300 scale-105'
                      : isSorted
                        ? 'text-emerald-300'
                        : isPivot
                          ? 'text-purple-300'
                          : 'text-slate-300'
                }`}
              >
                {value}
              </div>

              {/* 막대 Bar */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-2xl border ${barBg} ${glowEffect} transition-all duration-200 flex flex-col items-center justify-start pt-1.5 shadow-lg relative overflow-hidden`}
              >
                {/* 상단 하이라이트 광택 */}
                <div className="w-3/4 h-1 bg-white/40 rounded-full mx-auto" />
              </div>

              {/* 하단 인덱스 라벨 */}
              <div className="text-[10px] font-mono text-slate-500 mt-2">[{idx}]</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
