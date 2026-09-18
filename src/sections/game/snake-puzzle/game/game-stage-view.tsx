'use client';

import React, { useRef, useState, useEffect } from 'react';

import { BUILTIN_LEVELS } from './types';
import SettingsModal from '../components/settings-modal';
import { getItem, getLocalSync } from '../utils/local-storage';
import StagePreviewModal from '../components/stage-preview-modal';

export interface GameStageViewProps {
  onSelectStage: (stageIndex: number) => void;
  onBackToHome: () => void;
  muted: boolean;
  setMuted?: (muted: boolean) => void;
  playSound: (
    type: 'coin' | 'select' | 'start' | 'error' | 'match' | 'fall' | 'shoot' | 'break',
    muted: boolean
  ) => void;
}

export default function GameStageView({
  onSelectStage,
  onBackToHome,
  muted,
  setMuted,
  playSound,
}: GameStageViewProps) {
  const [maxUnlocked, setMaxUnlocked] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [previewStageIndex, setPreviewStageIndex] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(5);

  const currentStageRef = useRef<HTMLButtonElement | null>(null);
  const stageGridContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const syncVal = getLocalSync('puzznic_max_unlocked');
    if (syncVal) {
      const parsed = parseInt(syncVal, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        setMaxUnlocked(parsed);
      }
    }
    setIsLoaded(true);

    const init = async () => {
      try {
        if (typeof window !== 'undefined' && document.fonts?.ready) {
          await Promise.race([document.fonts.ready, new Promise((res) => setTimeout(res, 200))]);
        }
        const stored = await Promise.race([
          getItem('puzznic_max_unlocked'),
          new Promise<string | null>((res) => setTimeout(() => res(null), 300)),
        ]);
        if (isMounted && stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed >= 1) {
            setMaxUnlocked(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to initialize stage view:', err);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // 현재 도전 중인 문제 카드 자동 포커스 스크롤 (헤더가 이동하지 않도록 내부 그리드만 스크롤)
  useEffect(() => {
    if (isLoaded && currentStageRef.current && stageGridContainerRef.current) {
      const timer = setTimeout(() => {
        const container = stageGridContainerRef.current;
        const target = currentStageRef.current;
        if (container && target) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const relativeTop = targetRect.top - containerRect.top + container.scrollTop;
          const targetScrollTop = relativeTop - container.clientHeight / 2 + targetRect.height / 2;
          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth',
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoaded]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const isLocalEnv = process.env.NEXT_PUBLIC_APP_ENV?.toUpperCase() === 'LOCAL';

  // 처음엔 50개만 보이고, 50번째 클리어 시(maxUnlocked > 50) 5개 단위로 확장
  const totalCount = BUILTIN_LEVELS.length;
  const visibleCount = isLocalEnv
    ? totalCount
    : Math.min(totalCount, Math.max(50, Math.ceil(maxUnlocked / 5) * 5));

  const visibleLevels = BUILTIN_LEVELS.slice(0, visibleCount);

  return (
    <div className="h-full min-h-0 flex-1 text-amber-950 flex flex-col items-center justify-start p-2 sm:p-4 relative overflow-hidden select-none w-full animate-fade-in">
      {/* 장식용 은은한 분위기 아우라 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 py-2 sm:py-3 gap-2 shrink-0">
        {/* 메인 메뉴 돌아가기 버튼 (밝은 농장 테마) */}
        <button
          type="button"
          onClick={() => {
            playSound('select', muted);
            onBackToHome();
          }}
          className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#FFFDF6]/90 hover:bg-[#FFFDF6] active:scale-95 text-amber-900 font-black text-xs sm:text-sm rounded-2xl shadow-md border-2 border-amber-400/80 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>◀</span>
          <span>메인 메뉴</span>
        </button>

        {/* 타이틀 & 설정 보드 (밝은 농장 테마) */}
        <button
          type="button"
          className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#FFFDF6]/90 hover:bg-[#FFFDF6] active:scale-95 text-amber-900 font-black text-xs sm:text-sm rounded-2xl shadow-md border-2 border-amber-400/80 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>🧩 문제 선택</span>
        </button>
      </div>

      {/* Stage Grid Container (Always 5 columns) */}
      <div
        ref={stageGridContainerRef}
        className="flex-1 w-full max-w-4xl z-10 overflow-y-auto min-h-0 px-1 py-1 sm:py-2 flex flex-col"
      >
        <div className="w-full py-1">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {visibleLevels.map((_, idx) => {
              const stageNum = idx + 1;
              const isUnlocked = isLocalEnv || stageNum <= maxUnlocked;
              const isCleared = stageNum < maxUnlocked;
              const isCurrent = stageNum === Math.min(maxUnlocked, totalCount);

              return (
                <button
                  key={`stage-card-${stageNum}`}
                  ref={isCurrent ? currentStageRef : undefined}
                  type="button"
                  onClick={() => {
                    if (isUnlocked) {
                      playSound('select', muted);
                      setPreviewStageIndex(idx);
                    } else {
                      playSound('error', muted);
                      showToast(`이전 문제를 클리어 해주세요!`);
                    }
                  }}
                  className={`relative group p-1.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer shadow-md overflow-hidden aspect-square isolate transform-gpu ${
                    isCurrent
                      ? 'bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200 border-amber-500 ring-4 ring-amber-400/90 shadow-xl shadow-amber-500/30 scale-105 z-20'
                      : isUnlocked
                        ? 'bg-gradient-to-b from-[#FFFDF6] via-amber-50/90 to-amber-100/80 border-amber-400/80 hover:border-amber-500 hover:scale-105 active:scale-95 shadow-amber-900/10'
                        : 'bg-amber-100/30 border-amber-200/60 opacity-70 cursor-not-allowed'
                  }`}
                >
                  {/* 은은한 광택 효과 (해금된 문제) */}
                  {isUnlocked && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-300/20 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  )}

                  {/* 상태 표시 뱃지 (상단 우측) */}
                  <div className="absolute top-1 right-1 sm:top-2.5 sm:right-2.5 z-10">
                    {isCleared ? (
                      <span
                        className="text-xs sm:text-sm bg-amber-300/90 text-amber-950 px-1.5 py-0.5 rounded-full font-black shadow-xs"
                        title="클리어 완료"
                      >
                        ⭐
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[9px] sm:text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-black shadow-xs flex items-center gap-0.5 animate-bounce">
                        🔥 TRY
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[9px] sm:text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black shadow-xs">
                        TRY
                      </span>
                    ) : null}
                  </div>

                  {/* 문제 번호 & LOCK 표시 */}
                  <div className="my-auto flex flex-col items-center justify-center gap-0.5 z-10">
                    <span
                      className={`text-xl sm:text-4xl md:text-5xl font-black tracking-tight ${
                        isCurrent
                          ? 'text-amber-950 scale-105'
                          : isUnlocked
                            ? 'text-amber-900'
                            : 'text-amber-900/30'
                      }`}
                    >
                      {stageNum}
                    </span>

                    {!isUnlocked && (
                      <span className="text-[9px] sm:text-xs font-black text-amber-900/70 bg-amber-200/70 px-1.5 py-0.2 rounded-md border border-amber-300/60 flex items-center gap-0.5">
                        🔒
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 1. 50번째(마지막) 문제를 클리어하여 해금 상태가 51 이상인 경우 - 흔들리는 제작 요청 자물쇠 버튼 */}
          {maxUnlocked > totalCount ? (
            <div className="w-full flex items-center justify-center mt-7 mb-3">
              <button
                type="button"
                onClick={() => {
                  playSound('select', muted);
                  setShowReviewModal(true);
                }}
                className="px-6 py-2.5 bg-[#FFFDF6] border-2 border-amber-400/90 hover:border-amber-500 rounded-2xl shadow-md text-amber-900 font-black text-xs sm:text-sm flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer animate-bounce"
                title="다음 문제 추가 제작 요청하기"
              >
                <span className="text-base sm:text-lg">🔒</span>
                <span>다음 문제 제작 요청하기</span>
              </button>
            </div>
          ) : (
            /* 2. 아직 50번째 문제를 클리어하지 않은 진행 중인 경우 - 정적 LOCK 버튼 */
            <div className="w-full flex items-center justify-center mt-3 mb-1">
              <button
                type="button"
                onClick={() => {
                  playSound('error', muted);
                  showToast(`${visibleCount}번 문제를 클리어 해주세요!`);
                }}
                className="px-6 py-2.5 bg-[#FFFDF6] border-2 border-amber-400/80 hover:border-amber-500 rounded-2xl shadow-md text-amber-900 font-black text-sm flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-base">🔒</span>
                <span>LOCK</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 게임 클리어 / 평점 및 리뷰 모달 (Bright Farm Theme) */}
      {showReviewModal && (
        <div className="fixed inset-0 pt-[80px] z-50 flex items-center justify-center p-4 bg-amber-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#FFFDF6] border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-amber-950 flex flex-col items-center gap-4 text-center animate-pop-in relative overflow-hidden">
            {/* 장식용 은은한 빛 효과 */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

            {/* 축하 트로피 / 선물 아이콘 */}
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-sm relative z-10 animate-bounce">
              🏆
            </div>

            <div className="flex flex-col gap-2 relative z-10">
              <h3 className="text-lg sm:text-xl font-black text-amber-900">
                모든 퍼즐을 완료하다니 대단해요! 👏
              </h3>
              <p className="text-xs sm:text-sm font-bold text-amber-800/90 leading-relaxed px-1">
                평점 및 소중한 리뷰를 남겨주시면 <br />
                분발해서 더 재미있는 다음 문제를 만들어 볼게요! 💖
              </p>
            </div>

            {/* 별점 선택 UI */}
            <div className="flex items-center gap-2 py-1 relative z-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={`review-star-${star}`}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl sm:text-3xl hover:scale-125 transition-transform cursor-pointer"
                  aria-label={`${star}점 별점 선택`}
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            {/* 버튼 액션 */}
            <div className="flex flex-col gap-2 w-full pt-1 relative z-10">
              <button
                type="button"
                onClick={() => {
                  showToast('소중한 평점에 감사드립니다! 힘을 내서 더 멋진 문제로 찾아올게요! 🌟');
                  setShowReviewModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                ⭐ 평점 및 리뷰 남기기
              </button>

              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="w-full py-2.5 bg-amber-200/70 hover:bg-amber-300/80 text-amber-900 font-bold text-xs rounded-xl border border-amber-400/50 active:scale-[0.98] transition-all cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

      {/* Stage Preview Modal */}
      <StagePreviewModal
        isOpen={previewStageIndex !== null}
        stageIndex={previewStageIndex ?? 0}
        levelData={previewStageIndex !== null ? (visibleLevels[previewStageIndex] ?? null) : null}
        hasPrev={previewStageIndex !== null && previewStageIndex > 0}
        hasNext={
          previewStageIndex !== null &&
          previewStageIndex < visibleLevels.length - 1 &&
          (isLocalEnv || previewStageIndex + 2 <= maxUnlocked)
        }
        onPrevStage={() => {
          if (previewStageIndex !== null && previewStageIndex > 0) {
            playSound('select', muted);
            setPreviewStageIndex(previewStageIndex - 1);
          }
        }}
        onNextStage={() => {
          if (
            previewStageIndex !== null &&
            previewStageIndex < visibleLevels.length - 1 &&
            (isLocalEnv || previewStageIndex + 2 <= maxUnlocked)
          ) {
            playSound('select', muted);
            setPreviewStageIndex(previewStageIndex + 1);
          }
        }}
        onClose={() => {
          playSound('select', muted);
          setPreviewStageIndex(null);
        }}
        onStart={() => {
          if (previewStageIndex !== null) {
            const idx = previewStageIndex;
            setPreviewStageIndex(null);
            playSound('start', muted);
            onSelectStage(idx);
          }
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-950/90 text-amber-100 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-amber-500/40 backdrop-blur-md animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
