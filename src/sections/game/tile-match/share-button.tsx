'use client';

import React from 'react';

import { isSfxMuted } from './utils/sound';
import { playEngineSound } from './game/sound';

export interface ShareButtonProps {
  appName?: string;
  ogImageUrl?: string;
  onShowToast?: (msg: string) => void;
}

export default function ShareButton({
  appName: _appName = 'tile-match',
  ogImageUrl: _ogImageUrl,
  onShowToast,
}: ShareButtonProps) {
  async function handleClick() {
    const muted = isSfxMuted();
    playEngineSound('select', muted);

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: '턴제 사천성',
          text: '두뇌 트레이닝 턴제 퍼즐! 턴제 사천성을 플레이해보세요.',
          url: window.location.href,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        onShowToast?.('링크가 클립보드에 복사되었습니다! 📋');
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('공유하기 에러:', err);
      }
    }
  }

  return (
    <div className="relative group inline-flex items-center justify-center">
      <button
        type="button"
        onClick={handleClick}
        aria-label="공유하기"
        className="relative p-3.5 bg-gradient-to-br from-purple-400 via-fuchsia-500 to-indigo-500 hover:from-purple-300 hover:via-fuchsia-400 hover:to-indigo-400 text-white rounded-full shadow-[0_6px_20px_rgba(168,85,247,0.45)] border-2 border-purple-100/90 hover:scale-115 active:scale-90 transition-all duration-300 cursor-pointer flex items-center justify-center animate-bounce overflow-hidden"
        style={{ animationDuration: '2.6s' }}
      >
        {/* Inner Splash Effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-300/50 via-purple-200/60 to-violet-300/50 opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 pointer-events-none" />
        <span className="absolute inset-0 rounded-full bg-purple-300/40 opacity-0 group-hover:opacity-100 animate-ping pointer-events-none" />

        {/* Inner Icon Container */}
        <span className="relative z-10 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 drop-shadow-md">
          <svg
            className="w-6 h-6 text-white stroke-[2.8]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </span>
      </button>

      {/* Hover Tooltip */}
      <span className="absolute left-full ml-2.5 px-2.5 py-1 bg-purple-950 text-purple-100 font-extrabold text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none border border-purple-400/60 z-30">
        공유하기
      </span>
    </div>
  );
}
