export const WIDTH = 420;
export const HEIGHT = 620;
export const BLOCK_HEIGHT = 28;
export const START_WIDTH = 208;

export type Block = { x: number; y: number; width: number; color: string };
export type MovingBlock = Block & { direction: -1 | 1; speed: number };
export type Game = {
  layers: Block[];
  active: MovingBlock;
  score: number;
  streak: number;
  status: 'playing' | 'paused' | 'lost';
  lastPerfect: boolean;
};

export type DropResult = { game: Game; cut: Block | null };

function colorFor(level: number) {
  return `hsl(${(188 + level * 17) % 360} 85% 63%)`;
}

export function createGame(): Game {
  const base: Block = {
    x: (WIDTH - START_WIDTH) / 2,
    y: HEIGHT - 76,
    width: START_WIDTH,
    color: colorFor(0),
  };
  return {
    layers: [base],
    active: {
      x: 0,
      y: base.y - BLOCK_HEIGHT,
      width: START_WIDTH,
      color: colorFor(1),
      direction: 1,
      speed: 180,
    },
    score: 0,
    streak: 0,
    status: 'playing',
    lastPerfect: false,
  };
}

export function advance(game: Game, seconds: number): Game {
  if (game.status !== 'playing') return game;
  const limit = WIDTH - game.active.width;
  let x = game.active.x + game.active.direction * game.active.speed * seconds;
  let direction = game.active.direction;
  if (x < 0) {
    x = -x;
    direction = 1;
  } else if (x > limit) {
    x = 2 * limit - x;
    direction = -1;
  }
  return { ...game, active: { ...game.active, x: Math.max(0, Math.min(limit, x)), direction } };
}

export function drop(game: Game): DropResult {
  if (game.status !== 'playing') return { game, cut: null };
  const top = game.layers[game.layers.length - 1];
  const moving = game.active;
  const left = Math.max(top.x, moving.x);
  const right = Math.min(top.x + top.width, moving.x + moving.width);
  if (right <= left) return { game: { ...game, status: 'lost', lastPerfect: false }, cut: moving };

  const perfect = Math.abs(moving.x - top.x) <= 5;
  const x = perfect ? top.x : left;
  const width = perfect ? top.width : right - left;
  const placed: Block = { x, y: moving.y, width, color: moving.color };
  let cut: Block | null = null;
  if (!perfect && moving.x < top.x)
    cut = { x: moving.x, y: moving.y, width: top.x - moving.x, color: moving.color };
  else if (!perfect && moving.x > top.x)
    cut = { x: right, y: moving.y, width: moving.x + moving.width - right, color: moving.color };

  const score = game.score + 1;
  const streak = perfect ? game.streak + 1 : 0;
  const fromRight = game.layers.length % 2 === 1;
  return {
    game: {
      layers: [...game.layers, placed],
      active: {
        x: fromRight ? WIDTH - width : 0,
        y: placed.y - BLOCK_HEIGHT,
        width,
        color: colorFor(score + 1),
        direction: fromRight ? -1 : 1,
        speed: Math.min(430, 180 + score * 13),
      },
      score,
      streak,
      status: 'playing',
      lastPerfect: perfect,
    },
    cut,
  };
}
