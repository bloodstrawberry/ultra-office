"use client";

import React from "react";

// =========================================================================
// [헤더 스타일 & 크기 조절 변수]
// 필요에 따라 헤더 높이, 패딩, 폰트 크기, 수직 위치 등을 이 변수에서 수정하실 수 있습니다.
// =========================================================================
/** 헤더 높이 및 패딩 */
export const HEADER_HEIGHT_CLASS = "h-14 px-4";

/** 타이틀 폰트 크기 */
export const TITLE_FONT_SIZE_CLASS = "text-lg sm:text-xl";

/** 뒤로가기 버튼 박스 크기 */
export const BUTTON_SIZE_CLASS = "w-8 h-8";

/** 뒤로가기 화살표 아이콘 크기 */
export const ARROW_ICON_SIZE_CLASS = "w-4.5 h-4.5";

/** 타이틀 전용 상단 공간(여백) 조절 변수 */
export const TITLE_TOP_SPACE_CLASS = "pt-0";

export interface StepHeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
}

export function StepHeader({
  title = "콕!",
  onBack,
  showBack = false,
  className = "",
}: StepHeaderProps) {
  const shouldShowBack = showBack || Boolean(onBack);

  return (
    <header
      className={`relative w-full flex items-center justify-between bg-white/70 backdrop-blur-md z-20 border-b border-slate-100 ${HEADER_HEIGHT_CLASS} ${className}`}
    >
      {/* 좌측 뒤로가기 버튼 슬롯 */}
      <div className="w-10 flex items-center justify-start shrink-0 h-full">
        {shouldShowBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`${BUTTON_SIZE_CLASS} flex items-center justify-center rounded-xl bg-white/90 text-slate-700 shadow-sm border border-slate-200 active:scale-95 transition-transform cursor-pointer`}
            aria-label="뒤로가기"
          >
            <svg
              className={`${ARROW_ICON_SIZE_CLASS} stroke-current stroke-[2.5]`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 중앙 타이틀 */}
      <div className="flex-1 flex items-center justify-center h-full">
        <h1
          className={`flex items-center justify-center font-extrabold text-slate-800 tracking-wider text-center font-jua leading-normal ${TITLE_FONT_SIZE_CLASS} ${TITLE_TOP_SPACE_CLASS}`}
        >
          {title}
        </h1>
      </div>

      {/* 우측 슬롯 (좌우 대칭 밸런스 유지) */}
      <div className="w-10 shrink-0 h-full" />
    </header>
  );
}
