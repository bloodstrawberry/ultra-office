import { GridCell } from '../types';

export const DEFAULT_GRID_ROWS = 15;
export const DEFAULT_GRID_COLS = 25;

export interface GridConfig {
  rows: number;
  cols: number;
  start: [number, number];
  target: [number, number];
  walls: Set<string>;
}

export function createDefaultGrid(
  rows = DEFAULT_GRID_ROWS,
  cols = DEFAULT_GRID_COLS,
  start: [number, number] = [Math.floor(rows / 2), 3],
  target: [number, number] = [Math.floor(rows / 2), cols - 4],
  walls: Set<string> = new Set()
): GridCell[][] {
  const grid: GridCell[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < cols; c++) {
      let type: GridCell['type'] = 'empty';
      if (r === start[0] && c === start[1]) {
        type = 'start';
      } else if (r === target[0] && c === target[1]) {
        type = 'target';
      } else if (walls.has(`${r},${c}`)) {
        type = 'wall';
      }

      row.push({
        row: r,
        col: c,
        type,
        distance: Infinity,
      });
    }
    grid.push(row);
  }

  return grid;
}

export function generateRandomWalls(
  rows: number,
  cols: number,
  start: [number, number],
  target: [number, number],
  density = 0.28
): Set<string> {
  const walls = new Set<string>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r === start[0] && c === start[1]) || (r === target[0] && c === target[1])) {
        continue;
      }
      if (Math.random() < density) {
        walls.add(`${r},${c}`);
      }
    }
  }

  return walls;
}

export function generateMazeRecursive(
  rows: number,
  cols: number,
  start: [number, number],
  target: [number, number]
): Set<string> {
  const walls = new Set<string>();

  // Add outer boundary
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        if (!(r === start[0] && c === start[1]) && !(r === target[0] && c === target[1])) {
          walls.add(`${r},${c}`);
        }
      }
    }
  }

  function divide(r1: number, r2: number, c1: number, c2: number) {
    if (r2 - r1 < 2 || c2 - c1 < 2) return;

    const isHorizontal = r2 - r1 > c2 - c1;

    if (isHorizontal) {
      const wallR = Math.floor((r1 + r2) / 2);
      const passC = Math.floor(Math.random() * (c2 - c1 + 1)) + c1;

      for (let c = c1; c <= c2; c++) {
        if (c !== passC) {
          if (
            !(wallR === start[0] && c === start[1]) &&
            !(wallR === target[0] && c === target[1])
          ) {
            walls.add(`${wallR},${c}`);
          }
        }
      }

      divide(r1, wallR - 1, c1, c2);
      divide(wallR + 1, r2, c1, c2);
    } else {
      const wallC = Math.floor((c1 + c2) / 2);
      const passR = Math.floor(Math.random() * (r2 - r1 + 1)) + r1;

      for (let r = r1; r <= r2; r++) {
        if (r !== passR) {
          if (
            !(r === start[0] && wallC === start[1]) &&
            !(r === target[0] && wallC === target[1])
          ) {
            walls.add(`${r},${wallC}`);
          }
        }
      }

      divide(r1, r2, c1, wallC - 1);
      divide(r1, r2, wallC + 1, c2);
    }
  }

  divide(1, rows - 2, 1, cols - 2);
  return walls;
}
