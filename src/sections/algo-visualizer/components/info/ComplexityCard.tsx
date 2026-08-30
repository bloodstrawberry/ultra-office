'use client';

import type { AlgorithmDefinition } from '../../lib/algorithms/types';

import React from 'react';

interface ComplexityCardProps {
  algo: AlgorithmDefinition;
}

export const ComplexityCard: React.FC<ComplexityCardProps> = ({ algo }) => {
  const { complexity, keyFeatures, shortDescription } = algo;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
      {/* 1. 알고리즘 기본 설명 */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xl">{algo.icon}</span>
          <h3 className="text-base font-extrabold text-white">{algo.name}</h3>
          <span className="text-xs font-mono text-slate-400">({algo.englishName})</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{shortDescription}</p>
      </div>

      {/* 2. Big-O 복잡도 표 */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 mb-2">
          복잡도 요약 (Big-O Complexity)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* 최선 시간 */}
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400 font-bold">최선 시간 (Best)</span>
            <span className="font-mono font-black text-xs sm:text-sm text-emerald-400 mt-0.5">
              {complexity.timeBest}
            </span>
          </div>

          {/* 평균 시간 */}
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400 font-bold">평균 시간 (Avg)</span>
            <span className="font-mono font-black text-xs sm:text-sm text-blue-400 mt-0.5">
              {complexity.timeAverage}
            </span>
          </div>

          {/* 최악 시간 */}
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400 font-bold">최악 시간 (Worst)</span>
            <span className="font-mono font-black text-xs sm:text-sm text-rose-400 mt-0.5">
              {complexity.timeWorst}
            </span>
          </div>

          {/* 공간 복잡도 */}
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400 font-bold">공간 복잡도 (Space)</span>
            <span className="font-mono font-black text-xs sm:text-sm text-amber-400 mt-0.5">
              {complexity.spaceWorst}
            </span>
          </div>
        </div>
      </div>

      {/* 3. 특성 배지 & 핵심 포인트 */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {complexity.isStable !== undefined && (
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                complexity.isStable
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {complexity.isStable ? '✓ 안정 정렬 (Stable)' : '불안정 정렬 (Unstable)'}
            </span>
          )}

          {complexity.isInPlace !== undefined && (
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                complexity.isInPlace
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {complexity.isInPlace ? '✓ 제자리 정렬 (In-Place)' : '추가 메모리 필요'}
            </span>
          )}
        </div>

        <ul className="text-[11px] text-slate-400 space-y-1 mt-1">
          {keyFeatures.map((feat, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="text-blue-400">▪</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
