import type { GomokuGrid, GomokuPoint, GomokuColor, GomokuWinLine } from './types';

export const GOMOKU_SIZE = 15;

export function createEmptyGomokuBoard(): GomokuGrid {
  return Array.from({ length: GOMOKU_SIZE }, () => Array.from({ length: GOMOKU_SIZE }, () => null));
}

export function cloneGomokuBoard(board: GomokuGrid): GomokuGrid {
  return board.map((row) => [...row]);
}

const DIRECTIONS: [number, number][] = [
  [0, 1], // Horizontal
  [1, 0], // Vertical
  [1, 1], // Diagonal \
  [1, -1], // Diagonal /
];

export function checkGomokuWin(
  board: GomokuGrid,
  lastMove: GomokuPoint | null
): GomokuWinLine | null {
  if (!lastMove) return null;
  const color = board[lastMove.r][lastMove.c];
  if (!color) return null;

  for (const [dr, dc] of DIRECTIONS) {
    const points: GomokuPoint[] = [lastMove];

    // Forward
    let r = lastMove.r + dr;
    let c = lastMove.c + dc;
    while (r >= 0 && r < GOMOKU_SIZE && c >= 0 && c < GOMOKU_SIZE && board[r][c] === color) {
      points.push({ r, c });
      r += dr;
      c += dc;
    }

    // Backward
    r = lastMove.r - dr;
    c = lastMove.c - dc;
    while (r >= 0 && r < GOMOKU_SIZE && c >= 0 && c < GOMOKU_SIZE && board[r][c] === color) {
      points.push({ r, c });
      r -= dr;
      c -= dc;
    }

    if (points.length >= 5) {
      return {
        color,
        points,
      };
    }
  }

  return null;
}

export function formatGomokuCoord(p: GomokuPoint): string {
  const colLetter = String.fromCharCode(65 + p.c); // A-O
  const rowNumber = p.r + 1; // 1-15
  return `${colLetter}${rowNumber} (${p.r}, ${p.c})`;
}
