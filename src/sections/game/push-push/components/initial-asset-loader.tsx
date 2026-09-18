'use client';

import React, { useState, useEffect, useRef } from 'react';

import { getAssetPath } from '../utils/asset';
import { useAssetLoader } from './asset-loader-context';

const ASSETS_TO_PRELOAD: string[] = [
  getAssetPath('/images/background.png'),
  getAssetPath('/images/button-start.png'),
  getAssetPath('/images/button-editor.png'),
  getAssetPath('/images/button-rule.png'),
  getAssetPath('/images/button-setting.png'),
  getAssetPath('/sounds/bgm.mp3'),
];

export default function InitialAssetLoader() {
  const { markLoaderAsFinished } = useAssetLoader();
  const [progress, setProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const isFinishingRef = useRef<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    const startTime = Date.now();
    const DURATION_MS = 600;
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
            if (!isCancelled) setIsDismissed(true);
          }, 300);
        }
      }, 150);
    };

    const updateProgress = () => {
      if (isCancelled || isFinishingRef.current) return;
      const elapsed = Date.now() - startTime;
      const timeRatio = Math.min(1, elapsed / DURATION_MS);
      const assetRatio = totalAssets > 0 ? completedCount / totalAssets : 1;
      const currentVal = Math.floor(Math.max(timeRatio * 0.7 + assetRatio * 0.3, timeRatio) * 100);

      setProgress(Math.min(currentVal, 99));

      if (timeRatio >= 1 && isPreloadFinished) {
        finishLoading();
      }
    };

    const intervalId = setInterval(updateProgress, 30);

    const onAssetLoaded = () => {
      completedCount += 1;
      if (completedCount >= totalAssets) {
        isPreloadFinished = true;
      }
      updateProgress();
    };

    ASSETS_TO_PRELOAD.forEach((src) => {
      if (src.endsWith('.mp3')) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.addEventListener('canplaythrough', onAssetLoaded, { once: true });
        audio.addEventListener('error', onAssetLoaded, { once: true });
        audio.src = src;
      } else {
        const img = new Image();
        img.onload = onAssetLoaded;
        img.onerror = onAssetLoaded;
        img.src = src;
      }
    });

    const fallbackTimeout = setTimeout(() => {
      finishLoading();
    }, 2000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
      clearTimeout(fallbackTimeout);
    };
  }, [markLoaderAsFinished]);

  if (isDismissed) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-amber-950 transition-opacity duration-300 pointer-events-none select-none ${
        isLoaded ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4 w-64">
        <div className="text-3xl animate-bounce">📦</div>
        <div className="text-white font-extrabold text-xl tracking-wider drop-shadow-md">
          푸시푸시 (Push Push)
        </div>
        <div className="w-full h-3 bg-amber-900/80 rounded-full overflow-hidden p-0.5 border border-amber-600/50 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-amber-200/80 text-xs font-semibold">{progress}% 로딩 중...</div>
      </div>
    </div>
  );
}
