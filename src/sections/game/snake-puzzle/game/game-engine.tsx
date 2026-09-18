'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import {
  BLOCK_EMPTY,
  isStrawBlock,
  isPortalBlock,
  isFrozenBlock,
  getBaseBlockId,
  BLOCK_SHOOTER_L,
  BLOCK_SHOOTER_R,
  isWormholeBlock,
  BLOCK_AUTO_WALL_V,
  BLOCK_AUTO_WALL_H,
  getBlockProperties,
  getNextStrawBlockId,
  BLOCK_SHOOTER_L_ONCE,
  BLOCK_SHOOTER_R_ONCE,
} from '../object/constants';

export { BUILTIN_LEVELS, SHOOTER_INTERVAL, AUTO_WALL_TURN_DELAY_TICKS } from './types';
// ── Re-export public types & constants from modules ──
export type { Bullet, CellType, Position, LevelData } from './types';

import { playEngineSound } from './sound';
import { useEditorEngine } from './editor-logic';
import { useGameUndo, useUndoHotkey, type UndoSnapshot } from './use-game-undo';
import {
  realMap,
  copyGrid,
  type Bullet,
  type CellType,
  type Position,
  BUILTIN_LEVELS,
  SHOOTER_INTERVAL,
  findInitialCursor,
  AUTO_WALL_TURN_DELAY_TICKS,
} from './types';
import {
  applySpikes,
  findMatches,
  applyGravity,
  clearMatches,
  tryMoveBlock,
  applyWormholes,
  applyBlackholes,
  findPairedWormhole,
  findAdjacentStrawTransitions,
} from './physics';

export const useGameEngine = (
  initialLevelIndex = 0,
  isEditorMode = false,
  isEditorPage = false,
  showTimer = false
) => {
  const [editorMapType, setEditorMapType] = useState<'real' | 'test'>('real');
  const [levelIndex, setLevelIndex] = useState<number>(initialLevelIndex);
  const autoWallDirections = useRef<Record<string, number>>({});
  const autoWallDelays = useRef<Record<string, number>>({});
  const physicsLoopIdRef = useRef<number>(0);
  const prevGridRef = useRef<CellType[][]>([]);

  const {
    pushSnapshot,
    popSnapshot,
    clearUndoHistory,
    canUndo: canUndoPlay,
    historySize,
  } = useGameUndo(50);
  const pendingMoveSnapshotRef = useRef<UndoSnapshot | null>(null);
  const [remainingUndos, setRemainingUndos] = useState<number>(0);

  const startUndoChance = useCallback(() => {
    setRemainingUndos(Math.min(historySize, 3));
  }, [historySize]);

  const [grid, setGrid] = useState<CellType[][]>(() => {
    if (isEditorMode) {
      const firstLvl = realMap[0];
      return firstLvl
        ? copyGrid(firstLvl.grid as CellType[][])
        : Array.from({ length: 8 }, () => Array(8).fill(BLOCK_EMPTY));
    }
    return copyGrid(BUILTIN_LEVELS[initialLevelIndex].grid);
  });
  const [cursor, setCursor] = useState<Position>(() => {
    if (isEditorMode) {
      const firstLvl = realMap[0];
      const w = firstLvl?.grid[0]?.length ?? 8;
      const h = firstLvl?.grid?.length ?? 8;
      return { x: Math.floor(w / 2), y: h - 1 };
    }
    return findInitialCursor(BUILTIN_LEVELS[initialLevelIndex].grid);
  });
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (isEditorMode) {
      const firstLvl = realMap[0];
      return firstLvl ? (firstLvl.timeLimit ?? 180) : 180;
    }
    return BUILTIN_LEVELS[initialLevelIndex].timeLimit;
  });

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLevelCleared, setIsLevelCleared] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [grabbed, setGrabbed] = useState<boolean>(false);
  const [isCursorVisible, setIsCursorVisible] = useState<boolean>(false);
  const [hasMovedFirstBlock, setHasMovedFirstBlock] = useState<boolean>(false);
  const [flashingBlocks, setFlashingBlocks] = useState<Record<string, CellType | boolean>>({});
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [firedOnce, setFiredOnce] = useState<Record<string, boolean>>({});

  const firedOnceRef = useRef<Record<string, boolean>>({});
  const cooldownsRef = useRef<Record<string, number>>({});
  const protectedBlocksRef = useRef<Map<string, number>>(new Map());

  const isProtectedCell = useCallback((y: number, x: number): boolean => {
    const key = `${y},${x}`;
    const expire = protectedBlocksRef.current.get(key);
    if (!expire) return false;
    if (Date.now() > expire) {
      protectedBlocksRef.current.delete(key);
      return false;
    }
    return true;
  }, []);

  const triggerShotRef = useRef<
    (x: number, y: number, dirX: number, curGrid: CellType[][], curMuted: boolean) => void
  >(() => {});

  const fireShooterRef = useRef<
    (x: number, y: number, dirX: number, curGrid: CellType[][], curMuted: boolean) => void
  >(() => {});

  const stateRef = useRef<{
    grid: CellType[][];
    cursor: Position;
    grabbed: boolean;
    isProcessing: boolean;
    isGameOver: boolean;
    isLevelCleared: boolean;
    hasMovedFirstBlock: boolean;
    isEditorMode: boolean;
    muted: boolean;
    flashingBlocks: Record<string, CellType | boolean>;
    bullets: Bullet[];
    triggerShot: (
      x: number,
      y: number,
      dirX: number,
      curGrid: CellType[][],
      curMuted: boolean
    ) => void;
    fireShooter: (
      x: number,
      y: number,
      dirX: number,
      curGrid: CellType[][],
      curMuted: boolean
    ) => void;
  }>({
    grid: [],
    cursor: { x: 0, y: 0 },
    grabbed: false,
    isProcessing: false,
    isGameOver: false,
    isLevelCleared: false,
    hasMovedFirstBlock: false,
    isEditorMode: false,
    muted: false,
    flashingBlocks: {},
    bullets: [],
    triggerShot: (x, y, dirX, curGrid, curMuted) =>
      triggerShotRef.current(x, y, dirX, curGrid, curMuted),
    fireShooter: (x, y, dirX, curGrid, curMuted) =>
      fireShooterRef.current(x, y, dirX, curGrid, curMuted),
  });

  useEffect(() => {
    stateRef.current = {
      grid,
      cursor,
      grabbed,
      isProcessing,
      isGameOver,
      isLevelCleared,
      hasMovedFirstBlock,
      isEditorMode,
      muted,
      flashingBlocks,
      bullets,
      triggerShot: (x, y, dirX, curGrid, curMuted) =>
        triggerShotRef.current(x, y, dirX, curGrid, curMuted),
      fireShooter: (x, y, dirX, curGrid, curMuted) =>
        fireShooterRef.current(x, y, dirX, curGrid, curMuted),
    };
  }, [
    grid,
    cursor,
    grabbed,
    isProcessing,
    isGameOver,
    isLevelCleared,
    hasMovedFirstBlock,
    isEditorMode,
    muted,
    flashingBlocks,
    bullets,
  ]);

  const updateCursor = useCallback(
    (updater: Position | ((prev: Position) => Position)) => {
      if (typeof updater === 'function') {
        setCursor((prev) => {
          const next = updater(prev);
          if (stateRef.current) {
            stateRef.current.cursor = next;
          }
          return next;
        });
      } else {
        if (stateRef.current) {
          stateRef.current.cursor = updater;
        }
        setCursor(updater);
      }
    },
    [setCursor]
  );

  const updateGrabbed = useCallback(
    (updater: boolean | ((prev: boolean) => boolean)) => {
      if (typeof updater === 'function') {
        setGrabbed((prev) => {
          const next = updater(prev);
          if (stateRef.current) {
            stateRef.current.grabbed = next;
          }
          return next;
        });
      } else {
        if (stateRef.current) {
          stateRef.current.grabbed = updater;
        }
        setGrabbed(updater);
      }
    },
    [setGrabbed]
  );

  const checkAndReleaseGrabbed = useCallback(
    (targetGrid: CellType[][], customFlashing?: Record<string, boolean>) => {
      if (!stateRef.current) return;
      const {
        cursor: curPos,
        grabbed: curLock,
        flashingBlocks: stateFlashing,
        isProcessing: curProcessing,
      } = stateRef.current;
      if (!curLock) return;
      const cell = targetGrid[curPos.y]?.[curPos.x];
      const curFlashing = customFlashing || stateFlashing || {};
      const isGrabable = cell !== undefined && getBlockProperties(cell, targetGrid)?.canSelect;

      if (!isGrabable || curFlashing[`${curPos.y},${curPos.x}`]) {
        if (curProcessing && !curFlashing[`${curPos.y},${curPos.x}`]) {
          return;
        }
        updateGrabbed(false);
      }
    },
    [updateGrabbed]
  );

  const [blockCounts, setBlockCounts] = useState<Record<string, number>>(() => {
    const initialGrid = isEditorMode
      ? (realMap[0]?.grid as CellType[][]) ||
        Array.from({ length: 8 }, () => Array(8).fill(BLOCK_EMPTY))
      : BUILTIN_LEVELS[initialLevelIndex].grid;
    const counts: Record<string, number> = {};
    initialGrid.forEach((row) => {
      row.forEach((cell) => {
        if (getBlockProperties(cell)?.canBeDestroyedByShooter) {
          counts[cell] = (counts[cell] || 0) + 1;
        }
      });
    });
    return counts;
  });

  // Calculate remaining target blocks on the grid
  const updateBlockCounts = useCallback((board: CellType[][]) => {
    const counts: Record<string, number> = {};
    board.forEach((row) => {
      row.forEach((cell) => {
        if (getBlockProperties(cell)?.canBeDestroyedByShooter) {
          counts[cell] = (counts[cell] || 0) + 1;
        }
      });
    });
    setBlockCounts(counts);
    return counts;
  }, []);

  // ── Editor engine (delegated) ──
  const editor = useEditorEngine(
    isEditorMode,
    isEditorPage,
    grid,
    setGrid,
    setCursor,
    setTimeLeft,
    muted,
    updateBlockCounts,
    setBlockCounts,
    setGrabbed,
    setIsGameOver,
    setIsLevelCleared,
    setIsProcessing,
    setBullets,
    setFlashingBlocks,
    stateRef as React.MutableRefObject<{
      flashingBlocks: Record<string, CellType | boolean>;
    }>,
    setHasMovedFirstBlock,
    updateGrabbed,
    setFiredOnce,
    firedOnceRef
  );

  // Initialize and Reset levels
  const loadLevel = useCallback(
    (levelIdx: number) => {
      if (levelIdx < 0 || levelIdx >= BUILTIN_LEVELS.length) return;
      physicsLoopIdRef.current++;
      const level = BUILTIN_LEVELS[levelIdx];
      setLevelIndex(levelIdx);
      setGrid(copyGrid(level.grid));
      setTimeLeft(level.timeLimit);
      setIsGameOver(false);
      setIsLevelCleared(false);
      setIsProcessing(false);
      updateGrabbed(false);
      setIsCursorVisible(false);
      setFlashingBlocks({});
      if (stateRef.current) stateRef.current.flashingBlocks = {};
      setBullets([]);
      setFiredOnce({});
      firedOnceRef.current = {};
      cooldownsRef.current = {};
      protectedBlocksRef.current.clear();
      autoWallDirections.current = {};
      autoWallDelays.current = {};
      prevGridRef.current = [];
      setHasMovedFirstBlock(false);
      clearUndoHistory();
      pendingMoveSnapshotRef.current = null;
      setRemainingUndos(0);
      updateBlockCounts(level.grid);
      playEngineSound('start', muted);
    },
    [muted, updateBlockCounts, updateGrabbed]
  );

  const resetLevel = useCallback(() => {
    physicsLoopIdRef.current++;
    updateGrabbed(false);
    setIsCursorVisible(false);
    setFlashingBlocks({});
    if (stateRef.current) stateRef.current.flashingBlocks = {};
    setBullets([]);
    setFiredOnce({});
    firedOnceRef.current = {};
    cooldownsRef.current = {};
    autoWallDirections.current = {};
    autoWallDelays.current = {};
    setHasMovedFirstBlock(false);
    prevGridRef.current = [];
    clearUndoHistory();
    pendingMoveSnapshotRef.current = null;
    setRemainingUndos(0);
    if (isEditorPage) {
      const activeLvl = editor.editorLevels[editor.editorActiveIndex];
      if (activeLvl) {
        setGrid(copyGrid(activeLvl.grid));
        updateBlockCounts(activeLvl.grid);
        setTimeLeft(activeLvl.timeLimit);
      }
      setIsLevelCleared(false);
      setIsGameOver(false);
      setIsProcessing(false);
    } else {
      loadLevel(levelIndex);
    }
  }, [
    isEditorPage,
    editor.editorActiveIndex,
    editor.editorLevels,
    levelIndex,
    loadLevel,
    updateBlockCounts,
    updateGrabbed,
  ]);

  // Main countdown timer (Game mode only)
  useEffect(() => {
    if (!showTimer || isEditorMode || isGameOver || isLevelCleared || isProcessing)
      return undefined;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          playEngineSound('error', muted);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimer, isEditorMode, isGameOver, isLevelCleared, isProcessing, muted]);

  // Physics step resolution logic (runs sequentially for animations)
  const runPhysicsLoop = useCallback(
    async (startGrid: CellType[][]) => {
      const currentLoopId = ++physicsLoopIdRef.current;
      setIsProcessing(true);
      if (stateRef.current) stateRef.current.isProcessing = true;
      let currentGrid = copyGrid(startGrid);
      if (stateRef.current) stateRef.current.grid = currentGrid;
      let keepGoing = true;

      // Auxiliary delay helper for animation frames
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      while (keepGoing) {
        // 1. Gravity phase
        const gravityResult = applyGravity(currentGrid);

        if (gravityResult.changed) {
          const nextProtected = new Map<string, number>();
          const H = currentGrid.length;
          const W = currentGrid[0]?.length || 0;
          for (let y = H - 2; y >= 0; y--) {
            for (let x = 0; x < W; x++) {
              const key = `${y},${x}`;
              const expire = protectedBlocksRef.current.get(key);
              if (expire) {
                if (
                  gravityResult.grid[y + 1]?.[x] === currentGrid[y][x] &&
                  gravityResult.grid[y][x] === BLOCK_EMPTY
                ) {
                  nextProtected.set(`${y + 1},${x}`, expire);
                } else if (gravityResult.grid[y][x] === currentGrid[y][x]) {
                  nextProtected.set(key, expire);
                }
              }
            }
          }
          protectedBlocksRef.current = nextProtected;

          if (stateRef.current?.grabbed) {
            const { cursor: curCursor } = stateRef.current;
            const oldCell = currentGrid[curCursor.y]?.[curCursor.x];
            const wasEmptyBelow = currentGrid[curCursor.y + 1]?.[curCursor.x] === BLOCK_EMPTY;
            const newCellBelow = gravityResult.grid[curCursor.y + 1]?.[curCursor.x];
            if (
              oldCell !== undefined &&
              getBlockProperties(oldCell, currentGrid)?.canFall &&
              wasEmptyBelow &&
              newCellBelow === oldCell
            ) {
              const nextCursor = { x: curCursor.x, y: curCursor.y + 1 };
              updateCursor(nextCursor);
            }
          }
          currentGrid = gravityResult.grid;
          setGrid(currentGrid);
          if (stateRef.current) stateRef.current.grid = currentGrid;
          checkAndReleaseGrabbed(currentGrid);
          updateBlockCounts(currentGrid);
          playEngineSound('fall', muted);
          await delay(200); // falling animation duration
          if (physicsLoopIdRef.current !== currentLoopId) return;
          if (stateRef.current?.grid) {
            currentGrid = copyGrid(stateRef.current.grid);
          }
          continue; // Re-evaluate gravity until stable
        }

        // 1.2 Wormhole phase
        const wormholeResult = applyWormholes(currentGrid);
        if (wormholeResult.changed) {
          // Immediately teleport object and update grid
          currentGrid = wormholeResult.grid;
          setGrid(currentGrid);
          if (stateRef.current) stateRef.current.grid = currentGrid;

          // Show closing animation on the consumed portals
          if (wormholeResult.closingWormholeKeys.size > 0) {
            const wormholeFlashing: Record<string, CellType | boolean> = {};
            wormholeResult.closingWormholeKeys.forEach((type, key) => {
              wormholeFlashing[key] = type;
            });
            setFlashingBlocks(wormholeFlashing);
            if (stateRef.current) stateRef.current.flashingBlocks = wormholeFlashing;
            playEngineSound('select', muted);
            await delay(250); // Wait for wormhole-close animation (matches CSS duration)
            if (physicsLoopIdRef.current !== currentLoopId) return;
            setFlashingBlocks({});
            if (stateRef.current) stateRef.current.flashingBlocks = {};
          }

          currentGrid = wormholeResult.grid;
          setGrid(currentGrid);
          if (stateRef.current) stateRef.current.grid = currentGrid;
          checkAndReleaseGrabbed(currentGrid);
          updateBlockCounts(currentGrid);
          await delay(100);
          if (physicsLoopIdRef.current !== currentLoopId) return;
          if (stateRef.current?.grid) {
            currentGrid = copyGrid(stateRef.current.grid);
          }
          continue; // Re-evaluate gravity and physics after wormhole teleportation
        }

        // 1.3 Blackhole phase
        const blackholeResult = applyBlackholes(currentGrid);
        if (blackholeResult.changed) {
          currentGrid = blackholeResult.grid;
          setGrid(currentGrid);
          if (stateRef.current) stateRef.current.grid = currentGrid;
          checkAndReleaseGrabbed(currentGrid);
          updateBlockCounts(currentGrid);
          playEngineSound('select', muted);
          await delay(100);
          if (physicsLoopIdRef.current !== currentLoopId) return;
          if (stateRef.current?.grid) {
            currentGrid = copyGrid(stateRef.current.grid);
          }
          continue; // Re-evaluate gravity and physics after blackhole teleportation
        }

        // 1.5 Spike check phase
        const spikeResult = applySpikes(currentGrid);

        if (spikeResult.changed) {
          if (pendingMoveSnapshotRef.current) {
            pushSnapshot(pendingMoveSnapshotRef.current);
            pendingMoveSnapshotRef.current = null;
          } else {
            pushSnapshot({
              grid: copyGrid(currentGrid),
              cursor: { ...stateRef.current.cursor },
              grabbed: stateRef.current.grabbed,
              autoWallDirections: { ...autoWallDirections.current },
              firedOnce: { ...firedOnceRef.current },
            });
          }
          currentGrid = spikeResult.grid;
          setGrid(currentGrid);
          if (stateRef.current) stateRef.current.grid = currentGrid;
          checkAndReleaseGrabbed(currentGrid);
          updateBlockCounts(currentGrid);
          playEngineSound('break', muted);
          await delay(200);
          if (physicsLoopIdRef.current !== currentLoopId) return;
          if (stateRef.current?.grid) {
            currentGrid = copyGrid(stateRef.current.grid);
          }
          continue; // Re-evaluate gravity and spikes after block removal
        }

        // 2. Match Phase (2 or more adjacent identical blocks touch)
        const bulletTargetKeys = new Set<string>();
        (stateRef.current?.bullets || []).forEach((b) => {
          bulletTargetKeys.add(`${b.targetY},${b.targetX}`);
        });

        const matchResult = findMatches(currentGrid, bulletTargetKeys);

        if (matchResult.changed) {
          if (pendingMoveSnapshotRef.current) {
            pushSnapshot(pendingMoveSnapshotRef.current);
            pendingMoveSnapshotRef.current = null;
          } else {
            pushSnapshot({
              grid: copyGrid(currentGrid),
              cursor: { ...stateRef.current.cursor },
              grabbed: stateRef.current.grabbed,
              autoWallDirections: { ...autoWallDirections.current },
              firedOnce: { ...firedOnceRef.current },
            });
          }
          const strawTransitions = findAdjacentStrawTransitions(
            currentGrid,
            matchResult.toClearKeys
          );

          // Record flashing blocks (cleared blocks and straw transitions)
          const nextFlashing: Record<string, boolean> = {};
          matchResult.toClearKeys.forEach((key) => {
            nextFlashing[key] = true;
          });
          strawTransitions.forEach((_, key) => {
            nextFlashing[key] = true;
          });
          setFlashingBlocks(nextFlashing);
          if (stateRef.current) stateRef.current.flashingBlocks = nextFlashing;
          checkAndReleaseGrabbed(currentGrid, nextFlashing);
          playEngineSound('match', muted);

          await delay(320); // Faster, snappy match and unfreeze resolution
          if (physicsLoopIdRef.current !== currentLoopId) return;

          setFlashingBlocks({});
          if (stateRef.current) stateRef.current.flashingBlocks = {};
          const baseGrid = stateRef.current?.grid ? stateRef.current.grid : currentGrid;
          currentGrid = clearMatches(
            baseGrid,
            matchResult.toClearKeys,
            strawTransitions,
            matchResult.unfreezeTransitions
          );
          setGrid(currentGrid);
          if (stateRef.current) stateRef.current.grid = currentGrid;
          checkAndReleaseGrabbed(currentGrid);
          updateBlockCounts(currentGrid);
          if (matchResult.unfreezeTransitions && matchResult.unfreezeTransitions.size > 0) {
            playEngineSound('ice-break', muted);
          }
          continue; // Loop back to gravity check to drop blocks that were held
        }

        // Neither gravity nor matches occurred, physics is stable
        keepGoing = false;
      }

      // Check win/lose conditions after resolution
      const finalCounts = updateBlockCounts(currentGrid);
      const remainingBlocks = Object.values(finalCounts).reduce((a, b) => a + b, 0);

      if (remainingBlocks === 0 && !isEditorMode) {
        setIsLevelCleared(true);
        playEngineSound('start', muted);
      } else if (!isEditorMode) {
        // Detect if any legal matches are still possible, otherwise warn player/prompt retry
        // In this implementation, we allow the user to retry if they get stuck.
      }

      // Maintain lock state after move settles, but release if block is gone (e.g. matched or fell)
      checkAndReleaseGrabbed(currentGrid);

      setIsProcessing(false);
      if (stateRef.current) stateRef.current.isProcessing = false;
    },
    [isEditorMode, muted, updateBlockCounts, checkAndReleaseGrabbed, updateCursor]
  );

  // Move Block left, right, up, or down
  const moveBlock = useCallback(
    (x: number, y: number, dx: number, dy: number) => {
      const curState = stateRef.current;

      const hasFlashingBlocks = Object.keys(curState.flashingBlocks || {}).length > 0;

      if (
        curState.isGameOver ||
        curState.isLevelCleared ||
        curState.isEditorMode ||
        curState.isProcessing ||
        hasFlashingBlocks
      )
        return;

      const bulletTargetKeys = new Set<string>();
      (curState.bullets || []).forEach((b) => {
        bulletTargetKeys.add(`${b.targetY},${b.targetX}`);
      });

      const result = tryMoveBlock(
        curState.grid,
        x,
        y,
        dx,
        dy,
        curState.flashingBlocks,
        bulletTargetKeys
      );

      if (!result.success) {
        playEngineSound('error', curState.muted);
        return;
      }

      setRemainingUndos(0);

      pendingMoveSnapshotRef.current = {
        grid: copyGrid(curState.grid),
        cursor: { ...curState.cursor },
        grabbed: curState.grabbed,
        autoWallDirections: { ...autoWallDirections.current },
        firedOnce: { ...firedOnceRef.current },
      };

      // Check if the block (or stack) being moved was sitting on top of a shooter
      const isAboveShooter =
        y < curState.grid.length - 1 &&
        (curState.grid[y + 1][x] === BLOCK_SHOOTER_L ||
          curState.grid[y + 1][x] === BLOCK_SHOOTER_R ||
          curState.grid[y + 1][x] === BLOCK_SHOOTER_L_ONCE ||
          curState.grid[y + 1][x] === BLOCK_SHOOTER_R_ONCE);

      if (isAboveShooter) {
        const now = Date.now();
        const H = curState.grid.length;
        const W = curState.grid[0]?.length || 0;
        for (let ry = 0; ry < H; ry++) {
          for (let rx = 0; rx < W; rx++) {
            if (curState.grid[ry][rx] !== BLOCK_EMPTY && result.grid[ry][rx] === BLOCK_EMPTY) {
              const destY = ry + dy;
              const destX = rx + dx;
              protectedBlocksRef.current.set(`${destY},${destX}`, now + 1000);
            }
          }
        }
      }

      if (result.consumedPortals && Object.keys(result.consumedPortals).length > 0) {
        const portalFlashing = result.consumedPortals;
        setFlashingBlocks((prev) => ({ ...prev, ...portalFlashing }));
        if (stateRef.current) {
          stateRef.current.flashingBlocks = {
            ...stateRef.current.flashingBlocks,
            ...portalFlashing,
          };
        }
        playEngineSound('select', curState.muted);
        setTimeout(() => {
          setFlashingBlocks({});
          if (stateRef.current) stateRef.current.flashingBlocks = {};
        }, 250);
      }

      setHasMovedFirstBlock(true);
      setGrid(result.grid);
      if (stateRef.current) {
        stateRef.current.grid = result.grid;
        stateRef.current.hasMovedFirstBlock = true;
        stateRef.current.cursor = {
          x: result.newCursorX,
          y: result.newCursorY,
        };
      }
      updateCursor({ x: result.newCursorX, y: result.newCursorY });
      playEngineSound('select', curState.muted);

      // Start physics solver
      runPhysicsLoop(result.grid);
    },
    [runPhysicsLoop, updateCursor]
  );

  const triggerShot = useCallback(
    (x: number, y: number, dirX: number, curGrid: CellType[][], curMuted: boolean) => {
      const W = curGrid[0]?.length || 8;
      playEngineSound('shoot', curMuted);

      const processBulletLeg = (startX: number, startY: number, gridForLeg: CellType[][]) => {
        // Raycast to find target for this leg
        let tx = startX + dirX;
        while (tx >= 0 && tx < W) {
          const cell = gridForLeg[startY]?.[tx];
          if (cell !== BLOCK_EMPTY && cell !== undefined) {
            break;
          }
          tx += dirX;
        }

        const bulletId = Math.random().toString();
        const newBullet: Bullet = {
          id: bulletId,
          startX,
          startY,
          targetX: tx,
          targetY: startY,
          dir: dirX,
          firedAt: Date.now(),
        };

        setBullets((prev) => [...prev, newBullet]);
        if (stateRef.current) {
          stateRef.current.bullets = [...stateRef.current.bullets, newBullet];
        }

        setTimeout(() => {
          // Read the latest state of this bullet to check if ignoreNextCell is true
          const latestBullet = stateRef.current?.bullets.find((b) => b.id === bulletId);
          const shouldIgnoreNextCell = latestBullet?.ignoreNextCell || false;

          setBullets((prev) => prev.filter((b) => b.id !== bulletId));
          if (stateRef.current) {
            stateRef.current.bullets = stateRef.current.bullets.filter((b) => b.id !== bulletId);
          }

          const currentW = gridForLeg[0]?.length || W;
          const latestGrid = stateRef.current?.grid || gridForLeg;

          let hitX = startX + dirX;
          while (hitX >= 0 && hitX < currentW) {
            const isNextCell = hitX === startX + dirX;
            const shouldIgnore = isNextCell && shouldIgnoreNextCell;

            if (hitX === tx || (latestGrid[startY]?.[hitX] !== BLOCK_EMPTY && !shouldIgnore)) {
              break;
            }
            hitX += dirX;
          }

          if (hitX >= 0 && hitX < currentW) {
            const currentCell = latestGrid[startY]?.[hitX];
            if (currentCell !== undefined && currentCell !== BLOCK_EMPTY) {
              if (isPortalBlock(currentCell) || isWormholeBlock(currentCell)) {
                // Target is a Portal / Wormhole!
                const pairPos = findPairedWormhole(latestGrid, currentCell, startY, hitX);

                pushSnapshot({
                  grid: copyGrid(latestGrid),
                  cursor: { ...stateRef.current.cursor },
                  grabbed: stateRef.current.grabbed,
                  autoWallDirections: { ...autoWallDirections.current },
                  firedOnce: { ...firedOnceRef.current },
                });

                const nextGrid = copyGrid(latestGrid);
                nextGrid[startY][hitX] = BLOCK_EMPTY;

                const wormholeFlashing: Record<string, CellType | boolean> = {
                  [`${startY},${hitX}`]: currentCell,
                };

                if (pairPos) {
                  nextGrid[pairPos.y][pairPos.x] = BLOCK_EMPTY;
                  wormholeFlashing[`${pairPos.y},${pairPos.x}`] = currentCell;
                }

                setGrid(nextGrid);
                if (stateRef.current) {
                  stateRef.current.grid = nextGrid;
                }

                setFlashingBlocks((prev) => ({ ...prev, ...wormholeFlashing }));
                if (stateRef.current) {
                  stateRef.current.flashingBlocks = {
                    ...stateRef.current.flashingBlocks,
                    ...wormholeFlashing,
                  };
                }

                playEngineSound('select', curMuted);

                setTimeout(() => {
                  setFlashingBlocks({});
                  if (stateRef.current) stateRef.current.flashingBlocks = {};
                }, 250);

                if (pairPos) {
                  // Continue bullet leg 2 from paired portal position in same direction
                  processBulletLeg(pairPos.x, pairPos.y, nextGrid);
                } else {
                  setTimeout(() => {
                    const finalGrid = stateRef.current?.grid || nextGrid;
                    runPhysicsLoop(finalGrid);
                  }, 150);
                }
                return;
              } else if (isFrozenBlock(currentCell)) {
                pushSnapshot({
                  grid: copyGrid(latestGrid),
                  cursor: { ...stateRef.current.cursor },
                  grabbed: stateRef.current.grabbed,
                  autoWallDirections: { ...autoWallDirections.current },
                  firedOnce: { ...firedOnceRef.current },
                });
                const nextGrid = copyGrid(latestGrid);
                nextGrid[startY][hitX] = getBaseBlockId(currentCell);
                setGrid(nextGrid);
                if (stateRef.current) {
                  stateRef.current.grid = nextGrid;
                }
                checkAndReleaseGrabbed(nextGrid);
                updateBlockCounts(nextGrid);
                playEngineSound('ice-break', curMuted);

                setTimeout(() => {
                  const finalGrid = stateRef.current?.grid || nextGrid;
                  runPhysicsLoop(finalGrid);
                }, 150);
                return;
              } else if (getBlockProperties(currentCell, latestGrid)?.canBeDestroyedByShooter) {
                pushSnapshot({
                  grid: copyGrid(latestGrid),
                  cursor: { ...stateRef.current.cursor },
                  grabbed: stateRef.current.grabbed,
                  autoWallDirections: { ...autoWallDirections.current },
                  firedOnce: { ...firedOnceRef.current },
                });
                const nextGrid = copyGrid(latestGrid);
                nextGrid[startY][hitX] = BLOCK_EMPTY;
                const dy = [-1, 1, 0, 0];
                const dx = [0, 0, -1, 1];
                for (let i = 0; i < 4; i++) {
                  const ny = startY + dy[i];
                  const nx = hitX + dx[i];
                  if (
                    ny >= 0 &&
                    ny < nextGrid.length &&
                    nx >= 0 &&
                    nx < (nextGrid[ny]?.length || 0)
                  ) {
                    const neighbor = nextGrid[ny][nx];
                    if (isFrozenBlock(neighbor)) {
                      nextGrid[ny][nx] = getBaseBlockId(neighbor);
                    }
                  }
                }
                setGrid(nextGrid);
                if (stateRef.current) {
                  stateRef.current.grid = nextGrid;
                }
                checkAndReleaseGrabbed(nextGrid);
                updateBlockCounts(nextGrid);
                playEngineSound('break', curMuted);

                setTimeout(() => {
                  const finalGrid = stateRef.current?.grid || nextGrid;
                  runPhysicsLoop(finalGrid);
                }, 150);
                return;
              } else if (isStrawBlock(currentCell)) {
                pushSnapshot({
                  grid: copyGrid(latestGrid),
                  cursor: { ...stateRef.current.cursor },
                  grabbed: stateRef.current.grabbed,
                  autoWallDirections: { ...autoWallDirections.current },
                  firedOnce: { ...firedOnceRef.current },
                });
                const nextGrid = copyGrid(latestGrid);
                nextGrid[startY][hitX] = getNextStrawBlockId(currentCell);
                setGrid(nextGrid);
                if (stateRef.current) {
                  stateRef.current.grid = nextGrid;
                }
                checkAndReleaseGrabbed(nextGrid);
                updateBlockCounts(nextGrid);
                playEngineSound('break', curMuted);

                setTimeout(() => {
                  const finalGrid = stateRef.current?.grid || nextGrid;
                  runPhysicsLoop(finalGrid);
                }, 150);
                return;
              }
            }
          }

          setTimeout(() => {
            const finalGrid = stateRef.current?.grid || gridForLeg;
            runPhysicsLoop(finalGrid);
          }, 50);
        }, 300);
      };

      processBulletLeg(x, y, curGrid);
    },
    [runPhysicsLoop, checkAndReleaseGrabbed, pushSnapshot, updateBlockCounts]
  );

  const fireShooter = useCallback(
    (x: number, y: number, dirX: number, curGrid: CellType[][], curMuted: boolean) => {
      let activeGrid = curGrid;
      const curFlashingBlocks = stateRef.current?.flashingBlocks || {};
      const bulletTargetKeys = new Set<string>();
      (stateRef.current?.bullets || []).forEach((b) => {
        bulletTargetKeys.add(`${b.targetY},${b.targetX}`);
      });

      if (y > 0 && curGrid[y - 1]?.[x] !== BLOCK_EMPTY) {
        const moveResult = tryMoveBlock(
          curGrid,
          x,
          y - 1,
          dirX,
          0,
          curFlashingBlocks,
          bulletTargetKeys
        );

        if (moveResult.success) {
          activeGrid = moveResult.grid;

          const now = Date.now();
          const H = curGrid.length;
          const W = curGrid[0]?.length || 0;
          for (let ry = 0; ry < H; ry++) {
            for (let rx = 0; rx < W; rx++) {
              if (curGrid[ry][rx] !== BLOCK_EMPTY && activeGrid[ry][rx] === BLOCK_EMPTY) {
                const destY = ry;
                const destX = rx + dirX;
                protectedBlocksRef.current.set(`${destY},${destX}`, now + 1000);
              }
            }
          }

          setGrid(activeGrid);
          if (stateRef.current) {
            stateRef.current.grid = activeGrid;
          }

          if (!stateRef.current?.isProcessing) {
            runPhysicsLoop(activeGrid);
          }
        }
      }

      triggerShot(x, y, dirX, activeGrid, curMuted);
    },
    [triggerShot, runPhysicsLoop]
  );

  useEffect(() => {
    triggerShotRef.current = triggerShot;
    fireShooterRef.current = fireShooter;
  }, [triggerShot, fireShooter]);

  // Interval timer for auto-moving walls (patrol slabs)
  useEffect(() => {
    if (isEditorMode) return undefined;

    const interval = setInterval(() => {
      const {
        grid: curGrid,
        cursor: curCursor,
        isProcessing: curProcessing,
        isGameOver: curGameOver,
        isLevelCleared: curLevelCleared,
        flashingBlocks: curFlashingBlocks = {},
      } = stateRef.current;

      // Skip this tick if the game is over or cleared
      if (curGameOver || curLevelCleared) return;

      let moved = false;
      let nextCursor = { ...curCursor };
      const nextGrid = copyGrid(curGrid);
      const H = nextGrid.length;
      const W = nextGrid[0]?.length || 0;

      // Track which cells have already been processed in this tick to avoid double moves
      const processed: boolean[][] = Array.from({ length: H }, () => Array(W).fill(false));

      const nextDirections: Record<string, number> = {
        ...autoWallDirections.current,
      };
      const nextDelays: Record<string, number> = {};
      const newPortalFlashing: Record<string, CellType | boolean> = {};

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (processed[y][x]) continue;

          const cell = curGrid[y][x];
          if (cell === BLOCK_AUTO_WALL_H) {
            const dirKey = `${y},${x}`;
            let dx = nextDirections[dirKey] !== undefined ? nextDirections[dirKey] : -1;
            const hasDelayKey = autoWallDelays.current[dirKey] !== undefined;
            const currentDelay = hasDelayKey ? autoWallDelays.current[dirKey] : 0;

            const bulletTargetKeys = new Set<string>();
            (stateRef.current?.bullets || []).forEach((b) => {
              bulletTargetKeys.add(`${b.targetY},${b.targetX}`);
            });

            let moveRes = tryMoveBlock(nextGrid, x, y, dx, 0, curFlashingBlocks, bulletTargetKeys);

            if (!moveRes.success) {
              if (!hasDelayKey && AUTO_WALL_TURN_DELAY_TICKS > 0) {
                nextDelays[dirKey] = AUTO_WALL_TURN_DELAY_TICKS - 1;
                nextDirections[dirKey] = dx;
              } else if (hasDelayKey && currentDelay > 0) {
                nextDelays[dirKey] = currentDelay - 1;
                nextDirections[dirKey] = dx;
              } else {
                dx = -dx;
                moveRes = tryMoveBlock(nextGrid, x, y, dx, 0, curFlashingBlocks, bulletTargetKeys);
              }
            }

            if (moveRes.success) {
              for (let r = 0; r < H; r++) {
                for (let c = 0; c < W; c++) {
                  nextGrid[r][c] = moveRes.grid[r][c];
                }
              }

              if (moveRes.finalPositions) {
                for (const fp of moveRes.finalPositions) {
                  if (fp.y >= 0 && fp.y < H && fp.x >= 0 && fp.x < W) {
                    processed[fp.y][fp.x] = true;
                  }
                }
              }

              if (moveRes.movedCoords && moveRes.finalPositions) {
                for (let i = 0; i < moveRes.movedCoords.length; i++) {
                  const mc = moveRes.movedCoords[i];
                  const fp = moveRes.finalPositions[i];
                  if (mc.x === nextCursor.x && mc.y === nextCursor.y) {
                    nextCursor = { x: fp.x, y: fp.y };
                    if (stateRef.current) {
                      stateRef.current.cursor = nextCursor;
                    }
                    updateCursor(nextCursor);
                    break;
                  }
                }
              }

              if (moveRes.consumedPortals) {
                Object.assign(newPortalFlashing, moveRes.consumedPortals);
              }

              delete nextDirections[dirKey];
              nextDirections[`${moveRes.newCursorY},${moveRes.newCursorX}`] = dx;
              moved = true;
            } else {
              nextDirections[dirKey] = dx;
            }
          } else if (cell === BLOCK_AUTO_WALL_V) {
            const dirKey = `${y},${x}`;
            let dy = nextDirections[dirKey] !== undefined ? nextDirections[dirKey] : -1;
            const hasDelayKey = autoWallDelays.current[dirKey] !== undefined;
            const currentDelay = hasDelayKey ? autoWallDelays.current[dirKey] : 0;

            const bulletTargetKeys = new Set<string>();
            (stateRef.current?.bullets || []).forEach((b) => {
              bulletTargetKeys.add(`${b.targetY},${b.targetX}`);
            });

            let moveRes = tryMoveBlock(nextGrid, x, y, 0, dy, curFlashingBlocks, bulletTargetKeys);

            if (!moveRes.success) {
              if (!hasDelayKey && AUTO_WALL_TURN_DELAY_TICKS > 0) {
                nextDelays[dirKey] = AUTO_WALL_TURN_DELAY_TICKS - 1;
                nextDirections[dirKey] = dy;
              } else if (hasDelayKey && currentDelay > 0) {
                nextDelays[dirKey] = currentDelay - 1;
                nextDirections[dirKey] = dy;
              } else {
                dy = -dy;
                moveRes = tryMoveBlock(nextGrid, x, y, 0, dy, curFlashingBlocks, bulletTargetKeys);
              }
            }

            if (moveRes.success) {
              for (let r = 0; r < H; r++) {
                for (let c = 0; c < W; c++) {
                  nextGrid[r][c] = moveRes.grid[r][c];
                }
              }

              if (moveRes.finalPositions) {
                for (const fp of moveRes.finalPositions) {
                  if (fp.y >= 0 && fp.y < H && fp.x >= 0 && fp.x < W) {
                    processed[fp.y][fp.x] = true;
                  }
                }
              }

              if (moveRes.movedCoords && moveRes.finalPositions) {
                for (let i = 0; i < moveRes.movedCoords.length; i++) {
                  const mc = moveRes.movedCoords[i];
                  const fp = moveRes.finalPositions[i];
                  if (mc.x === nextCursor.x && mc.y === nextCursor.y) {
                    nextCursor = { x: fp.x, y: fp.y };
                    if (stateRef.current) {
                      stateRef.current.cursor = nextCursor;
                    }
                    updateCursor(nextCursor);
                    break;
                  }
                }
              }

              if (moveRes.consumedPortals) {
                Object.assign(newPortalFlashing, moveRes.consumedPortals);
              }

              delete nextDirections[dirKey];
              nextDirections[`${moveRes.newCursorY},${moveRes.newCursorX}`] = dy;
              moved = true;
            } else {
              nextDirections[dirKey] = dy;
            }
          }
        }
      }

      autoWallDirections.current = nextDirections;
      autoWallDelays.current = nextDelays;

      if (Object.keys(newPortalFlashing).length > 0) {
        setFlashingBlocks((prev) => ({ ...prev, ...newPortalFlashing }));
        if (stateRef.current) {
          stateRef.current.flashingBlocks = {
            ...stateRef.current.flashingBlocks,
            ...newPortalFlashing,
          };
        }
        playEngineSound('select', muted);
        setTimeout(() => {
          setFlashingBlocks({});
          if (stateRef.current) stateRef.current.flashingBlocks = {};
        }, 250);
      }

      if (moved) {
        if (stateRef.current) {
          stateRef.current.grid = nextGrid;
          stateRef.current.cursor = nextCursor;
        }
        setGrid(nextGrid);
        checkAndReleaseGrabbed(nextGrid);
        if (!curProcessing) {
          runPhysicsLoop(nextGrid);
        }
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isEditorMode, runPhysicsLoop, updateCursor, checkAndReleaseGrabbed]);

  // Watch grid changes to detect when a block leaves a shooter
  useEffect(() => {
    if (isEditorMode) return;
    const prevGrid = prevGridRef.current;
    if (
      prevGrid.length === 0 ||
      prevGrid.length !== grid.length ||
      (grid.length > 0 && prevGrid[0]?.length !== grid[0]?.length)
    ) {
      prevGridRef.current = copyGrid(grid);
      return;
    }

    const H = grid.length;
    const W = grid[0]?.length || 0;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const cell = grid[y][x];
        const isShooter =
          cell === BLOCK_SHOOTER_L ||
          cell === BLOCK_SHOOTER_R ||
          cell === BLOCK_SHOOTER_L_ONCE ||
          cell === BLOCK_SHOOTER_R_ONCE;

        if (isShooter && y > 0) {
          const wasOccupied = prevGrid[y - 1]?.[x] !== BLOCK_EMPTY;
          const isOccupied = grid[y - 1]?.[x] !== BLOCK_EMPTY;
          if (wasOccupied && !isOccupied) {
            // Block was on top of the shooter but has now left
            setBullets((prev) =>
              prev.map((b) =>
                b.startX === x && b.startY === y ? { ...b, ignoreNextCell: true } : b
              )
            );
          }
        }
      }
    }
    prevGridRef.current = copyGrid(grid);
  }, [grid, isEditorMode]);

  // Interval timer for shooter blocks
  useEffect(() => {
    if (isEditorMode) return undefined;

    const interval = setInterval(() => {
      const {
        grid: curGrid,
        isGameOver: curGameOver,
        isLevelCleared: curLevelCleared,
        muted: curMuted,
        triggerShot: curTriggerShot,
      } = stateRef.current;

      // Skip this tick if the game is over or cleared
      if (curGameOver || curLevelCleared) return;

      // Scan grid for shooters and trigger shooting if button is pressed
      const H = curGrid.length;
      const W = curGrid[0]?.length || 0;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const cell = curGrid[y][x];
          const isShooter =
            cell === BLOCK_SHOOTER_L ||
            cell === BLOCK_SHOOTER_R ||
            cell === BLOCK_SHOOTER_L_ONCE ||
            cell === BLOCK_SHOOTER_R_ONCE;

          if (!isShooter) continue;

          const key = `${y},${x}`;
          const hasBlockOnTop = y > 0 && curGrid[y - 1][x] !== BLOCK_EMPTY;

          if (hasBlockOnTop) {
            if (cell === BLOCK_SHOOTER_L || cell === BLOCK_SHOOTER_R) {
              const lastFired = cooldownsRef.current[key] || 0;
              if (Date.now() - lastFired >= SHOOTER_INTERVAL) {
                const dirX = cell === BLOCK_SHOOTER_L ? -1 : 1;
                curTriggerShot(x, y, dirX, curGrid, curMuted);
                cooldownsRef.current[key] = Date.now();
              }
            } else {
              const fired = firedOnceRef.current[key] || false;
              if (!fired) {
                const dirX = cell === BLOCK_SHOOTER_L_ONCE ? -1 : 1;
                curTriggerShot(x, y, dirX, curGrid, curMuted);
                firedOnceRef.current[key] = true;
                setFiredOnce((prev) => ({ ...prev, [key]: true }));
              }
            }
          } else {
            // Reset state when block is removed/empty
            if (cell === BLOCK_SHOOTER_L || cell === BLOCK_SHOOTER_R) {
              cooldownsRef.current[key] = 0;
            }
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isEditorMode]);

  const undoPlay = useCallback(() => {
    if (isEditorMode) return;
    const snapshot = popSnapshot();
    if (!snapshot) return;

    physicsLoopIdRef.current++;

    setGrid(copyGrid(snapshot.grid));
    if (stateRef.current) stateRef.current.grid = copyGrid(snapshot.grid);

    updateCursor(snapshot.cursor);
    if (stateRef.current) stateRef.current.cursor = snapshot.cursor;

    updateGrabbed(false);

    if (snapshot.autoWallDirections) {
      autoWallDirections.current = { ...snapshot.autoWallDirections };
    }
    if (snapshot.firedOnce) {
      setFiredOnce(snapshot.firedOnce);
      firedOnceRef.current = { ...snapshot.firedOnce };
    }

    setFlashingBlocks({});
    if (stateRef.current) stateRef.current.flashingBlocks = {};

    setBullets([]);
    setIsGameOver(false);
    if (stateRef.current) stateRef.current.isGameOver = false;

    setIsLevelCleared(false);
    if (stateRef.current) stateRef.current.isLevelCleared = false;

    setIsProcessing(false);
    if (stateRef.current) stateRef.current.isProcessing = false;

    updateBlockCounts(snapshot.grid);
    if (remainingUndos > 0) {
      setRemainingUndos((prev) => Math.max(0, prev - 1));
    }
    playEngineSound('select', muted);
  }, [
    isEditorMode,
    popSnapshot,
    updateCursor,
    updateGrabbed,
    updateBlockCounts,
    muted,
    remainingUndos,
  ]);

  useUndoHotkey({
    enabled: !isEditorMode,
    onUndo: undoPlay,
  });

  return {
    grid,
    setGrid,
    cursor,
    setCursor: updateCursor,
    timeLeft,
    setTimeLeft,
    isGameOver,
    setIsGameOver,
    isLevelCleared,
    setIsLevelCleared,
    isProcessing,
    blockCounts,
    levelIndex,
    loadLevel,
    resetLevel,
    moveBlock,
    undoPlay,
    canUndoPlay,
    historySize,
    remainingUndos,
    setRemainingUndos,
    startUndoChance,
    editorPlaceBlock: editor.editorPlaceBlock,
    editorClearGrid: editor.editorClearGrid,
    editorResizeGrid: editor.editorResizeGrid,
    editorFillBorder: editor.editorFillBorder,
    editorDeleteRow: editor.editorDeleteRow,
    editorDeleteCol: editor.editorDeleteCol,
    editorInsertRowAbove: editor.editorInsertRowAbove,
    editorInsertRowBelow: editor.editorInsertRowBelow,
    editorInsertColLeft: editor.editorInsertColLeft,
    editorInsertColRight: editor.editorInsertColRight,
    copiedCol: editor.copiedCol,
    copiedRow: editor.copiedRow,
    editorCopyCol: editor.editorCopyCol,
    editorPasteCol: editor.editorPasteCol,
    editorCopyRow: editor.editorCopyRow,
    editorPasteRow: editor.editorPasteRow,
    editorFlipHorizontal: editor.editorFlipHorizontal,
    muted,
    setMuted,
    grabbed,
    setGrabbed: updateGrabbed,
    isCursorVisible,
    setIsCursorVisible,
    hasMovedFirstBlock,
    flashingBlocks,
    bullets,
    firedOnce,
    editorLevels: editor.editorLevels,
    setEditorLevels: editor.setEditorLevels,
    editorActiveIndex: editor.editorActiveIndex,
    setEditorActiveIndex: editor.setEditorActiveIndex,
    selectEditorLevel: editor.selectEditorLevel,
    editorAddLevel: editor.editorAddLevel,
    editorDeleteLevel: editor.editorDeleteLevel,
    editorUpdateTimeLimit: editor.editorUpdateTimeLimit,
    editorImportJSON: editor.editorImportJSON,
    editorRestoreLevel: editor.editorRestoreLevel,
    editorUndo: editor.editorUndo,
    editorPushHistory: editor.editorPushHistory,
    editorMapType,
    setEditorMapType,
    changeMapType: editor.changeMapType,
    editorAddHint: editor.editorAddHint,
    editorDeleteHint: editor.editorDeleteHint,
  };
};
