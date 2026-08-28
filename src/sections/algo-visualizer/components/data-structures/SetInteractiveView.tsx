'use client';

import React, { useState } from 'react';
import { playButtonClickSound, playFoundSound, playSwapSound } from '../../lib/sound';

export const SetInteractiveView: React.FC = () => {
  const [setItems, setSetItems] = useState<number[]>([10, 20, 30, 40]);
  const [inputVal, setInputVal] = useState<string>('20');
  const [highlightVal, setHighlightVal] = useState<number | null>(null);
  const [log, setLog] = useState<string>('Set은 중복 원소를 허용하지 않는 고유 집합입니다.');

  const handleAdd = () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;

    if (setItems.includes(val)) {
      setHighlightVal(val);
      setLog(
        `[중복 거부] 원소 ${val}은(는) 이미 Set에 존재합니다! (Set은 요소의 중복을 허용하지 않음)`
      );
      playSwapSound();
    } else {
      setSetItems([...setItems, val]);
      setHighlightVal(val);
      setLog(`[Add 성공] 새 고유 원소 ${val} 추가 완료 (Set.size = ${setItems.length + 1})`);
      playButtonClickSound();
    }
  };

  const handleHas = () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;

    if (setItems.includes(val)) {
      setHighlightVal(val);
      setLog(`[Has] Set.has(${val}) ➔ true (존재함)`);
      playFoundSound();
    } else {
      setHighlightVal(null);
      setLog(`[Has] Set.has(${val}) ➔ false (존재하지 않음)`);
      playSwapSound();
    }
  };

  const handleDelete = () => {
    const val = parseInt(inputVal);
    if (isNaN(val)) return;

    if (setItems.includes(val)) {
      setSetItems(setItems.filter((x) => x !== val));
      setHighlightVal(null);
      setLog(`[Delete] 원소 ${val}을(를) Set에서 제거했습니다.`);
      playSwapSound();
    } else {
      setLog(`[Delete 실패] 제거할 원소 ${val}이(가) Set에 없습니다.`);
    }
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
            className="w-28 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            Add(val)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHas}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            Has(val)
          </button>
          <button
            onClick={handleDelete}
            className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            Delete(val)
          </button>
        </div>
      </div>

      {/* Set 원소 벤다이어그램 버블 캔버스 */}
      <div className="w-full min-h-[180px] bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 relative shadow-inner">
        <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400">
          <span className="text-emerald-300 font-mono">Set.size = {setItems.length}</span>
          <span className="text-[10px]">고유 원소 집합 (Unique Collection)</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 p-4">
          {setItems.map((val) => {
            const isHighlight = highlightVal === val;
            return (
              <div
                key={val}
                className={`w-16 h-16 rounded-full border-2 font-mono font-black text-base flex flex-col items-center justify-center shadow-lg transition-all duration-300 animate-scale-up ${
                  isHighlight
                    ? 'bg-emerald-500 border-yellow-200 text-slate-950 scale-110 shadow-emerald-500/50 animate-bounce'
                    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:scale-105'
                }`}
              >
                <span>{val}</span>
              </div>
            );
          })}

          {setItems.length === 0 && (
            <span className="text-xs text-slate-500">
              Set이 비어 있습니다. Add 버튼으로 원소를 추가하세요.
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
