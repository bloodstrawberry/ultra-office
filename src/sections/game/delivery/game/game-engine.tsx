"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BLOCK_EMPTY,
  BLOCK_WALL,
  BLOCK_STRAWBERRY,
  BLOCK_PORTAL_1,
  BLOCK_NONE,
  getBaseBlockId,
  type BlockId,
} from "../object/constants";
import {
  type CellType,
  type Position,
  type LevelData,
  type Bullet,
  BUILTIN_LEVELS,
  realMap,
  copyGrid,
} from "./types";
import { playEngineSound } from "./sound";
import {
  slideOrbox,
  findPlayerSpawn,
  type Direction,
  type DestroyedBlock,
} from "./physics";
import { useEditorEngine } from "./editor-logic";
import { useGameUndo, type UndoSnapshot } from "./use-game-undo";
import { DisappearingEffectItem } from "./disappear-burst";
import { IceBreakEffectItem } from "./ice-break-burst";

export type { CellType, Position, LevelData, Bullet } from "./types";
export { BUILTIN_LEVELS } from "./types";

export interface MoveInfo {
  path: Position[];
  direction: Direction;
  timestamp: number;
}

export const useGameEngine = (
  initialLevelIndex = 0,
  isEditorMode = false,
  isEditorPage = false,
) => {
  const [editorMapType, setEditorMapType] = useState<"real" | "test">("real");
  const [levelIndex, setLevelIndex] = useState<number>(initialLevelIndex);

  const {
    pushSnapshot,
    popSnapshot,
    clearUndoHistory,
    canUndo: canUndoPlay,
    historySize,
  } = useGameUndo(50);
  const [remainingUndos, setRemainingUndos] = useState<number>(0);

  const startUndoChance = useCallback(() => {
    setRemainingUndos(Math.min(historySize, 3));
  }, [historySize]);

  // Initialize grid from level data
  const [grid, setGrid] = useState<CellType[][]>(() => {
    if (isEditorMode) {
      const firstLvl = realMap[0];
      return firstLvl
        ? copyGrid(firstLvl.grid as CellType[][])
        : Array.from({ length: 9 }, () => Array(9).fill(BLOCK_EMPTY));
    }
    const currentLevel = BUILTIN_LEVELS[initialLevelIndex] || BUILTIN_LEVELS[0];
    const newGrid = copyGrid(currentLevel.grid);
    const spawn = findPlayerSpawn(newGrid);
    if (
      spawn.y >= 0 &&
      spawn.y < newGrid.length &&
      spawn.x >= 0 &&
      spawn.x < (newGrid[spawn.y]?.length || 0)
    ) {
      if (getBaseBlockId(newGrid[spawn.y][spawn.x]) === BLOCK_STRAWBERRY) {
        newGrid[spawn.y][spawn.x] = BLOCK_EMPTY;
      }
    }
    return newGrid;
  });

  // Player position (cursor)
  const [cursor, setCursor] = useState<Position>(() => {
    if (isEditorMode) {
      const firstLvl = realMap[0];
      return firstLvl
        ? findPlayerSpawn(firstLvl.grid as CellType[][])
        : { x: 1, y: 1 };
    }
    const currentLevel = BUILTIN_LEVELS[initialLevelIndex] || BUILTIN_LEVELS[0];
    return findPlayerSpawn(currentLevel.grid);
  });

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLevelCleared, setIsLevelCleared] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [grabbed, setGrabbed] = useState<boolean>(false);
  const [isCursorVisible, setIsCursorVisible] = useState<boolean>(true);
  const [hasMovedFirstBlock, setHasMovedFirstBlock] = useState<boolean>(false);
  const [flashingBlocks, setFlashingBlocks] = useState<
    Record<string, CellType | boolean>
  >({});
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [firedOnce, setFiredOnce] = useState<Record<string, boolean>>({});
  const firedOnceRef = useRef<Record<string, boolean>>({});

  const [disappearingEffects, setDisappearingEffects] = useState<
    DisappearingEffectItem[]
  >([]);
  const [iceBreakEffects, setIceBreakEffects] = useState<IceBreakEffectItem[]>(
    [],
  );
  const [lastMoveInfo, setLastMoveInfo] = useState<MoveInfo | null>(null);
  const [isSliding, setIsSliding] = useState<boolean>(false);

  const blockCountsRef = useRef<Record<string, number>>({});
  const setBlockCounts = useCallback(
    (
      counts:
        | Record<string, number>
        | ((prev: Record<string, number>) => Record<string, number>),
    ) => {
      if (typeof counts === "function") {
        blockCountsRef.current = counts(blockCountsRef.current);
      } else {
        blockCountsRef.current = counts;
      }
    },
    [],
  );

  const updateBlockCounts = useCallback((_board: CellType[][]) => {
    return {};
  }, []);

  const stateRef = useRef<{
    grid: CellType[][];
    cursor: Position;
    flashingBlocks: Record<string, CellType | boolean>;
  }>({
    grid,
    cursor,
    flashingBlocks,
  });

  useEffect(() => {
    stateRef.current = {
      grid,
      cursor,
      flashingBlocks,
    };
  }, [grid, cursor, flashingBlocks]);

  // Load level by index
  const loadLevel = useCallback(
    (index: number) => {
      const targetLvl = BUILTIN_LEVELS[index] || BUILTIN_LEVELS[0];
      setLevelIndex(index);
      const newGrid = copyGrid(targetLvl.grid);
      const spawn = findPlayerSpawn(newGrid);
      if (
        spawn.y >= 0 &&
        spawn.y < newGrid.length &&
        spawn.x >= 0 &&
        spawn.x < (newGrid[spawn.y]?.length || 0)
      ) {
        if (getBaseBlockId(newGrid[spawn.y][spawn.x]) === BLOCK_STRAWBERRY) {
          newGrid[spawn.y][spawn.x] = BLOCK_EMPTY;
        }
      }
      setGrid(newGrid);
      setCursor(spawn);
      setIsGameOver(false);
      setIsLevelCleared(false);
      setIsProcessing(false);
      setHasMovedFirstBlock(false);
      setDisappearingEffects([]);
      setIceBreakEffects([]);
      setLastMoveInfo(null);
      setIsSliding(false);
      clearUndoHistory();
    },
    [clearUndoHistory],
  );

  // Reset current level
  const resetLevel = useCallback(() => {
    if (isEditorMode) {
      // In editor mode, restore to editor level grid
      const spawn = findPlayerSpawn(grid);
      setCursor(spawn);
      setIsGameOver(false);
      setIsLevelCleared(false);
      setIsProcessing(false);
      setDisappearingEffects([]);
      setIceBreakEffects([]);
      setLastMoveInfo(null);
      setIsSliding(false);
      clearUndoHistory();
      return;
    }
    loadLevel(levelIndex);
  }, [isEditorMode, grid, levelIndex, loadLevel, clearUndoHistory]);

  // Slide Orbox in direction ('up' | 'down' | 'left' | 'right')
  const moveOrbox = useCallback(
    (direction: Direction) => {
      if (isGameOver || isLevelCleared || isProcessing) return;

      const currentGrid = stateRef.current.grid;
      const currentCursor = stateRef.current.cursor;

      const result = slideOrbox(currentGrid, currentCursor, direction);
      if (!result.success) {
        // Did not move (hit adjacent obstacle immediately)
        return;
      }

      // Save undo snapshot
      pushSnapshot({
        grid: copyGrid(currentGrid),
        cursor: { ...currentCursor },
      });

      setIsProcessing(true);
      setHasMovedFirstBlock(true);
      setLastMoveInfo({
        path: result.path,
        direction,
        timestamp: Date.now(),
      });
      setIsSliding(true);
      setTimeout(() => {
        setIsSliding(false);
      }, 180);

      // Play slide sound
      playEngineSound("select", muted);

      // Update grid & player position
      setGrid(result.grid);
      setCursor(result.finalPos);

      // Trigger effects for destroyed blocks
      if (result.destroyedBlocks.length > 0) {
        playEngineSound("break", muted);
        const newEffects = result.destroyedBlocks.map((b) => ({
          id: `${Date.now()}-${b.x}-${b.y}-${Math.random()}`,
          x: b.x,
          y: b.y,
          timestamp: Date.now(),
        }));
        setDisappearingEffects((prev) => [...prev, ...newEffects]);
        setTimeout(() => {
          setDisappearingEffects((prev) =>
            prev.filter((e) => !newEffects.some((ne) => ne.id === e.id)),
          );
        }, 500);
      }

      // Trigger sound for collected items
      if (result.collectedItems.length > 0) {
        playEngineSound("coin", muted);
      }

      // Handle outcome
      if (result.isCleared) {
        setTimeout(() => {
          playEngineSound("match", muted);
          setIsLevelCleared(true);
          setIsProcessing(false);
        }, 200);
      } else if (result.isOutOfBounds) {
        setTimeout(() => {
          playEngineSound("fall", muted);
          setIsGameOver(true);
          setIsProcessing(false);
        }, 200);
      } else {
        setTimeout(() => {
          setIsProcessing(false);
        }, 120);
      }
    },
    [
      grid,
      cursor,
      isGameOver,
      isLevelCleared,
      isProcessing,
      muted,
      pushSnapshot,
    ],
  );

  // Compatibility moveBlock function (mapping number dir to Direction)
  const moveBlock = useCallback(
    (dir: number | Direction) => {
      if (typeof dir === "string") {
        moveOrbox(dir);
        return;
      }
      if (dir === -1) moveOrbox("left");
      else if (dir === 1) moveOrbox("right");
      else if (dir === -2) moveOrbox("up");
      else if (dir === 2) moveOrbox("down");
    },
    [moveOrbox],
  );

  // Undo move
  const undoPlay = useCallback(() => {
    if (isProcessing) return;
    const snapshot = popSnapshot();
    if (!snapshot) return;

    setGrid(copyGrid(snapshot.grid));
    setCursor({ ...snapshot.cursor });
    setIsGameOver(false);
    setIsLevelCleared(false);
    setIsProcessing(false);
    setLastMoveInfo(null);
    setIsSliding(false);
    playEngineSound("select", muted);

    if (remainingUndos > 0) {
      setRemainingUndos((prev) => Math.max(0, prev - 1));
    }
  }, [isProcessing, popSnapshot, muted, remainingUndos]);

  // Hook editor engine
  const editorEngine = useEditorEngine(
    isEditorMode,
    isEditorPage,
    grid,
    setGrid,
    setCursor,
    muted,
    updateBlockCounts,
    setBlockCounts,
    setGrabbed,
    setIsGameOver,
    setIsLevelCleared,
    setIsProcessing,
    setBullets,
    setFlashingBlocks,
    stateRef,
    setHasMovedFirstBlock,
    setGrabbed,
    setFiredOnce,
    firedOnceRef,
  );

  return {
    grid,
    setGrid,
    cursor,
    setCursor,
    lastMoveInfo,
    isSliding,
    isGameOver,
    setIsGameOver,
    isLevelCleared,
    setIsLevelCleared,
    isProcessing,
    levelIndex,
    setLevelIndex,
    loadLevel,
    resetLevel,
    moveOrbox,
    moveBlock,
    undoPlay,
    canUndoPlay,
    historySize,
    remainingUndos,
    startUndoChance,
    muted,
    setMuted,
    grabbed,
    setGrabbed,
    isCursorVisible,
    setIsCursorVisible,
    flashingBlocks,
    bullets,
    firedOnce,
    disappearingEffects,
    iceBreakEffects,
    editorMapType,
    setEditorMapType,
    ...editorEngine,
  };
};
