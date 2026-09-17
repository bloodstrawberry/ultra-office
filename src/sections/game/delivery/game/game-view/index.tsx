"use client";

import React, { useState, useEffect } from "react";
import { GameContent } from "./game-content";
import { useBlockImagesPreloader } from "../../object";
import TossInterstitialAd from "../../toss/toss-interstitial-ad";
import GameLoadingView from "../../components/game-loading-view";
import {
  incrementAdEventCountSync,
  resetAdCountsSync,
  isAdPendingSync,
  clearAdPendingSync,
} from "../../utils/local-storage";
import { AD_TRIGGER_COUNT } from "../../utils/ad";
import { GameViewProps } from "./types";

export default function GameView({ isEditor = false }: GameViewProps) {
  const [resetKey, setResetKey] = useState(0);
  const [isAdOpen, setIsAdOpen] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number | undefined>(
    undefined,
  );
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
        ignoreCooldown={true}
        stage={currentStage}
      />
    </>
  );
}

export * from "./types";
