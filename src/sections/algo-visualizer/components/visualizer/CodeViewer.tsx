'use client';

import type { AlgorithmId } from '../../lib/algorithms/types';

import React, { useRef, useState, useEffect } from 'react';

import { getThemeById, DEFAULT_THEME_ID } from 'src/sections/code-runner/core/editor-themes';

import { useVisualizerStore } from '../../store/visualizerStore';
import { MULTI_LANG_CODES } from '../../lib/algorithms/multiLanguageCodes';

interface CodeViewerProps {
  code: string;
  activeLine: number;
  language?: string;
  algoId?: AlgorithmId;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, activeLine, algoId }) => {
  const { themeId = DEFAULT_THEME_ID } = useVisualizerStore();
  const currentTheme = getThemeById(themeId);

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
    <div
      className="w-full h-full flex flex-col rounded-3xl shadow-xl overflow-hidden backdrop-blur-md"
      style={{
        backgroundColor: currentTheme.uiColors.surface,
        borderColor: currentTheme.uiColors.border,
        borderWidth: 1,
        color: currentTheme.uiColors.text,
      }}
    >
      {/* 상단 탭 헤더 및 언어 셀렉터 */}
      <div
        className="flex flex-wrap items-center justify-between px-3.5 py-2.5 flex-shrink-0 gap-2"
        style={{
          backgroundColor: currentTheme.uiColors.card,
          borderBottom: `1px solid ${currentTheme.uiColors.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          {/* 4대 언어 전환 탭 */}
          <div
            className="flex items-center p-0.5 rounded-xl border"
            style={{
              backgroundColor: currentTheme.uiColors.bg,
              borderColor: currentTheme.uiColors.border,
            }}
          >
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
                    isSelected ? 'bg-blue-600 text-white shadow-sm' : 'hover:opacity-80'
                  }`}
                  style={{
                    color: isSelected ? '#ffffff' : currentTheme.uiColors.textMuted,
                  }}
                >
                  {labelMap[lang]}
                </button>
              );
            })}
          </div>
        </div>

        {selectedLang === 'typescript' ? (
          <div className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Line {activeLine}</span>
          </div>
        ) : (
          <span
            className="text-[10px] font-mono"
            style={{ color: currentTheme.uiColors.textMuted }}
          >
            참조 코드
          </span>
        )}
      </div>

      {/* 코드 줄 렌더링 영역 */}
      <div
        className="flex-1 overflow-y-auto p-3 font-mono text-xs sm:text-[13px] leading-relaxed"
        style={{
          backgroundColor: currentTheme.uiColors.surface,
        }}
      >
        {lines.map((lineText, index) => {
          const lineNumber = index + 1;
          const isActive = selectedLang === 'typescript' && lineNumber === activeLine;

          return (
            <div
              key={lineNumber}
              ref={isActive ? activeLineRef : null}
              className={`flex items-center px-2 py-0.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-blue-500/20 border-l-4 border-blue-500 font-bold shadow-md'
                  : 'hover:bg-slate-500/5'
              }`}
              style={{
                color: isActive
                  ? currentTheme.isDark
                    ? '#ffffff'
                    : '#0284c7'
                  : currentTheme.uiColors.text,
              }}
            >
              {/* 줄 번호 */}
              <span
                className="w-7 text-right select-none pr-3 text-[10px] font-mono"
                style={{
                  color: isActive ? '#0284c7' : currentTheme.uiColors.textMuted,
                  fontWeight: isActive ? 800 : 400,
                }}
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
