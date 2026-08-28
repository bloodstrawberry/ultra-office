'use client';

import React from 'react';
import { Step } from '../../lib/algorithms/types';

interface DPVisualizerProps {
  step: Step;
}

export const DPVisualizer: React.FC<DPVisualizerProps> = ({ step }) => {
  const dp2D = step.dp2D;
  const rowLabels = step.dpRowLabels || [];
  const colLabels = step.dpColLabels || [];
  const activeCell = Array.isArray(step.dpActiveCell) ? step.dpActiveCell : null;
  const sourceCells = new Set((step.dpSourceCells || []).map(([r, c]) => `${r},${c}`));

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-5 select-none relative overflow-y-auto bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <span className="text-sm font-extrabold text-violet-300">
            동적 계획법 (DP) 2D 메모이제이션 테이블
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-violet-300">현재 계산 셀 (Active)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-300">참조 셀 (Source)</span>
          </div>
        </div>
      </div>

      {dp2D && (
        <div className="w-full flex-1 overflow-x-auto overflow-y-auto p-2 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[220px]">
          <table className="border-collapse text-xs font-mono text-center">
            <thead>
              <tr>
                <th className="p-2 border border-slate-800 bg-slate-950 text-slate-500 font-bold rounded-tl-xl">
                  아이템 \ 용량
                </th>
                {colLabels.map((col, cIdx) => (
                  <th
                    key={cIdx}
                    className={`p-2 border border-slate-800 text-slate-300 font-bold ${
                      activeCell && activeCell[1] === cIdx
                        ? 'bg-violet-900/60 text-violet-300'
                        : 'bg-slate-950/80'
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dp2D.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td
                    className={`p-2 border border-slate-800 font-bold whitespace-nowrap text-left px-3 ${
                      activeCell && activeCell[0] === rIdx
                        ? 'bg-violet-900/60 text-violet-300'
                        : 'bg-slate-950/80 text-slate-400'
                    }`}
                  >
                    {rowLabels[rIdx] || `i=${rIdx}`}
                  </td>
                  {row.map((cellVal, cIdx) => {
                    const isActive = activeCell && activeCell[0] === rIdx && activeCell[1] === cIdx;
                    const isSource = sourceCells.has(`${rIdx},${cIdx}`);

                    let cellBg = 'bg-slate-900 text-slate-300';
                    if (isActive) {
                      cellBg =
                        'bg-violet-600 text-white font-black scale-110 shadow-lg shadow-violet-500/50 z-10 border-violet-300';
                    } else if (isSource) {
                      cellBg =
                        'bg-cyan-950 border-cyan-500/60 text-cyan-300 font-bold animate-pulse';
                    }

                    return (
                      <td
                        key={cIdx}
                        className={`p-2.5 border border-slate-800 transition-all duration-200 min-w-[48px] ${cellBg}`}
                      >
                        {cellVal !== null ? cellVal : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
