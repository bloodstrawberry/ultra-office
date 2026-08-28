'use client';

import React from 'react';
import { Step } from '../../lib/algorithms/types';

interface MatrixVisualizerProps {
  step: Step;
}

export const MatrixVisualizer: React.FC<MatrixVisualizerProps> = ({ step }) => {
  const matrix = step.matrix || [];
  const labels = step.matrixLabels || [];
  const k = step.matrixK;
  const i = step.matrixI;
  const j = step.matrixJ;

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-5 select-none relative overflow-y-auto bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <span className="text-sm font-extrabold text-cyan-300">
            플로이드-워셜 $V \times V$ 모든 쌍 최단 거리 행렬
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          {k !== null && k !== undefined && (
            <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-xl font-bold">
              경유 노드 (k): {labels[k]}
            </span>
          )}
          {i !== null && i !== undefined && (
            <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-xl font-bold">
              출발 (i): {labels[i]}
            </span>
          )}
          {j !== null && j !== undefined && (
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold">
              도착 (j): {labels[j]}
            </span>
          )}
        </div>
      </div>

      <div className="w-full flex-1 overflow-x-auto overflow-y-auto p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[220px]">
        <table className="border-collapse text-xs font-mono text-center">
          <thead>
            <tr>
              <th className="p-3 border border-slate-800 bg-slate-950 text-slate-500 font-bold rounded-tl-xl">
                출발 \ 도착
              </th>
              {labels.map((lbl, cIdx) => (
                <th
                  key={cIdx}
                  className={`p-3 border border-slate-800 font-black ${
                    j === cIdx
                      ? 'bg-emerald-900/60 text-emerald-300'
                      : 'bg-slate-950/80 text-slate-300'
                  }`}
                >
                  {lbl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rIdx) => (
              <tr key={rIdx}>
                <td
                  className={`p-3 border border-slate-800 font-black ${
                    i === rIdx ? 'bg-blue-900/60 text-blue-300' : 'bg-slate-950/80 text-slate-300'
                  }`}
                >
                  {labels[rIdx]}
                </td>
                {row.map((cellVal, cIdx) => {
                  const isCurrentTarget = i === rIdx && j === cIdx;
                  const isViaIK = i === rIdx && k === cIdx;
                  const isViaKJ = k === rIdx && j === cIdx;

                  let bgStyle = 'bg-slate-900 text-slate-300';
                  if (isCurrentTarget) {
                    bgStyle =
                      'bg-cyan-600 text-white font-black scale-110 shadow-lg shadow-cyan-500/50 z-10 border-cyan-300';
                  } else if (isViaIK || isViaKJ) {
                    bgStyle =
                      'bg-purple-950 border-purple-500/60 text-purple-300 font-bold animate-pulse';
                  } else if (rIdx === cIdx) {
                    bgStyle = 'bg-slate-950 text-slate-500 font-bold';
                  }

                  return (
                    <td
                      key={cIdx}
                      className={`p-3.5 border border-slate-800 transition-all duration-200 min-w-[54px] ${bgStyle}`}
                    >
                      {cellVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
