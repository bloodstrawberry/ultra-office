"use client";

import React from "react";
import { useAssetLoader } from "./components/asset-loader-context";
import { getAssetPath } from "./utils/asset";

// ==========================================
// 버튼 스타일 설정 변수 (자유롭게 조절 가능)
// ==========================================

/** 버튼 간격 (px 단위로 조절 가능) */
export const DEFAULT_BUTTON_GAP_PX = 0;

/** 게임 시작 버튼 글자 크기 (Tailwind 클래스 또는 원하는 크기) */
export const DEFAULT_START_FONT_SIZE = "text-3xl sm:text-3xl";

/** 일반 버튼(에디터, 규칙, 설정) 글자 크기 (Tailwind 클래스 또는 원하는 크기) */
export const DEFAULT_OTHER_FONT_SIZE = "text-3xl sm:text-3xl";

interface HomeButtonsProps {
  onNavigate: (path: string) => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  /** 버튼 사이 간격 (px 단위, 생략 시 DEFAULT_BUTTON_GAP_PX 적용) */
  gapPx?: number;
  /** 게임 시작 버튼 글자 크기 클래스 */
  startFontSize?: string;
  /** 일반 버튼 (에디터, 규칙, 설정) 글자 크기 클래스 */
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
  const isLocal =
    process.env.NEXT_PUBLIC_APP_ENV?.toUpperCase() === "LOCAL" ||
    process.env.NODE_ENV === "development";

  const getButtonStyle = (delayMs: number, bgImagePath: string) => {
    const baseStyle = {
      backgroundImage: `url(${getAssetPath(bgImagePath)})`,
    };
    if (!isLoaderFinished) {
      return {
        ...baseStyle,
        opacity: 0,
        transform: "scale(0)",
        pointerEvents: "none" as const,
      };
    }
    return {
      ...baseStyle,
      animationDelay: `${delayMs}ms`,
    };
  };

  const getButtonClass = () => {
    return isLoaderFinished ? "animate-button-pop" : "opacity-0";
  };

  const startDelay = 250;
  const editorDelay = 370;
  const ruleDelay = isLocal ? 490 : 370;
  const settingDelay = isLocal ? 610 : 490;

  return (
    <div
      className="w-full flex flex-col px-2 mt-1 mb-auto"
      style={{ gap: `${gapPx}px` }}
    >
      {/* 게임 시작 Button */}
      <button
        type="button"
        onClick={() => onNavigate("/game/delivery/play")}
        style={getButtonStyle(startDelay, "/delivery/images/button-start.png")}
        className={`w-full aspect-[280/80] bg-contain bg-center bg-no-repeat hover:brightness-110 active:scale-[0.97] text-white font-black flex items-center justify-center gap-3 transition-all cursor-pointer group pb-1.5 ${getButtonClass()}`}
      >
        <span
          className={`${startFontSize} group-hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
        >
          문제 풀기
        </span>
      </button>

      {/* 에디터 Button (NEXT_PUBLIC_APP_ENV === "LOCAL" 일 때만 표시) */}
      {isLocal && (
        <button
          type="button"
          onClick={() => onNavigate("/game/delivery/editor")}
          style={getButtonStyle(editorDelay, "/delivery/images/button-editor.png")}
          className={`w-full aspect-[280/80] bg-contain bg-center bg-no-repeat hover:brightness-110 active:scale-[0.97] text-white font-bold flex items-center justify-center gap-3 transition-all cursor-pointer group pb-1.5 ${getButtonClass()}`}
        >
          <span
            className={`${otherFontSize} group-hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
          >
            에디터
          </span>
        </button>
      )}

      {/* 규칙 Button */}
      <button
        type="button"
        onClick={onOpenRules}
        style={getButtonStyle(ruleDelay, "/delivery/images/button-rule.png")}
        className={`w-full aspect-[280/80] bg-contain bg-center bg-no-repeat hover:brightness-110 active:scale-[0.97] text-slate-100 font-bold flex items-center justify-center gap-3 transition-all cursor-pointer group pb-1.5 ${getButtonClass()}`}
      >
        <span
          className={`${otherFontSize} group-hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
        >
          규칙
        </span>
      </button>

      {/* 설정 Button */}
      <button
        type="button"
        onClick={onOpenSettings}
        style={getButtonStyle(settingDelay, "/delivery/images/button-setting.png")}
        className={`w-full aspect-[280/80] bg-contain bg-center bg-no-repeat hover:brightness-110 active:scale-[0.97] text-slate-100 font-bold flex items-center justify-center gap-3 transition-all cursor-pointer group pb-1.5 ${getButtonClass()}`}
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
