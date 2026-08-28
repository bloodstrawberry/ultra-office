'use client';

import React from 'react';
import { Step } from '../../lib/algorithms/types';

interface RecursionVisualizerProps {
  step: Step;
}

export const RecursionVisualizer: React.FC<RecursionVisualizerProps> = ({ step }) => {
  const callStack = step.callStack || [];
  const currentSelection = step.currentSelection || [];
  const generatedCombinations = step.generatedCombinations || [];

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-stretch justify-between p-4 sm:p-5 select-none relative overflow-y-auto bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner gap-4">
      {/* 1. 호출 스택 뷰 (Call Stack Container) */}
      <div className="flex-1 flex flex-col gap-2 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🥞</span>
            <span className="text-xs font-extrabold text-pink-300">호출 스택 (Call Stack)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Depth: {callStack.length}</span>
        </div>

        <div className="flex-1 min-h-[220px] flex flex-col-reverse justify-start gap-2 overflow-y-auto p-2 bg-slate-950/80 rounded-xl border border-slate-850">
          {callStack.map((frame, idx) => {
            const isTop = idx === callStack.length - 1;
            return (
              <div
                key={frame.id || idx}
                className={`p-2.5 rounded-xl border transition-all duration-200 shadow-md flex items-center justify-between ${
                  isTop
                    ? 'bg-pink-600/30 border-pink-400 text-pink-100 scale-[1.02] shadow-pink-500/20'
                    : 'bg-slate-850 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex flex-col">
                  <div className="font-mono font-bold text-xs flex items-center gap-2">
                    <span className="text-[10px] text-pink-400">#{frame.depth}</span>
                    <span>
                      {frame.name}({frame.args})
                    </span>
                  </div>
                  {frame.returnValue !== undefined && (
                    <div className="text-[11px] text-emerald-300 font-bold mt-0.5">
                      ➔ Return: {frame.returnValue}
                    </div>
                  )}
                </div>

                {isTop && (
                  <span className="px-2 py-0.5 bg-pink-500 text-slate-950 font-black text-[10px] rounded-md animate-pulse">
                    Active
                  </span>
                )}
              </div>
            );
          })}

          {callStack.length === 0 && (
            <div className="text-xs text-slate-500 my-auto text-center">
              호출 스택이 비어 있습니다.
            </div>
          )}
        </div>
      </div>

      {/* 2. 순열/조합 생성 상태 뷰 (Permutation / Backtracking Results) */}
      <div className="flex-1 flex flex-col gap-2 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🎲</span>
            <span className="text-xs font-extrabold text-fuchsia-300">
              현재 탐색 경로 & 생성 목록
            </span>
          </div>
          <span className="text-[10px] font-mono text-fuchsia-400">
            총 {generatedCombinations.length}개 생성됨
          </span>
        </div>

        {/* 현재 선택된 조합 */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-850 flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-bold">현재 선택 버퍼:</span>
          <div className="flex items-center gap-1.5">
            {currentSelection.length > 0 ? (
              currentSelection.map((val, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/50 rounded-lg text-xs font-mono font-bold"
                >
                  {val}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 font-mono">(선택 없음)</span>
            )}
          </div>
        </div>

        {/* 생성 완료된 목록 그리드 */}
        <div className="flex-1 min-h-[160px] p-2 bg-slate-950/80 rounded-xl border border-slate-850 flex flex-wrap content-start gap-2 overflow-y-auto">
          {generatedCombinations.map((combo, idx) => (
            <div
              key={idx}
              className="px-2.5 py-1 bg-gradient-to-r from-purple-900/60 to-fuchsia-900/60 border border-fuchsia-500/40 rounded-xl text-xs font-mono font-bold text-white shadow-sm flex items-center gap-1.5 animate-fade-in"
            >
              <span className="text-[9px] text-fuchsia-400">#{idx + 1}</span>
              <span>({combo.join(', ')})</span>
            </div>
          ))}
          {generatedCombinations.length === 0 && (
            <div className="text-xs text-slate-500 m-auto text-center">
              아직 완성된 조합이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
