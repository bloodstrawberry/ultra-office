/**
 * Sliding Puzzle Image & Board Utilities
 */

import { isSolvable } from './sliding-solver';

/**
 * Calculates CSS background properties to render a sliced tile from an image
 * Supports both getTileBackgroundStyle(val, size, imageUrl) and getTileBackgroundStyle(val, rows, cols, imageUrl)
 */
export function getTileBackgroundStyle(
  val: number,
  rowsOrSize: number,
  colsOrImageUrl: number | string,
  maybeImageUrl?: string
): {
  backgroundImage: string;
  backgroundPosition: string;
  backgroundSize: string;
  backgroundRepeat: string;
} {
  const rows = rowsOrSize;
  let cols = rowsOrSize;
  let imageUrl = '';

  if (typeof colsOrImageUrl === 'string') {
    imageUrl = colsOrImageUrl;
  } else {
    cols = colsOrImageUrl;
    imageUrl = maybeImageUrl || '';
  }

  if (val === 0 || !imageUrl) {
    return {
      backgroundImage: 'none',
      backgroundPosition: '0 0',
      backgroundSize: 'auto',
      backgroundRepeat: 'no-repeat',
    };
  }

  const targetIdx = val - 1;
  const targetR = Math.floor(targetIdx / cols);
  const targetC = targetIdx % cols;

  const posX = cols > 1 ? (targetC / (cols - 1)) * 100 : 0;
  const posY = rows > 1 ? (targetR / (rows - 1)) * 100 : 0;

  return {
    backgroundImage: `url("${imageUrl}")`,
    backgroundPosition: `${posX.toFixed(2)}% ${posY.toFixed(2)}%`,
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundRepeat: 'no-repeat',
  };
}

/**
 * Parses a sliding puzzle board array from raw text (e.g. "[1, 2, 3, 4, 5, 6, 7, 8, 0]" or "1 2 3 4 5 6 7 8 0")
 */
export function parseSlidingBoardFromText(
  rawText: string,
  rows: number,
  cols = rows
): { board: number[] | null; error?: string } {
  const clean = rawText.trim();
  if (!clean) return { board: null, error: '입력된 내용이 없습니다.' };

  // Extract all numbers
  const matches = clean.match(/\d+/g);
  if (!matches) {
    return { board: null, error: '숫자를 찾을 수 없습니다.' };
  }

  const nums = matches.map((m) => parseInt(m, 10));
  const expectedCount = rows * cols;

  if (nums.length !== expectedCount) {
    return {
      board: null,
      error: `${rows}x${cols} 퍼즐은 총 ${expectedCount}개의 숫자(0~${
        expectedCount - 1
      })가 필요합니다. (현재 ${nums.length}개)`,
    };
  }

  // Check unique numbers from 0 to expectedCount - 1
  const set = new Set(nums);
  for (let i = 0; i < expectedCount; i += 1) {
    if (!set.has(i)) {
      return {
        board: null,
        error: `숫자 [${i}]이(가) 누락되었습니다. 0부터 ${
          expectedCount - 1
        }까지 중복 없이 포함되어야 합니다.`,
      };
    }
  }

  return { board: nums };
}

/**
 * Swaps two non-zero tiles to flip the inversion parity and make an unsolvable board solvable
 */
export function makeBoardSolvable(board: number[], rows: number, cols = rows): number[] {
  if (isSolvable(board, rows, cols)) {
    return [...board];
  }

  const next = [...board];
  // Find first two non-zero tile indices
  const nonZeroIndices: number[] = [];
  for (let i = 0; i < next.length; i += 1) {
    if (next[i] !== 0) {
      nonZeroIndices.push(i);
      if (nonZeroIndices.length === 2) break;
    }
  }

  if (nonZeroIndices.length === 2) {
    const [idx1, idx2] = nonZeroIndices;
    const temp = next[idx1];
    next[idx1] = next[idx2];
    next[idx2] = temp;
  }

  return next;
}
