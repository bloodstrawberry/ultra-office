'use client';

import type { BlockId } from '../object/constants';

import { useRef, useState, useEffect, useCallback } from 'react';

import { findShisenShoPath } from './shisen-sho';
import {
  PATH_H,
  BLOCK_EGG,
  PATH_NONE,
  BLOCK_WALL,
  BLOCK_PATH,
  BLOCK_EMPTY,
  isWaterTile,
  BLOCK_RABBIT,
  getBaseBlockId,
  isChickenBlock,
  PATH_CORNER_TL,
  PATH_CORNER_TR,
  PATH_CORNER_BR,
  PATH_CORNER_BL,
  BLOCK_CHICKEN_D,
  BLOCK_CHICKEN_U,
  BLOCK_CHICKEN_L,
  BLOCK_CHICKEN_R,
  getBlockProperties,
  getPathConnections,
  getWaterFlowVector,
  WATER_CORNER_TL_CW,
  WATER_CORNER_TR_CW,
  WATER_CORNER_BR_CW,
  WATER_CORNER_BL_CW,
  isTargetAnimalBlock,
  WATER_CORNER_TL_CCW,
  WATER_CORNER_TR_CCW,
  WATER_CORNER_BR_CCW,
  WATER_CORNER_BL_CCW,
  getInitialChickenDirection,
} from '../object/constants';

export { BUILTIN_LEVELS } from './types';
// ── Re-export public types & constants from modules ──
export type { Bullet, CellType, Position, LevelData } from './types';

import { playEngineSound } from './sound';
import { useEditorEngine } from './editor-logic';
import { useGameUndo, useUndoHotkey } from './use-game-undo';
import {
  realMap,
  copyGrid,
  type Bullet,
  type CellType,
  type Position,
  copyStatusMap,
  BUILTIN_LEVELS,
  findInitialCursor,
} from './types';

export function createDefaultStatusMap(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function extractOrMigrateStatusMap(
  grid: CellType[][],
  existingStatusMap?: number[][]
): { grid: CellType[][]; statusMap: number[][] } {
  const H = grid.length;
  const W = grid[0]?.length || 0;
  const newGrid = copyGrid(grid);
  const newStatusMap = existingStatusMap
    ? copyStatusMap(existingStatusMap)!
    : createDefaultStatusMap(H, W);

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (getBaseBlockId(newGrid[y][x]) === BLOCK_PATH) {
        newGrid[y][x] = BLOCK_EMPTY;
        if (newStatusMap[y][x] === 0) {
          newStatusMap[y][x] = PATH_H;
        }
      }
    }
  }

  return { grid: newGrid, statusMap: newStatusMap };
}

function processRabbitRemovals(board: CellType[][], clearedPositions: Position[]): void {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  const H = board.length;
  const W = board[0]?.length || 0;
  const rabbitPositionsToRemove: Position[] = [];

  for (const pos of clearedPositions) {
    for (const dir of directions) {
      const nx = pos.x + dir.x;
      const ny = pos.y + dir.y;
      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        if (getBaseBlockId(board[ny][nx]) === BLOCK_RABBIT) {
          rabbitPositionsToRemove.push({ x: nx, y: ny });
        }
      }
    }
  }

  for (const pos of rabbitPositionsToRemove) {
    board[pos.y][pos.x] = BLOCK_EMPTY;
  }
}

function canWalkBetween(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  statusMap?: number[][],
  board?: CellType[][]
): boolean {
  const H = statusMap?.length || board?.length || 0;
  const W = statusMap?.[0]?.length || board?.[0]?.length || 0;
  if (H === 0 || W === 0) return false;
  if (toX < 0 || toX >= W || toY < 0 || toY >= H) return false;

  const dx = toX - fromX;
  const dy = toY - fromY;

  let dirFrom: 'up' | 'down' | 'left' | 'right';
  let dirTo: 'up' | 'down' | 'left' | 'right';

  if (dx === 1 && dy === 0) {
    dirFrom = 'right';
    dirTo = 'left';
  } else if (dx === -1 && dy === 0) {
    dirFrom = 'left';
    dirTo = 'right';
  } else if (dx === 0 && dy === 1) {
    dirFrom = 'down';
    dirTo = 'up';
  } else if (dx === 0 && dy === -1) {
    dirFrom = 'up';
    dirTo = 'down';
  } else {
    return false;
  }

  if (statusMap) {
    const fromTile = statusMap[fromY]?.[fromX] ?? PATH_NONE;
    const toTile = statusMap[toY]?.[toX] ?? PATH_NONE;

    if (fromTile !== PATH_NONE) {
      const conn = getPathConnections(fromTile);
      if (!conn[dirFrom]) return false;
    }

    if (toTile !== PATH_NONE) {
      const conn = getPathConnections(toTile);
      if (!conn[dirTo]) return false;
    }
  }

  if (board) {
    const targetCell = board[toY][toX];
    const baseId = getBaseBlockId(targetCell);
    if (targetCell !== BLOCK_EMPTY && baseId !== BLOCK_EGG) {
      return false;
    }
  }

  return true;
}

function isCornerTile(tile: number): boolean {
  return (
    tile === PATH_CORNER_TL ||
    tile === PATH_CORNER_TR ||
    tile === PATH_CORNER_BR ||
    tile === PATH_CORNER_BL ||
    tile === WATER_CORNER_TL_CW ||
    tile === WATER_CORNER_TL_CCW ||
    tile === WATER_CORNER_TR_CW ||
    tile === WATER_CORNER_TR_CCW ||
    tile === WATER_CORNER_BR_CW ||
    tile === WATER_CORNER_BR_CCW ||
    tile === WATER_CORNER_BL_CW ||
    tile === WATER_CORNER_BL_CCW
  );
}

function getCornerTurnDirection(
  tile: number,
  curDir: 'up' | 'down' | 'left' | 'right'
): 'up' | 'down' | 'left' | 'right' {
  switch (tile) {
    case PATH_CORNER_TL: // ┌ (connects down & right)
    case WATER_CORNER_TL_CW:
    case WATER_CORNER_TL_CCW:
      if (curDir === 'up') return 'right';
      if (curDir === 'left') return 'down';
      return curDir;

    case PATH_CORNER_TR: // ┐ (connects down & left)
    case WATER_CORNER_TR_CW:
    case WATER_CORNER_TR_CCW:
      if (curDir === 'up') return 'left';
      if (curDir === 'right') return 'down';
      return curDir;

    case PATH_CORNER_BR: // ┘ (connects up & left)
    case WATER_CORNER_BR_CW:
    case WATER_CORNER_BR_CCW:
      if (curDir === 'down') return 'left';
      if (curDir === 'right') return 'up';
      return curDir;

    case PATH_CORNER_BL: // └ (connects up & right)
    case WATER_CORNER_BL_CW:
    case WATER_CORNER_BL_CCW:
      if (curDir === 'down') return 'right';
      if (curDir === 'left') return 'up';
      return curDir;

    default:
      return curDir;
  }
}

function isCornerOrJunctionTile(tile: number): boolean {
  return isCornerTile(tile);
}

function getDeltaForDir(dir: 'up' | 'down' | 'left' | 'right'): Position {
  switch (dir) {
    case 'right':
      return { x: 1, y: 0 };
    case 'left':
      return { x: -1, y: 0 };
    case 'down':
      return { x: 0, y: 1 };
    case 'up':
      return { x: 0, y: -1 };
    default:
      return { x: 0, y: 0 };
  }
}

function getOppositeDir(dir: 'up' | 'down' | 'left' | 'right'): 'up' | 'down' | 'left' | 'right' {
  switch (dir) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    case 'left':
      return 'right';
    case 'right':
    default:
      return 'left';
  }
}

function getPrioritizedDirections(
  curDir: 'up' | 'down' | 'left' | 'right'
): { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' }[] {
  const opp = getOppositeDir(curDir);
  const all: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' }[] = [
    { x: 1, y: 0, dir: 'right' },
    { x: -1, y: 0, dir: 'left' },
    { x: 0, y: 1, dir: 'down' },
    { x: 0, y: -1, dir: 'up' },
  ];

  // Completely exclude the opposite (backtrack) direction! Chicken NEVER turns around backwards.
  return all
    .filter((d) => d.dir !== opp)
    .sort((a, b) => (a.dir === curDir ? -1 : b.dir === curDir ? 1 : 0));
}

function getChickenBlockForDir(dir: 'up' | 'down' | 'left' | 'right'): BlockId {
  switch (dir) {
    case 'up':
      return BLOCK_CHICKEN_U;
    case 'left':
      return BLOCK_CHICKEN_L;
    case 'right':
      return BLOCK_CHICKEN_R;
    case 'down':
    default:
      return BLOCK_CHICKEN_D;
  }
}

async function processChickenMovementsAsync(
  gridRef: { current: CellType[][] },
  setGrid: React.Dispatch<React.SetStateAction<CellType[][]>>,
  statusMap?: number[][],
  setChickenDirections?: React.Dispatch<
    React.SetStateAction<Record<string, 'up' | 'down' | 'left' | 'right'>>
  >,
  chickenDirections?: Record<string, 'up' | 'down' | 'left' | 'right'>,
  onEggMissionClear?: () => void
): Promise<boolean> {
  let anyMoved = false;

  const runtimeDirections: Record<string, 'up' | 'down' | 'left' | 'right'> = {
    ...(chickenDirections || {}),
  };

  while (true) {
    const board = copyGrid(gridRef.current);
    const H = board.length;
    const W = board[0]?.length || 0;

    const chickens: {
      pos: Position;
      id: CellType;
      dir: 'up' | 'down' | 'left' | 'right';
    }[] = [];
    const eggs: Position[] = [];

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const cell = board[y][x];
        if (isChickenBlock(cell)) {
          const dirKey = `${y},${x}`;
          let facingDir = runtimeDirections[dirKey] || getInitialChickenDirection(cell);
          const currentTile = statusMap?.[y]?.[x] ?? PATH_NONE;
          if (isCornerTile(currentTile)) {
            const turnedDir = getCornerTurnDirection(currentTile, facingDir);
            if (turnedDir !== facingDir) {
              facingDir = turnedDir;
              runtimeDirections[dirKey] = facingDir;
              board[y][x] = getChickenBlockForDir(facingDir);
            }
          }
          chickens.push({ pos: { x, y }, id: cell, dir: facingDir });
        } else if (getBaseBlockId(cell) === BLOCK_EGG) {
          eggs.push({ x, y });
        }
      }
    }

    if (chickens.length === 0) break;

    let stepTakenInThisPass = false;

    for (const chicken of chickens) {
      const chickenPos = chicken.pos;
      const curDir = chicken.dir;

      let nextStep: Position | null = null;
      let nextDir: 'up' | 'down' | 'left' | 'right' = curDir;

      // The chicken attempts to move 1 step in its current facing direction (curDir)
      const delta = getDeltaForDir(curDir);
      const nx = chickenPos.x + delta.x;
      const ny = chickenPos.y + delta.y;

      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const targetCell = board[ny][nx];
        const baseId = getBaseBlockId(targetCell);
        const isOpenCell = targetCell === BLOCK_EMPTY || baseId === BLOCK_EGG;

        if (
          isOpenCell &&
          (!statusMap || canWalkBetween(chickenPos.x, chickenPos.y, nx, ny, statusMap, board))
        ) {
          nextStep = { x: nx, y: ny };

          // Direction turning ONLY occurs upon ENTERING a Corner tile (┌, ┐, ┘, └)!
          const targetTile = statusMap?.[ny]?.[nx] ?? PATH_NONE;
          if (isCornerTile(targetTile)) {
            nextDir = getCornerTurnDirection(targetTile, curDir);
          } else {
            nextDir = curDir;
          }
        }
      }

      if (nextStep) {
        const oldKey = `${chickenPos.y},${chickenPos.x}`;
        const newKey = `${nextStep.y},${nextStep.x}`;

        board[chickenPos.y][chickenPos.x] = BLOCK_EMPTY;
        delete runtimeDirections[oldKey];

        let ateEgg = false;
        if (getBaseBlockId(board[nextStep.y][nextStep.x]) === BLOCK_EGG) {
          board[nextStep.y][nextStep.x] = BLOCK_EMPTY;
          ateEgg = true;
        } else {
          board[nextStep.y][nextStep.x] = getChickenBlockForDir(nextDir);
          runtimeDirections[newKey] = nextDir;
        }

        gridRef.current = board;
        setGrid(copyGrid(board));
        if (setChickenDirections) {
          setChickenDirections((prev) => {
            const next = { ...prev };
            delete next[oldKey];
            if (!ateEgg) {
              next[newKey] = nextDir;
            }
            return next;
          });
        }

        if (ateEgg) {
          let remainingEggs = 0;
          for (let ry = 0; ry < H; ry++) {
            for (let rx = 0; rx < W; rx++) {
              if (getBaseBlockId(board[ry][rx]) === BLOCK_EGG) {
                remainingEggs++;
              }
            }
          }
          if (remainingEggs === 0 && onEggMissionClear) {
            onEggMissionClear();
          }
        }

        stepTakenInThisPass = true;
        anyMoved = true;
        await new Promise((res) => setTimeout(res, 180));
      }
      // Note: If nextStep is null (path ahead is blocked), the chicken remains STOPPED at chickenPos facing curDir.
      // ZERO direction changes or mutations occur while stopped!
    }

    if (!stepTakenInThisPass) break;
  }

  return anyMoved;
}

export async function processWaterCurrentMovementsAsync(
  gridRef: { current: CellType[][] },
  setGrid: React.Dispatch<React.SetStateAction<CellType[][]>>,
  statusMap?: number[][]
): Promise<boolean> {
  if (!statusMap) return false;

  const board = gridRef.current;
  const H = board.length;
  const W = board[0]?.length || 0;
  if (H === 0 || W === 0) return false;

  interface WaterBlock {
    from: Position;
    to: Position;
    block: CellType;
    canMove: boolean;
  }

  const waterBlocks: WaterBlock[] = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cell = board[y][x];
      if (cell === BLOCK_EMPTY || cell === BLOCK_WALL) continue;

      const tile = statusMap[y]?.[x] ?? PATH_NONE;
      if (!isWaterTile(tile)) continue;

      const vec = getWaterFlowVector(tile);
      if (!vec) continue; // Dead end rock or no flow

      const nx = x + vec.dx;
      const ny = y + vec.dy;

      // Check bounds
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;

      // Cannot move into a solid wall
      if (board[ny][nx] === BLOCK_WALL) continue;

      waterBlocks.push({
        from: { x, y },
        to: { x: nx, y: ny },
        block: cell,
        canMove: false,
      });
    }
  }

  if (waterBlocks.length === 0) return false;

  // Resolve conveyor movements (iterative resolution for chains and unblocked paths)
  const movingBlocks = new Set<string>(); // "fromY,fromX"
  const reservedDestinations = new Map<string, string>(); // "toY,toX" -> "fromY,fromX"
  let changed = true;

  while (changed) {
    changed = false;

    for (const wb of waterBlocks) {
      const fromKey = `${wb.from.y},${wb.from.x}`;
      if (movingBlocks.has(fromKey)) continue;

      const toKey = `${wb.to.y},${wb.to.x}`;
      const targetCell = board[wb.to.y][wb.to.x];

      const isTargetEmpty = targetCell === BLOCK_EMPTY;
      const isTargetMovingAway = movingBlocks.has(toKey);

      if (isTargetEmpty || isTargetMovingAway) {
        const existingReserver = reservedDestinations.get(toKey);
        if (!existingReserver || existingReserver === fromKey) {
          movingBlocks.add(fromKey);
          reservedDestinations.set(toKey, fromKey);
          wb.canMove = true;
          changed = true;
        }
      }
    }
  }

  if (movingBlocks.size === 0) return false;

  const nextGrid = copyGrid(board);

  // Clear original positions
  for (const wb of waterBlocks) {
    if (wb.canMove) {
      nextGrid[wb.from.y][wb.from.x] = BLOCK_EMPTY;
    }
  }

  // Place at target positions
  for (const wb of waterBlocks) {
    if (wb.canMove) {
      nextGrid[wb.to.y][wb.to.x] = wb.block;
    }
  }

  gridRef.current = nextGrid;
  setGrid(copyGrid(nextGrid));
  await new Promise((res) => setTimeout(res, 220));

  return true;
}

export const useGameEngine = (
  initialLevelIndex = 0,
  isEditorMode = false,
  isEditorPage = false
) => {
  const [editorMapType, setEditorMapType] = useState<'real' | 'test'>('real');
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

  const [grid, setGrid] = useState<CellType[][]>(() => {
    const rawGrid = isEditorMode
      ? realMap[0]
        ? copyGrid(realMap[0].grid as CellType[][])
        : Array.from({ length: 8 }, () => Array(8).fill(BLOCK_EMPTY))
      : copyGrid(BUILTIN_LEVELS[initialLevelIndex].grid);

    const rawStatusMap = isEditorMode
      ? realMap[0]?.statusMap
      : BUILTIN_LEVELS[initialLevelIndex]?.statusMap;

    const { grid: migratedGrid } = extractOrMigrateStatusMap(rawGrid, rawStatusMap);
    return migratedGrid;
  });

  const [statusMap, setStatusMap] = useState<number[][]>(() => {
    const rawGrid = isEditorMode
      ? realMap[0]
        ? copyGrid(realMap[0].grid as CellType[][])
        : Array.from({ length: 8 }, () => Array(8).fill(BLOCK_EMPTY))
      : copyGrid(BUILTIN_LEVELS[initialLevelIndex].grid);

    const rawStatusMap = isEditorMode
      ? realMap[0]?.statusMap
      : BUILTIN_LEVELS[initialLevelIndex]?.statusMap;

    const { statusMap: migratedStatusMap } = extractOrMigrateStatusMap(rawGrid, rawStatusMap);
    return migratedStatusMap;
  });

  const [chickenDirections, setChickenDirections] = useState<
    Record<string, 'up' | 'down' | 'left' | 'right'>
  >({});

  const [cursor, setCursor] = useState<Position>(() => {
    if (isEditorMode) {
      const firstLvl = realMap[0];
      const w = firstLvl?.grid[0]?.length ?? 8;
      const h = firstLvl?.grid?.length ?? 8;
      return { x: Math.floor(w / 2), y: h - 1 };
    }
    return findInitialCursor(BUILTIN_LEVELS[initialLevelIndex].grid);
  });

  const [turnsLeft, setTurnsLeft] = useState<number>(() => {
    if (isEditorMode) {
      const firstLvl = realMap[0];
      return firstLvl ? (firstLvl.turnLimit ?? 50) : 50;
    }
    return BUILTIN_LEVELS[initialLevelIndex]?.turnLimit ?? 50;
  });

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLevelCleared, setIsLevelCleared] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [grabbed, setGrabbed] = useState<boolean>(false);
  const [isCursorVisible, setIsCursorVisible] = useState<boolean>(false);
  const [flashingBlocks, setFlashingBlocks] = useState<Record<string, CellType | boolean>>({});
  const [shisenShoPath, setShisenShoPath] = useState<Position[] | null>(null);

  const stateRef = useRef<{
    grid: CellType[][];
    cursor: Position;
    grabbed: boolean;
    isProcessing: boolean;
    isGameOver: boolean;
    isLevelCleared: boolean;
    isEditorMode: boolean;
    muted: boolean;
    flashingBlocks: Record<string, CellType | boolean>;
  }>({
    grid: [],
    cursor: { x: 0, y: 0 },
    grabbed: false,
    isProcessing: false,
    isGameOver: false,
    isLevelCleared: false,
    isEditorMode: false,
    muted: false,
    flashingBlocks: {},
  });

  useEffect(() => {
    stateRef.current = {
      grid,
      cursor,
      grabbed,
      isProcessing,
      isGameOver,
      isLevelCleared,
      isEditorMode,
      muted,
      flashingBlocks,
    };
  }, [
    grid,
    cursor,
    grabbed,
    isProcessing,
    isGameOver,
    isLevelCleared,
    isEditorMode,
    muted,
    flashingBlocks,
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

  function checkHasTargetAnimals(board: CellType[][]): boolean {
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < (board[r]?.length || 0); c++) {
        if (isTargetAnimalBlock(board[r][c])) {
          return true;
        }
      }
    }
    return false;
  }

  const hasTargetAnimalsRef = useRef<boolean>(false);

  const calculateBlockCounts = useCallback((board: CellType[][]) => {
    const counts: Record<string, number> = {};
    if (checkHasTargetAnimals(board)) {
      hasTargetAnimalsRef.current = true;
    }
    const modeHasTargetAnimals = hasTargetAnimalsRef.current;

    board.forEach((row) => {
      row.forEach((cell) => {
        if (modeHasTargetAnimals) {
          if (isTargetAnimalBlock(cell)) {
            counts[cell] = (counts[cell] || 0) + 1;
          }
        } else {
          if (getBlockProperties(cell)?.canBeDestroyedByShooter) {
            counts[cell] = (counts[cell] || 0) + 1;
          }
        }
      });
    });
    return counts;
  }, []);

  const [blockCounts, setBlockCounts] = useState<Record<string, number>>(() => {
    const initialGrid = isEditorMode
      ? (realMap[0]?.grid as CellType[][]) ||
        Array.from({ length: 8 }, () => Array(8).fill(BLOCK_EMPTY))
      : BUILTIN_LEVELS[initialLevelIndex]?.grid || [];
    hasTargetAnimalsRef.current = checkHasTargetAnimals(initialGrid);
    return calculateBlockCounts(initialGrid);
  });

  const updateBlockCounts = useCallback((board: CellType[][]) => {
    const counts = calculateBlockCounts(board);
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
    setTurnsLeft,
    muted,
    updateBlockCounts,
    setBlockCounts,
    setGrabbed,
    setIsGameOver,
    setIsLevelCleared,
    setIsProcessing,
    () => {},
    setFlashingBlocks,
    stateRef as React.MutableRefObject<{
      flashingBlocks: Record<string, CellType | boolean>;
    }>,
    () => {},
    updateGrabbed,
    () => {},
    { current: {} },
    statusMap,
    setStatusMap
  );

  // Initialize and Reset levels
  const loadLevel = useCallback(
    (levelIdx: number) => {
      if (levelIdx < 0 || levelIdx >= BUILTIN_LEVELS.length) return;
      const level = BUILTIN_LEVELS[levelIdx];
      const { grid: migratedGrid, statusMap: migratedStatusMap } = extractOrMigrateStatusMap(
        copyGrid(level.grid),
        level.statusMap
      );
      hasTargetAnimalsRef.current = checkHasTargetAnimals(migratedGrid);
      setLevelIndex(levelIdx);
      setGrid(migratedGrid);
      setStatusMap(migratedStatusMap);
      setChickenDirections({});
      setTurnsLeft(level.turnLimit ?? 50);
      setIsGameOver(false);
      setIsLevelCleared(false);
      setIsProcessing(false);
      updateGrabbed(false);
      setIsCursorVisible(false);
      setFlashingBlocks({});
      if (stateRef.current) stateRef.current.flashingBlocks = {};
      setShisenShoPath(null);
      clearUndoHistory();
      setRemainingUndos(0);
      updateBlockCounts(migratedGrid);
      playEngineSound('start', muted);
    },
    [muted, updateBlockCounts, updateGrabbed, clearUndoHistory]
  );

  const resetLevel = useCallback(() => {
    updateGrabbed(false);
    setIsCursorVisible(false);
    setFlashingBlocks({});
    if (stateRef.current) stateRef.current.flashingBlocks = {};
    setShisenShoPath(null);
    clearUndoHistory();
    setRemainingUndos(0);
    if (isEditorPage) {
      const activeLvl = editor.editorLevels[editor.editorActiveIndex];
      if (activeLvl) {
        const { grid: mg, statusMap: sm } = extractOrMigrateStatusMap(
          copyGrid(activeLvl.grid),
          activeLvl.statusMap
        );
        hasTargetAnimalsRef.current = checkHasTargetAnimals(mg);
        setGrid(mg);
        setStatusMap(sm);
        setChickenDirections({});
        updateBlockCounts(mg);
        setTurnsLeft(activeLvl.turnLimit ?? 50);
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
    clearUndoHistory,
  ]);

  // Shisen-Sho 2-Turn Tile Matching
  const tryMatchShisenSho = useCallback(
    async (p1: Position, p2: Position): Promise<boolean> => {
      const curState = stateRef.current;
      const curGrid = curState.grid;

      if (
        curState.isGameOver ||
        curState.isLevelCleared ||
        curState.isProcessing ||
        curState.isEditorMode
      ) {
        return false;
      }

      if (!curGrid || curGrid.length === 0) return false;

      // 1. Find 2-turn line path
      const path = findShisenShoPath(curGrid, p1, p2);
      if (!path) return false;

      // Push history state before modifying grid
      pushSnapshot({
        grid: curGrid,
        cursor: curState.cursor,
        grabbed: curState.grabbed,
        autoWallDirections: {},
        firedOnce: {},
        turnsLeft,
      });

      // 2. Visual connection line
      setShisenShoPath(path);
      playEngineSound('match', curState.muted);

      const k1 = `${p1.y},${p1.x}`;
      const k2 = `${p2.y},${p2.x}`;
      const flash: Record<string, boolean> = { [k1]: true, [k2]: true };
      setFlashingBlocks(flash);
      if (stateRef.current) stateRef.current.flashingBlocks = flash;

      setIsProcessing(true);
      if (stateRef.current) stateRef.current.isProcessing = true;

      // 3. Wait for connect line & flash animation
      await new Promise((res) => setTimeout(res, 280));

      setShisenShoPath(null);
      setFlashingBlocks({});
      if (stateRef.current) stateRef.current.flashingBlocks = {};

      // 4. Remove the pair from grid
      const nextGrid = copyGrid(stateRef.current?.grid || curGrid);
      nextGrid[p1.y][p1.x] = BLOCK_EMPTY;
      nextGrid[p2.y][p2.x] = BLOCK_EMPTY;

      // Process passive Rabbit removal when adjacent tiles are destroyed
      processRabbitRemovals(nextGrid, [p1, p2]);

      setGrid(nextGrid);
      if (stateRef.current) stateRef.current.grid = nextGrid;
      updateGrabbed(false);

      const gridRef = { current: nextGrid };

      // 1. Process Waterway (수로) block movements along current direction!
      await processWaterCurrentMovementsAsync(gridRef, setGrid, statusMap);

      // 2. Process Chicken movement along path step-by-step with animated delays!
      await processChickenMovementsAsync(
        gridRef,
        setGrid,
        statusMap,
        setChickenDirections,
        chickenDirections,
        () => {
          setIsLevelCleared(true);
          playEngineSound('start', curState.muted);
        }
      );

      const finalGrid = gridRef.current;
      setGrid(finalGrid);
      if (stateRef.current) stateRef.current.grid = finalGrid;
      updateGrabbed(false);

      const finalCounts = updateBlockCounts(finalGrid);
      const remaining = Object.values(finalCounts).reduce((a, b) => a + b, 0);

      if (!isEditorMode) {
        setTurnsLeft((prev) => {
          const nextTurns = prev - 1;
          if (nextTurns <= 0 && remaining > 0) {
            setIsGameOver(true);
            playEngineSound('error', curState.muted);
          }
          return Math.max(0, nextTurns);
        });
      }

      if (remaining === 0) {
        setIsLevelCleared(true);
        playEngineSound('start', curState.muted);
      }

      setIsProcessing(false);
      if (stateRef.current) stateRef.current.isProcessing = false;

      return true;
    },
    [pushSnapshot, updateGrabbed, updateBlockCounts, isEditorMode, turnsLeft]
  );

  const undoPlay = useCallback(() => {
    if (isEditorMode) return;
    const snap = popSnapshot();
    if (!snap) return;

    setGrid(snap.grid);
    if (stateRef.current) stateRef.current.grid = snap.grid;
    updateCursor(snap.cursor);
    updateGrabbed(false);
    setFlashingBlocks({});
    if (stateRef.current) stateRef.current.flashingBlocks = {};
    setShisenShoPath(null);
    updateBlockCounts(snap.grid);
    if (snap.turnsLeft !== undefined) {
      setTurnsLeft(snap.turnsLeft);
    }

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
    statusMap,
    setStatusMap,
    chickenDirections,
    cursor,
    setCursor: updateCursor,
    turnsLeft,
    setTurnsLeft,
    isGameOver,
    setIsGameOver,
    isLevelCleared,
    setIsLevelCleared,
    isProcessing,
    blockCounts,
    levelIndex,
    loadLevel,
    resetLevel,
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
    hasMovedFirstBlock: false,
    flashingBlocks,
    bullets: [] as Bullet[],
    firedOnce: {},
    shisenShoPath,
    tryMatchShisenSho,
    editorLevels: editor.editorLevels,
    setEditorLevels: editor.setEditorLevels,
    editorActiveIndex: editor.editorActiveIndex,
    setEditorActiveIndex: editor.setEditorActiveIndex,
    selectEditorLevel: editor.selectEditorLevel,
    editorAddLevel: editor.editorAddLevel,
    editorDeleteLevel: editor.editorDeleteLevel,
    editorUpdateTurnLimit: editor.editorUpdateTurnLimit,
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
