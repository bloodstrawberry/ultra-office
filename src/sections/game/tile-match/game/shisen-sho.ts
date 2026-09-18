import type { CellType, Position } from './types';

import {
  BLOCK_NONE,
  BLOCK_EMPTY,
  BLOCK_NUM_1,
  BLOCK_NUM_5,
  isBlockActive,
  getBaseBlockId,
  BLOCK_LETTER_A,
  BLOCK_LETTER_E,
  BLOCK_COW_MALE,
  BLOCK_COW_FEMALE,
  getBlockProperties,
  isLetterBlockActive,
} from '../object/constants';

/**
 * Check whether two cells are valid matching tiles in Shisen-Sho rules.
 */
export function canMatchTiles(cellA: CellType, cellB: CellType, grid: CellType[][]): boolean {
  if (cellA === BLOCK_EMPTY || cellA === BLOCK_NONE) return false;
  if (cellB === BLOCK_EMPTY || cellB === BLOCK_NONE) return false;

  const baseA = getBaseBlockId(cellA);
  const baseB = getBaseBlockId(cellB);

  const isCowA = baseA === BLOCK_COW_MALE || baseA === BLOCK_COW_FEMALE;
  const isCowB = baseB === BLOCK_COW_MALE || baseB === BLOCK_COW_FEMALE;

  // Cow matching: only male and female cows match with each other (same gender cow cannot match)
  if (isCowA || isCowB) {
    const isCowPair =
      (baseA === BLOCK_COW_MALE && baseB === BLOCK_COW_FEMALE) ||
      (baseA === BLOCK_COW_FEMALE && baseB === BLOCK_COW_MALE);
    if (!isCowPair) return false;
  } else if (baseA !== baseB) {
    return false;
  }

  const propsA = getBlockProperties(cellA, grid);
  const propsB = getBlockProperties(cellB, grid);

  // Must be selectable puzzle tiles
  if (!propsA?.canSelect || !propsB?.canSelect) return false;

  // Number block sequential constraint check (1 -> 2 -> 3 -> 4 -> 5)
  if (baseA >= BLOCK_NUM_1 && baseA <= BLOCK_NUM_5) {
    if (!isBlockActive(baseA, grid)) return false;
  }

  // Letter block sequential constraint check (A -> B -> C -> D -> E)
  if (baseA >= BLOCK_LETTER_A && baseA <= BLOCK_LETTER_E) {
    if (!isLetterBlockActive(baseA, grid)) return false;
  }

  return true;
}

/**
 * Checks if a position on (or around) the board is empty/passable.
 * Coordinates range from -1 to W (x) and -1 to H (y) to allow routing outside the board.
 */
function isCellEmpty(
  x: number,
  y: number,
  grid: CellType[][],
  start: Position,
  end: Position
): boolean {
  // Start and end positions are always passable for their own endpoints
  if ((x === start.x && y === start.y) || (x === end.x && y === end.y)) {
    return true;
  }

  const H = grid.length;
  const W = grid[0]?.length || 0;

  // Out-of-bounds area around the board is free space
  if (x < 0 || x >= W || y < 0 || y >= H) {
    return true;
  }

  const cell = grid[y][x];
  return cell === BLOCK_EMPTY || cell === BLOCK_NONE;
}

/**
 * 0-turn: Check direct straight line connection between p1 and p2.
 */
function getDirectPath(
  p1: Position,
  p2: Position,
  grid: CellType[][],
  start: Position,
  end: Position
): Position[] | null {
  if (p1.x === p2.x) {
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    for (let y = minY + 1; y < maxY; y++) {
      if (!isCellEmpty(p1.x, y, grid, start, end)) {
        return null;
      }
    }
    return [p1, p2];
  }

  if (p1.y === p2.y) {
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    for (let x = minX + 1; x < maxX; x++) {
      if (!isCellEmpty(x, p1.y, grid, start, end)) {
        return null;
      }
    }
    return [p1, p2];
  }

  return null;
}

/**
 * 1-turn: Check L-shaped connection with 1 corner between p1 and p2.
 */
function getOneTurnPath(
  p1: Position,
  p2: Position,
  grid: CellType[][],
  start: Position,
  end: Position
): Position[] | null {
  // Corner Option 1: (p1.x, p2.y)
  const c1: Position = { x: p1.x, y: p2.y };
  if (isCellEmpty(c1.x, c1.y, grid, start, end)) {
    const path1 = getDirectPath(p1, c1, grid, start, end);
    const path2 = getDirectPath(c1, p2, grid, start, end);
    if (path1 && path2) {
      return [p1, c1, p2];
    }
  }

  // Corner Option 2: (p2.x, p1.y)
  const c2: Position = { x: p2.x, y: p1.y };
  if (isCellEmpty(c2.x, c2.y, grid, start, end)) {
    const path1 = getDirectPath(p1, c2, grid, start, end);
    const path2 = getDirectPath(c2, p2, grid, start, end);
    if (path1 && path2) {
      return [p1, c2, p2];
    }
  }

  return null;
}

/**
 * 2-turns: Check Z-shaped / U-shaped connection with up to 2 corners between p1 and p2.
 */
function getTwoTurnPath(
  p1: Position,
  p2: Position,
  grid: CellType[][],
  start: Position,
  end: Position
): Position[] | null {
  const H = grid.length;
  const W = grid[0]?.length || 0;

  const minBoundX = -1;
  const maxBoundX = W;
  const minBoundY = -1;
  const maxBoundY = H;

  // Cast ray in 4 directions from p1
  const directions = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  let bestPath: Position[] | null = null;
  let minLength = Infinity;

  for (const { dx, dy } of directions) {
    let curX = p1.x + dx;
    let curY = p1.y + dy;

    while (curX >= minBoundX && curX <= maxBoundX && curY >= minBoundY && curY <= maxBoundY) {
      if (!isCellEmpty(curX, curY, grid, start, end)) {
        break;
      }

      const midPos: Position = { x: curX, y: curY };
      const subPath = getOneTurnPath(midPos, p2, grid, start, end);

      if (subPath) {
        // [p1, midPos, corner, p2]
        const fullPath = [p1, ...subPath];
        // Calculate rough Manhattan length to pick the most visually direct route
        let len = 0;
        for (let i = 0; i < fullPath.length - 1; i++) {
          len +=
            Math.abs(fullPath[i].x - fullPath[i + 1].x) +
            Math.abs(fullPath[i].y - fullPath[i + 1].y);
        }
        if (len < minLength) {
          minLength = len;
          bestPath = fullPath;
        }
      }

      curX += dx;
      curY += dy;
    }
  }

  return bestPath;
}

/**
 * Finds a Shisen-Sho connect path (up to 2 turns / 3 segments) between p1 and p2.
 * Returns the array of waypoints (e.g. [p1, p2] or [p1, c1, p2] or [p1, c1, c2, p2])
 * or null if no valid path exists.
 */
export function findShisenShoPath(
  grid: CellType[][],
  p1: Position,
  p2: Position
): Position[] | null {
  if (p1.x === p2.x && p1.y === p2.y) return null;

  const H = grid.length;
  const W = grid[0]?.length || 0;
  if (H === 0 || W === 0) return null;

  const cell1 = grid[p1.y]?.[p1.x];
  const cell2 = grid[p2.y]?.[p2.x];

  if (cell1 === undefined || cell2 === undefined) return null;
  if (!canMatchTiles(cell1, cell2, grid)) return null;

  // 1. Try 0-turn direct line
  const directPath = getDirectPath(p1, p2, grid, p1, p2);
  if (directPath) return directPath;

  // 2. Try 1-turn L-shape
  const oneTurnPath = getOneTurnPath(p1, p2, grid, p1, p2);
  if (oneTurnPath) return oneTurnPath;

  // 3. Try 2-turn Z/U-shape (including routing outside the board perimeter)
  const twoTurnPath = getTwoTurnPath(p1, p2, grid, p1, p2);
  if (twoTurnPath) return twoTurnPath;

  return null;
}

/**
 * Searches for all currently matchable pairs on the board.
 * Useful for hint generation and no-more-moves detection.
 */
export function findAnyMatchablePair(grid: CellType[][]): {
  p1: Position;
  p2: Position;
  path: Position[];
} | null {
  const H = grid.length;
  const W = grid[0]?.length || 0;

  const tilePositions: { pos: Position; cell: CellType }[] = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cell = grid[y][x];
      const props = getBlockProperties(cell, grid);
      if (props?.canSelect && cell !== BLOCK_EMPTY && cell !== BLOCK_NONE) {
        tilePositions.push({ pos: { x, y }, cell });
      }
    }
  }

  for (let i = 0; i < tilePositions.length; i++) {
    for (let j = i + 1; j < tilePositions.length; j++) {
      const a = tilePositions[i];
      const b = tilePositions[j];

      const baseA = getBaseBlockId(a.cell);
      const baseB = getBaseBlockId(b.cell);
      const isCowA = baseA === BLOCK_COW_MALE || baseA === BLOCK_COW_FEMALE;
      const isCowB = baseB === BLOCK_COW_MALE || baseB === BLOCK_COW_FEMALE;
      const isMatchableType =
        isCowA || isCowB
          ? (baseA === BLOCK_COW_MALE && baseB === BLOCK_COW_FEMALE) ||
            (baseA === BLOCK_COW_FEMALE && baseB === BLOCK_COW_MALE)
          : baseA === baseB;

      if (isMatchableType) {
        const path = findShisenShoPath(grid, a.pos, b.pos);
        if (path) {
          return { p1: a.pos, p2: b.pos, path };
        }
      }
    }
  }

  return null;
}
