'use client';

import React from 'react';
import { DataStructureDefinition } from '../../lib/data-structures/types';

interface DSConceptCardProps {
  ds: DataStructureDefinition;
  onOpenQuiz?: () => void;
}

export const DSConceptCard: React.FC<DSConceptCardProps> = ({ ds, onOpenQuiz }) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
      {/* 1. 기본 설명 & 퀴즈 버튼 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{ds.icon}</span>
            <h3 className="text-lg font-extrabold text-white">{ds.name}</h3>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-0.5">{ds.englishName}</div>
        </div>

        {onOpenQuiz && ds.quiz && ds.quiz.length > 0 && (
          <button
            onClick={onOpenQuiz}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>📝</span>
            <span>개념 자가 퀴즈 풀기</span>
          </button>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">{ds.description}</p>

      {/* 2. 핵심 연산별 시간 복잡도 표 */}
      <div>
        <div className="text-xs font-bold text-slate-400 mb-2">⚡ 주요 연산 시간 복잡도</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ds.operations.map((op, i) => (
            <div
              key={i}
              className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl flex items-center justify-between gap-2"
            >
              <div>
                <div className="text-xs font-bold text-slate-200">{op.name}</div>
                <div className="text-[10px] text-slate-400">{op.description}</div>
              </div>
              <span className="font-mono font-black text-xs text-blue-400 bg-blue-950/60 px-2 py-1 rounded-xl border border-blue-800/60 flex-shrink-0">
                {op.timeComplexity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 장점 & 단점 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* 장점 */}
        <div className="bg-slate-950/70 border border-emerald-900/40 p-3 rounded-2xl">
          <div className="text-xs font-extrabold text-emerald-400 mb-1.5 flex items-center gap-1">
            <span>✓</span>
            <span>핵심 장점 (Pros)</span>
          </div>
          <ul className="text-[11px] text-slate-300 space-y-1">
            {ds.advantages.map((adv, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-400">•</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 단점 및 한계 */}
        <div className="bg-slate-950/70 border border-rose-900/40 p-3 rounded-2xl">
          <div className="text-xs font-extrabold text-rose-400 mb-1.5 flex items-center gap-1">
            <span>✗</span>
            <span>한계 및 유의점 (Cons)</span>
          </div>
          <ul className="text-[11px] text-slate-300 space-y-1">
            {ds.disadvantages.map((dis, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-rose-400">•</span>
                <span>{dis}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. 실무 & 기술 면접 활용 사례 */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-xs font-bold text-slate-400 mb-1.5">💡 실무 및 시스템 활용 사례</div>
        <div className="flex flex-wrap gap-1.5">
          {ds.realWorldUses.map((use, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-xl text-[11px] font-medium"
            >
              ▪ {use}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
