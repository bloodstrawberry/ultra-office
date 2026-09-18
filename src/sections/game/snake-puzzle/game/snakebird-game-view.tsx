'use client';

import React, { useState } from 'react';

import { SnakebirdHud } from './snakebird-hud';
import { useSnakebirdEngine } from './snakebird-engine';
import { SnakebirdControls } from './snakebird-controls';
import { SnakebirdBoardView } from './snakebird-board-view';
import { StageClearModal, LevelSelectModal } from './snakebird-modals';

export interface SnakebirdGameViewProps {
  initialLevelIndex?: number;
  onNavigateHome?: () => void;
}

export default function SnakebirdGameView({
  initialLevelIndex = 0,
  onNavigateHome,
}: SnakebirdGameViewProps) {
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);

  const {
    levelIndex,
    allLevels,
    currentLevel,
    gameState,
    canUndo,
    muted,
    setMuted,
    loadLevel,
    resetLevel,
    move,
    switchActiveBird,
    undo,
  } = useSnakebirdEngine(initialLevelIndex);

  const handleNavigateHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('snake-puzzle-go-home'));
    }
  };

  const handleNextLevel = () => {
    if (levelIndex < allLevels.length - 1) {
      loadLevel(levelIndex + 1);
    }
  };

  const livingBirds = gameState.birds.filter((b) => !b.isExited && !b.isDead);
  const hasMultipleBirds = livingBirds.length > 1;

  return (
    <main
      className="w-full h-full min-h-0 flex-1 flex flex-col justify-between items-center relative overflow-hidden p-2 sm:p-4 select-none"
      style={{ backgroundColor: '#52AEF8' }}
    >
      {/* Top HUD */}
      <SnakebirdHud
        level={currentLevel}
        levelIndex={levelIndex}
        totalLevels={allLevels.length}
        gameState={gameState}
        canUndo={canUndo}
        onUndo={undo}
        onReset={resetLevel}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onNavigateHome={handleNavigateHome}
        muted={muted}
        setMuted={setMuted}
      />

      {/* Center Game Board */}
      <div className="flex-1 w-full min-h-0 flex items-center justify-center relative my-1">
        <SnakebirdBoardView gameState={gameState} onMove={move} onSelectBird={switchActiveBird} />
      </div>

      {/* Bottom Controls */}
      <SnakebirdControls
        onMove={move}
        onSwitchBird={switchActiveBird}
        onUndo={undo}
        onReset={resetLevel}
        canUndo={canUndo}
        hasMultipleBirds={hasMultipleBirds}
      />

      {/* Stage Select Modal */}
      <LevelSelectModal
        isOpen={showLevelSelect}
        onClose={() => setShowLevelSelect(false)}
        levels={allLevels}
        currentLevelIndex={levelIndex}
        onSelectLevel={(idx) => loadLevel(idx)}
      />

      {/* Stage Clear Modal */}
      <StageClearModal
        isOpen={gameState.isClear}
        levelIndex={levelIndex}
        totalLevels={allLevels.length}
        moveCount={gameState.moveCount}
        onNextLevel={handleNextLevel}
        onReplay={resetLevel}
        onHome={handleNavigateHome}
      />
    </main>
  );
}
