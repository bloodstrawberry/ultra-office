'use client';

import React, { useState } from 'react';
import { LinkedListNode } from '../../lib/data-structures/types';
import {
  playSwapSound,
  playFoundSound,
  playButtonClickSound,
  playCompareSound,
} from '../../lib/sound';

export const LinkedListInteractiveView: React.FC = () => {
  const [nodes, setNodes] = useState<LinkedListNode[]>([
    { id: 'node-1', value: 12, nextId: 'node-2' },
    { id: 'node-2', value: 34, nextId: 'node-3' },
    { id: 'node-3', value: 58, nextId: 'node-4' },
    { id: 'node-4', value: 91, nextId: null },
  ]);

  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string>(
    '단일 연결 리스트가 준비되었습니다. Head에서 Tail까지 포인터로 연결되어 있습니다.'
  );
  const [inputVal, setInputVal] = useState<number>(45);
  const [inputIdx, setInputIdx] = useState<number>(2);

  // Push Front
  const handlePushFront = () => {
    playSwapSound();
    const newId = `node-${Date.now()}`;
    const newNode: LinkedListNode = {
      id: newId,
      value: inputVal,
      nextId: nodes.length > 0 ? nodes[0].id : null,
    };
    setNodes([newNode, ...nodes]);
    setHighlightId(newId);
    setActionLog(
      `[Push Front] 새 노드 [${inputVal}]의 next를 기존 Head로 지정하고 Head 포인터를 갱신했습니다. (O(1) 소요)`
    );
  };

  // Push Back
  const handlePushBack = () => {
    playSwapSound();
    const newId = `node-${Date.now()}`;
    const newNode: LinkedListNode = {
      id: newId,
      value: inputVal,
      nextId: null,
    };

    if (nodes.length === 0) {
      setNodes([newNode]);
    } else {
      const nextNodes = nodes.map((n, i) => (i === nodes.length - 1 ? { ...n, nextId: newId } : n));
      setNodes([...nextNodes, newNode]);
    }
    setHighlightId(newId);
    setActionLog(
      `[Push Back] 기존 Tail 노드의 next를 새 노드 [${inputVal}]로 연결하고 Tail을 갱신했습니다. (O(1) 소요)`
    );
  };

  // Insert At Index
  const handleInsertAt = () => {
    playSwapSound();
    const idx = Math.max(0, Math.min(nodes.length, inputIdx));
    if (idx === 0) {
      handlePushFront();
      return;
    }
    if (idx === nodes.length) {
      handlePushBack();
      return;
    }

    const newId = `node-${Date.now()}`;
    const targetNextId = nodes[idx].id;
    const newNode: LinkedListNode = {
      id: newId,
      value: inputVal,
      nextId: targetNextId,
    };

    const nextNodes: LinkedListNode[] = [];
    nodes.forEach((n, i) => {
      if (i === idx - 1) {
        nextNodes.push({ ...n, nextId: newId });
        nextNodes.push(newNode);
      } else {
        nextNodes.push(n);
      }
    });

    setNodes(nextNodes);
    setHighlightId(newId);
    setActionLog(
      `[중간 삽입] 인덱스 [${idx}] 위치까지 순회한 뒤, [인덱스 ${idx - 1}]의 next를 새 노드에, 새 노드의 next를 [인덱스 ${idx}]에 연결했습니다. (O(N) 순회 + O(1) 삽입)`
    );
  };

  // Delete At Index
  const handleDeleteAt = () => {
    if (nodes.length === 0) return;
    playButtonClickSound();
    const idx = Math.max(0, Math.min(nodes.length - 1, inputIdx));
    const targetNode = nodes[idx];

    if (idx === 0) {
      setNodes(nodes.slice(1));
      setActionLog(
        `[Head 삭제] Head 포인터를 다음 노드로 이동하여 첫 번째 노드(${targetNode.value})를 O(1)에 제거했습니다.`
      );
    } else {
      const nextNodes: LinkedListNode[] = [];
      nodes.forEach((n, i) => {
        if (i === idx - 1) {
          nextNodes.push({ ...n, nextId: targetNode.nextId });
        } else if (i !== idx) {
          nextNodes.push(n);
        }
      });
      setNodes(nextNodes);
      setActionLog(
        `[노드 삭제] 인덱스 [${idx - 1}] 노드의 next 포인터가 삭제 대상(${targetNode.value})을 건너뛰고 다음 노드를 가리키도록 재연결했습니다.`
      );
    }
    setHighlightId(null);
  };

  // Search
  const handleSearch = () => {
    const foundIdx = nodes.findIndex((n) => n.value === inputVal);
    if (foundIdx !== -1) {
      playFoundSound();
      setHighlightId(nodes[foundIdx].id);
      setActionLog(
        `✨ 노드 탐색 성공: 값 ${inputVal}이(가) 인덱스 [${foundIdx}] 노드에 존재합니다. (Head부터 ${foundIdx + 1}번 포인터 추적)`
      );
    } else {
      playButtonClickSound();
      setHighlightId(null);
      setActionLog(
        `노드 탐색 실패: 값 ${inputVal}을(를) 찾지 못했습니다. (전체 ${nodes.length}개 노드 순회 완료, O(N))`
      );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* 1. 상단 상태 요약 바 */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">총 노드 수:</span>
            <span className="px-2.5 py-0.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-mono font-extrabold text-xs">
              {nodes.length}개
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Head:</span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              {nodes[0] ? `[${nodes[0].value}]` : 'null'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Tail:</span>
            <span className="font-mono text-xs font-bold text-cyan-400">
              {nodes[nodes.length - 1] ? `[${nodes[nodes.length - 1].value}]` : 'null'}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setNodes([
              { id: 'node-1', value: 12, nextId: 'node-2' },
              { id: 'node-2', value: 34, nextId: 'node-3' },
              { id: 'node-3', value: 58, nextId: 'node-4' },
              { id: 'node-4', value: 91, nextId: null },
            ]);
            setHighlightId(null);
            setActionLog('기본 연결 리스트로 리셋되었습니다.');
          }}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all active:scale-95"
        >
          🔄 리셋
        </button>
      </div>

      {/* 2. 연결 리스트 노드 & 포인터 캔버스 */}
      <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-3xl shadow-inner flex items-center justify-start min-h-[200px] overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max p-2">
          {nodes.map((node, idx) => {
            const isHead = idx === 0;
            const isTail = idx === nodes.length - 1;
            const isHighlight = highlightId === node.id;

            return (
              <React.Fragment key={node.id}>
                {/* 노드 카드 */}
                <div
                  onClick={() => {
                    playCompareSound(node.value, 100);
                    setHighlightId(node.id);
                  }}
                  className={`flex flex-col items-center cursor-pointer group transition-all duration-200 ${
                    isHighlight ? 'scale-105' : 'hover:-translate-y-1'
                  }`}
                >
                  {/* 상단 Head / Tail 뱃지 */}
                  <div className="flex items-center gap-1 mb-1.5 h-5">
                    {isHead && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-extrabold shadow-sm">
                        Head
                      </span>
                    )}
                    {isTail && (
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-[10px] font-extrabold shadow-sm">
                        Tail
                      </span>
                    )}
                  </div>

                  {/* 노드 Box: Data | Next */}
                  <div
                    className={`flex rounded-2xl border-2 overflow-hidden shadow-xl font-mono transition-all ${
                      isHighlight
                        ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.8)]'
                        : 'bg-slate-900/90 border-slate-700 text-white hover:border-slate-500'
                    }`}
                  >
                    {/* Data 섹션 */}
                    <div className="px-4 py-3 font-black text-lg border-r border-slate-700 flex items-center justify-center min-w-[50px]">
                      {node.value}
                    </div>

                    {/* Next Pointer 섹션 */}
                    <div className="px-3 py-3 text-xs flex items-center justify-center bg-slate-950/60 text-slate-400 font-bold">
                      {node.nextId ? '● next' : 'null'}
                    </div>
                  </div>

                  {/* 하단 인덱스 */}
                  <div className="text-[10px] font-mono text-slate-500 mt-1.5">Node [{idx}]</div>
                </div>

                {/* 포인터 연결 화살표 */}
                {node.nextId && (
                  <div className="flex items-center text-slate-500 font-bold text-lg px-1 animate-pulse">
                    <span className="text-emerald-400 font-mono">──▶</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {nodes.length === 0 && (
            <div className="text-xs text-slate-500 mx-auto py-8">
              연결 리스트가 비어있습니다. 아래 버튼을 눌러 노드를 추가하세요.
            </div>
          )}
        </div>
      </div>

      {/* 3. 동작 해설 피드백 로그 */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed flex items-start gap-2.5 shadow-md">
        <span className="text-base text-emerald-400 flex-shrink-0">💡</span>
        <div className="flex-1 font-medium">{actionLog}</div>
      </div>

      {/* 4. 대화형 인터랙티브 조작 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl">
        {/* 노드 삽입 조작 */}
        <div className="flex flex-col gap-2.5 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <div className="text-xs font-extrabold text-emerald-300">노드 삽입 조작</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={inputVal}
              onChange={(e) => setInputVal(Number(e.target.value))}
              placeholder="값"
              className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
            />
            <input
              type="number"
              value={inputIdx}
              onChange={(e) => setInputIdx(Number(e.target.value))}
              placeholder="인덱스"
              className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
            />
            <button
              onClick={handlePushFront}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex-1"
            >
              맨 앞 추가 (O(1))
            </button>
            <button
              onClick={handlePushBack}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex-1"
            >
              맨 뒤 추가 (O(1))
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInsertAt}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex-1"
            >
              [인덱스 {inputIdx}] 중간 삽입
            </button>
            <button
              onClick={handleDeleteAt}
              className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex-1"
            >
              [인덱스 {inputIdx}] 노드 삭제
            </button>
          </div>
        </div>

        {/* 탐색 & 조회 */}
        <div className="flex flex-col gap-2.5 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <div className="text-xs font-extrabold text-cyan-300">노드 값 탐색</div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex-1"
            >
              🔍 값 [{inputVal}] 노드 탐색 (Head부터 순회 O(N))
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            연결 리스트는 인덱스로 즉시 점프할 수 없으며, Head 포인터부터 차례대로 다음 노드로
            이동(Traversal)해야 합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
