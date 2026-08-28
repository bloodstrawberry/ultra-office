'use client';

import React, { useState } from 'react';
import { playButtonClickSound, playFoundSound, playSwapSound } from '../../lib/sound';

export const MapInteractiveView: React.FC = () => {
  const [mapEntries, setMapEntries] = useState<Record<string, string>>({
    user_1: 'Alice',
    user_2: 'Bob',
    user_3: 'Charlie',
  });
  const [keyInput, setKeyInput] = useState<string>('user_4');
  const [valInput, setValInput] = useState<string>('David');
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const [log, setLog] = useState<string>(
    'Map은 중복되지 않는 Key를 통해 각 Value를 고유하게 관리합니다.'
  );

  const handleSet = () => {
    if (!keyInput.trim()) {
      setLog('Key를 입력해주세요.');
      return;
    }
    const isUpdate = keyInput in mapEntries;
    setMapEntries({ ...mapEntries, [keyInput]: valInput });
    setHighlightKey(keyInput);
    setLog(
      isUpdate
        ? `[Update] Key '${keyInput}'의 기존 값을 '${valInput}'(으)로 덮어씌웠습니다. (Key 중복 불허)`
        : `[Insert] Key '${keyInput}' ➔ Value '${valInput}' 저장 완료 (O(1))`
    );
    playButtonClickSound();
  };

  const handleGet = () => {
    if (keyInput in mapEntries) {
      setHighlightKey(keyInput);
      setLog(`[Get] Key '${keyInput}'의 값은 '${mapEntries[keyInput]}' 입니다. (O(1) 조회)`);
      playFoundSound();
    } else {
      setHighlightKey(null);
      setLog(`[Get 실패] Key '${keyInput}'에 매핑된 데이터가 존재하지 않습니다.`);
      playSwapSound();
    }
  };

  const handleDelete = () => {
    if (keyInput in mapEntries) {
      const next = { ...mapEntries };
      delete next[keyInput];
      setMapEntries(next);
      setHighlightKey(null);
      setLog(`[Delete] Key '${keyInput}' 항목을 삭제했습니다.`);
      playSwapSound();
    } else {
      setLog(`[Delete 실패] 삭제할 Key '${keyInput}'이(가) 없습니다.`);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* 상단 컨트롤 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Key"
            className="w-28 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-fuchsia-500"
          />
          <input
            type="text"
            value={valInput}
            onChange={(e) => setValInput(e.target.value)}
            placeholder="Value"
            className="w-28 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-fuchsia-500"
          />
          <button
            onClick={handleSet}
            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            Set(Key, Value)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGet}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            Get(Key)
          </button>
          <button
            onClick={handleDelete}
            className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md"
          >
            Delete(Key)
          </button>
        </div>
      </div>

      {/* Map Key-Value 테이블 시각화 */}
      <div className="w-full min-h-[160px] bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 shadow-inner">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
          <span className="text-fuchsia-300 font-mono">
            Map.size = {Object.keys(mapEntries).length}
          </span>
          <span>고유 Key-Value 매핑 테이블</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(mapEntries).map(([k, v]) => {
            const isHighlight = highlightKey === k;
            return (
              <div
                key={k}
                className={`p-3 rounded-2xl border transition-all duration-200 shadow-md flex items-center justify-between font-mono ${
                  isHighlight
                    ? 'bg-fuchsia-600/30 border-fuchsia-400 text-fuchsia-100 scale-105 shadow-fuchsia-500/30 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-fuchsia-400 font-bold">KEY</span>
                  <span className="text-xs font-extrabold text-white">{k}</span>
                </div>
                <span className="text-slate-500 text-xs font-bold">➔</span>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 font-bold">VALUE</span>
                  <span className="text-xs font-black text-emerald-400">{v}</span>
                </div>
              </div>
            );
          })}

          {Object.keys(mapEntries).length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-slate-500">
              Map이 비어 있습니다. Set(Key, Value) 버튼을 눌러 새 항목을 등록하세요.
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
