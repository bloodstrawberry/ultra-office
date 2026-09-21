export const WIDTH = 432;
export const HEIGHT = 600;
export const RADIUS = 18;
export const COLUMNS = 11;
export const ROWS = 16;
export const ROW_HEIGHT = 31;
export const SHOOTER_X = WIDTH / 2;
export const SHOOTER_Y = 562;

export const COLORS = ['#ff638d', '#55c8ff', '#ffd166', '#ad87ff', '#65dfa6'] as const;
export type Bubble = number;
export type Grid = (Bubble | null)[][];
export type Status = 'playing' | 'won' | 'lost';
export type Game = {
  grid: Grid;
  current: Bubble;
  next: Bubble;
  score: number;
  shots: number;
  misses: number;
  status: Status;
};

export const center = (row: number, col: number) => ({
  x: RADIUS + col * RADIUS * 2 + (row % 2) * RADIUS,
  y: RADIUS + row * ROW_HEIGHT,
});

export function collides(grid: Grid, x: number, y: number): boolean {
  if (y <= RADIUS) return true;
  const nearestRow = Math.round((y - RADIUS) / ROW_HEIGHT);
  for (let row = Math.max(0, nearestRow - 1); row <= Math.min(ROWS - 1, nearestRow + 1); row += 1) {
    const nearestCol = Math.round((x - RADIUS - (row % 2) * RADIUS) / (RADIUS * 2));
    for (
      let col = Math.max(0, nearestCol - 1);
      col <= Math.min(COLUMNS - 1, nearestCol + 1);
      col += 1
    ) {
      if (grid[row][col] == null) continue;
      const point = center(row, col);
      const dx = point.x - x;
      const dy = point.y - y;
      if (dx * dx + dy * dy < (RADIUS * 2 - 2) ** 2) return true;
    }
  }
  return false;
}

const randomColor = (colors: Bubble[]) => colors[Math.floor(Math.random() * colors.length)];

export function createGame(): Game {
  const grid: Grid = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLUMNS }, () =>
      row < 5 && Math.random() > 0.13 ? randomColor([0, 1, 2, 3]) : null
    )
  );
  return {
    grid,
    current: randomColor([0, 1, 2, 3]),
    next: randomColor([0, 1, 2, 3]),
    score: 0,
    shots: 0,
    misses: 0,
    status: 'playing',
  };
}

export function neighbors(row: number, col: number): [number, number][] {
  const origin = center(row, col);
  const result: [number, number][] = [];
  for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r += 1) {
    for (let c = Math.max(0, col - 1); c <= Math.min(COLUMNS - 1, col + 1); c += 1) {
      if (r === row && c === col) continue;
      const point = center(r, c);
      if (Math.hypot(origin.x - point.x, origin.y - point.y) < RADIUS * 2 + 2) result.push([r, c]);
    }
  }
  return result;
}

function connected(grid: Grid, starts: [number, number][], predicate: (bubble: Bubble) => boolean) {
  const seen = new Set<string>();
  const queue = [...starts];
  for (let index = 0; index < queue.length; index += 1) {
    const [row, col] = queue[index];
    const key = `${row},${col}`;
    const value = grid[row]?.[col];
    if (seen.has(key) || value == null || !predicate(value)) continue;
    seen.add(key);
    queue.push(...neighbors(row, col));
  }
  return seen;
}

export function settle(game: Game, x: number, y: number): Game {
  if (game.status !== 'playing') return game;
  const grid = game.grid.map((row) => [...row]);
  const candidates: { row: number; col: number; distance: number }[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLUMNS; col += 1) {
      if (
        grid[row][col] != null ||
        (row > 0 && !neighbors(row, col).some(([r, c]) => grid[r][c] != null))
      )
        continue;
      const point = center(row, col);
      candidates.push({ row, col, distance: Math.hypot(point.x - x, point.y - y) });
    }
  }
  if (!candidates.length) return { ...game, status: 'lost' };
  candidates.sort((a, b) => a.distance - b.distance);
  const { row, col } = candidates[0];
  grid[row][col] = game.current;

  const group = connected(grid, [[row, col]], (color) => color === game.current);
  let removed = 0;
  if (group.size >= 3) {
    for (const key of group) {
      const [r, c] = key.split(',').map(Number);
      grid[r][c] = null;
      removed += 1;
    }
    const anchored = connected(
      grid,
      Array.from({ length: COLUMNS }, (_, c) => [0, c]),
      () => true
    );
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLUMNS; c += 1) {
        if (grid[r][c] != null && !anchored.has(`${r},${c}`)) {
          grid[r][c] = null;
          removed += 1;
        }
      }
    }
  }

  let misses = removed ? 0 : game.misses + 1;
  let status: Status = 'playing';
  if (misses >= 5) {
    const active = [...new Set(grid.flat().filter((value): value is Bubble => value != null))];
    grid.pop();
    grid.unshift(
      Array.from({ length: COLUMNS }, () => randomColor(active.length ? active : [0, 1, 2, 3]))
    );
    misses = 0;
  }
  if (grid.every((line) => line.every((value) => value == null))) status = 'won';
  else if (grid.slice(14).some((line) => line.some((value) => value != null))) status = 'lost';

  const active = [...new Set(grid.flat().filter((value): value is Bubble => value != null))];
  return {
    grid,
    current: active.includes(game.next)
      ? game.next
      : randomColor(active.length ? active : [0, 1, 2, 3]),
    next: randomColor(active.length ? active : [0, 1, 2, 3]),
    score: game.score + (removed >= 3 ? removed * 10 + Math.max(0, removed - group.size) * 10 : 0),
    shots: game.shots + 1,
    misses,
    status,
  };
}
