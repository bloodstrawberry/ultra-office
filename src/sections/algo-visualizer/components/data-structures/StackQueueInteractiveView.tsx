'use client';

import React, { useState } from 'react';
import { playSwapSound, playCompareSound, playPivotSound } from '../../lib/sound';

export const StackQueueInteractiveView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stack' | 'queue' | 'deque'>('stack');

  // Stack State
  const [stack, setStack] = useState<number[]>([10, 25, 40, 65]);
  const [stackInput, setStackInput] = useState<number>(80);

  // Queue / Deque State
  const [queue, setQueue] = useState<number[]>([100, 200, 300]);
  const [queueInput, setQueueInput] = useState<number>(400);

  const [actionLog, setActionLog] = useState<string>(
    '자료구조를 조작하여 LIFO / FIFO 원리를 직접 확인해보세요.'
  );

  // Stack Operations
  const handleStackPush = () => {
    playSwapSound();
    const next = [...stack, stackInput];
    setStack(next);
    setActionLog(`[Stack Push] 최상단(Top)에 값 ${stackInput}을(를) 삽입했습니다. (LIFO, O(1))`);
  };

  const handleStackPop = () => {
    if (stack.length === 0) return;
    playPivotSound();
    const popped = stack[stack.length - 1];
    setStack(stack.slice(0, -1));
    setActionLog(
      `[Stack Pop] 가장 마지막에 들어왔던 최상단 원소 ${popped}을(를) 꺼냈습니다. (LIFO, O(1))`
    );
  };

  const handleStackPeek = () => {
    if (stack.length === 0) return;
    const topVal = stack[stack.length - 1];
    playCompareSound(topVal, 100);
    setActionLog(`[Stack Peek] 최상단(Top) 원소는 ${topVal}입니다. (원소 제거 없음, O(1))`);
  };

  // Queue Operations
  const handleQueueEnqueue = () => {
    playSwapSound();
    const next = [...queue, queueInput];
    setQueue(next);
    setActionLog(`[Queue Enqueue] 큐 맨 뒤(Rear)에 ${queueInput}을(를) 줄세웠습니다. (FIFO, O(1))`);
  };

  const handleQueueDequeue = () => {
    if (queue.length === 0) return;
    playPivotSound();
    const dequeued = queue[0];
    setQueue(queue.slice(1));
    setActionLog(
      `[Queue Dequeue] 가장 먼저 대기하고 있던 맨 앞(Front) 원소 ${dequeued}을(를) 내보냈습니다. (FIFO, O(1))`
    );
  };

  // Deque Operations
  const handleDequePushFront = () => {
    playSwapSound();
    setQueue([queueInput, ...queue]);
    setActionLog(`[Deque PushFront] 맨 앞(Front)에 ${queueInput}을(를) 삽입했습니다. (O(1))`);
  };

  const handleDequePopBack = () => {
    if (queue.length === 0) return;
    playPivotSound();
    const popped = queue[queue.length - 1];
    setQueue(queue.slice(0, -1));
    setActionLog(`[Deque PopBack] 맨 뒤(Rear) 원소 ${popped}을(를) 꺼냈습니다. (O(1))`);
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* 1. 상단 모드 선택 탭 */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-3xl">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('stack');
              setActionLog('스택(Stack - LIFO) 모드로 전환되었습니다.');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'stack'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🥞</span>
            <span>스택 (Stack)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('queue');
              setActionLog('큐(Queue - FIFO) 모드로 전환되었습니다.');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🚶‍♂️</span>
            <span>큐 (Queue)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('deque');
              setActionLog('덱(Deque - 양방향 입출력) 모드로 전환되었습니다.');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'deque'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>↔️</span>
            <span>덱 (Deque)</span>
          </button>
        </div>

        <button
          onClick={() => {
            setStack([10, 25, 40, 65]);
            setQueue([100, 200, 300]);
            setActionLog('기본 데이터로 리셋되었습니다.');
          }}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all active:scale-95"
        >
          🔄 리셋
        </button>
      </div>

      {/* 2. 인터랙티브 캔버스 */}
      {activeTab === 'stack' ? (
        // Stack Bucket View
        <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-3xl shadow-inner flex flex-col items-center justify-center min-h-[260px]">
          <div className="text-xs font-mono font-bold text-amber-400 mb-2">
            ▼ Top (입구이자 출구)
          </div>
          <div className="w-56 h-64 border-b-4 border-l-4 border-r-4 border-amber-500/80 rounded-b-3xl bg-slate-900/90 p-3 flex flex-col-reverse items-center gap-2 overflow-y-auto shadow-2xl">
            {stack.map((val, idx) => (
              <div
                key={idx}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 border border-amber-300 rounded-2xl flex items-center justify-between px-4 font-mono font-black text-white text-base shadow-md animate-fade-in"
              >
                <span className="text-xs text-amber-200">#{idx}</span>
                <span>{val}</span>
                {idx === stack.length - 1 ? (
                  <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded-full text-amber-300 font-extrabold border border-amber-400">
                    Top
                  </span>
                ) : (
                  <span className="w-6" />
                )}
              </div>
            ))}
            {stack.length === 0 && (
              <div className="text-xs text-slate-500 my-auto">스택이 비어있습니다 (Empty)</div>
            )}
          </div>
          <div className="text-xs font-mono text-slate-400 mt-2">Stack Size: {stack.length}</div>
        </div>
      ) : (
        // Queue / Deque Pipe View
        <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-3xl shadow-inner flex flex-col items-center justify-center min-h-[260px]">
          <div className="w-full max-w-xl flex items-center justify-between text-xs font-mono font-bold text-cyan-400 mb-2 px-2">
            <span>◀ Front (출구)</span>
            <span>Rear (입구) ▶</span>
          </div>

          <div className="w-full max-w-xl h-28 border-t-4 border-b-4 border-cyan-500/80 rounded-3xl bg-slate-900/90 p-3 flex items-center gap-3 overflow-x-auto shadow-2xl">
            {queue.map((val, idx) => (
              <div
                key={idx}
                className="h-20 min-w-[80px] bg-gradient-to-br from-cyan-600 to-cyan-500 border border-cyan-300 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-white text-lg shadow-md animate-fade-in relative flex-shrink-0"
              >
                <span className="text-[10px] text-cyan-200 font-medium">#{idx}</span>
                <span>{val}</span>
                {idx === 0 && (
                  <span className="absolute -top-2.5 px-1.5 py-0.2 bg-slate-900 border border-cyan-400 text-cyan-300 text-[9px] font-bold rounded-full">
                    Front
                  </span>
                )}
                {idx === queue.length - 1 && (
                  <span className="absolute -bottom-2.5 px-1.5 py-0.2 bg-slate-900 border border-cyan-400 text-cyan-300 text-[9px] font-bold rounded-full">
                    Rear
                  </span>
                )}
              </div>
            ))}
            {queue.length === 0 && (
              <div className="text-xs text-slate-500 mx-auto">대기열이 비어있습니다 (Empty)</div>
            )}
          </div>
          <div className="text-xs font-mono text-slate-400 mt-2">Queue Size: {queue.length}</div>
        </div>
      )}

      {/* 3. 동작 해설 로그 */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed flex items-start gap-2.5 shadow-md">
        <span className="text-base text-amber-400 flex-shrink-0">💡</span>
        <div className="flex-1 font-medium">{actionLog}</div>
      </div>

      {/* 4. 조작 버튼군 */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl">
        {activeTab === 'stack' ? (
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={stackInput}
              onChange={(e) => setStackInput(Number(e.target.value))}
              placeholder="값"
              className="w-24 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-xs font-mono text-white"
            />
            <button
              onClick={handleStackPush}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
            >
              📥 Push ({stackInput})
            </button>
            <button
              onClick={handleStackPop}
              className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
            >
              📤 Pop (최상단 꺼내기)
            </button>
            <button
              onClick={handleStackPeek}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
            >
              👀 Peek (최상단 조회)
            </button>
          </div>
        ) : activeTab === 'queue' ? (
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={queueInput}
              onChange={(e) => setQueueInput(Number(e.target.value))}
              placeholder="값"
              className="w-24 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-xs font-mono text-white"
            />
            <button
              onClick={handleQueueEnqueue}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
            >
              📥 Enqueue ({queueInput})
            </button>
            <button
              onClick={handleQueueDequeue}
              className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
            >
              📤 Dequeue (맨 앞 내보내기)
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={queueInput}
              onChange={(e) => setQueueInput(Number(e.target.value))}
              placeholder="값"
              className="w-24 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-xs font-mono text-white"
            />
            <button
              onClick={handleDequePushFront}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold transition-all active:scale-95"
            >
              PushFront ({queueInput})
            </button>
            <button
              onClick={handleQueueEnqueue}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all active:scale-95"
            >
              PushBack ({queueInput})
            </button>
            <button
              onClick={handleQueueDequeue}
              className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all active:scale-95"
            >
              PopFront
            </button>
            <button
              onClick={handleDequePopBack}
              className="px-3.5 py-2 bg-rose-700/80 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all active:scale-95"
            >
              PopBack
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
