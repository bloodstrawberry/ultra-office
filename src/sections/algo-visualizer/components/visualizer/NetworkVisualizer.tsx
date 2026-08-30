'use client';

import type { Step } from '../../lib/algorithms/types';

import React from 'react';

interface NetworkVisualizerProps {
  step: Step;
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ step }) => {
  const nodes = step.networkNodes || [];
  const edges = step.networkEdges || [];
  const topoOrder = step.topoOrder;
  const mstTotalWeight = step.mstTotalWeight;
  const maxFlowValue = step.maxFlowValue;
  const bipartiteMatches = step.bipartiteMatches;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-5 select-none relative overflow-hidden bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner gap-3">
      {/* 상단 통계 & 결과 배지 바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 z-10">
        {topoOrder && topoOrder.length > 0 && (
          <div className="px-3 py-1.5 bg-blue-950/90 border border-blue-600/60 rounded-2xl text-xs font-bold text-blue-300 flex items-center gap-2">
            <span>위상 정렬 순서:</span>
            <span className="font-mono font-black text-white">{topoOrder.join(' ➔ ')}</span>
          </div>
        )}

        {mstTotalWeight !== undefined && (
          <div className="px-3 py-1.5 bg-emerald-950/90 border border-emerald-600/60 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2">
            <span>MST 누적 가중치:</span>
            <span className="font-mono font-black text-white">{mstTotalWeight}</span>
          </div>
        )}

        {maxFlowValue !== undefined && (
          <div className="px-3 py-1.5 bg-sky-950/90 border border-sky-600/60 rounded-2xl text-xs font-bold text-sky-300 flex items-center gap-2">
            <span>현재 총 공급 유량:</span>
            <span className="font-mono font-black text-white">{maxFlowValue}</span>
          </div>
        )}

        {bipartiteMatches && bipartiteMatches.length > 0 && (
          <div className="px-3 py-1.5 bg-purple-950/90 border border-purple-600/60 rounded-2xl text-xs font-bold text-purple-300 flex items-center gap-2">
            <span>매칭된 1:1 쌍 ({bipartiteMatches.length}쌍):</span>
            <span className="font-mono font-black text-white">
              {bipartiteMatches.map(([a, b]) => `${a}-${b}`).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* SVG 네트워크 그래프 캔버스 */}
      <div className="w-full flex-1 flex items-center justify-center pt-2 overflow-hidden">
        <svg viewBox="0 0 420 280" className="w-full max-w-[580px] h-full max-h-[340px]">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
            <marker
              id="arrow-selected"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* 간선(Edges) 렌더링 */}
          {edges.map((edge) => {
            const u = nodeMap.get(edge.from);
            const v = nodeMap.get(edge.to);
            if (!u || !v) return null;

            let strokeColor = '#475569';
            let strokeWidth = '2';
            let marker = edge.isDirected ? 'url(#arrow)' : undefined;

            if (edge.status === 'selected' || edge.status === 'matched') {
              strokeColor = '#38bdf8'; // sky-400
              strokeWidth = '3.5';
              if (edge.isDirected) marker = 'url(#arrow-selected)';
            } else if (edge.status === 'augmented') {
              strokeColor = '#06b6d4'; // cyan-500
              strokeWidth = '3.5';
              if (edge.isDirected) marker = 'url(#arrow-selected)';
            } else if (edge.status === 'comparing') {
              strokeColor = '#fbbf24'; // amber-400
              strokeWidth = '3';
            } else if (edge.status === 'rejected') {
              strokeColor = '#e11d48'; // rose-600
              strokeWidth = '1.5';
            }

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            return (
              <g key={edge.id}>
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={marker}
                  className="transition-all duration-300"
                />

                {/* 가중치 또는 유량/용량 라벨 */}
                {(edge.weight !== undefined || edge.capacity !== undefined) && (
                  <g>
                    <rect
                      x={midX - 16}
                      y={midY - 9}
                      width="32"
                      height="18"
                      rx="6"
                      fill="#0f172a"
                      stroke={strokeColor}
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {edge.capacity !== undefined
                        ? `${edge.flow ?? 0}/${edge.capacity}`
                        : edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 정점(Nodes) 렌더링 */}
          {nodes.map((node) => {
            let fill = '#1e293b';
            let stroke = '#64748b';

            if (node.status === 'selected' || node.status === 'matched') {
              fill = '#0284c7'; // sky-600
              stroke = '#bae6fd';
            } else if (node.status === 'active') {
              fill = '#d97706'; // amber-600
              stroke = '#fef08a';
            }

            return (
              <g key={node.id} className="transition-all duration-300">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="18"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2.5"
                  className="shadow-lg"
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {node.label.length > 5 ? node.label.slice(0, 4) + '..' : node.label}
                </text>
                {node.inDegree !== undefined && (
                  <text
                    x={node.x}
                    y={node.y + 28}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    in:{node.inDegree}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
