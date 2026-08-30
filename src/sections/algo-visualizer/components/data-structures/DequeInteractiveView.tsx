'use client';

import React, { useState } from 'react';

import { playSwapSound, playButtonClickSound } from '../../lib/sound';

export const DequeInteractiveView: React.FC = () => {
  const [items, setItems] = useState<number[]>([15, 30, 45, 60]);
  const [inputVal, setInputVal] = useState<string>('75');
  const [log, setLog] = useState<string>(
    '덱 초기화 완료. 앞(Front)과 뒤(Rear) 양 끝에서 자유롭게 삽입/삭제할 수 있습니다.'
  );

  const handlePushFront = () => {
    const val = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    if (items.length >= 10) {
      setLog('덱이 가득 찼습니다! (최대 10개)');
      return;
    }
    setItems([val, ...items]);
    setLog(`[Push Front] 맨 앞(Front)에 원소 ${val} 삽입 완료 (O(1))`);
    playButtonClickSound();
  };

  const handlePushBack = () => {
    const val = parseInt(inputVal) || Math.floor(Math.random() * 90) + 10;
    if (items.length >= 10) {
      setLog('덱이 가득 찼습니다! (최대 10개)');
      return;
    }
    setItems([...items, val]);
    setLog(`[Push Back] 맨 뒤(Rear)에 원소 ${val} 삽입 완료 (O(1))`);
    playButtonClickSound();
  };

  const handlePopFront = () => {
    if (items.length === 0) {
      setLog('덱이 비어있어 PopFront 할 수 없습니다.');
      return;
    }
    const popped = items[0];
    setItems(items.slice(1));
    setLog(`[Pop Front] 맨 앞(Front) 원소 ${popped} 추출 완료 (O(1))`);
    playSwapSound();
  };

  const handlePopBack = () => {
    if (items.length === 0) {
      setLog('덱이 비어있어 PopBack 할 수 없습니다.');
      return;
    }
    const popped = items[items.length - 1];
    setItems(items.slice(0, -1));
    setLog(`[Pop Back] 맨 뒤(Rear) 원소 ${popped} 추출 완료 (O(1))`);
    playSwapSound();
  };

  const handleClear = () => {
    setItems([]);
    setLog('덱을 모두 비웠습니다.');
    playButtonClickSound();
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* 상단 컨트롤 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="숫자 입력"
            className="w-24 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={handlePushFront}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            ◀ Push Front
          </button>
          <button
            onClick={handlePushBack}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            Push Back ▶
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePopFront}
            className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            ◀ Pop Front
          </button>
          <button
            onClick={handlePopBack}
            className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            Pop Back ▶
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 active:scale-95"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 덱 양방향 트랙 시각화 */}
      <div className="w-full min-h-[160px] bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 relative shadow-inner">
        <div className="w-full flex items-center justify-between px-2 text-[11px] font-bold text-teal-400">
          <span>◀ Front (앞쪽 출입구)</span>
          <span className="text-slate-500 font-mono">Size: {items.length} / 10</span>
          <span>Rear (뒤쪽 출입구) ▶</span>
        </div>

        <div className="w-full min-h-[70px] border-t-2 border-b-2 border-dashed border-teal-500/50 rounded-2xl p-3 flex items-center justify-center gap-3 overflow-x-auto">
          {items.map((val, idx) => (
            <div
              key={idx}
              className="w-14 h-14 rounded-2xl bg-gradient-to-t from-teal-700 to-teal-500 border border-teal-300 text-white font-mono font-black text-base flex flex-col items-center justify-center shadow-lg animate-scale-up flex-shrink-0"
            >
              <span>{val}</span>
              <span className="text-[9px] font-bold text-teal-200">
                {idx === 0 && items.length > 1
                  ? 'Front'
                  : idx === items.length - 1 && items.length > 1
                    ? 'Rear'
                    : `#${idx}`}
              </span>
            </div>
          ))}

          {items.length === 0 && (
            <span className="text-xs text-slate-500">
              덱이 비어 있습니다. Push 버튼을 눌러보세요.
            </span>
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
