'use client';

import type { IceBreakEffectItem } from './ice-break-burst';
import type { DisappearingEffectItem } from './disappear-burst';
import type { CellType, Position, Bullet as BulletType } from '../utils/types';

import React, { useRef, useMemo, useState, useEffect } from 'react';

import GameTutorial from './game-tutorial';
import GameStageHud from './game-stage-hud';
import GameBoardGrid from './game-board-grid';
import { BUILTIN_LEVELS } from '../utils/types';
import { EditorColControls, EditorRowControls } from './editor-grid-controls';
import { GameOverModal, GameClearModal, GameAllClearModal } from './game-result-modals';
import {
  BLOCK_NONE,
  BLOCK_EMPTY,
  isFrozenBlock,
  BLOCK_AUTO_WALL_H,
  BLOCK_AUTO_WALL_V,
  getBlockProperties,
} from '../objects';

export { DEFAULT_CONTROL_MARGIN_BOTTOM } from './puzzle-controls';

export interface GameBoardViewProps {
  grid: CellType[][];
  cursor: Position;
  activeEditor: boolean;
  playTestMode: boolean;
  grabbed: boolean;
  isCursorVisible?: boolean;
  isProcessing?: boolean;
  flashingBlocks: Record<string, CellType | boolean>;
  bullets: BulletType[];
  firedOnce?: Record<string, boolean>;
  isLevelCleared: boolean;
  isGameOver: boolean;
  levelIndex: number;
  isEditor: boolean;
  muted: boolean;
  showTimer?: boolean;
  timeLeft?: number;
  setGrabbed: (grabbed: boolean) => void;
  loadLevel: (index: number) => void;
  resetLevel: () => void;
  setCursor: (cursor: Position) => void;
  playSound: (
    type: 'coin' | 'select' | 'start' | 'error' | 'match' | 'fall' | 'shoot' | 'break',
    muted: boolean
  ) => void;
  handleMouseDown: (e: React.MouseEvent, x: number, y: number) => void;
  handleMouseEnter: (x: number, y: number) => void;
  handleCellClick: (x: number, y: number) => void;
  editorDeleteRow?: (y: number) => void;
  editorDeleteCol?: (x: number) => void;
  editorInsertRowAbove?: (y: number) => void;
  editorInsertRowBelow?: (y: number) => void;
  editorInsertColLeft?: (x: number) => void;
  editorInsertColRight?: (x: number) => void;
  copiedCol?: CellType[] | null;
  copiedRow?: CellType[] | null;
  editorCopyCol?: (x: number) => void;
  editorPasteCol?: (x: number) => void;
  editorCopyRow?: (y: number) => void;
  editorPasteRow?: (y: number) => void;
  setMuted?: (muted: boolean) => void;
  onFullReset?: (stage?: number) => void;
  editorActiveIndex?: number;
  editorLevels?: Array<{ name: string; timeLimit: number; grid: CellType[][] }>;
  selectEditorLevel?: (index: number) => void;
  editorAddLevel?: () => void;
  editorDeleteLevel?: () => void;
  editorUpdateTimeLimit?: (time: number) => void;
  togglePlayTest?: () => void;
  editorMapType?: 'real' | 'test';
  setEditorMapType?: (type: 'real' | 'test') => void;
  changeMapType?: (type: 'real' | 'test') => void;
  onBackToStageSelect?: () => void;
  onClearAllBlocks?: () => void;
  editorAddHint?: (grid: CellType[][]) => void;
  onToast?: (msg: string) => void;
  hasActiveHints?: boolean;
  activeHintsLength?: number;
  onOpenHintModal?: () => void;
  recordedStepsLength?: number;
  onOpenRecordModal?: () => void;
  isHintAttention?: boolean;
  hasWatchedHintAd?: boolean;
}

export default function GameBoardView({
  grid,
  cursor,
  activeEditor,
  playTestMode,
  grabbed,
  isCursorVisible = false,
  isProcessing = false,
  flashingBlocks,
  bullets,
  firedOnce,
  isLevelCleared,
  isGameOver,
  levelIndex,
  isEditor,
  muted,
  showTimer = false,
  timeLeft,
  setGrabbed,
  loadLevel,
  resetLevel,
  setCursor: _setCursor,
  playSound,
  handleMouseDown,
  handleMouseEnter,
  handleCellClick,
  editorDeleteRow,
  editorDeleteCol,
  editorInsertRowAbove,
  editorInsertRowBelow,
  editorInsertColLeft,
  editorInsertColRight,
  copiedCol,
  copiedRow,
  editorCopyCol,
  editorPasteCol,
  editorCopyRow,
  editorPasteRow,
  setMuted,
  onFullReset,
  editorActiveIndex,
  editorLevels,
  selectEditorLevel,
  editorAddLevel,
  editorDeleteLevel,
  togglePlayTest,
  editorMapType,
  setEditorMapType,
  changeMapType,
  onBackToStageSelect,
  onClearAllBlocks,
  editorAddHint,
  onToast,
  hasActiveHints,
  activeHintsLength,
  onOpenHintModal,
  recordedStepsLength,
  onOpenRecordModal,
  isHintAttention,
  hasWatchedHintAd,
}: GameBoardViewProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [finalRating, setFinalRating] = useState<number>(5);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showTouchGuideModal, setShowTouchGuideModal] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(1);

  const wrappedHandleCellClick = (x: number, y: number) => {
    if (levelIndex === 0 && !isEditor && !playTestMode && tutorialStep === 1) {
      if (y !== 1 || x !== 6) {
        return; // Only allow top block at (x: 6, y: 1) during Step 1
      }
    }
    handleCellClick(x, y);
  };

  const [disappearingEffects, setDisappearingEffects] = useState<DisappearingEffectItem[]>([]);
  const prevGridRef = useRef<CellType[][] | null>(null);

  // Track cell block removals to trigger disappearing burst effects
  useEffect(() => {
    if (prevGridRef.current) {
      const prevGrid = prevGridRef.current;
      const excludedKeys = new Set<string>();

      // Identify auto-wall moves and blocks moving together with auto-walls
      const prevH = prevGrid.length;
      const prevW = prevGrid[0]?.length || 0;
      const dirs = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
      ];

      for (let y = 0; y < prevH; y++) {
        for (let x = 0; x < prevW; x++) {
          const cell = prevGrid[y]?.[x];
          if (cell === BLOCK_AUTO_WALL_H || cell === BLOCK_AUTO_WALL_V) {
            excludedKeys.add(`${y},${x}`);

            // Find where this auto wall moved in current grid
            for (const { dx, dy } of dirs) {
              const ny = y + dy;
              const nx = x + dx;
              if (
                ny >= 0 &&
                ny < grid.length &&
                nx >= 0 &&
                nx < (grid[ny]?.length || 0) &&
                grid[ny][nx] === cell
              ) {
                // Auto wall moved by (dx, dy).
                // Check blocks in stack sitting above this auto-wall in prevGrid
                let ky = y - 1;
                while (ky >= 0) {
                  const aboveCell = prevGrid[ky]?.[x];
                  if (
                    aboveCell === undefined ||
                    aboveCell === BLOCK_EMPTY ||
                    aboveCell === BLOCK_NONE
                  ) {
                    break;
                  }
                  // Check if this stacked block also moved by (dx, dy)
                  const targetY = ky + dy;
                  const targetX = x + dx;
                  if (
                    targetY >= 0 &&
                    targetY < grid.length &&
                    targetX >= 0 &&
                    targetX < (grid[targetY]?.length || 0) &&
                    grid[targetY][targetX] === aboveCell
                  ) {
                    excludedKeys.add(`${ky},${x}`);
                  } else {
                    break;
                  }
                  ky--;
                }
                break;
              }
            }
          }
        }
      }

      // Track flashing blocks (portals) to prevent them and blocks above them from triggering disappear effects
      Object.entries(flashingBlocks).forEach(([key, val]) => {
        if (typeof val === 'number') {
          excludedKeys.add(key);
          const [py, px] = key.split(',');
          excludedKeys.add(`${parseInt(py, 10) - 1},${px}`);
        }
      });

      const newEffects: DisappearingEffectItem[] = [];
      const newIceEffects: IceBreakEffectItem[] = [];
      const now = Date.now();
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < (grid[y]?.length || 0); x++) {
          const prevCell = prevGrid[y]?.[x];
          const currCell = grid[y]?.[x];

          // Detect ice-breaking: frozen → non-frozen (unfrozen or destroyed)
          if (prevCell !== undefined && isFrozenBlock(prevCell) && !isFrozenBlock(currCell ?? 0)) {
            newIceEffects.push({
              id: `ice-${y}-${x}-${now}-${Math.random()}`,
              x,
              y,
              timestamp: now,
            });
          }

          // Detect block disappearance (for DisappearBurst)
          if (
            prevCell !== undefined &&
            prevCell !== BLOCK_EMPTY &&
            currCell === BLOCK_EMPTY &&
            !excludedKeys.has(`${y},${x}`)
          ) {
            // Check if this block simply fell down vertically due to gravity
            let fellDown = false;
            for (let ny = y + 1; ny < grid.length; ny++) {
              if (grid[ny]?.[x] === prevCell) {
                fellDown = true;
                break;
              }
              if (grid[ny]?.[x] !== BLOCK_EMPTY) {
                break;
              }
            }

            if (!fellDown) {
              newEffects.push({
                id: `grid-${y}-${x}-${now}-${Math.random()}`,
                x,
                y,
                timestamp: now,
              });
            }
          }
        }
      }
      if (newEffects.length > 0) {
        setTimeout(() => {
          setDisappearingEffects((prev) => {
            const filtered = prev.filter(
              (e) =>
                !newEffects.some((ne) => ne.x === e.x && ne.y === e.y && now - e.timestamp < 250)
            );
            return [...filtered, ...newEffects];
          });
        }, 0);
      }
      if (newIceEffects.length > 0) {
        setTimeout(() => {
          setIceBreakEffects((prev) => [...prev, ...newIceEffects]);
        }, 0);
      }
    }
    prevGridRef.current = grid;
  }, [grid]);

  // Track flashing matching blocks to trigger immediate disappear effect
  useEffect(() => {
    const keys = Object.entries(flashingBlocks)
      .filter(([_, val]) => typeof val !== 'number')
      .map(([key]) => key);
    if (keys.length > 0) {
      const now = Date.now();
      const flashEffects: DisappearingEffectItem[] = keys.map((key) => {
        const [yStr, xStr] = key.split(',');
        return {
          id: `flash-${key}-${now}`,
          x: parseInt(xStr, 10),
          y: parseInt(yStr, 10),
          timestamp: now,
        };
      });
      setTimeout(() => {
        setDisappearingEffects((prev) => {
          const filtered = prev.filter(
            (e) =>
              !flashEffects.some((fe) => fe.x === e.x && fe.y === e.y && now - e.timestamp < 300)
          );
          return [...filtered, ...flashEffects];
        });
      }, 0);
    }
  }, [flashingBlocks]);

  // Clean up completed disappearing effects after animation finish
  useEffect(() => {
    if (disappearingEffects.length === 0) return undefined;
    const timer = setTimeout(() => {
      const now = Date.now();
      setDisappearingEffects((prev) => prev.filter((e) => now - e.timestamp < 650));
    }, 100);
    return () => clearTimeout(timer);
  }, [disappearingEffects]);
  // ── Ice Break Effects ──
  const [iceBreakEffects, setIceBreakEffects] = useState<IceBreakEffectItem[]>([]);

  // Clean up completed ice break effects
  useEffect(() => {
    if (iceBreakEffects.length === 0) return undefined;
    const timer = setTimeout(() => {
      const now = Date.now();
      setIceBreakEffects((prev) => prev.filter((e) => now - e.timestamp < 380));
    }, 100);
    return () => clearTimeout(timer);
  }, [iceBreakEffects]);

  const totalRemainingBlocks = useMemo(() => {
    let count = 0;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < (grid[y]?.length || 0); x++) {
        const cell = grid[y][x];
        const props = getBlockProperties(cell, grid);
        if (props?.canBeDestroyedByShooter) {
          count++;
        }
      }
    }
    return count;
  }, [grid]);

  const cols = grid[0]?.length || 8;
  const rows = grid.length || 8;
  const ratio = cols / rows;

  // Calculate max cell size dynamically based on row count so board stays compact and never clips
  const baseMaxCellSize = activeEditor ? 44 : 50;
  const maxCellSize = Math.max(18, Math.min(baseMaxCellSize, Math.floor(400 / rows)));
  const maxBoardPixelWidth = cols * maxCellSize;

  const heightSubtract = activeEditor ? 320 : !isEditor && hasActiveHints ? 280 : 250;
  const stageMaxWidth = `min(calc(100vw - 16px), calc((100dvh - ${heightSubtract}px) * ${ratio}), ${maxBoardPixelWidth}px)`;

  return (
    <div className="flex-1 flex flex-col items-center justify-between relative animate-fade-in w-full h-full select-none min-h-0 pt-0">
      {/* Top Wooden HUD Header Bar */}
      <GameStageHud
        levelIndex={levelIndex}
        totalRemainingBlocks={totalRemainingBlocks}
        isEditor={isEditor}
        activeEditor={activeEditor}
        editorActiveIndex={editorActiveIndex}
        editorLevels={editorLevels}
        muted={muted}
        showTimer={showTimer}
        timeLeft={timeLeft}
        playTestMode={playTestMode}
        editorMapType={editorMapType}
        selectEditorLevel={selectEditorLevel}
        editorAddLevel={editorAddLevel}
        editorDeleteLevel={editorDeleteLevel}
        setMuted={setMuted}
        onFullReset={onFullReset}
        resetLevel={resetLevel}
        setGrabbed={setGrabbed}
        playSound={playSound}
        togglePlayTest={togglePlayTest}
        setEditorMapType={setEditorMapType}
        changeMapType={changeMapType}
        onBackToStageSelect={onBackToStageSelect}
        onClearAllBlocks={onClearAllBlocks}
        onMenuToggle={(open) => setIsMenuOpen(open)}
        externalMenuOpen={isMenuOpen}
        externalShowTouchGuideModal={showTouchGuideModal}
        onCloseTouchGuide={() => setShowTouchGuideModal(false)}
        grid={grid}
        editorAddHint={editorAddHint}
        onToast={onToast}
        hasActiveHints={hasActiveHints}
        activeHintsLength={activeHintsLength}
        onOpenHintModal={onOpenHintModal}
        recordedStepsLength={recordedStepsLength}
        onOpenRecordModal={onOpenRecordModal}
        isHintAttention={isHintAttention}
        hasWatchedHintAd={hasWatchedHintAd}
      />

      {/* Stage 1 Tutorial Overlay */}
      <GameTutorial
        levelIndex={levelIndex}
        isEditor={isEditor}
        playTestMode={playTestMode}
        grabbed={grabbed}
        cursor={cursor}
        isMenuOpen={isMenuOpen}
        showTouchGuideModal={showTouchGuideModal}
        onCloseMenu={() => setIsMenuOpen(false)}
        onOpenTouchGuide={() => setShowTouchGuideModal(true)}
        onCloseTouchGuide={() => setShowTouchGuideModal(false)}
        onStepChange={(s) => setTutorialStep(s)}
      />

      {/* Seamless Game Stage Grid Container */}
      <div
        className={`relative p-0 sm:p-0.5 flex flex-col items-center justify-center w-full z-10 min-h-0 my-auto ${
          !isEditor && hasActiveHints ? 'pt-6 sm:pt-8' : ''
        }`}
      >
        {/* Top: Column delete/add/copy/paste buttons (Editor only) */}
        {activeEditor && (
          <EditorColControls
            grid={grid}
            cols={cols}
            stageMaxWidth={stageMaxWidth}
            editorDeleteCol={editorDeleteCol}
            editorInsertColLeft={editorInsertColLeft}
            editorInsertColRight={editorInsertColRight}
            copiedCol={copiedCol}
            editorCopyCol={editorCopyCol}
            editorPasteCol={editorPasteCol}
            setHoveredCol={setHoveredCol}
          />
        )}

        {/* Middle: Row delete/add/copy/paste buttons + Grid */}
        <div className="flex items-stretch justify-center w-full min-h-0">
          {/* Left: Row delete/add/copy/paste buttons (Editor only) */}
          {activeEditor && (
            <EditorRowControls
              grid={grid}
              rows={rows}
              editorDeleteRow={editorDeleteRow}
              editorInsertRowAbove={editorInsertRowAbove}
              editorInsertRowBelow={editorInsertRowBelow}
              copiedRow={copiedRow}
              editorCopyRow={editorCopyRow}
              editorPasteRow={editorPasteRow}
              setHoveredRow={setHoveredRow}
            />
          )}

          {/* Interactive Game Grid & Soil Layer */}
          <GameBoardGrid
            grid={grid}
            cols={cols}
            rows={rows}
            stageMaxWidth={stageMaxWidth}
            activeEditor={activeEditor}
            playTestMode={playTestMode}
            cursor={cursor}
            grabbed={grabbed}
            isCursorVisible={isCursorVisible}
            isProcessing={isProcessing}
            flashingBlocks={flashingBlocks}
            firedOnce={firedOnce}
            bullets={bullets}
            disappearingEffects={disappearingEffects}
            iceBreakEffects={iceBreakEffects}
            hoveredRow={hoveredRow}
            hoveredCol={hoveredCol}
            handleMouseDown={handleMouseDown}
            handleMouseEnter={handleMouseEnter}
            handleCellClick={wrappedHandleCellClick}
          />
        </div>
      </div>

      {/* Success Notification Overlay (Cleared All Levels) */}
      {isLevelCleared && !isEditor && levelIndex + 1 >= BUILTIN_LEVELS.length ? (
        <GameAllClearModal
          finalRating={finalRating}
          setFinalRating={setFinalRating}
          onBackToStageSelect={onBackToStageSelect}
          muted={muted}
          playSound={playSound}
        />
      ) : (
        isLevelCleared && (
          <GameClearModal
            levelIndex={levelIndex}
            isEditor={isEditor}
            setGrabbed={setGrabbed}
            loadLevel={loadLevel}
            resetLevel={resetLevel}
            playSound={playSound}
            muted={muted}
            onBackToStageSelect={onBackToStageSelect}
          />
        )
      )}

      {/* Game Over Notification Overlay */}
      {isGameOver && (
        <GameOverModal
          isEditor={isEditor}
          setGrabbed={setGrabbed}
          resetLevel={resetLevel}
          onFullReset={onFullReset}
          playSound={playSound}
          muted={muted}
          onBackToStageSelect={onBackToStageSelect}
          levelIndex={levelIndex}
        />
      )}
    </div>
  );
}
