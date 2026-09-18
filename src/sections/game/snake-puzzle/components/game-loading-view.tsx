'use client';

import React from 'react';

import { getAssetPath } from '../utils/asset';

export interface GameLoadingViewProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function GameLoadingView({
  title = '그래픽 데이터 로딩 중...',
  description = '모든 블록 리소스를 준비하고 있습니다',
  className = '',
}: GameLoadingViewProps) {
  return (
    <div
      className={`h-full min-h-full bg-amber-950/20 backdrop-blur-xs flex flex-col items-center justify-center p-4 select-none animate-fade-in ${className}`}
    >
      <div className="w-full max-w-sm sm:max-w-md bg-[#FFFDF6] border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-amber-950 flex flex-col items-center gap-6 animate-pop-in relative overflow-hidden">
        {/* 장식용 은은한 빛 효과 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* 로고와 원형 로딩 스피너 (화면 절반 크기) */}
        <div className="relative w-[50vw] h-[50vw] max-w-[220px] max-h-[220px] min-w-[160px] min-h-[160px] flex items-center justify-center">
          <div className="absolute inset-0 border-[6px] border-rose-200 border-t-[#FF4B6E] rounded-full animate-spin shadow-xs" />
          <img
            src={getAssetPath('/logo.png')}
            alt="베리 하드 퍼즐 로고"
            className="w-[78%] h-[78%] object-contain select-none relative z-10"
          />
        </div>

        <div className="text-center relative z-10">
          <h2 className="text-lg sm:text-xl font-black text-amber-900 mb-1 flex items-center justify-center gap-1.5">
            {title}
          </h2>
          {description && (
            <p className="text-xs sm:text-sm font-bold text-amber-800/70">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
