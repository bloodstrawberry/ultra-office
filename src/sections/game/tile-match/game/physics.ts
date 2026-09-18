import type { CellType, Position } from './types';

import { copyGrid } from './types';
import {
  BLOCK_BOMB,
  BLOCK_EMPTY,
  isStrawBlock,
  BLOCK_SPIKE_U,
  BLOCK_SPIKE_D,
  BLOCK_SPIKE_L,
  BLOCK_SPIKE_R,
  isPortalBlock,
  isFrozenBlock,
  getBaseBlockId,
  isWormholeBlock,
  isBlackholeBlock,
  getBlockProperties,
  getNextStrawBlockId,
  WORMHOLE_BLOCK_TYPES,
  BLACKHOLE_BLOCK_TYPES,
} from '../object/constants';

// ── Physics step results ──

export interface GravityResult {
  changed: boolean;
  grid: CellType[][];
}

export interface SpikeResult {
  changed: boolean;
  grid: CellType[][];
}

export interface WormholeResult {
  changed: boolean;
  grid: CellType[][];
  teleportedPos?: Position;
  closingWormholeKeys: Map<string, CellType>;
}

export interface BlackholeResult {
  changed: boolean;
  grid: CellType[][];
}

/** Find the paired wormhole position of the same wormhole type on the grid. */
export const findPairedWormhole = (
  grid: CellType[][],
  wormholeId: CellType,
  currentY: number,
  currentX: number
): Position | null => {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === wormholeId && (y !== currentY || x !== currentX)) {
        return { x, y };
      }
    }
  }
  return null;
};

export interface MatchResult {
  changed: boolean;
  grid: CellType[][];
  toClearKeys: Set<string>;
  unfreezeTransitions?: Map<string, CellType>;
}

export interface MoveBlockResult {
  success: boolean;
  grid: CellType[][];
  newCursorX: number;
  newCursorY: number;
  consumedPortals?: Record<string, CellType>;
  movedCoords?: Position[];
  finalPositions?: Position[];
}

// ── Pure physics step functions ──

/** Apply one pass of gravity (blocks fall one cell down). */
export const applyGravity = (grid: CellType[][]): GravityResult => {
  let changed = false;
  const nextGrid = copyGrid(grid);

  // Process from bottom to top so multiple blocks can drop simultaneously
  for (let y = grid.length - 2; y >= 0; y--) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = nextGrid[y][x];
      if (getBlockProperties(cell, nextGrid)?.canFall) {
        const destCell = nextGrid[y + 1][x];
        if (destCell === BLOCK_EMPTY) {
          nextGrid[y + 1][x] = cell;
          nextGrid[y][x] = BLOCK_EMPTY;
          changed = true;
        }
      }
    }
  }

  return { changed, grid: nextGrid };
};

/** Detect wormhole pairs that have an object sitting on one of them (pre-animation check).
 *  Returns the set of wormhole cell keys that should play the closing animation. */
export const detectWormholeActivation = (grid: CellType[][]): Set<string> => {
  const closingKeys = new Set<string>();
  const H = grid.length;
  const W = grid[0]?.length || 0;

  for (const wType of WORMHOLE_BLOCK_TYPES) {
    const positions: Position[] = [];
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (grid[r][c] === wType) {
          positions.push({ y: r, x: c });
        }
      }
    }

    if (positions.length === 2) {
      const [posA, posB] = positions;
      // Check if the cell ABOVE a wormhole has a falling block that would land on it
      // or if something already occupies the wormhole cell (replaced during gravity)
      const cellAboveA = posA.y > 0 ? grid[posA.y - 1][posA.x] : BLOCK_EMPTY;
      const cellAboveB = posB.y > 0 ? grid[posB.y - 1][posB.x] : BLOCK_EMPTY;

      const hasIncomingA =
        cellAboveA !== BLOCK_EMPTY &&
        !isWormholeBlock(cellAboveA) &&
        getBlockProperties(cellAboveA, grid)?.canFall;
      const hasIncomingB =
        cellAboveB !== BLOCK_EMPTY &&
        !isWormholeBlock(cellAboveB) &&
        getBlockProperties(cellAboveB, grid)?.canFall;

      if (hasIncomingA || hasIncomingB) {
        closingKeys.add(`${posA.y},${posA.x}`);
        closingKeys.add(`${posB.y},${posB.x}`);
      }
    }
  }

  return closingKeys;
};

/** Detect and apply wormhole teleportation for blocks that have landed on them. */
export const applyWormholes = (grid: CellType[][]): WormholeResult => {
  let changed = false;
  const nextGrid = copyGrid(grid);
  const H = grid.length;
  const W = grid[0]?.length || 0;
  const closingWormholeKeys = new Map<string, CellType>();

  for (const wType of WORMHOLE_BLOCK_TYPES) {
    const positions: Position[] = [];
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (nextGrid[r][c] === wType) {
          positions.push({ y: r, x: c });
        }
      }
    }

    if (positions.length === 2) {
      const [posA, posB] = positions;

      const cellAboveA = posA.y > 0 ? nextGrid[posA.y - 1][posA.x] : BLOCK_EMPTY;
      const cellAboveB = posB.y > 0 ? nextGrid[posB.y - 1][posB.x] : BLOCK_EMPTY;

      const hasIncomingA =
        cellAboveA !== BLOCK_EMPTY &&
        !isWormholeBlock(cellAboveA) &&
        getBlockProperties(cellAboveA, nextGrid)?.canFall;
      const hasIncomingB =
        cellAboveB !== BLOCK_EMPTY &&
        !isWormholeBlock(cellAboveB) &&
        getBlockProperties(cellAboveB, nextGrid)?.canFall;

      if (hasIncomingA && !hasIncomingB) {
        nextGrid[posB.y][posB.x] = cellAboveA; // Teleport block to posB
        nextGrid[posA.y - 1][posA.x] = BLOCK_EMPTY; // Remove block from above A
        nextGrid[posA.y][posA.x] = BLOCK_EMPTY; // Destroy A
        closingWormholeKeys.set(`${posA.y},${posA.x}`, wType);
        closingWormholeKeys.set(`${posB.y},${posB.x}`, wType);
        changed = true;
      } else if (hasIncomingB && !hasIncomingA) {
        nextGrid[posA.y][posA.x] = cellAboveB; // Teleport block to posA
        nextGrid[posB.y - 1][posB.x] = BLOCK_EMPTY; // Remove block from above B
        nextGrid[posB.y][posB.x] = BLOCK_EMPTY; // Destroy B
        closingWormholeKeys.set(`${posA.y},${posA.x}`, wType);
        closingWormholeKeys.set(`${posB.y},${posB.x}`, wType);
        changed = true;
      }
    }
  }

  return { changed, grid: nextGrid, closingWormholeKeys };
};

/** Find the paired blackhole position of the same blackhole type on the grid. */
export const findPairedBlackhole = (
  grid: CellType[][],
  blackholeId: CellType,
  currentY: number,
  currentX: number
): Position | null => {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === blackholeId && (y !== currentY || x !== currentX)) {
        return { x, y };
      }
    }
  }
  return null;
};

/** Detect and apply blackhole teleportation for falling or moving blocks.
 *  Teleports blocks sitting on top of Blackhole A or moving into Blackhole A to immediately below Blackhole B.
 *  Blackhole objects themselves NEVER disappear. */
export const applyBlackholes = (grid: CellType[][]): BlackholeResult => {
  let changed = false;
  const nextGrid = copyGrid(grid);
  const H = grid.length;
  const W = grid[0]?.length || 0;

  for (const bhType of BLACKHOLE_BLOCK_TYPES) {
    const positions: Position[] = [];
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        if (grid[r][c] === bhType || nextGrid[r][c] === bhType) {
          if (!positions.some((p) => p.y === r && p.x === c)) {
            positions.push({ y: r, x: c });
          }
        }
      }
    }

    if (positions.length === 2) {
      const [posA, posB] = positions;

      const canTeleport = (cell: CellType) =>
        cell !== BLOCK_EMPTY &&
        !isBlackholeBlock(cell) &&
        !isPortalBlock(cell) &&
        (getBlockProperties(cell, nextGrid)?.canFall || isStrawBlock(cell));

      const cellAtA = nextGrid[posA.y][posA.x];
      const cellAboveA = posA.y > 0 ? nextGrid[posA.y - 1][posA.x] : BLOCK_EMPTY;

      const cellAtB = nextGrid[posB.y][posB.x];
      const cellAboveB = posB.y > 0 ? nextGrid[posB.y - 1][posB.x] : BLOCK_EMPTY;

      if (cellAtA !== bhType && canTeleport(cellAtA)) {
        const destY = posB.y + 1;
        const destX = posB.x;
        if (destY >= 0 && destY < H && destX >= 0 && destX < W) {
          if (nextGrid[destY][destX] === BLOCK_EMPTY) {
            nextGrid[destY][destX] = cellAtA;
            nextGrid[posA.y][posA.x] = bhType;
            changed = true;
          }
        }
      } else if (canTeleport(cellAboveA)) {
        const destY = posB.y + 1;
        const destX = posB.x;
        if (destY >= 0 && destY < H && destX >= 0 && destX < W) {
          if (nextGrid[destY][destX] === BLOCK_EMPTY) {
            nextGrid[destY][destX] = cellAboveA;
            nextGrid[posA.y - 1][posA.x] = BLOCK_EMPTY;
            changed = true;
          }
        }
      }

      if (cellAtB !== bhType && canTeleport(cellAtB)) {
        const destY = posA.y + 1;
        const destX = posA.x;
        if (destY >= 0 && destY < H && destX >= 0 && destX < W) {
          if (nextGrid[destY][destX] === BLOCK_EMPTY) {
            nextGrid[destY][destX] = cellAtB;
            nextGrid[posB.y][posB.x] = bhType;
            changed = true;
          }
        }
      } else if (canTeleport(cellAboveB)) {
        const destY = posA.y + 1;
        const destX = posA.x;
        if (destY >= 0 && destY < H && destX >= 0 && destX < W) {
          if (nextGrid[destY][destX] === BLOCK_EMPTY) {
            nextGrid[destY][destX] = cellAboveB;
            nextGrid[posB.y - 1][posB.x] = BLOCK_EMPTY;
            changed = true;
          }
        }
      }
    }
  }

  return { changed, grid: nextGrid };
};

/** Check for spike blocks destroying adjacent non-wall blocks. */
export const applySpikes = (grid: CellType[][]): SpikeResult => {
  let changed = false;
  const nextGrid = copyGrid(grid);

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      if (cell === BLOCK_SPIKE_U) {
        if (y > 0 && getBlockProperties(nextGrid[y - 1][x], nextGrid)?.canBeDestroyedByShooter) {
          nextGrid[y - 1][x] = BLOCK_EMPTY;
          changed = true;
        }
      } else if (cell === BLOCK_SPIKE_D) {
        if (
          y < grid.length - 1 &&
          getBlockProperties(nextGrid[y + 1][x], nextGrid)?.canBeDestroyedByShooter
        ) {
          nextGrid[y + 1][x] = BLOCK_EMPTY;
          changed = true;
        }
      } else if (cell === BLOCK_SPIKE_L) {
        if (x > 0 && getBlockProperties(nextGrid[y][x - 1], nextGrid)?.canBeDestroyedByShooter) {
          nextGrid[y][x - 1] = BLOCK_EMPTY;
          changed = true;
        }
      } else if (cell === BLOCK_SPIKE_R) {
        if (
          x < grid[y].length - 1 &&
          getBlockProperties(nextGrid[y][x + 1], nextGrid)?.canBeDestroyedByShooter
        ) {
          nextGrid[y][x + 1] = BLOCK_EMPTY;
          changed = true;
        }
      }
    }
  }

  return { changed, grid: nextGrid };
};

/** Find adjacent matching blocks (including bomb adjacency with frozen blocks). */
export const findMatches = (grid: CellType[][], ignoredKeys?: Set<string>): MatchResult => {
  let changed = false;
  const toClearKeys = new Set<string>();
  const unfreezeTransitions = new Map<string, CellType>();

  const dy = [-1, 1, 0, 0];
  const dx = [0, 0, -1, 1];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      const key = `${y},${x}`;
      if (ignoredKeys?.has(key)) continue;

      const baseCell = getBaseBlockId(cell);
      const isCellFrozen = isFrozenBlock(cell);

      // 1. Bomb interactions (Only unfrozen bombs can detonate!)
      if (!isCellFrozen && baseCell === BLOCK_BOMB) {
        for (let i = 0; i < 4; i++) {
          const ny = y + dy[i];
          const nx = x + dx[i];
          if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
            const nKey = `${ny},${nx}`;
            if (ignoredKeys?.has(nKey)) continue;

            const neighbor = grid[ny][nx];
            if (neighbor === BLOCK_EMPTY) continue;

            const baseNeighbor = getBaseBlockId(neighbor);
            const isNeighborFrozen = isFrozenBlock(neighbor);
            const neighborProps = getBlockProperties(neighbor, grid);

            if (isNeighborFrozen) {
              if (neighborProps.canBeDestroyedByShooter) {
                // Requirement 4: Frozen target block -> remove both ice and block immediately!
                toClearKeys.add(key);
                toClearKeys.add(nKey);
                changed = true;
              } else {
                // Requirement 4: Frozen non-target block -> remove ice ONLY!
                toClearKeys.add(key);
                unfreezeTransitions.set(nKey, baseNeighbor);
                changed = true;
              }
            } else if (neighborProps.canBeDestroyedByShooter) {
              // Normal target block -> destroyed by bomb
              toClearKeys.add(key);
              toClearKeys.add(nKey);
              changed = true;
            }
          }
        }
      }

      // 2. Standard matching between non-frozen destroyable blocks
      if (!isCellFrozen && getBlockProperties(cell, grid)?.canBeDestroyedByShooter) {
        for (let i = 0; i < 4; i++) {
          const ny = y + dy[i];
          const nx = x + dx[i];
          if (ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[0].length) {
            const nKey = `${ny},${nx}`;
            if (ignoredKeys?.has(nKey)) continue;

            const neighbor = grid[ny][nx];
            if (
              !isFrozenBlock(neighbor) &&
              getBlockProperties(neighbor, grid)?.canBeDestroyedByShooter
            ) {
              if (cell === neighbor) {
                toClearKeys.add(key);
                toClearKeys.add(nKey);
                changed = true;
              }
            }
          }
        }
      }
    }
  }

  // 3. Any block cleared removes ice from adjacent frozen blocks (up, down, left, right)
  if (toClearKeys.size > 0) {
    const adjacentIceTransitions = findAdjacentIceTransitions(grid, toClearKeys);
    adjacentIceTransitions.forEach((unfrozenVal, key) => {
      if (!toClearKeys.has(key)) {
        unfreezeTransitions.set(key, unfrozenVal);
        changed = true;
      }
    });
  }

  return { changed, grid, toClearKeys, unfreezeTransitions };
};

/** Find Frozen blocks adjacent to cleared cells and return map of coordinates to unfrozen Base Block ID. */
export const findAdjacentIceTransitions = (
  grid: CellType[][],
  clearedKeys: Set<string>
): Map<string, CellType> => {
  const transitions = new Map<string, CellType>();
  const dy = [-1, 1, 0, 0];
  const dx = [0, 0, -1, 1];
  const H = grid.length;
  const W = grid[0]?.length || 0;

  clearedKeys.forEach((key) => {
    const [yStr, xStr] = key.split(',');
    const cy = parseInt(yStr, 10);
    const cx = parseInt(xStr, 10);

    for (let i = 0; i < 4; i++) {
      const ny = cy + dy[i];
      const nx = cx + dx[i];
      if (ny >= 0 && ny < H && nx >= 0 && nx < W) {
        const nKey = `${ny},${nx}`;
        if (clearedKeys.has(nKey)) continue;

        const neighborCell = grid[ny][nx];
        if (isFrozenBlock(neighborCell)) {
          transitions.set(nKey, getBaseBlockId(neighborCell));
        }
      }
    }
  });

  return transitions;
};

/** Find Straw blocks adjacent to cleared cells and return map of coordinates to next Straw Block ID.
 *  If multiple cleared cells are adjacent to the same Straw block, it decrements by 1 for EACH adjacent cleared cell.
 */
export const findAdjacentStrawTransitions = (
  grid: CellType[][],
  clearedKeys: Set<string>
): Map<string, CellType> => {
  const transitions = new Map<string, CellType>();
  const dy = [-1, 1, 0, 0];
  const dx = [0, 0, -1, 1];
  const H = grid.length;
  const W = grid[0]?.length || 0;

  clearedKeys.forEach((key) => {
    const [yStr, xStr] = key.split(',');
    const cy = parseInt(yStr, 10);
    const cx = parseInt(xStr, 10);

    for (let i = 0; i < 4; i++) {
      const ny = cy + dy[i];
      const nx = cx + dx[i];
      if (ny >= 0 && ny < H && nx >= 0 && nx < W) {
        const nKey = `${ny},${nx}`;
        if (clearedKeys.has(nKey)) continue;

        const neighborCell = grid[ny][nx];
        if (isStrawBlock(neighborCell)) {
          const currentVal = transitions.has(nKey) ? transitions.get(nKey)! : neighborCell;
          transitions.set(nKey, getNextStrawBlockId(currentVal));
        }
      }
    }
  });

  return transitions;
};

/** Remove matched blocks from the grid, transition unfrozen blocks, and transition adjacent straw blocks. */
export const clearMatches = (
  grid: CellType[][],
  toClearKeys: Set<string>,
  strawTransitions?: Map<string, CellType>,
  unfreezeTransitions?: Map<string, CellType>
): CellType[][] => {
  const nextGrid = copyGrid(grid);
  toClearKeys.forEach((key) => {
    const [yStr, xStr] = key.split(',');
    const y = parseInt(yStr, 10);
    const x = parseInt(xStr, 10);
    const cell = nextGrid[y]?.[x];
    if (cell !== undefined) {
      nextGrid[y][x] = BLOCK_EMPTY;
    }
  });

  if (unfreezeTransitions) {
    unfreezeTransitions.forEach((nextVal, key) => {
      const [yStr, xStr] = key.split(',');
      const y = parseInt(yStr, 10);
      const x = parseInt(xStr, 10);
      if (nextGrid[y]?.[x] !== undefined) {
        nextGrid[y][x] = nextVal;
      }
    });
  }

  if (strawTransitions) {
    strawTransitions.forEach((nextVal, key) => {
      const [yStr, xStr] = key.split(',');
      const y = parseInt(yStr, 10);
      const x = parseInt(xStr, 10);
      if (nextGrid[y]?.[x] !== undefined) {
        nextGrid[y][x] = nextVal;
      }
    });
  }

  return nextGrid;
};

// ── Move block validation ──

/** Attempt to move a block (or stack) and return the resulting grid. */
export const tryMoveBlock = (
  currentGrid: CellType[][],
  x: number,
  y: number,
  dx: number,
  dy: number,
  flashingBlocks: Record<string, CellType | boolean>,
  ignoredKeys?: Set<string>
): MoveBlockResult => {
  const block = currentGrid[y]?.[x];
  const fail: MoveBlockResult = {
    success: false,
    grid: currentGrid,
    newCursorX: x,
    newCursorY: y,
  };

  const canMoveThisBlock = getBlockProperties(block, currentGrid)?.canSelect;

  if (block === undefined || !canMoveThisBlock) {
    return fail;
  }

  // Standard match blocks can only slide horizontally
  if (dy !== 0) return fail;

  // Blocks with gravity must be supported underneath to slide horizontally
  if (getBlockProperties(block, currentGrid)?.canFall && dy === 0) {
    const isSupported = y === currentGrid.length - 1 || currentGrid[y + 1]?.[x] !== BLOCK_EMPTY;
    if (!isSupported) return fail;
  }

  const coords: Position[] = [{ x, y }];

  const matchResult = findMatches(currentGrid, ignoredKeys);

  if (
    coords.some(
      (coord) =>
        flashingBlocks[`${coord.y},${coord.x}`] ||
        matchResult.toClearKeys.has(`${coord.y},${coord.x}`)
    )
  ) {
    return fail;
  }

  const W = currentGrid[0].length;
  const H = currentGrid.length;

  const finalPositions: Position[] = new Array(coords.length);
  const consumedPortals: Record<string, CellType> = {};
  const clearedPortalsSet = new Set<string>();

  for (let i = 0; i < coords.length; i++) {
    if (finalPositions[i]) continue;

    const src = coords[i];
    const tx = src.x + dx;
    const ty = src.y + dy;

    if (tx < 0 || tx >= W || ty < 0 || ty >= H) {
      return fail;
    }

    const destCell = currentGrid[ty][tx];

    if (isPortalBlock(destCell) || isWormholeBlock(destCell)) {
      const pairPos = findPairedWormhole(currentGrid, destCell, ty, tx);
      if (!pairPos) return fail;

      const portalKeyA = `${ty},${tx}`;
      const portalKeyB = `${pairPos.y},${pairPos.x}`;
      consumedPortals[portalKeyA] = destCell;
      consumedPortals[portalKeyB] = destCell;
      clearedPortalsSet.add(portalKeyA);
      clearedPortalsSet.add(portalKeyB);

      // ONLY the specific block that actually reached the portal teleports to pairPos
      finalPositions[i] = { x: pairPos.x, y: pairPos.y };
    } else if (isBlackholeBlock(destCell)) {
      const pairPos = findPairedBlackhole(currentGrid, destCell, ty, tx);
      if (!pairPos) return fail;

      // ONLY the specific block that actually reached the blackhole teleports below pairPos
      finalPositions[i] = { x: pairPos.x, y: pairPos.y + 1 };
    } else {
      finalPositions[i] = { x: tx, y: ty };
    }
  }

  // Validate all final positions
  for (let i = 0; i < coords.length; i++) {
    const fp = finalPositions[i];
    if (fp.x < 0 || fp.x >= W || fp.y < 0 || fp.y >= H) {
      return fail;
    }
    if (flashingBlocks[`${fp.y},${fp.x}`]) {
      return fail;
    }

    const destCell = currentGrid[fp.y][fp.x];
    const isSelfOldPos = coords.some((c) => c.x === fp.x && c.y === fp.y);
    const isClearedPortal = clearedPortalsSet.has(`${fp.y},${fp.x}`);

    if (destCell !== BLOCK_EMPTY && !isSelfOldPos && !isClearedPortal) {
      return fail;
    }
  }

  // Ensure no overlapping final positions
  const posSet = new Set<string>();
  for (let i = 0; i < finalPositions.length; i++) {
    const key = `${finalPositions[i].y},${finalPositions[i].x}`;
    if (posSet.has(key)) return fail;
    posSet.add(key);
  }

  // Execute shift
  const nextGrid = copyGrid(currentGrid);
  for (const c of coords) {
    nextGrid[c.y][c.x] = BLOCK_EMPTY;
  }
  for (const key of clearedPortalsSet) {
    const [py, px] = key.split(',').map(Number);
    nextGrid[py][px] = BLOCK_EMPTY;
  }
  for (let i = 0; i < coords.length; i++) {
    nextGrid[finalPositions[i].y][finalPositions[i].x] = currentGrid[coords[i].y][coords[i].x];
  }

  return {
    success: true,
    grid: nextGrid,
    newCursorX: finalPositions[0].x,
    newCursorY: finalPositions[0].y,
    consumedPortals: Object.keys(consumedPortals).length > 0 ? consumedPortals : undefined,
    movedCoords: coords,
    finalPositions,
  };
};
