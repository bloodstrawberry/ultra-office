'use client';

import type { Step } from '../../lib/algorithms/types';

import React from 'react';

interface SearchVisualizerProps {
  step: Step;
}

export const SearchVisualizer: React.FC<SearchVisualizerProps> = ({ step }) => {
  const array = step.array || [];
  const comparingIndices = new Set(step.comparingIndices || []);
  const foundIndex = step.foundIndex;
  const targetValue = step.targetValue;
  const pointers = step.pointers || [];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner">
      {/* 상단 타겟 정보 배너 */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-blue-950/80 border border-blue-600/60 rounded-2xl text-xs font-bold text-blue-300 flex items-center gap-2">
            <span>🎯 찾을 목표 값(Target):</span>
            <span className="px-2 py-0.5 bg-blue-600 text-white rounded-lg font-mono font-extrabold">
              {targetValue ?? '-'}
            </span>
          </div>
        </div>

        {foundIndex !== undefined && foundIndex !== null && (
          <div className="px-3 py-1.5 bg-emerald-950/90 border border-emerald-500 rounded-2xl text-xs font-extrabold text-emerald-300 animate-pulse flex items-center gap-1.5">
            <span>✨ 타겟 발견! 인덱스 [{foundIndex}]</span>
          </div>
        )}
      </div>

      {/* 배열 타일 컨테이너 */}
      <div className="w-full flex-1 flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-16 overflow-y-auto">
        {array.map((value, idx) => {
          const isComparing = comparingIndices.has(idx);
          const isFound = foundIndex === idx;

          let tileBg = 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-slate-500';
          let glowEffect = '';

          if (isFound) {
            tileBg =
              'bg-gradient-to-br from-emerald-600 to-emerald-400 border-emerald-300 text-white';
            glowEffect = 'shadow-[0_0_20px_rgba(52,211,153,0.8)] scale-110';
          } else if (isComparing) {
            tileBg = 'bg-gradient-to-br from-amber-600 to-amber-500 border-amber-300 text-white';
            glowEffect = 'shadow-[0_0_16px_rgba(251,191,36,0.7)] scale-105';
          }

          const activePointers = pointers.filter((p) => p.index === idx);

          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-center relative min-w-[56px] sm:min-w-[64px]"
            >
              {/* 상단 포인터 */}
              {activePointers.length > 0 && (
                <div className="absolute -top-10 flex flex-col items-center animate-bounce z-20">
                  <div className="px-2 py-0.5 bg-slate-900 border border-amber-400 text-amber-300 font-black text-[11px] rounded-lg shadow-lg">
                    {activePointers.map((p) => p.label).join(', ')}
                  </div>
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-amber-400" />
                </div>
              )}

              {/* 숫자 타일 Box */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-lg sm:text-xl shadow-lg transition-all duration-200 ${tileBg} ${glowEffect}`}
              >
                {value}
              </div>

              {/* 하단 인덱스 */}
              <div className="text-[11px] font-mono text-slate-400 mt-1.5">[{idx}]</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
