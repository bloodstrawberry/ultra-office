'use client';

import React, { useState } from 'react';
import {
  playCompareSound,
  playSwapSound,
  playFoundSound,
  playButtonClickSound,
} from '../../lib/sound';

export const ArrayInteractiveView: React.FC = () => {
  const [array, setArray] = useState<number[]>([15, 28, 42, 60, 77, 93]);
  const [capacity, setCapacity] = useState<number>(8);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [actionLog, setActionLog] = useState<string>(
    '배열이 준비되었습니다. 아래 버튼을 눌러 연산을 직접 실행해보세요.'
  );

  // Input states
  const [insertVal, setInsertVal] = useState<number>(55);
  const [insertIdx, setInsertIdx] = useState<number>(2);
  const [searchVal, setSearchVal] = useState<number>(42);

  // Append
  const handleAppend = () => {
    playSwapSound();
    if (array.length >= capacity) {
      // Doubling
      const newCap = capacity * 2;
      setCapacity(newCap);
      const nextArr = [...array, insertVal];
      setArray(nextArr);
      setHighlightIdx(nextArr.length - 1);
      setActionLog(
        `⚡ 공간 부족으로 용량(Capacity)이 ${capacity} ➔ ${newCap}으로 2배 확장(Doubling)된 후 ${insertVal}이 맨 뒤에 추가되었습니다. (분할 상환 O(1))`
      );
    } else {
      const nextArr = [...array, insertVal];
      setArray(nextArr);
      setHighlightIdx(nextArr.length - 1);
      setActionLog(
        `맨 뒤에 ${insertVal}을(를) O(1)에 추가했습니다. (크기: ${nextArr.length}/${capacity})`
      );
    }
  };

  // Insert at Index
  const handleInsertAt = () => {
    playSwapSound();
    const idx = Math.max(0, Math.min(array.length, insertIdx));
    let nextCap = capacity;
    if (array.length >= capacity) {
      nextCap = capacity * 2;
      setCapacity(nextCap);
    }
    const nextArr = [...array];
    nextArr.splice(idx, 0, insertVal);
    setArray(nextArr);
    setHighlightIdx(idx);
    setActionLog(
      `인덱스 [${idx}] 위치에 ${insertVal}을(를) 삽입했습니다. 인덱스 ${idx}부터의 기존 원소들이 오른쪽으로 한 칸씩 밀렸습니다. (O(N) 소요)`
    );
  };

  // Delete at Index
  const handleDeleteAt = () => {
    if (array.length === 0) return;
    playButtonClickSound();
    const idx = Math.max(0, Math.min(array.length - 1, insertIdx));
    const deletedVal = array[idx];
    const nextArr = [...array];
    nextArr.splice(idx, 1);
    setArray(nextArr);
    setHighlightIdx(null);
    setActionLog(
      `인덱스 [${idx}]의 원소 ${deletedVal}을(를) 삭제했습니다. 뒤쪽 원소들이 왼쪽으로 한 칸씩 당겨졌습니다. (O(N) 소요)`
    );
  };

  // Access by Index
  const handleAccess = (idx: number) => {
    playCompareSound(array[idx], 100);
    setHighlightIdx(idx);
    setActionLog(
      `[인덱스 접근] 주소 'Base + (${idx} × 4B)'를 계산하여 인덱스 [${idx}]의 값 ${array[idx]}을(를) O(1)에 즉시 읽었습니다.`
    );
  };

  // Search
  const handleSearch = () => {
    const found = array.indexOf(searchVal);
    if (found !== -1) {
      playFoundSound();
      setHighlightIdx(found);
      setActionLog(
        `✨ 선형 탐색 성공: 값 ${searchVal}이(가) 인덱스 [${found}]에 위치해 있습니다. (${found + 1}번 비교, O(N))`
      );
    } else {
      playButtonClickSound();
      setHighlightIdx(null);
      setActionLog(
        `선형 탐색 결과: 값 ${searchVal}을(를) 찾지 못했습니다. (전체 ${array.length}번 순회 완료, O(N))`
      );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* 1. 상태 배너 & 용량 바 */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">현재 원소 수 (Size):</span>
            <span className="px-2.5 py-0.5 bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl font-mono font-extrabold text-xs">
              {array.length}개
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">할당된 용량 (Capacity):</span>
            <span className="px-2.5 py-0.5 bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-xl font-mono font-extrabold text-xs">
              {capacity}칸
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setArray([15, 28, 42, 60, 77, 93]);
            setCapacity(8);
            setHighlightIdx(null);
            setActionLog('기본 배열로 초기화되었습니다.');
          }}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all active:scale-95"
        >
          🔄 초기화
        </button>
      </div>

      {/* 2. 메모리 블록 시각화 캔버스 */}
      <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-3xl shadow-inner flex flex-col items-center justify-center min-h-[180px] overflow-x-auto">
        <div className="text-[11px] font-mono text-slate-500 self-start mb-3">
          Contiguous Memory Address Buffer: [0x1000 ~ 0x{1000 + capacity * 4}]
        </div>

        <div className="flex items-center gap-2 min-w-max p-2">
          {Array.from({ length: capacity }).map((_, idx) => {
            const hasValue = idx < array.length;
            const value = hasValue ? array[idx] : null;
            const isHighlight = highlightIdx === idx;

            return (
              <div
                key={idx}
                onClick={() => hasValue && handleAccess(idx)}
                className={`flex flex-col items-center justify-center relative cursor-pointer transition-all duration-200 group ${
                  hasValue ? 'hover:-translate-y-1' : 'cursor-default opacity-40'
                }`}
              >
                {/* 상단 인덱스 */}
                <div className="text-[11px] font-mono font-bold text-slate-400 mb-1">[{idx}]</div>

                {/* 메모리 셀 Box */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-mono font-extrabold text-base sm:text-lg shadow-lg transition-all ${
                    isHighlight
                      ? 'bg-gradient-to-br from-amber-500 to-yellow-400 border-yellow-200 text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.8)] scale-110'
                      : hasValue
                        ? 'bg-gradient-to-br from-blue-600/80 to-blue-800/80 border-blue-400 text-white hover:border-blue-300'
                        : 'bg-slate-900/60 border-dashed border-slate-700 text-slate-600'
                  }`}
                >
                  {hasValue ? value : <span className="text-xs text-slate-600">빈 칸</span>}
                </div>

                {/* 메모리 주소 오프셋 */}
                <div className="text-[9px] font-mono text-slate-600 mt-1">
                  +0x{(idx * 4).toString(16).padStart(2, '0')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 동작 해설 피드백 로그 */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed flex items-start gap-2.5 shadow-md">
        <span className="text-base text-blue-400 flex-shrink-0">💡</span>
        <div className="flex-1 font-medium">{actionLog}</div>
      </div>

      {/* 4. 대화형 인터랙티브 컨트롤 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl">
        {/* 삽입 & 삭제 조작 */}
        <div className="flex flex-col gap-2.5 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <div className="text-xs font-extrabold text-blue-300">원소 삽입 & 삭제 조작</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={insertVal}
              onChange={(e) => setInsertVal(Number(e.target.value))}
              placeholder="값"
              className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
            />
            <input
              type="number"
              value={insertIdx}
              onChange={(e) => setInsertIdx(Number(e.target.value))}
              placeholder="인덱스"
              className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
            />
            <button
              onClick={handleAppend}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex-1"
            >
              맨 뒤 추가 (Append)
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInsertAt}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex-1"
            >
              [인덱스 {insertIdx}] 삽입
            </button>
            <button
              onClick={handleDeleteAt}
              className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex-1"
            >
              [인덱스 {insertIdx}] 삭제
            </button>
          </div>
        </div>

        {/* 탐색 & 조회 조작 */}
        <div className="flex flex-col gap-2.5 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <div className="text-xs font-extrabold text-cyan-300">원소 탐색 & 조회 조작</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={searchVal}
              onChange={(e) => setSearchVal(Number(e.target.value))}
              placeholder="탐색할 값"
              className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex-1"
            >
              🔍 값 선형 탐색 (Search)
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            위 메모리 블록을 직접 클릭하면 해당 인덱스 메모리에 즉시 O(1)로 접근합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
