import type { BlockId } from '../objects/constants';

import realMapJson from '../data/real-map.json';
import testMapJson from '../data/test-map.json';
import { getBlockProperties } from '../objects/constants';

// ── Raw JSON shape ──
interface RawLevelData {
  name: string;
  grid: number[][];
  timeLimit?: number;
  hint?: number[][][];
}

// ── Public types ──
export type CellType = BlockId;

export interface Position {
  x: number;
  y: number;
}

export interface LevelData {
  name: string;
  grid: CellType[][];
  timeLimit: number;
  hint?: CellType[][][];
}

export interface Bullet {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  dir: number;
  ignoreNextCell?: boolean;
  firedAt?: number;
}

// ── Constants ──
export const AUTO_WALL_TURN_DELAY_TICKS = 2;
export const SHOOTER_INTERVAL = 1000;

// ── Level data ──
const realMap: RawLevelData[] = realMapJson as RawLevelData[];
const testMap: RawLevelData[] = testMapJson as RawLevelData[];

export { realMap, testMap };

export const BUILTIN_LEVELS: LevelData[] = realMap.map((lvl) => ({
  name: lvl.name,
  grid: lvl.grid as CellType[][],
  timeLimit: lvl.timeLimit ?? 180,
  hint: lvl.hint as CellType[][][] | undefined,
}));

// ── Utility functions ──
export const copyGrid = (src: CellType[][]): CellType[][] => src.map((row) => [...row]);

export const copy3DGrid = (src?: CellType[][][]): CellType[][][] | undefined => {
  if (!src) return undefined;
  return src.map((grid) => copyGrid(grid));
};

export const findInitialCursor = (grid: CellType[][]): Position => {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (getBlockProperties(grid[y][x], grid)?.canSelect) {
        return { x, y };
      }
    }
  }
  return { x: Math.floor(w / 2), y: h - 1 };
};
