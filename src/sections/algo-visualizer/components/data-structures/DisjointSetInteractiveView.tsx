'use client';

import React, { useState } from 'react';

import { playSwapSound, playFoundSound, playButtonClickSound } from '../../lib/sound';

export const DisjointSetInteractiveView: React.FC = () => {
  const TOTAL_NODES = 8;
  const [parent, setParent] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7]);
  const [rank, setRank] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [nodeA, setNodeA] = useState<number>(0);
  const [nodeB, setNodeB] = useState<number>(1);
  const [findTarget, setFindTarget] = useState<number>(0);
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const [log, setLog] = useState<string>(
    '유니온-파인드(Disjoint Set)는 상호 배타적인 집합들을 관리하며 Union(합치기)과 Find(루트 찾기)를 거의 O(1) 분할 상환 시간에 수행해요.'
  );

  const findRoot = (pArr: number[], i: number): { root: number; path: number[] } => {
    const path: number[] = [];
    let curr = i;
    while (pArr[curr] !== curr) {
      path.push(curr);
      curr = pArr[curr];
    }
    path.push(curr);
    return { root: curr, path };
  };

  const handleFind = () => {
    const { root, path } = findRoot(parent, findTarget);
    setActiveNodes(path);

    // 경로 압축 (Path Compression) 적용
    const nextParent = [...parent];
    for (const node of path) {
      nextParent[node] = root;
    }
    setParent(nextParent);

    setLog(
      `[Find 연산] 노드 ${findTarget}의 대표 루트는 ${root}이에요. 탐색 경로 [${path.join(' ➔ ')}]를 거친 후 경로 압축(Path Compression)을 통해 부모를 루트(${root})로 직접 연결했어요.`
    );
    playFoundSound();
  };

  const handleUnion = () => {
    if (nodeA === nodeB) {
      setLog(`노드 ${nodeA}와 ${nodeB}는 같은 노드예요.`);
      return;
    }

    const { root: rootA } = findRoot(parent, nodeA);
    const { root: rootB } = findRoot(parent, nodeB);

    if (rootA === rootB) {
      setActiveNodes([nodeA, nodeB, rootA]);
      setLog(
        `[Union 스킵] 노드 ${nodeA}와 ${nodeB}는 이미 같은 집합(루트 ${rootA})에 속해 있어요. (사이클 방지)`
      );
      playSwapSound();
      return;
    }

    const nextParent = [...parent];
    const nextRank = [...rank];

    // Union by Rank
    if (nextRank[rootA] < nextRank[rootB]) {
      nextParent[rootA] = rootB;
    } else if (nextRank[rootA] > nextRank[rootB]) {
      nextParent[rootB] = rootA;
    } else {
      nextParent[rootB] = rootA;
      nextRank[rootA]++;
    }

    setParent(nextParent);
    setRank(nextRank);
    setActiveNodes([rootA, rootB]);
    setLog(`[Union 성공] 집합 루트 ${rootA}와 ${rootB}를 하나로 병합했어요.`);
    playButtonClickSound();
  };

  const handleCheckConnected = () => {
    const { root: rootA } = findRoot(parent, nodeA);
    const { root: rootB } = findRoot(parent, nodeB);
    setActiveNodes([rootA, rootB]);

    if (rootA === rootB) {
      setLog(
        `[연결 확인] 노드 ${nodeA}와 ${nodeB}는 같은 집합(루트 ${rootA})으로 서로 연결되어 있어요!`
      );
      playFoundSound();
    } else {
      setLog(
        `[연결 확인] 노드 ${nodeA}(루트 ${rootA})와 ${nodeB}(루트 ${rootB})는 서로 다른 독립된 집합이에요.`
      );
      playSwapSound();
    }
  };

  const handleReset = () => {
    setParent(Array.from({ length: TOTAL_NODES }, (_, i) => i));
    setRank(new Array(TOTAL_NODES).fill(0));
    setActiveNodes([]);
    setLog('모든 집합을 개별 단일 원소 상태로 초기화했어요.');
    playButtonClickSound();
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 select-none relative overflow-y-auto bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner gap-4">
      {/* 1. 상단 컨트롤 패널 */}
      <div className="flex flex-col gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Union & Connected */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-300">합집합(Union):</span>
            <select
              value={nodeA}
              onChange={(e) => setNodeA(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
            >
              {Array.from({ length: TOTAL_NODES }, (_, i) => (
                <option key={i} value={i}>
                  노드 {i}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400 font-bold">+</span>
            <select
              value={nodeB}
              onChange={(e) => setNodeB(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
            >
              {Array.from({ length: TOTAL_NODES }, (_, i) => (
                <option key={i} value={i}>
                  노드 {i}
                </option>
              ))}
            </select>
            <button
              onClick={handleUnion}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-md"
            >
              Union 병합하기
            </button>
            <button
              onClick={handleCheckConnected}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-md"
            >
              연결 여부 확인하기
            </button>
          </div>

          {/* Find & Reset */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-300">루트 찾기(Find):</span>
            <select
              value={findTarget}
              onChange={(e) => setFindTarget(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none"
            >
              {Array.from({ length: TOTAL_NODES }, (_, i) => (
                <option key={i} value={i}>
                  노드 {i}
                </option>
              ))}
            </select>
            <button
              onClick={handleFind}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-md"
            >
              Find 실행하기
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95"
            >
              초기화하기
            </button>
          </div>
        </div>
      </div>

      {/* 2. 부모 배열 테이블 및 노드 카드 시각화 */}
      <div className="w-full flex-1 min-h-[240px] flex flex-col justify-around p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 gap-4">
        {/* Parent Array Grid */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-300">
              부모 포인터 배열 (Parent Pointer Array)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              parent[i] == i 이면 자신이 집합의 대표 루트
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {parent.map((pVal, idx) => {
              const isRoot = pVal === idx;
              const isActive = activeNodes.includes(idx);

              return (
                <div
                  key={idx}
                  className={`flex-1 min-w-[55px] h-14 rounded-2xl flex flex-col items-center justify-center border font-mono transition-all duration-300 shadow-md ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-300 scale-105 shadow-amber-500/40 font-black'
                      : isRoot
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60'
                        : 'bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  <span className="text-[10px] opacity-75 font-normal">노드 #{idx}</span>
                  <span className="text-sm font-bold">➔ {pVal}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 집합별 그룹핑 칩 뷰 */}
        <div className="flex flex-col gap-1.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <span className="text-xs font-extrabold text-indigo-300">
            현재 형성된 독립 집합 그룹 (Disjoint Groups)
          </span>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {Array.from(new Set(parent.map((_, i) => findRoot(parent, i).root))).map((rootId) => {
              const members = Array.from({ length: TOTAL_NODES }, (_, i) => i).filter(
                (i) => findRoot(parent, i).root === rootId
              );

              return (
                <div
                  key={rootId}
                  className="px-3.5 py-1.5 bg-slate-900 border border-indigo-500/40 rounded-xl text-xs font-mono flex items-center gap-2 shadow-sm"
                >
                  <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold rounded-lg text-[10px]">
                    루트 {rootId}
                  </span>
                  <span className="text-slate-300 font-bold">
                    집합 원소: &#123;{members.join(', ')}&#125;
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 하단 동작 로그 */}
      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
        <span className="text-indigo-400 font-bold mr-2">📌 실시간 안내:</span>
        {log}
      </div>
    </div>
  );
};
