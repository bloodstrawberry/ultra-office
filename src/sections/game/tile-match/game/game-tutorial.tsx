'use client';

import type { Position } from './types';

import { createPortal } from 'react-dom';
import React, { useRef, useState, useEffect } from 'react';

export type TutorialStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface GameTutorialProps {
  levelIndex: number;
  isEditor: boolean;
  playTestMode: boolean;
  grabbed: boolean;
  cursor?: Position;
  isMenuOpen: boolean;
  showTouchGuideModal?: boolean;
  onCloseMenu?: () => void;
  onOpenTouchGuide?: () => void;
  onCloseTouchGuide?: () => void;
  onStepChange?: (step: TutorialStep) => void;
}

export default function GameTutorial({
  levelIndex,
  isEditor,
  playTestMode,
  grabbed,
  cursor,
  isMenuOpen,
  showTouchGuideModal,
  onCloseMenu,
  onOpenTouchGuide,
  onCloseTouchGuide,
  onStepChange,
}: GameTutorialProps) {
  const [step, setStep] = useState<number>(1);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const prevCursorRef = useRef<Position | null>(null);

  // Mount check for SSR / Portal safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset tutorial state whenever Stage 1 is loaded/reloaded
  useEffect(() => {
    if (levelIndex === 0 && !isEditor && !playTestMode) {
      setStep(1);
      setMoveCount(0);
      prevCursorRef.current = null;
    }
  }, [levelIndex, isEditor, playTestMode]);

  // Notify parent on step change
  useEffect(() => {
    const activeStep = Math.floor(step) as TutorialStep;
    onStepChange?.(activeStep);
  }, [step, onStepChange]);

  const step2InitialCursorRef = useRef<Position | null>(null);

  // Step 1 -> 2: Triggered when user selects/grabs the block
  useEffect(() => {
    if (step === 1 && grabbed) {
      setStep(2);
      step2InitialCursorRef.current = cursor || null;
    }
  }, [step, grabbed, cursor]);

  // Step 2 -> 3: Advance to Step 3 after 1 successful left movement in Step 2
  useEffect(() => {
    if (step !== 2 || !grabbed || !cursor) return;

    if (!step2InitialCursorRef.current) {
      step2InitialCursorRef.current = cursor;
      return;
    }

    if (
      cursor.x !== step2InitialCursorRef.current.x ||
      cursor.y !== step2InitialCursorRef.current.y
    ) {
      // Step 2 left movement completed
      setStep(3);
      setMoveCount(0);
      prevCursorRef.current = cursor;
    }
  }, [step, grabbed, cursor]);

  // Step 3 -> 4: Track 4 NEW actual successful block movements in Step 3
  useEffect(() => {
    if (step !== 3 || !grabbed || !cursor) return;

    if (!prevCursorRef.current) {
      prevCursorRef.current = cursor;
      return;
    }

    if (prevCursorRef.current.x !== cursor.x || prevCursorRef.current.y !== cursor.y) {
      prevCursorRef.current = cursor;
      setMoveCount((prev) => {
        const next = prev + 1;
        if (next >= 4) {
          setStep(4);
        }
        return next;
      });
    }
  }, [step, grabbed, cursor]);

  // Step 4 -> 5: Advance when menu opens
  useEffect(() => {
    if (step === 4 && isMenuOpen) {
      setStep(5);
    }
  }, [step, isMenuOpen]);

  // Step 5 -> 6: Advance when user clicks "터치 이동" in menu
  useEffect(() => {
    if (step !== 5) return undefined;
    const handleTouchMoveClick = (e: MouseEvent) => {
      const touchBtn = document.querySelector('[data-tutorial="touch-move-btn"]');
      if (touchBtn && touchBtn.contains(e.target as Node)) {
        setStep(6);
      }
    };
    window.addEventListener('click', handleTouchMoveClick, true);
    return () => window.removeEventListener('click', handleTouchMoveClick, true);
  }, [step]);

  // Step 6.5 -> 7: Advance when user clicks "확인" or "✕" in TouchMoveGuideModal
  useEffect(() => {
    if (step !== 6.5) return undefined;
    const handleGuideCloseClick = (e: MouseEvent) => {
      const closeBtns = document.querySelectorAll('[data-tutorial="touch-guide-close-btn"]');
      const targetNode = e.target as Node;
      for (let i = 0; i < closeBtns.length; i++) {
        if (closeBtns[i].contains(targetNode)) {
          onCloseTouchGuide?.();
          onCloseMenu?.();
          setStep(7);
          break;
        }
      }
    };
    window.addEventListener('click', handleGuideCloseClick, true);
    return () => window.removeEventListener('click', handleGuideCloseClick, true);
  }, [step, onCloseTouchGuide, onCloseMenu]);

  // Step 7 auto-completion timer: Fades out after 3.5s
  useEffect(() => {
    if (step === 7) {
      const timer = setTimeout(() => {
        setStep(8);
      }, 3500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [step]);

  // Strict Event Interceptor: Blocks all clicks/touches outside current step's target element
  useEffect(() => {
    if (levelIndex !== 0 || isEditor || playTestMode || step >= 7) return undefined;

    const handleIntercept = (e: Event) => {
      const targetNode = e.target as Node;
      if (!targetNode) return;

      // Always allow clicks on tutorial skip/close button
      const skipBtns = document.querySelectorAll('[data-tutorial-skip="true"]');
      for (let i = 0; i < skipBtns.length; i++) {
        if (skipBtns[i].contains(targetNode)) {
          return;
        }
      }

      const allowedElements: Element[] = [];
      if (step === 1) {
        const el = document.querySelector('[data-tutorial-cell="1-6"]');
        if (el) allowedElements.push(el);
      } else if (step === 2) {
        const el = document.querySelector('[data-tutorial="left-btn"]');
        if (el) allowedElements.push(el);
      } else if (step === 3) {
        const left = document.querySelector('[data-tutorial="left-btn"]');
        if (left) allowedElements.push(left);
      } else if (step === 4) {
        const el = document.querySelector('[data-tutorial="menu-btn"]');
        if (el) allowedElements.push(el);
      } else if (step === 5) {
        const el = document.querySelector('[data-tutorial="touch-move-btn"]');
        if (el) allowedElements.push(el);
      } else if (step === 6) {
        const el = document.querySelector('[data-tutorial="step6-confirm-btn"]');
        if (el) allowedElements.push(el);
      } else if (step === 6.5) {
        const closeBtns = document.querySelectorAll('[data-tutorial="touch-guide-close-btn"]');
        closeBtns.forEach((btn) => allowedElements.push(btn));
      }

      const isAllowed = allowedElements.some((el) => el.contains(targetNode));
      if (!isAllowed) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const events = ['click', 'mousedown', 'pointerdown', 'touchstart'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleIntercept, true);
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleIntercept, true);
      });
    };
  }, [step, levelIndex, isEditor, playTestMode]);

  // Determine selector for current active step
  const getTargetSelector = (): string | null => {
    switch (step) {
      case 1:
        // Topmost block in Stage 1 is at y=1, x=6
        return '[data-tutorial-cell="1-6"]';
      case 2:
        return '[data-tutorial="left-btn"]';
      case 3:
        return '[data-tutorial="left-btn"]';
      case 4:
        return '[data-tutorial="menu-btn"]';
      case 5:
        return '[data-tutorial="touch-move-btn"]';
      case 6.5:
        return '[data-tutorial="touch-guide-close-btn"]';
      default:
        return null;
    }
  };

  // Continuously track target element position
  const targetSelector = getTargetSelector();
  useEffect(() => {
    if (!targetSelector) {
      setTargetRect(null);
      return undefined;
    }

    const updateRect = () => {
      const el = document.querySelector(targetSelector);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const interval = setInterval(updateRect, 100);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [targetSelector, step]);

  // Return null if not in Stage 1, or in editor/playtest, or tutorial completed
  if (levelIndex !== 0 || isEditor || playTestMode || step >= 8 || !mounted) {
    return null;
  }

  // Tutorial Instruction Text according to step requirements
  const getInstructionText = (): string => {
    switch (Math.floor(step)) {
      case 1:
        return '1. 블록을 터치해보세요.';
      case 2:
        return '2. 왼쪽 버튼을 클릭해보세요.';
      case 3:
        return `3. 계속 움직여보세요. (${moveCount}/4)`;
      case 4:
        return '4. 목록 버튼을 눌러보세요.';
      case 5:
        return '5. 터치 이동 버튼을 눌러보세요.';
      case 6:
        return step === 6.5
          ? '6. 모달의 확인 또는 ✕ 버튼을 클릭해보세요.'
          : '6. 설명 확인 버튼을 클릭해보세요.';
      case 7:
        return '7. 이제 모든 블럭을 제거해보세요!';
      default:
        return '';
    }
  };

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none font-sans">
      {/* ── Focused Element Glowing Pulse Ring ── */}
      {targetRect && (step <= 5 || step === 6.5) && (
        <div
          className="absolute rounded-2xl border-4 border-amber-400 bg-amber-300/20 shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse transition-all duration-300 ease-out pointer-events-none"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* ── Bouncing Hand Pointer Icon ── */}
      {targetRect && (step <= 5 || step === 6.5) && (
        <div
          className="absolute z-[999999] flex items-center justify-center pointer-events-none animate-bounce transition-all duration-300 ease-out"
          style={{
            top:
              step === 4 || step === 5 || step === 6.5
                ? targetRect.bottom + 8
                : targetRect.top - 48,
            left: targetRect.left + targetRect.width / 2 - 20,
          }}
        >
          <span className="text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            {step === 4 || step === 5 || step === 6.5 ? '👆' : '👇'}
          </span>
        </div>
      )}

      {/* ── Top Instruction Banner (Steps 1 to 6.5) ── */}
      {step <= 6.5 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md pointer-events-auto">
          <div
            className="bg-[#cb7c3e] border-[3px] sm:border-[4px] border-[#592a11] rounded-2xl p-3 sm:p-4 text-center shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_2px_0_rgba(255,255,255,0.3)] animate-pop-in relative overflow-hidden"
            style={{
              boxShadow:
                'inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(60,25,5,0.3), 0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {/* Force Exit / Skip Tutorial Button */}
            <button
              type="button"
              data-tutorial-skip="true"
              onClick={() => {
                if (showTouchGuideModal) {
                  onCloseTouchGuide?.();
                }
                if (isMenuOpen) {
                  onCloseMenu?.();
                }
                setStep(8);
              }}
              className="absolute top-2 right-2 px-2 py-0.5 bg-[#592a11]/90 hover:bg-[#381708] active:scale-90 text-amber-100 hover:text-white font-black text-xs rounded-xl border border-amber-300/40 transition-all cursor-pointer shadow-xs z-20 flex items-center gap-1"
              title="튜토리얼 강제 종료"
              aria-label="튜토리얼 강제 종료"
            >
              <span>✕</span>
            </button>

            {/* Step Badge */}
            <div className="inline-block bg-[#592a11] text-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full mb-1">
              튜토리얼 STEP {Math.floor(step)} / 7
            </div>

            {/* Instruction Message */}
            <div
              className="text-base sm:text-lg font-black text-white leading-tight tracking-wide antialiased"
              style={{
                WebkitTextStroke: '1px #592a11',
                paintOrder: 'stroke fill',
                textShadow:
                  '0 2px 0 #592a11, -1px -1px 0 #592a11, 1px -1px 0 #592a11, -1px 1px 0 #592a11, 1px 1px 0 #592a11',
              }}
            >
              {getInstructionText()}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 6: Modal Explanation & Confirm Button ── */}
      {step === 6 && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-amber-950/60 backdrop-blur-sm pointer-events-auto animate-fade-in">
          <div className="w-full max-w-sm sm:max-w-md bg-[#FFFDF6] border-4 border-amber-400 rounded-3xl p-5 shadow-2xl text-amber-950 flex flex-col gap-3 animate-pop-in text-center relative overflow-hidden">
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-amber-100 border-2 border-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                👆
              </div>
              <h3 className="text-lg sm:text-xl font-black text-amber-950">
                터치 이동 기능 설정 완료!
              </h3>
            </div>

            {/* Content Explanation */}
            <p className="text-sm font-bold text-amber-900 leading-relaxed bg-amber-100/70 p-3 rounded-2xl border border-amber-300/80">
              터치 이동 기능이 활성화되었습니다!
              <br />
              이제 하단 버튼을 누르지 않아도 화면의 블럭을 직접 터치하거나 끌어서 자유롭게 이동시킬
              수 있습니다.
            </p>

            {/* Step 6 Confirm Button: Opens "화면 터치 이동 이란?" guide modal */}
            <button
              type="button"
              data-tutorial="step6-confirm-btn"
              onClick={() => {
                onOpenTouchGuide?.();
                setStep(6.5);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-base rounded-2xl border-2 border-amber-700 shadow-md cursor-pointer transition-all"
            >
              설명 확인
            </button>
          </div>
        </div>
      )}

      {/* ── Step 7: Final Encouragement Toast ── */}
      {step === 7 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md pointer-events-auto animate-pop-in">
          <div
            className="bg-emerald-600 border-[3px] sm:border-[4px] border-emerald-900 rounded-2xl p-4 text-center shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden"
            style={{
              boxShadow:
                'inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(10,50,20,0.4), 0 10px 30px rgba(0,0,0,0.4)',
            }}
          >
            <div className="text-xs font-black text-emerald-200 uppercase tracking-widest mb-1">
              TUTORIAL COMPLETE
            </div>
            <div
              className="text-lg sm:text-xl font-black text-white leading-snug tracking-wide"
              style={{
                WebkitTextStroke: '1px #064e3b',
                paintOrder: 'stroke fill',
                textShadow: '0 2px 0 #064e3b',
              }}
            >
              🎉 이제 모든 블럭을 제거해보세요! 🎉
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
