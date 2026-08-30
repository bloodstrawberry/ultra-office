'use client';

import React, { useState } from 'react';

import { playSwapSound, playPivotSound, playCompareSound } from '../../lib/sound';

export const HeapInteractiveView: React.FC = () => {
  const [heapType, setHeapType] = useState<'max' | 'min'>('max');
  const [heapArray, setHeapArray] = useState<number[]>([90, 75, 80, 45, 60, 70, 65, 30, 20]);
  const [inputValue, setInputValue] = useState<number>(85);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [actionLog, setActionLog] = useState<string>(
    '힙(Heap)은 완전 이진 트리를 1차원 배열로 완벽히 매핑하여 포인터 없이 부모/자식을 O(1)에 찾습니다.'
  );

  // Parent & Child helpers
  const parent = (i: number) => Math.floor((i - 1) / 2);
  const leftChild = (i: number) => 2 * i + 1;
  const rightChild = (i: number) => 2 * i + 2;

  // Insert (Heapify-Up)
  const handleInsert = () => {
    playSwapSound();
    const arr = [...heapArray, inputValue];
    let i = arr.length - 1;

    if (heapType === 'max') {
      while (i > 0 && arr[i] > arr[parent(i)]) {
        const p = parent(i);
        const temp = arr[i];
        arr[i] = arr[p];
        arr[p] = temp;
        i = p;
      }
    } else {
      while (i > 0 && arr[i] < arr[parent(i)]) {
        const p = parent(i);
        const temp = arr[i];
        arr[i] = arr[p];
        arr[p] = temp;
        i = p;
      }
    }

    setHeapArray(arr);
    setHighlightIdx(i);
    setActionLog(
      `[힙 삽입] 배열 끝에 ${inputValue}을(를) 추가한 뒤, 부모와 비교하며 올바른 위치까지 상승(Heapify-Up)했습니다. (O(log N))`
    );
  };

  // Extract Root (Heapify-Down)
  const handleExtractRoot = () => {
    if (heapArray.length === 0) return;
    playPivotSound();

    const rootVal = heapArray[0];
    if (heapArray.length === 1) {
      setHeapArray([]);
      setActionLog(`[루트 추출] 마지막 남은 루트 원소 ${rootVal}을(를) 꺼냈습니다.`);
      return;
    }

    const arr = [...heapArray];
    arr[0] = arr.pop()!; // Move last to root

    let i = 0;
    const n = arr.length;

    while (leftChild(i) < n) {
      let target = i;
      const l = leftChild(i);
      const r = rightChild(i);

      if (heapType === 'max') {
        if (arr[l] > arr[target]) target = l;
        if (r < n && arr[r] > arr[target]) target = r;
      } else {
        if (arr[l] < arr[target]) target = l;
        if (r < n && arr[r] < arr[target]) target = r;
      }

      if (target !== i) {
        const temp = arr[i];
        arr[i] = arr[target];
        arr[target] = temp;
        i = target;
      } else {
        break;
      }
    }

    setHeapArray(arr);
    setHighlightIdx(0);
    setActionLog(
      `[루트 추출] 루트 최${heapType === 'max' ? '대' : '소'}값 ${rootVal}을(를) 추출하고, 마지막 원소를 루트로 올린 뒤 아래로 하강(Heapify-Down) 정렬했습니다. (O(log N))`
    );
  };

  // Node position calculation for SVG rendering (depth 0 to 3)
  const getNodePos = (idx: number): { x: number; y: number } => {
    const level = Math.floor(Math.log2(idx + 1));
    const indexInLevel = idx - (Math.pow(2, level) - 1);
    const totalInLevel = Math.pow(2, level);
    const x = ((indexInLevel + 0.5) / totalInLevel) * 440 + 20;
    const y = 35 + level * 55;
    return { x, y };
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* 1. 상단 타입 토글 & 리셋 바 */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setHeapType('max');
              setHeapArray([90, 75, 80, 45, 60, 70, 65, 30, 20]);
              setActionLog('최대 힙(Max Heap: 부모 ≥ 자식)으로 전환되었습니다.');
            }}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
              heapType === 'max'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            최대 힙 (Max Heap)
          </button>
          <button
            onClick={() => {
              setHeapType('min');
              setHeapArray([10, 25, 15, 45, 30, 50, 20, 80, 90]);
              setActionLog('최소 힙(Min Heap: 부모 ≤ 자식)으로 전환되었습니다.');
            }}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
              heapType === 'min'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            최소 힙 (Min Heap)
          </button>
        </div>

        <button
          onClick={() => {
            if (heapType === 'max') {
              setHeapArray([90, 75, 80, 45, 60, 70, 65, 30, 20]);
            } else {
              setHeapArray([10, 25, 15, 45, 30, 50, 20, 80, 90]);
            }
            setHighlightIdx(null);
            setActionLog('기본 힙 데이터로 리셋되었습니다.');
          }}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all active:scale-95"
        >
          🔄 리셋
        </button>
      </div>

      {/* 2. 힙 이중 뷰어: 트리 SVG + 1차원 배열 매핑 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 트리 뷰 */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl shadow-inner flex flex-col items-center justify-center min-h-[240px]">
          <div className="text-[11px] font-bold text-slate-400 self-start mb-1">
            🌲 완전 이진 트리 (Logical Structure)
          </div>
          <svg viewBox="0 0 480 230" className="w-full h-full max-h-[220px]">
            {/* 연결선 */}
            {heapArray.map((_, idx) => {
              const l = leftChild(idx);
              const r = rightChild(idx);
              const pos = getNodePos(idx);

              return (
                <React.Fragment key={`lines-${idx}`}>
                  {l < heapArray.length && (
                    <line
                      x1={pos.x}
                      y1={pos.y}
                      x2={getNodePos(l).x}
                      y2={getNodePos(l).y}
                      stroke="#475569"
                      strokeWidth="2.5"
                    />
                  )}
                  {r < heapArray.length && (
                    <line
                      x1={pos.x}
                      y1={pos.y}
                      x2={getNodePos(r).x}
                      y2={getNodePos(r).y}
                      stroke="#475569"
                      strokeWidth="2.5"
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* 노드 원들 */}
            {heapArray.map((val, idx) => {
              const pos = getNodePos(idx);
              const isHighlight = highlightIdx === idx;
              const isRoot = idx === 0;

              return (
                <g
                  key={`node-${idx}`}
                  onClick={() => {
                    playCompareSound(val, 100);
                    setHighlightIdx(idx);
                  }}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="16"
                    fill={isHighlight ? '#f59e0b' : isRoot ? '#e11d48' : '#1e293b'}
                    stroke={isHighlight ? '#fef08a' : isRoot ? '#fda4af' : '#64748b'}
                    strokeWidth="2"
                    className="transition-all duration-200 group-hover:scale-110"
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 4.5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y - 20}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    [{idx}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 1차원 배열 물리적 메모리 뷰 */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl shadow-inner flex flex-col justify-between min-h-[240px]">
          <div>
            <div className="text-[11px] font-bold text-slate-400 mb-2">
              📦 1차원 배열 메모리 배치 (Physical Storage)
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {heapArray.map((val, idx) => {
                const isHighlight = highlightIdx === idx;
                const isRoot = idx === 0;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      playCompareSound(val, 100);
                      setHighlightIdx(idx);
                    }}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <span className="text-[10px] font-mono text-slate-500 mb-1">[{idx}]</span>
                    <div
                      className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center font-mono font-black text-sm shadow-md transition-all ${
                        isHighlight
                          ? 'bg-amber-500 border-amber-300 text-slate-950 scale-105'
                          : isRoot
                            ? 'bg-rose-600/80 border-rose-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-200 group-hover:border-slate-500'
                      }`}
                    >
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 수학적 인덱스 공식 안내 */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-300 mt-3 flex flex-col gap-1">
            <span className="text-rose-400 font-bold">인덱스 i 계산 공식:</span>
            <span>• 부모 노드: Math.floor((i - 1) / 2)</span>
            <span>• 왼쪽 자식: 2 * i + 1</span>
            <span>• 오른쪽 자식: 2 * i + 2</span>
          </div>
        </div>
      </div>

      {/* 3. 동작 해설 피드백 로그 */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed flex items-start gap-2.5 shadow-md">
        <span className="text-base text-rose-400 flex-shrink-0">💡</span>
        <div className="flex-1 font-medium">{actionLog}</div>
      </div>

      {/* 4. 조작 패널 */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(Number(e.target.value))}
          placeholder="값"
          className="w-24 bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
        />
        <button
          onClick={handleInsert}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          ➕ 원소 삽입 (Heapify-Up O(log N))
        </button>
        <button
          onClick={handleExtractRoot}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          👑 루트 최{heapType === 'max' ? '대' : '소'}값 추출 (Heapify-Down O(log N))
        </button>
      </div>
    </div>
  );
};
