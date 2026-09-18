'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  CELL_FLOOR,
  CELL_WALL,
  CELL_TARGET,
  CELL_BOX,
  CELL_BOX_ON_TARGET,
  CELL_PLAYER,
  CELL_PLAYER_ON_TARGET,
  CELL_VOID,
  type Direction,
  type GameState,
  type UndoSnapshot,
  type ParsedLevel,
  type PushPushLevelData,
} from './push-push-types';
import { playSound } from './push-push-sound';
import { getLocalSync, setLocalSync } from '../utils/local-storage';
import { PUSH_PUSH_LEVELS, parseLevel } from '../level/push-push-levels';

const DIR_OFFSETS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function copyGrid<T>(grid: T[][]): T[][] {
  return grid.map((row) => [...row]);
}

function countRemainingTargets(grid: number[][]): number {
  let remaining = 0;
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[y].length; x += 1) {
      if (grid[y][x] === CELL_TARGET || grid[y][x] === CELL_PLAYER_ON_TARGET) {
        remaining += 1;
      }
    }
  }
  return remaining;
}

function isStageCleared(grid: number[][], remainingTargets: number, totalTargets: number): boolean {
  return (
    totalTargets > 0 &&
    remainingTargets === 0 &&
    grid.every((row) => row.every((cell) => cell !== CELL_BOX))
  );
}

export interface StageRecord {
  moves: number;
  pushes: number;
  stars: number;
}

export function usePushPushEngine(initialLevelIndex = 0, isEditorMode = false) {
  const [allLevels, setAllLevels] = useState<PushPushLevelData[]>(PUSH_PUSH_LEVELS);
  const [levelIndex, setLevelIndex] = useState<number>(initialLevelIndex);
  const [currentLevel, setCurrentLevel] = useState<ParsedLevel>(() =>
    parseLevel(PUSH_PUSH_LEVELS[initialLevelIndex] || PUSH_PUSH_LEVELS[0])
  );

  const [gameState, setGameState] = useState<GameState>(() => {
    const parsed = parseLevel(PUSH_PUSH_LEVELS[initialLevelIndex] || PUSH_PUSH_LEVELS[0]);
    return {
      grid: copyGrid(parsed.grid),
      playerPos: { ...parsed.playerPos },
      playerFacing: 'down',
      isMoving: false,
      moves: 0,
      pushes: 0,
      isCleared: false,
      targetsRemaining: parsed.targetCount,
      totalTargets: parsed.targetCount,
    };
  });

  const [undoStack, setUndoStack] = useState<UndoSnapshot[]>([]);
  const [unlockedStage, setUnlockedStage] = useState<number>(1);
  const [bestRecords, setBestRecords] = useState<Record<number, StageRecord>>({});

  // Hydration-safe initial load from localStorage
  useEffect(() => {
    const savedUnlocked = getLocalSync('unlocked_stage');
    if (savedUnlocked) {
      const parsed = parseInt(savedUnlocked, 10);
      if (!Number.isNaN(parsed) && parsed >= 1) {
        setUnlockedStage(parsed);
      }
    }

    const savedRecords = getLocalSync('stage_records');
    if (savedRecords) {
      try {
        const parsed = JSON.parse(savedRecords);
        if (parsed && typeof parsed === 'object') {
          setBestRecords(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const loadLevel = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(allLevels.length - 1, index));
      const parsed = parseLevel(allLevels[safeIndex]);

      setLevelIndex(safeIndex);
      setCurrentLevel(parsed);
      setGameState({
        grid: copyGrid(parsed.grid),
        playerPos: { ...parsed.playerPos },
        playerFacing: 'down',
        isMoving: false,
        moves: 0,
        pushes: 0,
        isCleared: false,
        targetsRemaining: parsed.targetCount,
        totalTargets: parsed.targetCount,
      });
      setUndoStack([]);
    },
    [allLevels]
  );

  const resetLevel = useCallback(() => {
    setGameState({
      grid: copyGrid(currentLevel.grid),
      playerPos: { ...currentLevel.playerPos },
      playerFacing: 'down',
      isMoving: false,
      moves: 0,
      pushes: 0,
      isCleared: false,
      targetsRemaining: currentLevel.targetCount,
      totalTargets: currentLevel.targetCount,
    });
    setUndoStack([]);
  }, [currentLevel]);

  const move = useCallback(
    (dir: Direction) => {
      if (gameState.isCleared) return;

      const { x: dx, y: dy } = DIR_OFFSETS[dir];
      const { x: px, y: py } = gameState.playerPos;
      const nx = px + dx;
      const ny = py + dy;

      const { grid } = gameState;
      const height = grid.length;
      const width = grid[0]?.length || 0;

      // Bounds check
      if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
        playSound('bump');
        setGameState((prev) => ({ ...prev, playerFacing: dir }));
        return;
      }

      const nextCell = grid[ny][nx];

      // Wall or Void -> Blocked
      if (nextCell === CELL_WALL || nextCell === CELL_VOID) {
        playSound('bump');
        setGameState((prev) => ({ ...prev, playerFacing: dir }));
        return;
      }

      // Empty Floor or Target -> Step forward
      if (nextCell === CELL_FLOOR || nextCell === CELL_TARGET) {
        // Save snapshot for undo
        const snapshot: UndoSnapshot = {
          grid: copyGrid(grid),
          playerPos: { ...gameState.playerPos },
          playerFacing: gameState.playerFacing,
          moves: gameState.moves,
          pushes: gameState.pushes,
        };

        const newGrid = copyGrid(grid);
        const currCell = newGrid[py][px];

        // Restore previous cell under player
        newGrid[py][px] = currCell === CELL_PLAYER_ON_TARGET ? CELL_TARGET : CELL_FLOOR;

        // Place player on next cell
        newGrid[ny][nx] = nextCell === CELL_TARGET ? CELL_PLAYER_ON_TARGET : CELL_PLAYER;

        playSound('walk');

        setUndoStack((prev) => [...prev, snapshot]);
        setGameState((prev) => ({
          ...prev,
          grid: newGrid,
          playerPos: { x: nx, y: ny },
          playerFacing: dir,
          moves: prev.moves + 1,
        }));
        return;
      }

      // Box or Box on Target -> Try pushing
      if (nextCell === CELL_BOX || nextCell === CELL_BOX_ON_TARGET) {
        const bnx = nx + dx;
        const bny = ny + dy;

        // Bounds check for pushed box
        if (bny < 0 || bny >= height || bnx < 0 || bnx >= width) {
          playSound('bump');
          setGameState((prev) => ({ ...prev, playerFacing: dir }));
          return;
        }

        const boxNextCell = grid[bny][bnx];

        // Box can ONLY move onto empty floor or target
        if (boxNextCell !== CELL_FLOOR && boxNextCell !== CELL_TARGET) {
          playSound('bump');
          setGameState((prev) => ({ ...prev, playerFacing: dir }));
          return;
        }

        // Push is valid!
        const snapshot: UndoSnapshot = {
          grid: copyGrid(grid),
          playerPos: { ...gameState.playerPos },
          playerFacing: gameState.playerFacing,
          moves: gameState.moves,
          pushes: gameState.pushes,
        };

        const newGrid = copyGrid(grid);
        const currCell = newGrid[py][px];

        // 1. Move box to boxNextPos
        const isGoal = boxNextCell === CELL_TARGET;
        newGrid[bny][bnx] = isGoal ? CELL_BOX_ON_TARGET : CELL_BOX;

        // 2. Move player to box's old pos
        newGrid[ny][nx] = nextCell === CELL_BOX_ON_TARGET ? CELL_PLAYER_ON_TARGET : CELL_PLAYER;

        // 3. Restore player's old pos
        newGrid[py][px] = currCell === CELL_PLAYER_ON_TARGET ? CELL_TARGET : CELL_FLOOR;

        if (isGoal) {
          playSound('goal');
        } else {
          playSound('push');
        }

        const remaining = countRemainingTargets(newGrid);
        const isCleared = isStageCleared(newGrid, remaining, gameState.totalTargets);

        if (isCleared) {
          playSound('clear');

          // Save unlock and best record
          const nextStageToUnlock = Math.min(
            allLevels.length,
            Math.max(unlockedStage, levelIndex + 2)
          );
          setUnlockedStage(nextStageToUnlock);
          setLocalSync('unlocked_stage', String(nextStageToUnlock));

          const moves = gameState.moves + 1;
          const pushes = gameState.pushes + 1;
          let stars = 1;
          if (moves <= currentLevel.parMoves) {
            stars = 3;
          } else if (moves <= Math.floor(currentLevel.parMoves * 1.4)) {
            stars = 2;
          }

          const currentBest = bestRecords[currentLevel.id];
          const shouldUpdate =
            !currentBest ||
            stars > currentBest.stars ||
            (stars === currentBest.stars && moves < currentBest.moves);

          if (shouldUpdate) {
            const updated = {
              ...bestRecords,
              [currentLevel.id]: { moves, pushes, stars },
            };
            setBestRecords(updated);
            setLocalSync('stage_records', JSON.stringify(updated));
          }
        }

        setUndoStack((prev) => [...prev, snapshot]);
        setGameState((prev) => ({
          ...prev,
          grid: newGrid,
          playerPos: { x: nx, y: ny },
          playerFacing: dir,
          moves: prev.moves + 1,
          pushes: prev.pushes + 1,
          targetsRemaining: remaining,
          isCleared,
        }));
      }
    },
    [gameState, currentLevel, unlockedStage, levelIndex, bestRecords, allLevels.length]
  );

  const undo = useCallback(() => {
    if (undoStack.length === 0 || gameState.isCleared) return;

    playSound('undo');
    const lastSnapshot = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    const remaining = countRemainingTargets(lastSnapshot.grid);

    setGameState((prev) => ({
      ...prev,
      grid: lastSnapshot.grid,
      playerPos: lastSnapshot.playerPos,
      playerFacing: lastSnapshot.playerFacing,
      moves: lastSnapshot.moves,
      pushes: lastSnapshot.pushes,
      targetsRemaining: remaining,
      isCleared: false,
    }));
  }, [undoStack, gameState.isCleared]);

  const setLevelFromEditor = useCallback((customLevel: PushPushLevelData) => {
    const parsed = parseLevel(customLevel);
    setCurrentLevel(parsed);
    setGameState({
      grid: copyGrid(parsed.grid),
      playerPos: { ...parsed.playerPos },
      playerFacing: 'down',
      isMoving: false,
      moves: 0,
      pushes: 0,
      isCleared: false,
      targetsRemaining: parsed.targetCount,
      totalTargets: parsed.targetCount,
    });
    setUndoStack([]);
  }, []);

  return {
    levelIndex,
    allLevels,
    currentLevel,
    gameState,
    canUndo: undoStack.length > 0 && !gameState.isCleared,
    undoHistoryLength: undoStack.length,
    unlockedStage,
    bestRecords,
    loadLevel,
    resetLevel,
    move,
    undo,
    setLevelFromEditor,
    setAllLevels,
  };
}
