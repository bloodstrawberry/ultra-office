'use client';

import type { IceBreakEffectItem } from './ice-break-burst';
import type { DisappearingEffectItem } from './disappear-burst';
import type { CellType, Position, Bullet as BulletType } from './types';

import React, { useRef, useMemo, useState, useEffect } from 'react';

import GameStageHud from './game-stage-hud';
import GameBoardGrid from './game-board-grid';
import { BUILTIN_LEVELS } from './types';
import { isAdPendingSync } from '../utils/local-storage';
import { EditorColControls, EditorRowControls } from './editor-grid-controls';
import { GameOverModal, GameClearModal, GameAllClearModal } from './game-result-modals';
import { BLOCK_EMPTY, isFrozenBlock, getBlockProperties, isTargetAnimalBlock } from '../object';

export { DEFAULT_CONTROL_MARGIN_BOTTOM } from './puzzle-controls';

export interface GameBoardViewProps {
  grid: CellType[][];
  statusMap?: number[][];
  chickenDirections?: Record<string, 'up' | 'down' | 'left' | 'right'>;
  cursor: Position;
  activeEditor: boolean;
  playTestMode: boolean;
  grabbed: boolean;
  isCursorVisible?: boolean;
  isProcessing?: boolean;
  flashingBlocks: Record<string, CellType | boolean>;
  bullets: BulletType[];
  shisenShoPath?: Position[] | null;
  firedOnce?: Record<string, boolean>;
  isLevelCleared: boolean;
  isGameOver: boolean;
  levelIndex: number;
  isEditor: boolean;
  muted: boolean;
  turnsLeft?: number;
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
  editorLevels?: Array<{
    name: string;
    turnLimit?: number;
    grid: CellType[][];
    hint?: CellType[][][];
  }>;
  editorUpdateTurnLimit?: (turns: number) => void;
  selectEditorLevel?: (index: number) => void;
  editorAddLevel?: () => void;
  editorDeleteLevel?: () => void;
  togglePlayTest?: () => void;
  editorMapType?: 'real' | 'test';
  setEditorMapType?: (type: 'real' | 'test') => void;
  changeMapType?: (type: 'real' | 'test') => void;
  onBackToStageSelect?: () => void;
  onClearAllBlocks?: () => void;
  onStageClearAd?: (stage?: number) => void;
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
  statusMap,
  chickenDirections,
  cursor,
  activeEditor,
  playTestMode,
  grabbed,
  isCursorVisible = false,
  isProcessing = false,
  flashingBlocks,
  bullets,
  shisenShoPath,
  firedOnce,
  isLevelCleared,
  isGameOver,
  levelIndex,
  isEditor,
  muted,
  turnsLeft,
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
  editorUpdateTurnLimit,
  selectEditorLevel,
  editorAddLevel,
  editorDeleteLevel,
  togglePlayTest,
  editorMapType,
  setEditorMapType,
  changeMapType,
  onBackToStageSelect,
  onClearAllBlocks,
  onStageClearAd,
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

  // ── 게임 보드 뷰(game-board-view) 진입 시 미완료 전면 광고가 있다면 재노출 ──
  useEffect(() => {
    if (isAdPendingSync()) {
      onStageClearAd?.(levelIndex + 1);
    }
  }, [levelIndex, onStageClearAd]);

  const [disappearingEffects, setDisappearingEffects] = useState<DisappearingEffectItem[]>([]);
  const prevGridRef = useRef<CellType[][] | null>(null);

  // Track cell block removals to trigger disappearing burst effects
  useEffect(() => {
    if (prevGridRef.current) {
      const prevGrid = prevGridRef.current;
      const excludedKeys = new Set<string>();

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

  const targetAnimalsDetectedRef = useRef<boolean>(false);

  useEffect(() => {
    targetAnimalsDetectedRef.current = false;
  }, [levelIndex, activeEditor]);

  const totalRemainingBlocks = useMemo(() => {
    const builtinGrid = BUILTIN_LEVELS[levelIndex]?.grid;
    if (builtinGrid) {
      for (let y = 0; y < builtinGrid.length; y++) {
        for (let x = 0; x < (builtinGrid[y]?.length || 0); x++) {
          if (isTargetAnimalBlock(builtinGrid[y][x])) {
            targetAnimalsDetectedRef.current = true;
            break;
          }
        }
      }
    }

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < (grid[y]?.length || 0); x++) {
        if (isTargetAnimalBlock(grid[y][x])) {
          targetAnimalsDetectedRef.current = true;
          break;
        }
      }
    }

    const hasTargetAnimals = targetAnimalsDetectedRef.current;

    let count = 0;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < (grid[y]?.length || 0); x++) {
        const cell = grid[y][x];
        if (hasTargetAnimals) {
          if (isTargetAnimalBlock(cell)) {
            count++;
          }
        } else {
          const props = getBlockProperties(cell, grid);
          if (props?.canBeDestroyedByShooter) {
            count++;
          }
        }
      }
    }
    return count;
  }, [grid, levelIndex, activeEditor]);

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
        editorUpdateTurnLimit={editorUpdateTurnLimit}
        muted={muted}
        turnsLeft={turnsLeft}
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
            statusMap={statusMap}
            chickenDirections={chickenDirections}
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
            shisenShoPath={shisenShoPath}
            disappearingEffects={disappearingEffects}
            iceBreakEffects={iceBreakEffects}
            hoveredRow={hoveredRow}
            hoveredCol={hoveredCol}
            handleMouseDown={handleMouseDown}
            handleMouseEnter={handleMouseEnter}
            handleCellClick={handleCellClick}
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
            onStageClearAd={onStageClearAd}
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
