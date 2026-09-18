'use client';

import type { GameViewProps } from './types';

import React, { useState } from 'react';

import { GameContent } from './game-content';
import { AD_TRIGGER_COUNT } from '../../utils/ad';
import { useBlockImagesPreloader } from '../../object';
import TossInterstitialAd from '../../toss/toss-interstitial-ad';
import GameLoadingView from '../../components/game-loading-view';
import {
  isAdPendingSync,
  resetAdCountsSync,
  clearAdPendingSync,
  incrementAdEventCountSync,
} from '../../utils/local-storage';

export default function GameView({ isEditor = false }: GameViewProps) {
  const [resetKey, setResetKey] = useState(0);
  const [isAdOpen, setIsAdOpen] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number | undefined>(undefined);
  const isLoaded = useBlockImagesPreloader();

  const handleFullReset = (stageNum?: number) => {
    if (stageNum !== undefined) {
      setCurrentStage(stageNum);
    }
    const count = incrementAdEventCountSync();
    if (isAdPendingSync() || count % AD_TRIGGER_COUNT === 0) {
      setIsAdOpen(true);
    }
    setResetKey((prev) => prev + 1);
  };

  const handleStageClearAd = (stageNum?: number) => {
    if (stageNum !== undefined) {
      setCurrentStage(stageNum);
    }
    const count = incrementAdEventCountSync();
    if (isAdPendingSync() || count % AD_TRIGGER_COUNT === 0) {
      setIsAdOpen(true);
    }
  };

  const handleStageSelect = (stageNum?: number) => {
    if (stageNum !== undefined) {
      setCurrentStage(stageNum);
    }
    const count = incrementAdEventCountSync();
    if (isAdPendingSync() || count % AD_TRIGGER_COUNT === 0) {
      setIsAdOpen(true);
    }
  };

  const handleAdCompleted = () => {
    resetAdCountsSync();
    clearAdPendingSync();
  };

  if (!isLoaded) {
    return <GameLoadingView />;
  }

  return (
    <>
      <GameContent
        key={resetKey}
        isEditor={isEditor}
        onFullReset={handleFullReset}
        onStageClearAd={handleStageClearAd}
        onStageSelect={handleStageSelect}
      />
      <TossInterstitialAd
        isOpen={isAdOpen}
        onClose={() => setIsAdOpen(false)}
        onAdCompleted={handleAdCompleted}
        ignoreCooldown
        stage={currentStage}
      />
    </>
  );
}

export * from './types';
