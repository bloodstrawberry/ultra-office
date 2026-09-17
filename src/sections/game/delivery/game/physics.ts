import {
  BLOCK_EMPTY,
  BLOCK_NONE,
  BLOCK_WALL,
  BLOCK_STRAWBERRY,
  BLOCK_WATERMELON,
  BLOCK_SWEET_POTATO,
  BLOCK_BOMB,
  BLOCK_PORTAL_1,
  BLOCK_PORTAL_2,
  BLOCK_PORTAL_3,
  BLOCK_PORTAL_4,
  BLOCK_PORTAL_5,
  BLOCK_PORTAL_6,
  BLOCK_PORTAL_7,
  BLOCK_APPLE,
  BLOCK_BLUEBERRY,
  BLOCK_GRAPE,
  BLOCK_PEACH,
  isPortalBlock,
  getBaseBlockId,
  type BlockId,
} from "../object/constants";
import { CellType, Position, copyGrid } from "./types";

export type Direction = "up" | "down" | "left" | "right";

export interface DestroyedBlock {
  x: number;
  y: number;
  type: CellType;
}

export interface SlideResult {
  success: boolean; // True if the box moved at least 1 step
  grid: CellType[][];
  startPos: Position;
  finalPos: Position;
  path: Position[]; // Path traversed from start to final position
  isCleared: boolean;
  isOutOfBounds: boolean;
  destroyedBlocks: DestroyedBlock[];
  collectedItems: Position[];
  hitObstacleType: CellType | null;
}

/** Find the starting player spawn position on the grid (default: BLOCK_STRAWBERRY or first open tile) */
export function findPlayerSpawn(grid: CellType[][]): Position {
  const height = grid.length;
  const width = grid[0]?.length || 0;

  // 1. Look for BLOCK_STRAWBERRY (Player block)
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (getBaseBlockId(grid[r][c]) === BLOCK_STRAWBERRY) {
        return { x: c, y: r };
      }
    }
  }

  // 2. Fallback: Look for the first BLOCK_EMPTY or non-wall tile
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (grid[r][c] === BLOCK_EMPTY) {
        return { x: c, y: r };
      }
    }
  }

  return { x: 1, y: 1 };
}

/** Find the linked paired portal on the grid */
export function findPairedPortal(
  grid: CellType[][],
  portalId: CellType,
  currentY: number,
  currentX: number,
): Position | null {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (
        getBaseBlockId(grid[y][x]) === portalId &&
        (y !== currentY || x !== currentX)
      ) {
        return { x, y };
      }
    }
  }
  return null;
}

/**
 * Slide the Orbox in the given direction until an obstacle or void is reached.
 */
export function slideOrbox(
  initialGrid: CellType[][],
  startPos: Position,
  dir: Direction,
): SlideResult {
  const grid = copyGrid(initialGrid);
  const height = grid.length;
  const width = grid[0]?.length || 0;

  if (
    startPos.y >= 0 &&
    startPos.y < height &&
    startPos.x >= 0 &&
    startPos.x < width
  ) {
    if (getBaseBlockId(grid[startPos.y][startPos.x]) === BLOCK_STRAWBERRY) {
      grid[startPos.y][startPos.x] = BLOCK_EMPTY;
    }
  }

  let dx = 0;
  let dy = 0;
  if (dir === "up") dy = -1;
  else if (dir === "down") dy = 1;
  else if (dir === "left") dx = -1;
  else if (dir === "right") dx = 1;

  let currentX = startPos.x;
  let currentY = startPos.y;
  const path: Position[] = [{ x: currentX, y: currentY }];
  const destroyedBlocks: DestroyedBlock[] = [];
  const collectedItems: Position[] = [];

  let isCleared = false;
  let isOutOfBounds = false;
  let hitObstacleType: CellType | null = null;
  let stepsTaken = 0;

  // Maximum step count safeguard to prevent infinite loops (e.g. infinite portal loops)
  const maxSteps = Math.max(width, height) * 4;

  while (stepsTaken < maxSteps) {
    const nextX = currentX + dx;
    const nextY = currentY + dy;

    // 1. Out of bounds (Outside the grid boundary) -> Falling off in space
    if (nextY < 0 || nextY >= height || nextX < 0 || nextX >= width) {
      currentX = nextX;
      currentY = nextY;
      path.push({ x: currentX, y: currentY });
      isOutOfBounds = true;
      stepsTaken++;
      break;
    }

    const nextCell = grid[nextY][nextX];
    const baseCell = getBaseBlockId(nextCell);

    // 2. Void tile (-1) -> Space fall
    if (baseCell === BLOCK_NONE) {
      currentX = nextX;
      currentY = nextY;
      path.push({ x: currentX, y: currentY });
      isOutOfBounds = true;
      stepsTaken++;
      break;
    }

    // 3. Goal Portal (51) -> STAGE CLEAR!
    if (baseCell === BLOCK_PORTAL_1) {
      currentX = nextX;
      currentY = nextY;
      path.push({ x: currentX, y: currentY });
      isCleared = true;
      hitObstacleType = baseCell;
      stepsTaken++;
      break;
    }

    // 4. Empty Space (0) or Player Spawn marker (2) -> Slide through
    if (baseCell === BLOCK_EMPTY || baseCell === BLOCK_STRAWBERRY) {
      currentX = nextX;
      currentY = nextY;
      path.push({ x: currentX, y: currentY });
      stepsTaken++;
      continue;
    }

    // 5. Collectible Fruits / Stars (Apple, Blueberry, Peach, Grape) -> Collect and slide through
    if (
      baseCell === BLOCK_APPLE ||
      baseCell === BLOCK_BLUEBERRY ||
      baseCell === BLOCK_PEACH ||
      baseCell === BLOCK_GRAPE
    ) {
      collectedItems.push({ x: nextX, y: nextY });
      grid[nextY][nextX] = BLOCK_EMPTY;
      currentX = nextX;
      currentY = nextY;
      path.push({ x: currentX, y: currentY });
      stepsTaken++;
      continue;
    }

    // 6. Warp Portal (52 ~ 57) -> Teleport to paired portal and keep sliding
    if (isPortalBlock(baseCell) && baseCell !== BLOCK_PORTAL_1) {
      const paired = findPairedPortal(grid, baseCell, nextY, nextX);
      if (paired) {
        path.push({ x: nextX, y: nextY });
        currentX = paired.x;
        currentY = paired.y;
        path.push({ x: currentX, y: currentY });
        stepsTaken += 2;
        continue;
      }
    }

    // 7. Crumbling Block (Watermelon, Sweet Potato) -> Stops box, then breaks!
    if (baseCell === BLOCK_WATERMELON || baseCell === BLOCK_SWEET_POTATO) {
      hitObstacleType = baseCell;
      destroyedBlocks.push({ x: nextX, y: nextY, type: baseCell });
      grid[nextY][nextX] = BLOCK_EMPTY;
      // Box stops on the cell immediately before the crumbling block
      break;
    }

    // 8. Bomb Block (30) -> Stops box, then explodes 3x3 surrounding blocks!
    if (baseCell === BLOCK_BOMB) {
      hitObstacleType = baseCell;
      destroyedBlocks.push({ x: nextX, y: nextY, type: baseCell });
      grid[nextY][nextX] = BLOCK_EMPTY;

      // Explode surrounding 3x3 blocks
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const by = nextY + oy;
          const bx = nextX + ox;
          if (by >= 0 && by < height && bx >= 0 && bx < width) {
            const bCell = grid[by][bx];
            const baseBCell = getBaseBlockId(bCell);
            if (
              baseBCell !== BLOCK_EMPTY &&
              baseBCell !== BLOCK_NONE &&
              baseBCell !== BLOCK_PORTAL_1
            ) {
              destroyedBlocks.push({ x: bx, y: by, type: bCell });
              grid[by][bx] = BLOCK_EMPTY;
            }
          }
        }
      }
      break;
    }

    // 9. Solid Wall (1) or other solid obstacles -> Stops box
    hitObstacleType = baseCell;
    break;
  }

  const success =
    currentX !== startPos.x ||
    currentY !== startPos.y ||
    destroyedBlocks.length > 0 ||
    collectedItems.length > 0 ||
    isCleared ||
    isOutOfBounds;

  return {
    success,
    grid,
    startPos,
    finalPos: { x: currentX, y: currentY },
    path,
    isCleared,
    isOutOfBounds,
    destroyedBlocks,
    collectedItems,
    hitObstacleType,
  };
}
