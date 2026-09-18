export type Direction = 'left' | 'right' | 'up' | 'down';
export type Board = number[][];
export type Game = {
  board: Board;
  score: number;
  moves: number;
  status: 'playing' | 'won' | 'over';
  continued: boolean;
};

const SIZE = 4;

export function addTile(board: Board, random = Math.random): Board {
  const empty: [number, number][] = [];
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] === 0) empty.push([row, col]);
    }
  }
  if (!empty.length) return board;
  const [row, col] = empty[Math.floor(random() * empty.length)];
  const next = board.map((line) => [...line]);
  next[row][col] = random() < 0.9 ? 2 : 4;
  return next;
}

export function createGame(): Game {
  const empty = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  return {
    board: addTile(addTile(empty)),
    score: 0,
    moves: 0,
    status: 'playing',
    continued: false,
  };
}

function mergeLine(line: number[]) {
  const numbers = line.filter(Boolean);
  const result: number[] = [];
  let gained = 0;
  for (let index = 0; index < numbers.length; index += 1) {
    if (numbers[index] === numbers[index + 1]) {
      const value = numbers[index] * 2;
      result.push(value);
      gained += value;
      index += 1;
    } else {
      result.push(numbers[index]);
    }
  }
  while (result.length < SIZE) result.push(0);
  return { result, gained };
}

export function slide(board: Board, direction: Direction) {
  const next = board.map((row) => [...row]);
  let gained = 0;
  let changed = false;
  for (let lineIndex = 0; lineIndex < SIZE; lineIndex += 1) {
    const positions: [number, number][] = Array.from({ length: SIZE }, (_, index) =>
      direction === 'left'
        ? [lineIndex, index]
        : direction === 'right'
          ? [lineIndex, SIZE - 1 - index]
          : direction === 'up'
            ? [index, lineIndex]
            : [SIZE - 1 - index, lineIndex]
    );
    const original = positions.map(([row, col]) => board[row][col]);
    const merged = mergeLine(original);
    gained += merged.gained;
    positions.forEach(([row, col], index) => {
      next[row][col] = merged.result[index];
      if (original[index] !== merged.result[index]) changed = true;
    });
  }
  return { board: next, gained, changed };
}

export function hasMoves(board: Board): boolean {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = board[row][col];
      if (
        !value ||
        (col < SIZE - 1 && value === board[row][col + 1]) ||
        (row < SIZE - 1 && value === board[row + 1][col])
      )
        return true;
    }
  }
  return false;
}

export function play(game: Game, direction: Direction, random = Math.random): Game {
  if (game.status !== 'playing') return game;
  const result = slide(game.board, direction);
  if (!result.changed) return game;
  const board = addTile(result.board, random);
  const won = !game.continued && board.some((row) => row.some((value) => value >= 2048));
  return {
    ...game,
    board,
    score: game.score + result.gained,
    moves: game.moves + 1,
    status: won ? 'won' : hasMoves(board) ? 'playing' : 'over',
  };
}

export function continueGame(game: Game): Game {
  if (game.status !== 'won') return game;
  return { ...game, continued: true, status: hasMoves(game.board) ? 'playing' : 'over' };
}
