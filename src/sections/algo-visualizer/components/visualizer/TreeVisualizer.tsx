'use client';

import type { Step, TreeNodeData } from '../../lib/algorithms/types';

import React from 'react';

interface TreeVisualizerProps {
  step: Step;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ step }) => {
  const treeRoot = step.treeRoot;
  const activeNodeId = step.activeNodeId;
  const visitedNodeIds = new Set(step.visitedNodeIds || []);
  const traversalResult = step.traversalResult;
  const stackItems = step.stackItems;
  const queueItems = step.queueItems;

  // Stack & Queue mode render
  if (stackItems !== undefined || queueItems !== undefined) {
    return (
      <div className="w-full h-full flex flex-col md:flex-row items-center justify-around p-6 select-none bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner gap-6 overflow-y-auto">
        {/* 스택 (Stack - LIFO) 컨테이너 */}
        <div className="w-full max-w-[280px] flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🥞</span>
            <span className="font-extrabold text-sm text-amber-300">스택 (Stack)</span>
            <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40">
              LIFO (후입선출)
            </span>
          </div>

          <div className="w-full h-64 border-b-4 border-l-4 border-r-4 border-amber-500/60 rounded-b-2xl bg-slate-900/80 p-3 flex flex-col-reverse items-center gap-2 overflow-y-auto shadow-inner">
            {(stackItems || []).map((val, idx) => (
              <div
                key={idx}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 border border-amber-300 rounded-xl flex items-center justify-between px-4 font-mono font-extrabold text-white text-sm shadow-md animate-fade-in"
              >
                <span>#{idx}</span>
                <span className="text-base">{val}</span>
                {idx === (stackItems?.length || 0) - 1 && (
                  <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-amber-300">
                    Top
                  </span>
                )}
              </div>
            ))}
            {(stackItems?.length || 0) === 0 && (
              <div className="text-xs text-slate-500 my-auto">비어있음 (Empty)</div>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Size: {stackItems?.length || 0}
          </div>
        </div>

        {/* 큐 (Queue - FIFO) 컨테이너 */}
        <div className="w-full max-w-[280px] flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🚶‍♂️</span>
            <span className="font-extrabold text-sm text-cyan-300">큐 (Queue)</span>
            <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/40">
              FIFO (선입선출)
            </span>
          </div>

          <div className="w-full h-64 border-t-4 border-b-4 border-cyan-500/60 rounded-2xl bg-slate-900/80 p-3 flex flex-col items-center gap-2 overflow-y-auto shadow-inner">
            <div className="text-[10px] text-cyan-400 font-bold self-start">▲ Front (출구)</div>
            {(queueItems || []).map((val, idx) => (
              <div
                key={idx}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-300 rounded-xl flex items-center justify-between px-4 font-mono font-extrabold text-white text-sm shadow-md animate-fade-in"
              >
                <span>#{idx}</span>
                <span className="text-base">{val}</span>
                {idx === 0 && (
                  <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-cyan-300">
                    Front
                  </span>
                )}
              </div>
            ))}
            {(queueItems?.length || 0) === 0 && (
              <div className="text-xs text-slate-500 my-auto">비어있음 (Empty)</div>
            )}
            <div className="text-[10px] text-cyan-400 font-bold self-end mt-auto">
              ▼ Rear (입구)
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Size: {queueItems?.length || 0}
          </div>
        </div>
      </div>
    );
  }

  // Tree SVG recursive rendering
  const renderLines = (node: TreeNodeData | null): React.ReactNode => {
    if (!node) return null;
    const lines: React.ReactNode[] = [];

    if (
      node.left &&
      node.x !== undefined &&
      node.y !== undefined &&
      node.left.x !== undefined &&
      node.left.y !== undefined
    ) {
      lines.push(
        <line
          key={`line-${node.id}-L`}
          x1={node.x}
          y1={node.y}
          x2={node.left.x}
          y2={node.left.y}
          stroke="#475569"
          strokeWidth="3"
        />
      );
      lines.push(renderLines(node.left));
    }

    if (
      node.right &&
      node.x !== undefined &&
      node.y !== undefined &&
      node.right.x !== undefined &&
      node.right.y !== undefined
    ) {
      lines.push(
        <line
          key={`line-${node.id}-R`}
          x1={node.x}
          y1={node.y}
          x2={node.right.x}
          y2={node.right.y}
          stroke="#475569"
          strokeWidth="3"
        />
      );
      lines.push(renderLines(node.right));
    }

    return lines;
  };

  const renderNodes = (node: TreeNodeData | null): React.ReactNode => {
    if (!node || node.x === undefined || node.y === undefined) return null;

    const isActive = activeNodeId === node.id;
    const isVisited = visitedNodeIds.has(node.id);

    let fill = '#1e293b'; // slate-800
    let stroke = '#64748b'; // slate-500

    if (isActive) {
      fill = '#f59e0b'; // amber-500
      stroke = '#fef08a'; // yellow-200
    } else if (isVisited) {
      fill = '#059669'; // emerald-600
      stroke = '#a7f3d0'; // emerald-200
    }

    return (
      <g key={`node-g-${node.id}`}>
        {isActive && (
          <circle
            cx={node.x}
            cy={node.y}
            r="24"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3"
            className="animate-ping opacity-75"
          />
        )}
        <circle
          cx={node.x}
          cy={node.y}
          r="18"
          fill={fill}
          stroke={stroke}
          strokeWidth="2.5"
          className="transition-all duration-300"
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          fill="#ffffff"
          fontSize="12"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {node.value}
        </text>
        {renderNodes(node.left || null)}
        {renderNodes(node.right || null)}
      </g>
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-4 select-none relative overflow-hidden bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner">
      {/* 상단 순회 결과 바 */}
      {traversalResult && traversalResult.length > 0 && (
        <div className="absolute top-3 left-4 right-4 flex items-center gap-2 z-10">
          <div className="px-3 py-1.5 bg-emerald-950/90 border border-emerald-600/60 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2">
            <span>중위 순회 결과:</span>
            <div className="flex items-center gap-1 font-mono font-black text-white">
              {traversalResult.map((val, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-emerald-700/80 rounded-md border border-emerald-400/50"
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SVG 트리 캔버스 */}
      <div className="w-full flex-1 flex items-center justify-center pt-8 overflow-auto">
        <svg viewBox="0 0 400 300" className="w-full max-w-[540px] h-full max-h-[360px]">
          {renderLines(treeRoot || null)}
          {renderNodes(treeRoot || null)}
        </svg>
      </div>
    </div>
  );
};
