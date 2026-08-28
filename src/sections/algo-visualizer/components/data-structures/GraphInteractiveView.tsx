'use client';

import React, { useState } from 'react';
import { playCompareSound, playSwapSound } from '../../lib/sound';

const NODE_LABELS = ['A', 'B', 'C', 'D', 'E'];
const NODE_POSITIONS = [
  { x: 140, y: 40 }, // A
  { x: 60, y: 110 }, // B
  { x: 220, y: 110 }, // C
  { x: 90, y: 190 }, // D
  { x: 190, y: 190 }, // E
];

export const GraphInteractiveView: React.FC = () => {
  // 5x5 adjacency matrix (0: no edge, 1: edge)
  const [matrix, setMatrix] = useState<number[][]>([
    [0, 1, 1, 0, 0], // A connects to B, C
    [1, 0, 0, 1, 1], // B connects to A, D, E
    [1, 0, 0, 0, 1], // C connects to A, E
    [0, 1, 0, 0, 1], // D connects to B, E
    [0, 1, 1, 1, 0], // E connects to B, C, D
  ]);

  const [selectedNode, setSelectedNode] = useState<number | null>(0);
  const [actionLog, setActionLog] = useState<string>(
    '정점을 클릭하여 연결된 이웃과 인접 행렬/리스트의 대응 관계를 확인하세요.'
  );

  // Toggle edge
  const toggleEdge = (u: number, v: number) => {
    if (u === v) return;
    playSwapSound();

    const next = matrix.map((row) => [...row]);
    const currentVal = next[u][v];
    const newVal = currentVal === 1 ? 0 : 1;
    next[u][v] = newVal;
    next[v][u] = newVal; // Undirected

    setMatrix(next);
    setActionLog(
      `간선 (${NODE_LABELS[u]} ─ ${NODE_LABELS[v]}) ${newVal === 1 ? '추가' : '제거'} 완료! 인접 행렬과 인접 리스트가 동기화되었습니다.`
    );
  };

  // Node click
  const handleNodeClick = (nodeIdx: number) => {
    playCompareSound(nodeIdx * 20 + 20, 100);
    setSelectedNode(nodeIdx);
    const neighbors = matrix[nodeIdx]
      .map((val, idx) => (val === 1 ? NODE_LABELS[idx] : null))
      .filter(Boolean);
    setActionLog(
      `정점 [${NODE_LABELS[nodeIdx]}] 선택: 인접 이웃 정점 [${neighbors.join(', ')}] (차수: ${neighbors.length})`
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* 1. 상단 안내 바 */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <span>🕸️ 5개 정점(A, B, C, D, E) 무방향 그래프</span>
        </div>

        <button
          onClick={() => {
            setMatrix([
              [0, 1, 1, 0, 0],
              [1, 0, 0, 1, 1],
              [1, 0, 0, 0, 1],
              [0, 1, 0, 0, 1],
              [0, 1, 1, 1, 0],
            ]);
            setSelectedNode(0);
            setActionLog('기본 그래프 구조로 리셋되었습니다.');
          }}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all active:scale-95"
        >
          🔄 리셋
        </button>
      </div>

      {/* 2. 메인 3단 뷰어: SVG 그래프 + 인접 행렬 + 인접 리스트 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. SVG 그래프 캔버스 */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl shadow-inner flex flex-col items-center justify-center min-h-[260px]">
          <div className="text-[11px] font-bold text-slate-400 self-start mb-1">
            📍 네트워크 그래프 (Graph Topology)
          </div>
          <svg viewBox="0 0 280 230" className="w-full h-full max-h-[220px]">
            {/* 간선(Edges) 렌더링 */}
            {matrix.map((row, u) =>
              row.map((val, v) => {
                if (val === 1 && u < v) {
                  const p1 = NODE_POSITIONS[u];
                  const p2 = NODE_POSITIONS[v];
                  const isConnectedToSelected =
                    selectedNode !== null && (selectedNode === u || selectedNode === v);

                  return (
                    <line
                      key={`edge-${u}-${v}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={isConnectedToSelected ? '#60a5fa' : '#475569'}
                      strokeWidth={isConnectedToSelected ? '3.5' : '2'}
                      className="transition-all duration-200"
                    />
                  );
                }
                return null;
              })
            )}

            {/* 정점(Vertices) 렌더링 */}
            {NODE_POSITIONS.map((pos, idx) => {
              const isSelected = selectedNode === idx;
              const isNeighbor = selectedNode !== null && matrix[selectedNode][idx] === 1;

              let fill = '#1e293b';
              let stroke = '#64748b';

              if (isSelected) {
                fill = '#3b82f6';
                stroke = '#93c5fd';
              } else if (isNeighbor) {
                fill = '#059669';
                stroke = '#a7f3d0';
              }

              return (
                <g
                  key={`node-${idx}`}
                  onClick={() => handleNodeClick(idx)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="18"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="2.5"
                    className="transition-all duration-200 group-hover:scale-110 shadow-lg"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="black"
                    fontFamily="monospace"
                  >
                    {NODE_LABELS[idx]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 2. 인접 행렬 (Adjacency Matrix) */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl shadow-inner flex flex-col justify-between min-h-[260px]">
          <div>
            <div className="text-[11px] font-bold text-slate-400 mb-2">
              🧮 인접 행렬 (Adjacency Matrix) - O(V²)
            </div>
            <p className="text-[10px] text-slate-500 mb-2">
              셀을 클릭하면 해당 두 정점 사이의 간선을 즉시 토글합니다.
            </p>

            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr className="text-slate-500">
                  <th className="p-1"></th>
                  {NODE_LABELS.map((lbl) => (
                    <th key={lbl} className="p-1 font-bold text-slate-400">
                      {lbl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, u) => (
                  <tr key={`row-${u}`}>
                    <td className="p-1 font-bold text-slate-400">{NODE_LABELS[u]}</td>
                    {row.map((val, v) => {
                      const isSelf = u === v;
                      const isConnected = val === 1;

                      return (
                        <td key={`cell-${u}-${v}`} className="p-0.5">
                          <button
                            disabled={isSelf}
                            onClick={() => toggleEdge(u, v)}
                            className={`w-7 h-7 rounded-lg font-black text-xs transition-all flex items-center justify-center mx-auto ${
                              isSelf
                                ? 'bg-slate-900/40 text-slate-700 cursor-not-allowed'
                                : isConnected
                                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-500'
                                  : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
                            }`}
                          >
                            {val}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[10px] text-slate-500 font-mono mt-2">
            간선 검사: matrix[u][v] == 1 ➔ O(1)
          </div>
        </div>

        {/* 3. 인접 리스트 (Adjacency List) */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl shadow-inner flex flex-col justify-between min-h-[260px]">
          <div>
            <div className="text-[11px] font-bold text-slate-400 mb-2">
              📑 인접 리스트 (Adjacency List) - O(V+E)
            </div>
            <p className="text-[10px] text-slate-500 mb-2">
              각 정점에 실제로 연결된 이웃 노드들만 포인터 체인으로 보관합니다.
            </p>

            <div className="flex flex-col gap-1.5 pt-1">
              {NODE_LABELS.map((lbl, idx) => {
                const neighbors = matrix[idx]
                  .map((val, vIdx) => (val === 1 ? NODE_LABELS[vIdx] : null))
                  .filter(Boolean);
                const isSelected = selectedNode === idx;

                return (
                  <div
                    key={lbl}
                    onClick={() => handleNodeClick(idx)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-400 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-mono font-extrabold w-4 text-blue-400">[{lbl}]</span>
                    <span className="text-slate-600 font-bold">➔</span>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {neighbors.map((n) => (
                        <span
                          key={n}
                          className="px-2 py-0.5 bg-slate-800 text-emerald-300 font-mono font-bold text-[11px] rounded-lg border border-slate-700"
                        >
                          {n}
                        </span>
                      ))}
                      {neighbors.length === 0 && (
                        <span className="text-[10px] text-slate-600 italic">null</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono mt-2">
            메모리 공간: O(V + E) (희소 그래프 최적)
          </div>
        </div>
      </div>

      {/* 3. 동작 해설 피드백 로그 */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed flex items-start gap-2.5 shadow-md">
        <span className="text-base text-indigo-400 flex-shrink-0">💡</span>
        <div className="flex-1 font-medium">{actionLog}</div>
      </div>
    </div>
  );
};
