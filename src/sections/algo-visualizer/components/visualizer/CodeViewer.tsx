'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MULTI_LANG_CODES } from '../../lib/algorithms/multiLanguageCodes';
import { AlgorithmId } from '../../lib/algorithms/types';

interface CodeViewerProps {
  code: string;
  activeLine: number;
  language?: string;
  algoId?: AlgorithmId;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, activeLine, algoId }) => {
  const [selectedLang, setSelectedLang] = useState<'typescript' | 'python' | 'cpp' | 'java'>(
    'typescript'
  );
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const multiCodes = algoId ? MULTI_LANG_CODES[algoId] : null;

  const currentCodeToDisplay =
    selectedLang === 'typescript' ? code : multiCodes ? multiCodes[selectedLang] || code : code;

  const lines = currentCodeToDisplay.trim().split('\n');

  useEffect(() => {
    if (activeLineRef.current && selectedLang === 'typescript') {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeLine, selectedLang]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* 상단 탭 헤더 및 언어 셀렉터 */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          {/* 4대 언어 전환 탭 */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
            {(['typescript', 'python', 'cpp', 'java'] as const).map((lang) => {
              const labelMap = {
                typescript: 'TS',
                python: 'Python',
                cpp: 'C++',
                java: 'Java',
              };
              const isSelected = selectedLang === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {labelMap[lang]}
                </button>
              );
            })}
          </div>
        </div>

        {selectedLang === 'typescript' ? (
          <div className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-800/60 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Line {activeLine}</span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono">참조 코드</span>
        )}
      </div>

      {/* 코드 줄 렌더링 영역 */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs sm:text-[13px] leading-relaxed">
        {lines.map((lineText, index) => {
          const lineNumber = index + 1;
          const isActive = selectedLang === 'typescript' && lineNumber === activeLine;

          return (
            <div
              key={lineNumber}
              ref={isActive ? activeLineRef : null}
              className={`flex items-center px-2 py-0.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/30 border-l-4 border-blue-400 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* 줄 번호 */}
              <span
                className={`w-7 text-right select-none pr-3 text-[10px] font-mono ${
                  isActive ? 'text-blue-300 font-extrabold' : 'text-slate-600'
                }`}
              >
                {lineNumber}
              </span>

              {/* 코드 본문 */}
              <pre className="flex-1 overflow-x-auto whitespace-pre font-mono">
                <code>{lineText}</code>
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};
