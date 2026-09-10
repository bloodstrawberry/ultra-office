import type { PSM } from 'tesseract.js';
import type { SlidingSize } from './sliding-solver';

import { createWorker } from 'tesseract.js';

import { isSolvable } from './sliding-solver';
import { loadImageElement } from './nonogram-image-utils';
import { makeBoardSolvable } from './sliding-image-utils';

/**
 * Recognizes a sliding puzzle board (3x3 or 4x4) from an image using Tesseract.js
 */
export async function recognizeSlidingPuzzleFromImage(
  source: File | string,
  targetSize: SlidingSize,
  onProgress?: (progress: number) => void
): Promise<{ board: number[]; rawText: string; success: boolean }> {
  const img = await loadImageElement(source);

  const worker = await createWorker(['eng']);
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789',
    tessedit_pageseg_mode: '6' as unknown as PSM,
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    await worker.terminate();
    throw new Error('Canvas context failure');
  }

  ctx.drawImage(img, 0, 0);

  const totalCells = targetSize * targetSize;
  const cellW = img.width / targetSize;
  const cellH = img.height / targetSize;

  const board: number[] = new Array(totalCells).fill(0);
  const detectedTexts: string[] = [];

  for (let idx = 0; idx < totalCells; idx += 1) {
    const r = Math.floor(idx / targetSize);
    const c = idx % targetSize;

    // Sub-canvas for single cell with margin padding to focus on center digit
    const padX = cellW * 0.15;
    const padY = cellH * 0.15;
    const subW = cellW - padX * 2;
    const subH = cellH - padY * 2;

    const subCanvas = document.createElement('canvas');
    subCanvas.width = 64;
    subCanvas.height = 64;
    const subCtx = subCanvas.getContext('2d');

    if (subCtx) {
      subCtx.drawImage(img, c * cellW + padX, r * cellH + padY, subW, subH, 0, 0, 64, 64);
      const subDataUrl = subCanvas.toDataURL('image/png');

      const {
        data: { text },
      } = await worker.recognize(subDataUrl);
      const num = parseInt(text.trim(), 10);
      detectedTexts.push(text.trim());

      if (!Number.isNaN(num) && num >= 1 && num < totalCells) {
        board[idx] = num;
      } else {
        board[idx] = 0;
      }
    }

    if (onProgress) {
      onProgress(Math.round(((idx + 1) / totalCells) * 100));
    }
  }

  await worker.terminate();

  // Validate board uniqueness: If duplicated or missing, fall back or sanitize
  const counts = new Map<number, number>();
  for (const n of board) {
    counts.set(n, (counts.get(n) || 0) + 1);
  }

  // If OCR got invalid result, make sure all numbers 0 to totalCells - 1 exist
  const missing: number[] = [];
  for (let i = 0; i < totalCells; i += 1) {
    if (!counts.has(i)) missing.push(i);
  }

  if (missing.length > 0) {
    // Fill duplicates with missing
    const seen = new Set<number>();
    for (let i = 0; i < board.length; i += 1) {
      const val = board[i];
      if (val === 0 || seen.has(val)) {
        if (missing.length > 0) {
          board[i] = missing.pop()!;
        }
      } else {
        seen.add(val);
      }
    }
  }

  // Ensure solvable
  const finalBoard = isSolvable(board, targetSize) ? board : makeBoardSolvable(board, targetSize);

  return {
    board: finalBoard,
    rawText: detectedTexts.join(', '),
    success: true,
  };
}
