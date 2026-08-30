'use client';

import type { HashBucket } from '../../lib/data-structures/types';

import React, { useState } from 'react';

import { playSwapSound, playFoundSound, playButtonClickSound } from '../../lib/sound';

const BUCKET_SIZE = 7;

export const HashTableInteractiveView: React.FC = () => {
  const [buckets, setBuckets] = useState<HashBucket[]>([
    { index: 0, entries: [] },
    { index: 1, entries: [{ key: 'toss', value: '앱인토스' }] },
    { index: 2, entries: [] },
    {
      index: 3,
      entries: [
        { key: 'algo', value: '알고리즘' },
        { key: 'tree', value: '자료구조' },
      ],
    }, // Chaining example
    { index: 4, entries: [{ key: 'react', value: '프론트엔드' }] },
    { index: 5, entries: [] },
    { index: 6, entries: [{ key: 'node', value: '서버' }] },
  ]);

  const [inputKey, setInputKey] = useState<string>('next');
  const [inputVal, setInputVal] = useState<string>('웹 프레임워크');
  const [highlightBucket, setHighlightBucket] = useState<number | null>(null);
  const [actionLog, setActionLog] = useState<string>(
    '해시 테이블은 Key를 해시 함수로 변환해 해당 버킷에 데이터를 O(1)에 매핑합니다.'
  );

  // Simple Hash Function: sum of ASCII codes % BUCKET_SIZE
  const computeHash = (key: string): { sum: number; index: number } => {
    let sum = 0;
    for (let i = 0; i < key.length; i++) {
      sum += key.charCodeAt(i);
    }
    return { sum, index: sum % BUCKET_SIZE };
  };

  // Insert / Put
  const handlePut = () => {
    if (!inputKey.trim()) return;
    playSwapSound();

    const { sum, index } = computeHash(inputKey);
    const targetBucket = buckets[index];
    const existingIdx = targetBucket.entries.findIndex((e) => e.key === inputKey);

    const nextBuckets = buckets.map((b) => {
      if (b.index === index) {
        if (existingIdx !== -1) {
          const nextEntries = [...b.entries];
          nextEntries[existingIdx] = { key: inputKey, value: inputVal };
          return { ...b, entries: nextEntries };
        } else {
          return { ...b, entries: [...b.entries, { key: inputKey, value: inputVal }] };
        }
      }
      return b;
    });

    setBuckets(nextBuckets);
    setHighlightBucket(index);

    if (existingIdx !== -1) {
      setActionLog(
        `[Key 갱신] 해시 계산: hash("${inputKey}") = (${sum} % ${BUCKET_SIZE}) = [버킷 ${index}]. 기존 Key의 Value를 '${inputVal}'로 수정했습니다.`
      );
    } else if (targetBucket.entries.length > 0) {
      setActionLog(
        `⚡ [해시 충돌 발생 & Chaining] hash("${inputKey}") = [버킷 ${index}]. 이미 버킷에 데이터가 있어 연결 리스트(Chaining) 체인 뒤에 새 항목을 연결했습니다.`
      );
    } else {
      setActionLog(
        `[Insert] hash("${inputKey}") = (${sum} % ${BUCKET_SIZE}) = [버킷 ${index}]에 새 항목을 O(1)에 저장했습니다.`
      );
    }
  };

  // Search / Get
  const handleGet = () => {
    if (!inputKey.trim()) return;
    const { sum, index } = computeHash(inputKey);
    const targetBucket = buckets[index];
    const foundEntry = targetBucket.entries.find((e) => e.key === inputKey);

    setHighlightBucket(index);

    if (foundEntry) {
      playFoundSound();
      setActionLog(
        `✨ [Search 성공] hash("${inputKey}") = (${sum} % ${BUCKET_SIZE}) = [버킷 ${index}] 검색. Value = '${foundEntry.value}' 발견! (평균 O(1))`
      );
    } else {
      playButtonClickSound();
      setActionLog(
        `[Search 실패] hash("${inputKey}") = [버킷 ${index}]을 확인했으나 해당 Key가 존재하지 않습니다.`
      );
    }
  };

  // Delete / Remove
  const handleDelete = () => {
    if (!inputKey.trim()) return;
    playButtonClickSound();
    const { index } = computeHash(inputKey);

    const nextBuckets = buckets.map((b) => {
      if (b.index === index) {
        return { ...b, entries: b.entries.filter((e) => e.key !== inputKey) };
      }
      return b;
    });

    setBuckets(nextBuckets);
    setHighlightBucket(index);
    setActionLog(`[Delete] [버킷 ${index}]에서 Key '${inputKey}' 항목을 제거했습니다.`);
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none">
      {/* 1. 상단 해시 함수 원리 배너 */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-xl font-bold">
            해시 함수 (Hash Function)
          </span>
          <span className="text-slate-300">index = (ASCII 합) % {BUCKET_SIZE}</span>
        </div>

        <button
          onClick={() => {
            setBuckets([
              { index: 0, entries: [] },
              { index: 1, entries: [{ key: 'toss', value: '앱인토스' }] },
              { index: 2, entries: [] },
              {
                index: 3,
                entries: [
                  { key: 'algo', value: '알고리즘' },
                  { key: 'tree', value: '자료구조' },
                ],
              },
              { index: 4, entries: [{ key: 'react', value: '프론트엔드' }] },
              { index: 5, entries: [] },
              { index: 6, entries: [{ key: 'node', value: '서버' }] },
            ]);
            setHighlightBucket(null);
            setActionLog('기본 해시 테이블로 리셋되었습니다.');
          }}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all active:scale-95"
        >
          🔄 리셋
        </button>
      </div>

      {/* 2. 해시 버킷 & 체이닝 연결 리스트 캔버스 */}
      <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-3xl shadow-inner flex flex-col gap-3 min-h-[280px] overflow-y-auto">
        {buckets.map((bucket) => {
          const isHighlighted = highlightBucket === bucket.index;

          return (
            <div
              key={bucket.index}
              className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                isHighlighted
                  ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              {/* 버킷 번호 */}
              <div className="w-20 h-10 rounded-xl bg-slate-950 border border-purple-500/30 flex items-center justify-center font-mono font-extrabold text-xs text-purple-300 flex-shrink-0">
                Bucket [{bucket.index}]
              </div>

              <div className="text-slate-600 font-bold">➔</div>

              {/* 체이닝 노드 목록 */}
              <div className="flex items-center gap-2 overflow-x-auto flex-1">
                {bucket.entries.map((entry, eIdx) => (
                  <React.Fragment key={entry.key}>
                    <div className="flex items-center bg-gradient-to-r from-purple-600/90 to-indigo-600/90 border border-purple-400/60 px-3 py-1.5 rounded-xl font-mono text-xs text-white shadow-md flex-shrink-0">
                      <span className="font-black text-amber-300 mr-1.5">{entry.key}:</span>
                      <span className="font-semibold text-slate-100">{String(entry.value)}</span>
                    </div>
                    {eIdx < bucket.entries.length - 1 && (
                      <span className="text-purple-400 font-bold">➔</span>
                    )}
                  </React.Fragment>
                ))}

                {bucket.entries.length === 0 && (
                  <span className="text-[11px] text-slate-600 italic">null (비어있음)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. 동작 해설 피드백 로그 */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed flex items-start gap-2.5 shadow-md">
        <span className="text-base text-purple-400 flex-shrink-0">💡</span>
        <div className="flex-1 font-medium">{actionLog}</div>
      </div>

      {/* 4. 조작 패널 */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl">
        <input
          type="text"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Key (예: fruit)"
          className="w-32 bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
        />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Value (예: 사과)"
          className="w-36 bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handlePut}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          ➕ Insert/Put (O(1))
        </button>
        <button
          onClick={handleGet}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          🔍 Lookup/Get (O(1))
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          🗑️ Delete (O(1))
        </button>
      </div>
    </div>
  );
};
