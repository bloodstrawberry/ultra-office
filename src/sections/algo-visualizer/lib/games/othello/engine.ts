import type { OthelloGrid, OthelloPoint, OthelloColor, OthelloMoveResult } from './types';

export const OTHELLO_SIZE = 8;

const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export function createEmptyOthelloBoard(): OthelloGrid {
  return Array.from({ length: OTHELLO_SIZE }, () =>
    Array.from({ length: OTHELLO_SIZE }, () => null)
  );
}

export function createStandardOthelloBoard(): OthelloGrid {
  const board = createEmptyOthelloBoard();
  // Standard Othello start: White at (3,3), (4,4), Black at (3,4), (4,3)
  board[3][3] = 'W';
  board[3][4] = 'B';
  board[4][3] = 'B';
  board[4][4] = 'W';
  return board;
}

export function cloneOthelloBoard(board: OthelloGrid): OthelloGrid {
  return board.map((row) => [...row]);
}

export function countOthelloDiscs(board: OthelloGrid): {
  black: number;
  white: number;
  empty: number;
} {
  let black = 0;
  let white = 0;
  let empty = 0;
  for (let r = 0; r < OTHELLO_SIZE; r += 1) {
    for (let c = 0; c < OTHELLO_SIZE; c += 1) {
      if (board[r][c] === 'B') black += 1;
      else if (board[r][c] === 'W') white += 1;
      else empty += 1;
    }
  }
  return { black, white, empty };
}

export function getFlippedDiscsForMove(
  board: OthelloGrid,
  move: OthelloPoint,
  color: OthelloColor
): OthelloPoint[] {
  if (move.r < 0 || move.r >= OTHELLO_SIZE || move.c < 0 || move.c >= OTHELLO_SIZE) return [];
  if (board[move.r][move.c] !== null) return [];

  const opponent: OthelloColor = color === 'B' ? 'W' : 'B';
  const allFlipped: OthelloPoint[] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const lineFlipped: OthelloPoint[] = [];
    let r = move.r + dr;
    let c = move.c + dc;

    while (r >= 0 && r < OTHELLO_SIZE && c >= 0 && c < OTHELLO_SIZE && board[r][c] === opponent) {
      lineFlipped.push({ r, c });
      r += dr;
      c += dc;
    }

    if (
      lineFlipped.length > 0 &&
      r >= 0 &&
      r < OTHELLO_SIZE &&
      c >= 0 &&
      c < OTHELLO_SIZE &&
      board[r][c] === color
    ) {
      allFlipped.push(...lineFlipped);
    }
  }

  return allFlipped;
}

export function getValidOthelloMoves(board: OthelloGrid, color: OthelloColor): OthelloPoint[] {
  const validMoves: OthelloPoint[] = [];
  for (let r = 0; r < OTHELLO_SIZE; r += 1) {
    for (let c = 0; c < OTHELLO_SIZE; c += 1) {
      if (board[r][c] === null) {
        const flipped = getFlippedDiscsForMove(board, { r, c }, color);
        if (flipped.length > 0) {
          validMoves.push({ r, c });
        }
      }
    }
  }
  return validMoves;
}

export function applyOthelloMove(
  board: OthelloGrid,
  move: OthelloPoint,
  color: OthelloColor
): OthelloMoveResult {
  const flipped = getFlippedDiscsForMove(board, move, color);
  if (flipped.length === 0) {
    const counts = countOthelloDiscs(board);
    return {
      valid: false,
      flipped: [],
      blackCount: counts.black,
      whiteCount: counts.white,
    };
  }

  const nextBoard = cloneOthelloBoard(board);
  nextBoard[move.r][move.c] = color;
  for (const pt of flipped) {
    nextBoard[pt.r][pt.c] = color;
  }

  const counts = countOthelloDiscs(nextBoard);
  return {
    valid: true,
    flipped,
    newBoard: nextBoard,
    blackCount: counts.black,
    whiteCount: counts.white,
  };
}

export function formatOthelloCoord(p: OthelloPoint): string {
  const colLetter = String.fromCharCode(65 + p.c); // A-H
  const rowNumber = p.r + 1; // 1-8
  return `${colLetter}${rowNumber} (${p.r}, ${p.c})`;
}
