'use client';

import type { Step } from '../../lib/algorithms/types';

import React from 'react';

interface CountingSortVisualizerProps {
  step: Step;
}

export const CountingSortVisualizer: React.FC<CountingSortVisualizerProps> = ({ step }) => {
  const array = step.array || [];
  const countArray = step.countArray || [];
  const outputArray = step.outputArray || [];
  const comparingIndices = new Set(step.comparingIndices || []);
  const activeCountIdx = step.activeCountIdx;

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 select-none relative overflow-y-auto bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner gap-4">
      {/* 1. 입력 원본 배열 (Input Array) */}
      <div className="flex flex-col gap-1.5 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-blue-300">
            1. 입력 원본 배열 (Input Array)
          </span>
          <span className="text-[10px] font-mono text-slate-400">N = {array.length}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {array.map((val, idx) => {
            const isComparing = comparingIndices.has(idx);
            return (
              <div
                key={idx}
                className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center border font-mono font-black text-sm transition-all duration-200 shadow-md ${
                  isComparing
                    ? 'bg-amber-500 text-slate-950 border-yellow-200 scale-110 shadow-amber-500/50'
                    : 'bg-slate-800 text-white border-slate-700'
                }`}
              >
                <span>{val}</span>
                <span className="text-[9px] font-normal text-slate-400">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 카운트 및 누적합 배열 (Count Array) */}
      <div className="flex flex-col gap-1.5 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-indigo-300">
            2. 카운트 & 누적 배열 (Count / Prefix Sum Array)
          </span>
          <span className="text-[10px] font-mono text-indigo-400">
            Phase:{' '}
            {step.countPhase === 'count'
              ? '등장 횟수 세기'
              : step.countPhase === 'accumulate'
                ? '누적합 계산'
                : '결과 배열 배치'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {countArray.map((countVal, idx) => {
            const isActive = activeCountIdx === idx;
            return (
              <div
                key={idx}
                className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center border font-mono font-black text-sm transition-all duration-200 shadow-md ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-300 scale-110 shadow-indigo-500/50'
                    : 'bg-slate-850 text-slate-200 border-slate-700/80'
                }`}
              >
                <span>{countVal}</span>
                <span className="text-[9px] font-bold text-slate-400">값:{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 최종 출력 결과 배열 (Output Array) */}
      <div className="flex flex-col gap-1.5 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-emerald-300">
            3. 정렬된 출력 배열 (Output Sorted Array)
          </span>
          <span className="text-[10px] font-mono text-emerald-400">안정 정렬(Stable Sort)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {outputArray.map((val, idx) => {
            const isFilled = val !== null && val !== undefined;
            return (
              <div
                key={idx}
                className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center border font-mono font-black text-sm transition-all duration-200 shadow-md ${
                  isFilled
                    ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 text-white border-emerald-300 shadow-emerald-500/30'
                    : 'bg-slate-900/60 text-slate-600 border-dashed border-slate-700'
                }`}
              >
                <span>{isFilled ? val : '-'}</span>
                <span className="text-[9px] font-normal text-slate-400">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
