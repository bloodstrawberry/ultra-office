'use client';

import React from 'react';

import { BUILTIN_LEVELS } from '../utils/types';

interface SoundPlayFn {
  (
    type: 'coin' | 'select' | 'start' | 'error' | 'match' | 'fall' | 'shoot' | 'break',
    muted: boolean
  ): void;
}

export interface GameAllClearModalProps {
  finalRating: number;
  setFinalRating: (rating: number) => void;
  onBackToStageSelect?: () => void;
  muted: boolean;
  playSound: SoundPlayFn;
}

export function GameAllClearModal({
  finalRating,
  setFinalRating,
  onBackToStageSelect,
  muted,
  playSound,
}: GameAllClearModalProps) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-amber-950/50 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xs sm:max-w-sm bg-[#FFFDF6] border-4 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl text-amber-950 flex flex-col items-center gap-4 text-center animate-pop-in relative overflow-hidden">
        {/* Festive background glows */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-300/40 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-300/40 rounded-full blur-2xl pointer-events-none animate-pulse" />

        {/* Floating party decorations */}
        <span className="absolute top-3 left-4 text-xl sm:text-2xl animate-bounce pointer-events-none delay-75">
          🎉
        </span>
        <span className="absolute top-3 right-4 text-xl sm:text-2xl animate-bounce pointer-events-none delay-200">
          🎊
        </span>
        <span className="absolute bottom-4 left-4 text-lg pointer-events-none opacity-80 animate-pulse">
          ✨
        </span>
        <span className="absolute bottom-4 right-4 text-lg pointer-events-none opacity-80 animate-pulse">
          🌟
        </span>

        {/* Trophy Header */}
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-md relative z-10 animate-bounce">
          🏆
        </div>

        <div className="flex flex-col gap-1.5 relative z-10">
          <h2
            className="text-xl sm:text-2xl font-black text-amber-900 tracking-tight"
            style={{
              textShadow: '0 2px 4px rgba(180, 83, 9, 0.2)',
            }}
          >
            ALL CLEAR! 👏
          </h2>
          <p className="text-xs sm:text-sm font-extrabold text-amber-800/90 leading-relaxed px-1">
            준비된 모든 문제를 해결하셨어요!
            <br />
            소중한 평점과 리뷰를 남겨주시면
            <br /> 더 많은 문제가 업데이트됩니다. 💖
          </p>
        </div>

        {/* Star rating selection */}
        <div className="flex items-center gap-2 py-1 relative z-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={`all-clear-star-${star}`}
              type="button"
              onClick={() => setFinalRating(star)}
              className="text-3xl sm:text-4xl hover:scale-125 transition-transform cursor-pointer drop-shadow-sm"
              aria-label={`${star}점 선택`}
            >
              {star <= finalRating ? '⭐' : '☆'}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5 w-full pt-1 relative z-10">
          <button
            type="button"
            onClick={() => {
              if (onBackToStageSelect) {
                onBackToStageSelect();
              } else {
                window.dispatchEvent(new CustomEvent('very-hard-puzzle-go-home'));
              }
            }}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all cursor-pointer border border-emerald-400/40"
          >
            ⭐ 모든 스테이지 클리어 완료!
          </button>

          {onBackToStageSelect && (
            <button
              type="button"
              onClick={() => {
                playSound('select', muted);
                onBackToStageSelect();
              }}
              className="w-full py-2.5 bg-amber-100/90 hover:bg-amber-200/90 text-amber-950 font-black text-xs sm:text-sm rounded-2xl border border-amber-300/80 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              📋 문제 선택으로
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface GameClearModalProps {
  levelIndex: number;
  isEditor: boolean;
  setGrabbed: (grabbed: boolean) => void;
  loadLevel: (index: number) => void;
  resetLevel: () => void;
  playSound: SoundPlayFn;
  muted: boolean;
  onBackToStageSelect?: () => void;
}

export function GameClearModal({
  levelIndex,
  isEditor,
  setGrabbed,
  loadLevel,
  resetLevel,
  playSound,
  muted,
  onBackToStageSelect,
}: GameClearModalProps) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-amber-950/50 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xs sm:max-w-sm bg-[#FFFDF6] border-4 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl text-amber-950 flex flex-col items-center gap-4 text-center animate-pop-in relative overflow-hidden">
        {/* Festive background glows */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-300/40 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-300/40 rounded-full blur-2xl pointer-events-none animate-pulse" />

        {/* Floating party decorations */}
        <span className="absolute top-3 left-4 text-xl sm:text-2xl animate-bounce pointer-events-none delay-75">
          🎉
        </span>
        <span className="absolute top-3 right-4 text-xl sm:text-2xl animate-bounce pointer-events-none delay-200">
          🎊
        </span>
        <span className="absolute bottom-4 left-4 text-lg pointer-events-none opacity-80 animate-pulse">
          ✨
        </span>
        <span className="absolute bottom-4 right-4 text-lg pointer-events-none opacity-80 animate-pulse">
          🌟
        </span>

        {/* 3 Golden Stars Celebration Header */}
        <div className="flex items-center justify-center gap-1.5 pt-1 relative z-10">
          <span className="text-3xl sm:text-4xl drop-shadow-[0_4px_8px_rgba(234,179,8,0.6)] animate-bounce delay-75">
            ⭐
          </span>
          <span className="text-4xl sm:text-5xl drop-shadow-[0_6px_12px_rgba(234,179,8,0.8)] animate-bounce -translate-y-2">
            🌟
          </span>
          <span className="text-3xl sm:text-4xl drop-shadow-[0_4px_8px_rgba(234,179,8,0.6)] animate-bounce delay-150">
            ⭐
          </span>
        </div>

        {/* Main Title Banner */}
        <div className="flex flex-col items-center gap-1 relative z-10 w-full">
          <div className="px-3 py-1 bg-amber-200/90 border-2 border-amber-400/80 rounded-full shadow-xs inline-flex items-center gap-1 mb-0.5">
            <span className="text-xs sm:text-sm font-black text-amber-900 tracking-wider">
              문제 {levelIndex + 1}
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight leading-none"
            style={{
              WebkitTextStroke: '1px #065f46',
              paintOrder: 'stroke fill',
              textShadow: '0 3px 6px rgba(5, 150, 105, 0.4)',
            }}
          >
            문제 클리어!
          </h2>
          <p className="text-xs sm:text-sm font-extrabold text-amber-800/90 mt-1">
            축하합니다! 성공적으로 완료했어요!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-2 relative z-10">
          <button
            type="button"
            onClick={() => {
              setGrabbed(false);
              if (!isEditor) {
                const nextIdx = (levelIndex + 1) % BUILTIN_LEVELS.length;
                loadLevel(nextIdx);
              } else {
                resetLevel();
              }
              playSound('start', muted);
            }}
            className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.97] transition-all text-white rounded-2xl text-base sm:text-lg font-black cursor-pointer tracking-wider shadow-lg shadow-emerald-600/30 border border-emerald-400/50 flex items-center justify-center gap-2"
          >
            <span>{isEditor ? '확인' : '다음 문제'}</span>
          </button>

          {onBackToStageSelect && !isEditor && (
            <button
              type="button"
              onClick={() => {
                playSound('select', muted);
                onBackToStageSelect();
              }}
              className="w-full py-2.5 bg-amber-100/90 hover:bg-amber-200/90 active:scale-[0.98] text-amber-950 font-black rounded-2xl text-xs sm:text-sm cursor-pointer transition-all border border-amber-300/80 shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>📋 목록으로</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface GameOverModalProps {
  isEditor: boolean;
  setGrabbed: (grabbed: boolean) => void;
  resetLevel: () => void;
  onFullReset?: (stage?: number) => void;
  playSound: SoundPlayFn;
  muted: boolean;
  onBackToStageSelect?: () => void;
  levelIndex?: number;
}

export function GameOverModal({
  isEditor,
  setGrabbed,
  resetLevel,
  onFullReset,
  playSound,
  muted,
  onBackToStageSelect,
  levelIndex,
}: GameOverModalProps) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-amber-950/50 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xs sm:max-w-sm bg-[#FFFDF6] border-4 border-rose-400/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-amber-950 flex flex-col items-center gap-4 text-center animate-pop-in relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-4xl shadow-md relative z-10 animate-bounce">
          ⏳
        </div>

        <div className="flex flex-col gap-1 relative z-10">
          <h2 className="text-xl sm:text-2xl font-black text-rose-900 tracking-tight">
            시간 초과!
          </h2>
          <p className="text-xs sm:text-sm font-extrabold text-rose-800/90">
            제한 시간 안에 퍼즐을 풀지 못했습니다. 다시 시도해 보세요!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-2 relative z-10">
          <button
            type="button"
            onClick={() => {
              setGrabbed(false);
              if (!isEditor && onFullReset) {
                onFullReset(levelIndex !== undefined ? levelIndex + 1 : undefined);
              } else {
                resetLevel();
              }
              playSound('start', muted);
            }}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.97] transition-all text-white rounded-2xl text-base sm:text-lg font-black cursor-pointer tracking-wider shadow-lg shadow-emerald-600/30 border border-emerald-400/50 flex items-center justify-center gap-2"
          >
            <span>🔄 다시 도전</span>
          </button>

          {onBackToStageSelect && !isEditor && (
            <button
              type="button"
              onClick={() => {
                playSound('select', muted);
                onBackToStageSelect();
              }}
              className="w-full py-2.5 bg-amber-100/90 hover:bg-amber-200/90 active:scale-[0.98] text-amber-950 font-black rounded-2xl text-xs sm:text-sm cursor-pointer transition-all border border-amber-300/80 shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>📋 목록으로</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playSound('select', muted);
              window.dispatchEvent(new CustomEvent('very-hard-puzzle-go-home'));
            }}
            className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 active:scale-[0.98] transition-all cursor-pointer"
          >
            메인 메뉴로
          </button>
        </div>
      </div>
    </div>
  );
}
