'use client';

import type { GameViewProps } from './game-view-types';

import React, { useState } from 'react';

import { GameContent } from './game-content';
import GameLoadingView from './game-loading-view';
import { useBlockImagesPreloader } from '../objects';

export default function GameView({ isEditor = false, showTimer = false }: GameViewProps) {
  const [resetKey, setResetKey] = useState(0);
  const isLoaded = useBlockImagesPreloader();

  const handleFullReset = (_stageNum?: number) => {
    setResetKey((prev) => prev + 1);
  };

  const handleStageSelect = (_stageNum?: number) => {};

  if (!isLoaded) {
    return <GameLoadingView />;
  }

  return (
    <GameContent
      key={resetKey}
      isEditor={isEditor}
      showTimer={showTimer}
      onFullReset={handleFullReset}
      onStageSelect={handleStageSelect}
    />
  );
}

export * from './game-view-types';
