'use client';

import React, { useState, useEffect } from 'react';

import { getAssetPath } from '../utils/asset';
import { useAssetLoader } from './asset-loader-context';

const ASSETS_TO_PRELOAD: string[] = [
  getAssetPath('/images/title.png'),
  getAssetPath('/logo.png'),
  getAssetPath('/images/background.png'),
  getAssetPath('/images/button-start.png'),
  getAssetPath('/images/button-editor.png'),
  getAssetPath('/images/button-rule.png'),
  getAssetPath('/images/button-setting.png'),
  getAssetPath('/personal-ad/dummy.png'),
  getAssetPath('/personal-ad/berry-hard-puzzle.png'),
  getAssetPath('/personal-ad/three-body-problem.png'),
  getAssetPath('/personal-ad/icecream-31.png'),
  getAssetPath('/personal-ad/lotto-viewer-mobile.png'),
  getAssetPath('/personal-ad/multi-touch-dice.png'),
  getAssetPath('/personal-ad/pi-master.png'),
  getAssetPath('/personal-ad/switch-on-diet.png'),
  getAssetPath('/personal-ad/ai-watermarker.png'),
  getAssetPath('/personal-ad/lotto-tax.png'),
  getAssetPath('/personal-ad/fish-bowl.png'),
  getAssetPath('/personal-ad/simple-photo.png'),
  getAssetPath('/sounds/bgm.mp3'),
];

export default function InitialAssetLoader() {
  const { markLoaderAsFinished } = useAssetLoader();
  const [progress, setProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const isFinishingRef = React.useRef<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    const startTime = Date.now();
    const DURATION_MS = 1500;
    const totalAssets = ASSETS_TO_PRELOAD.length;
    let completedCount = 0;
    let isPreloadFinished = totalAssets === 0;

    const finishLoading = () => {
      if (isFinishingRef.current || isCancelled) return;
      isFinishingRef.current = true;
      setProgress(100);

      setTimeout(() => {
        if (!isCancelled) {
          setIsLoaded(true);
          try {
            markLoaderAsFinished();
          } catch {
            // ignore
          }
          setTimeout(() => {
            if (!isCancelled) {
              setIsDismissed(true);
            }
          }, 500);
        }
      }, 300);
    };

    if (typeof window !== 'undefined') {
      ASSETS_TO_PRELOAD.forEach((src) => {
        try {
          if (src.endsWith('.mp3') || src.endsWith('.wav') || src.endsWith('.ogg')) {
            const audio = new Audio();
            let handled = false;
            const onDone = () => {
              if (handled) return;
              handled = true;
              completedCount++;
              if (completedCount >= totalAssets) isPreloadFinished = true;
            };
            audio.oncanplaythrough = onDone;
            audio.onerror = onDone;
            audio.src = src;
            audio.load();
            if (audio.readyState >= 3) onDone();
          } else {
            const img = new Image();
            let handled = false;
            const onDone = () => {
              if (handled) return;
              handled = true;
              completedCount++;
              if (completedCount >= totalAssets) isPreloadFinished = true;
            };
            img.onload = onDone;
            img.onerror = onDone;
            img.src = src;
            if (img.complete) onDone();
          }
        } catch {
          completedCount++;
          if (completedCount >= totalAssets) isPreloadFinished = true;
        }
      });
    }

    function tick() {
      if (isCancelled || isFinishingRef.current) return;

      const elapsed = Date.now() - startTime;
      const timeRatio = Math.min(1, elapsed / DURATION_MS);

      let currentProgress: number;
      if (isPreloadFinished || elapsed >= DURATION_MS) {
        currentProgress = Math.floor(timeRatio * 100);
      } else {
        currentProgress = Math.min(95, Math.floor(timeRatio * 95));
      }

      if (elapsed >= DURATION_MS) {
        clearInterval(intervalId);
        finishLoading();
      } else {
        setProgress((prev) => Math.max(prev, Math.max(1, currentProgress)));
      }
    }

    const intervalId: NodeJS.Timeout = setInterval(tick, 16);

    const hangTimeoutId = setTimeout(() => {
      if (!isCancelled && !isFinishingRef.current) {
        clearInterval(intervalId);
        finishLoading();
      }
    }, DURATION_MS + 2000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
      clearTimeout(hangTimeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isDismissed) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[url('/images/background.png')] bg-cover bg-center text-slate-800 select-none font-jua p-6 transition-opacity duration-500 ease-out ${
        isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Decorative background sparkles */}
      <div className="absolute top-12 left-10 text-blue-300/50 text-4xl animate-pulse pointer-events-none">
        ✦
      </div>
      <div className="absolute bottom-16 right-12 text-indigo-300/50 text-5xl animate-pulse pointer-events-none">
        ✦
      </div>
      <div className="absolute top-1/3 right-8 text-amber-300/50 text-3xl animate-bounce pointer-events-none">
        ★
      </div>

      {/* Main Loader Glass Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 flex flex-col items-center space-y-6 text-center">
        {/* Animated Logo with Circle Loading (Occupies ~50% of viewport width) */}
        <div className="relative w-[50vw] h-[50vw] max-w-[220px] max-h-[220px] min-w-[160px] min-h-[160px] flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[6px] border-rose-200 border-t-[#FF4B6E] animate-spin shadow-md" />
          <img
            src={getAssetPath('/logo.png')}
            alt="스네이크 퍼즐 로고"
            className="w-[78%] h-[78%] object-contain select-none relative z-10"
          />
        </div>

        {/* Title and Status Text */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">스네이크 퍼즐</h2>
          <p className="text-xs font-bold text-slate-500 tracking-wide">
            리소스를 불러오는 중입니다...
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-2">
          <div className="w-full bg-slate-100 rounded-full h-4 p-0.5 border border-rose-200/80 shadow-inner relative overflow-hidden">
            {/* Animated Progress Fill */}
            <div
              className="bg-gradient-to-r from-pink-500 via-[#FF4B6E] to-rose-600 h-full rounded-full transition-all duration-200 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-[#FF4B6E] px-1">
            <span>로딩 중</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
