'use client';

import React from 'react';
import { Step } from '../../lib/algorithms/types';

interface VariableWatcherProps {
  step: Step;
}

export const VariableWatcher: React.FC<VariableWatcherProps> = ({ step }) => {
  const variables = step.variables || {};
  const variableEntries = Object.entries(variables);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. 자연어 스텝 해설 카드 */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-3.5 sm:p-4 rounded-2xl shadow-lg flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-base flex-shrink-0 text-blue-400">
          💡
        </div>
        <div className="flex-1">
          <div className="text-[11px] font-bold text-slate-400">동작 해설 (Step Detail)</div>
          <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-0.5 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {/* 2. 실시간 변수 상태 (Variable Watcher) */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-3.5 sm:p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <span>🔬 실시간 변수 상태 (Variables)</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {variableEntries.length}개 변수
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {variableEntries.map(([key, val]) => (
            <div
              key={key}
              className="flex items-center bg-slate-950/80 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-mono shadow-sm"
            >
              <span className="text-slate-400 mr-1.5 font-bold">{key} =</span>
              <span
                className={`font-black ${
                  typeof val === 'boolean'
                    ? val
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                    : typeof val === 'number'
                      ? 'text-cyan-300'
                      : 'text-amber-300'
                }`}
              >
                {String(val)}
              </span>
            </div>
          ))}

          {variableEntries.length === 0 && (
            <div className="text-xs text-slate-500 py-1">관찰 중인 변수 없음</div>
          )}
        </div>
      </div>
    </div>
  );
};
