'use client';

import React, { useState } from 'react';

import { PushPushHud } from './push-push-hud';
import { usePushPushEngine } from './push-push-engine';
import { PushPushControls } from './push-push-controls';
import { PushPushBoardView } from './push-push-board-view';
import { StageClearModal, StageSelectModal, HintModal } from './push-push-modals';

export interface PushPushGameViewProps {
  initialLevelIndex?: number;
  onNavigateHome?: () => void;
}

export default function PushPushGameView({
  initialLevelIndex = 0,
  onNavigateHome,
}: PushPushGameViewProps) {
  const [showStageSelect, setShowStageSelect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const {
    levelIndex,
    allLevels,
    currentLevel,
    gameState,
    canUndo,
    unlockedStage,
    bestRecords,
    loadLevel,
    resetLevel,
    move,
    undo,
  } = usePushPushEngine(initialLevelIndex);

  const handleNavigateHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('push-push-go-home'));
    }
  };

  const handleNextLevel = () => {
    if (levelIndex < allLevels.length - 1) {
      loadLevel(levelIndex + 1);
    }
  };

  return (
    <main className="w-full h-full min-h-0 flex-1 flex flex-col justify-between items-center relative overflow-hidden p-2 select-none bg-gradient-to-b from-[#2b1810] via-[#1f120b] to-[#120a06]">
      {/* Ambient Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top HUD */}
      <PushPushHud
        level={currentLevel}
        levelIndex={levelIndex}
        totalLevels={allLevels.length}
        gameState={gameState}
        onOpenStageSelect={() => setShowStageSelect(true)}
        onNavigateHome={handleNavigateHome}
        onOpenHint={() => setShowHint(true)}
      />

      {/* Center Game Board */}
      <div className="flex-1 w-full min-h-0 flex items-center justify-center relative my-1">
        <PushPushBoardView gameState={gameState} onMove={move} />
      </div>

      {/* Bottom Controls */}
      <PushPushControls onMove={move} onUndo={undo} onReset={resetLevel} canUndo={canUndo} />

      {/* Stage Select Modal */}
      <StageSelectModal
        isOpen={showStageSelect}
        onClose={() => setShowStageSelect(false)}
        levels={allLevels}
        currentLevelIndex={levelIndex}
        unlockedStage={unlockedStage}
        bestRecords={bestRecords}
        onSelectLevel={(idx) => loadLevel(idx)}
      />

      {/* Stage Clear Modal */}
      <StageClearModal
        isOpen={gameState.isCleared}
        level={currentLevel}
        levelIndex={levelIndex}
        totalLevels={allLevels.length}
        moves={gameState.moves}
        pushes={gameState.pushes}
        onNextLevel={handleNextLevel}
        onRetry={resetLevel}
        onOpenStageSelect={() => setShowStageSelect(true)}
        onNavigateHome={handleNavigateHome}
      />

      {/* Hint Modal */}
      <HintModal
        isOpen={showHint}
        onClose={() => setShowHint(false)}
        hint={currentLevel.hint}
        stageName={currentLevel.name}
      />
    </main>
  );
}
