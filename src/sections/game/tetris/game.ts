export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const COLORS: Record<PieceType, string> = {
  I: '#43d5f3',
  O: '#f9d65c',
  T: '#b884f6',
  S: '#69dc8e',
  Z: '#fb7185',
  J: '#668cf2',
  L: '#fbad5d',
};

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type Cell = [number, number];
export type Piece = { type: PieceType; cells: Cell[]; x: number; y: number };
export type Board = (PieceType | null)[][];
export type Game = {
  board: Board;
  active: Piece;
  queue: PieceType[];
  hold: PieceType | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  status: 'playing' | 'paused' | 'lost';
};

const SHAPES: Record<PieceType, Cell[]> = {
  I: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  O: [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  T: [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  S: [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
  Z: [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  J: [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  L: [
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ],
};

const TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

function bag(): PieceType[] {
  const values = [...TYPES];
  for (let index = values.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [values[index], values[other]] = [values[other], values[index]];
  }
  return values;
}

export function spawn(type: PieceType): Piece {
  const cells = SHAPES[type].map(([x, y]) => [x, y] as Cell);
  const width = Math.max(...cells.map(([x]) => x)) + 1;
  return { type, cells, x: Math.floor((BOARD_WIDTH - width) / 2), y: 0 };
}

export function createGame(): Game {
  const [first, ...queue] = bag();
  return {
    board: Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null)),
    active: spawn(first),
    queue: [...queue, ...bag()],
    hold: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    status: 'playing',
  };
}

export function fits(board: Board, piece: Piece): boolean {
  return piece.cells.every(([dx, dy]) => {
    const x = piece.x + dx;
    const y = piece.y + dy;
    return x >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT && (y < 0 || board[y][x] == null);
  });
}

function takeNext(game: Game): Pick<Game, 'active' | 'queue' | 'status'> {
  const [type, ...remaining] = game.queue;
  const active = spawn(type);
  return {
    active,
    queue: remaining.length < 7 ? [...remaining, ...bag()] : remaining,
    status: fits(game.board, active) ? 'playing' : 'lost',
  };
}

export function movePiece(game: Game, dx: number): Game {
  if (game.status !== 'playing') return game;
  const active = { ...game.active, x: game.active.x + dx };
  return fits(game.board, active) ? { ...game, active } : game;
}

export function softDrop(game: Game): Game {
  if (game.status !== 'playing') return game;
  const next = tick(game);
  return next.board === game.board ? { ...next, score: next.score + 1 } : next;
}

export function rotate(game: Game, direction: 1 | -1 = 1): Game {
  if (game.status !== 'playing' || game.active.type === 'O') return game;
  const raw = game.active.cells.map(([x, y]) =>
    direction === 1 ? ([-y, x] as Cell) : ([y, -x] as Cell)
  );
  const minX = Math.min(...raw.map(([x]) => x));
  const minY = Math.min(...raw.map(([, y]) => y));
  const cells = raw.map(([x, y]) => [x - minX, y - minY] as Cell);
  for (const dy of [0, -1, -2]) {
    for (const dx of [0, -1, 1, -2, 2]) {
      const active = { ...game.active, cells, x: game.active.x + dx, y: game.active.y + dy };
      if (fits(game.board, active)) return { ...game, active };
    }
  }
  return game;
}

export function ghostY(game: Game): number {
  let y = game.active.y;
  while (fits(game.board, { ...game.active, y: y + 1 })) y += 1;
  return y;
}

function lock(game: Game): Game {
  const board = game.board.map((row) => [...row]);
  for (const [dx, dy] of game.active.cells) {
    const x = game.active.x + dx;
    const y = game.active.y + dy;
    if (y < 0) return { ...game, status: 'lost' };
    board[y][x] = game.active.type;
  }
  const kept = board.filter((row) => row.some((cell) => cell == null));
  const cleared = BOARD_HEIGHT - kept.length;
  const lines = game.lines + cleared;
  const updated: Game = {
    ...game,
    board: [...Array.from({ length: cleared }, () => Array(BOARD_WIDTH).fill(null)), ...kept],
    score: game.score + [0, 100, 300, 500, 800][cleared] * game.level,
    lines,
    level: Math.floor(lines / 10) + 1,
    canHold: true,
  };
  return { ...updated, ...takeNext(updated) };
}

export function tick(game: Game): Game {
  if (game.status !== 'playing') return game;
  const active = { ...game.active, y: game.active.y + 1 };
  return fits(game.board, active) ? { ...game, active } : lock(game);
}

export function hardDrop(game: Game): Game {
  if (game.status !== 'playing') return game;
  const y = ghostY(game);
  return lock({
    ...game,
    active: { ...game.active, y },
    score: game.score + 2 * (y - game.active.y),
  });
}

export function holdPiece(game: Game): Game {
  if (game.status !== 'playing' || !game.canHold) return game;
  if (game.hold) {
    const active = spawn(game.hold);
    return {
      ...game,
      active,
      hold: game.active.type,
      canHold: false,
      status: fits(game.board, active) ? 'playing' : 'lost',
    };
  }
  const updated = { ...game, hold: game.active.type, canHold: false };
  return { ...updated, ...takeNext(updated) };
}
