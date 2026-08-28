'use client';

import React from 'react';
import { AlgorithmDefinition } from '../../lib/algorithms/types';
import { CODING_TEST_RECOMMENDATIONS } from '../../lib/algorithms/multiLanguageCodes';

interface CodingTestGuideCardProps {
  algo: AlgorithmDefinition;
}

export const CodingTestGuideCard: React.FC<CodingTestGuideCardProps> = ({ algo }) => {
  const guideData = CODING_TEST_RECOMMENDATIONS[algo.id] || {
    problems: [
      {
        platform: 'BOJ' as const,
        title: `${algo.name} 추천 실전 연습 문제`,
        difficulty: 'Silver' as const,
        url: 'https://www.acmicpc.net/',
        keyTakeaway: '기본 템플릿 코드 구현 및 시간복잡도 최적화 연습',
      },
    ],
    patterns: algo.keyFeatures || [
      '코딩 테스트 단골 출제 유형',
      '자료구조와 함께 복합 문제로 출제',
    ],
  };

  const getBadgeStyle = (platform: string, diff: string) => {
    if (
      diff.includes('Gold') ||
      diff.includes('Lv3') ||
      diff.includes('Hard') ||
      diff.includes('Platinum')
    ) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    if (diff.includes('Silver') || diff.includes('Lv2') || diff.includes('Medium')) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 select-none overflow-y-auto bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl">
      {/* 1. 이 알고리즘을 써야 하는 순간 (패턴 치트시트) */}
      <div className="flex flex-col gap-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">💡</span>
          <span className="text-xs font-extrabold text-blue-300">
            언제 이 알고리즘을 사용해야 할까요? (실전 패턴)
          </span>
        </div>
        <ul className="flex flex-col gap-1.5 pt-1">
          {guideData.patterns.map((ptn, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
              <span className="text-blue-400 font-bold">✓</span>
              <span>{ptn}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. 대표 기출 문제 추천 목록 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <span className="text-xs font-extrabold text-indigo-300">
              코딩 테스트 대표 기출 문제 추천
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {guideData.problems.length}개 엄선
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {guideData.problems.map((prob, idx) => (
            <a
              key={idx}
              href={prob.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition-all group flex flex-col gap-1.5 shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold font-mono">
                    {prob.platform}
                  </span>
                  <span className="font-extrabold text-xs text-white group-hover:text-indigo-300 transition-colors">
                    {prob.title}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(
                    prob.platform,
                    prob.difficulty
                  )}`}
                >
                  {prob.difficulty}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-1">
                🔑 <strong className="text-slate-300 font-bold">풀이 포인트:</strong>{' '}
                {prob.keyTakeaway}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
