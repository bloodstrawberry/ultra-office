'use client';

import React from 'react';

import { getAssetPath } from './utils/asset';
import { useAssetLoader } from './components/asset-loader-context';

export const DEFAULT_BUTTON_GAP_PX = 0;
export const DEFAULT_START_FONT_SIZE = 'text-3xl sm:text-3xl';
export const DEFAULT_OTHER_FONT_SIZE = 'text-3xl sm:text-3xl';

interface HomeButtonsProps {
  onNavigate: (path: string) => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  gapPx?: number;
  startFontSize?: string;
  otherFontSize?: string;
}

export default function HomeButtons({
  onNavigate,
  onOpenRules,
  onOpenSettings,
  gapPx = DEFAULT_BUTTON_GAP_PX,
  startFontSize = DEFAULT_START_FONT_SIZE,
  otherFontSize = DEFAULT_OTHER_FONT_SIZE,
}: HomeButtonsProps) {
  const { isLoaderFinished } = useAssetLoader();

  const getButtonStyle = (delayMs: number, bgImagePath: string) => {
    const baseStyle = {
      backgroundImage: `url(${getAssetPath(bgImagePath)})`,
    };
    if (!isLoaderFinished) {
      return {
        ...baseStyle,
        opacity: 0,
        transform: 'scale(0)',
        pointerEvents: 'none' as const,
      };
    }
    return {
      ...baseStyle,
      animationDelay: `${delayMs}ms`,
    };
  };

  const getButtonClass = () => (isLoaderFinished ? 'animate-button-pop' : 'opacity-0');

  const startDelay = 250;
  const editorDelay = 370;
  const ruleDelay = 490;
  const settingDelay = 610;

  return (
    <div className="w-full flex flex-col px-2 mt-1 mb-auto" style={{ gap: `${gapPx}px` }}>
      {/* 게임 시작 Button */}
      <button
        type="button"
        onClick={() => onNavigate('game')}
        style={getButtonStyle(startDelay, '/images/button-start.png')}
        className={`w-full aspect-[280/80] bg-contain bg-center bg-no-repeat hover:brightness-110 active:scale-[0.97] text-white font-black flex items-center justify-center gap-3 transition-all cursor-pointer group pb-1.5 ${getButtonClass()}`}
      >
        <span
          className={`${startFontSize} group-hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
        >
          게임 시작
        </span>
      </button>

      {/* 에디터 Button */}
      <button
        type="button"
        onClick={() => onNavigate('editor')}
        style={getButtonStyle(editorDelay, '/images/button-editor.png')}
        className={`w-full aspect-[280/80] bg-contain bg-center bg-no-repeat hover:brightness-110 active:scale-[0.97] text-white font-bold flex items-center justify-center gap-3 transition-all cursor-pointer group pb-1.5 ${getButtonClass()}`}
      >
        <span
          className={`${otherFontSize} group-hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
        >
          에디터
        </span>
      </button>

      {/* 게임 규칙 Button */}
      <button
        type="button"
        onClick={onOpenRules}
        style={getButtonStyle(ruleDelay, '/images/button-rule.png')}
        className={`w-full aspect-[280/80] bg-contain bg-center bg-no-repeat hover:brightness-110 active:scale-[0.97] text-white font-bold flex items-center justify-center gap-3 transition-all cursor-pointer group pb-1.5 ${getButtonClass()}`}
      >
        <span
          className={`${otherFontSize} group-hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
        >
          게임 방법
        </span>
      </button>

      {/* 환경 설정 Button */}
      <button
        type="button"
        onClick={onOpenSettings}
        style={getButtonStyle(settingDelay, '/images/button-setting.png')}
        className={`w-full aspect-[280/80] bg-contain bg-center bg-no-repeat hover:brightness-110 active:scale-[0.97] text-white font-bold flex items-center justify-center gap-3 transition-all cursor-pointer group pb-1.5 ${getButtonClass()}`}
      >
        <span
          className={`${otherFontSize} group-hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
        >
          설정
        </span>
      </button>
    </div>
  );
}
