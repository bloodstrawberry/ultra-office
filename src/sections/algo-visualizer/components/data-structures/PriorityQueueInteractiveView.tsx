'use client';

import React, { useState } from 'react';
import { playButtonClickSound, playFoundSound, playSwapSound } from '../../lib/sound';

interface PQElement {
  id: string;
  name: string;
  priority: number;
}

export const PriorityQueueInteractiveView: React.FC = () => {
  const [pq, setPq] = useState<PQElement[]>([
    { id: '1', name: '심장마비 응급환자', priority: 100 },
    { id: '2', name: '교통사고 골절환자', priority: 80 },
    { id: '3', name: '단순 열감기 환자', priority: 20 },
    { id: '4', name: '정기 건강검진', priority: 10 },
  ]);
  const [nameInput, setNameInput] = useState<string>('화상 긴급치료');
  const [priorityInput, setPriorityInput] = useState<number>(90);
  const [log, setLog] = useState<string>(
    'Priority Queue는 높은 우선순위를 가진 원소가 낮은 우선순위 원소보다 먼저 처리되는 자료구조입니다.'
  );

  const handleEnqueue = () => {
    if (!nameInput.trim()) return;
    const newItem: PQElement = {
      id: `item-${Date.now()}`,
      name: nameInput,
      priority: priorityInput,
    };
    // Keep sorted by priority descending
    const next = [...pq, newItem].sort((a, b) => b.priority - a.priority);
    setPq(next);
    setLog(
      `[Enqueue] '${newItem.name}' (우선순위: ${newItem.priority}) 삽입 완료 (Heapify O(log N))`
    );
    playButtonClickSound();
  };

  const handleDequeue = () => {
    if (pq.length === 0) {
      setLog('우선순위 큐가 비어있습니다.');
      return;
    }
    const highest = pq[0];
    setPq(pq.slice(1));
    setLog(
      `[Dequeue] 최고 우선순위 항목 '${highest.name}' (우선순위: ${highest.priority}) 추출 및 즉시 진료 처리 완료 (O(log N))`
    );
    playSwapSound();
  };

  const handlePeek = () => {
    if (pq.length === 0) {
      setLog('우선순위 큐가 비어있습니다.');
      return;
    }
    const highest = pq[0];
    setLog(
      `[Peek] 대기 중인 최우선 원소는 '${highest.name}' (우선순위: ${highest.priority}) 입니다. (O(1))`
    );
    playFoundSound();
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* 상단 컨트롤 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="작업/환자 이름"
            className="w-32 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <input
            type="number"
            value={priorityInput}
            onChange={(e) => setPriorityInput(parseInt(e.target.value) || 0)}
            placeholder="우선순위"
            className="w-20 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleEnqueue}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Enqueue (삽입)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePeek}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            Peek (최우선 확인)
          </button>
          <button
            onClick={handleDequeue}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            Dequeue (최우선 추출)
          </button>
        </div>
      </div>

      {/* 우선순위 큐 대기열 카드 목록 */}
      <div className="w-full min-h-[160px] bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-inner">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
          <span className="text-amber-300 font-mono">Priority Queue (Max-Heap 순환 대기열)</span>
          <span>우선순위가 높을수록 먼저 처리됨</span>
        </div>

        <div className="flex flex-col gap-2">
          {pq.map((item, idx) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between shadow-md ${
                idx === 0
                  ? 'bg-gradient-to-r from-amber-600/30 to-rose-600/30 border-amber-400 text-white scale-[1.01] shadow-amber-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                  {idx + 1}
                </span>
                <span className="text-xs font-extrabold text-white">{item.name}</span>
                {idx === 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full animate-pulse">
                    TOP PRIORITY
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold">우선순위 점수:</span>
                <span className="px-2.5 py-1 bg-slate-950 rounded-xl font-mono font-black text-amber-400 text-xs border border-amber-500/40">
                  {item.priority}
                </span>
              </div>
            </div>
          ))}

          {pq.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              우선순위 큐가 비어 있습니다. 항목을 추가해보세요.
            </div>
          )}
        </div>
      </div>

      {/* 상태 로그 */}
      <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono">
        {log}
      </div>
    </div>
  );
};
