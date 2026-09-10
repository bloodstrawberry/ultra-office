import type { SudokuBoard } from './sudoku-solver';

import { createWorker } from 'tesseract.js';

export interface ParseSudokuOptions {
  allowPartial?: boolean;
}

/**
 * Parses raw text into a 9x9 SudokuBoard.
 * Supports:
 * 1. 2D array syntax with brackets: {8,4,0,3,...} or [[8,4,0,...],...]
 * 2. CSV format: comma-separated values (single line or 9 lines)
 * 3. Space / tab / newline separated numbers
 * 4. Continuous 81-digit string or line-by-line digit blocks (e.g. 840300009)
 * 5. Dots (.), dashes (-), underscores (_), or 'x'/'X' as 0
 * 6. Partial inputs (padded with 0 if allowPartial is true)
 */
/**
 * Helper to extract number sequence (0-9) from a text fragment.
 */
function extractNumbersFromText(str: string): number[] {
  const normalized = str.replace(/[{}[\]'"`]/g, ' ').replace(/[._\-xX]/g, ' 0 ');
  const tokens = normalized.split(/[\s,;|]+/).filter(Boolean);
  const nums: number[] = [];

  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      if (token.length > 1) {
        for (const char of token) {
          const digit = parseInt(char, 10);
          nums.push(digit >= 1 && digit <= 9 ? digit : 0);
        }
      } else {
        const digit = parseInt(token, 10);
        nums.push(digit >= 1 && digit <= 9 ? digit : 0);
      }
    }
  }

  return nums;
}

/**
 * Parses raw text into a 9x9 SudokuBoard.
 * Supports:
 * 1. Line-by-line inputs: each newline corresponds to a row; blank lines represent empty rows of 0s.
 * 2. 2D array syntax with brackets: {8,4,0,3,...} or [[8,4,0,...], [], [4,5,6]]
 * 3. CSV format: comma-separated values (single line or 9 lines)
 * 4. Space / tab / newline separated numbers
 * 5. Comments stripping: //, #, <<, --, /* ... * /
 * 6. Continuous 81-digit string or line-by-line digit blocks (e.g. 840300009)
 * 7. Dots (.), dashes (-), underscores (_), or 'x'/'X' as 0
 * 8. Partial inputs (padded with 0 if allowPartial is true)
 */
export function parseSudokuFromText(
  rawText: string,
  options?: ParseSudokuOptions
): SudokuBoard | null {
  if (!rawText || !rawText.trim()) return null;

  const allowPartial = options?.allowPartial ?? true;

  // 0. Pre-clean comments: // ..., # ..., << ..., -- ..., /* ... */
  const cleanedText = rawText
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.replace(/(\/\/|#|<<|--).*$/, '').replace(/\/\*.*?\*\//g, ''))
    .join('\n');

  // 1. Check for 2D bracket rows: [[1, 2, 3], [], [4, 5, 6]] or { {1,2,3}, {}, {4,5,6} }
  const bracketMatches = cleanedText.match(/[{[](?:[^{}[\]]*)[}\]]/g);
  if (bracketMatches && bracketMatches.length >= 2) {
    const board: SudokuBoard = [];
    for (let i = 0; i < Math.min(bracketMatches.length, 9); i += 1) {
      const rowNums = extractNumbersFromText(bracketMatches[i]);
      while (rowNums.length < 9) {
        rowNums.push(0);
      }
      board.push(rowNums.slice(0, 9));
    }
    while (board.length < 9) {
      board.push(new Array(9).fill(0));
    }
    const hasNumbers = board.some((row) => row.some((n) => n > 0));
    if (hasNumbers) return board;
  }

  // 2. Line-by-line parsing if text contains newlines (\n)
  if (cleanedText.includes('\n')) {
    const rawLines = cleanedText.split('\n');

    // Trim outer enclosing brackets like standalone `[` at start or `]` at end
    let start = 0;
    let end = rawLines.length;
    while (start < end && /^\s*[[{]\s*$/.test(rawLines[start])) {
      start += 1;
    }
    while (end > start && /^\s*[\]}],?\s*$/.test(rawLines[end - 1])) {
      end -= 1;
    }

    const effectiveLines = rawLines.slice(start, end);
    const hasAnyLineOver9 = effectiveLines.some((line) => extractNumbersFromText(line).length > 9);

    // If lines do not contain more than 9 numbers per line, treat each line as a row
    if (!hasAnyLineOver9 && effectiveLines.length > 0) {
      const board: SudokuBoard = [];
      for (let r = 0; r < Math.min(effectiveLines.length, 9); r += 1) {
        const line = effectiveLines[r].trim();
        if (!line) {
          // Empty line represents an entire empty row
          board.push(new Array(9).fill(0));
          continue;
        }

        const rowNums = extractNumbersFromText(line);
        while (rowNums.length < 9) {
          rowNums.push(0);
        }
        board.push(rowNums.slice(0, 9));
      }

      while (board.length < 9) {
        board.push(new Array(9).fill(0));
      }

      const hasNumbers = board.some((row) => row.some((n) => n > 0));
      if (hasNumbers) {
        return board;
      }
    }
  }

  // 3. Fallback to flat stream of numbers across entire text
  const flatNums = extractNumbersFromText(cleanedText);
  if (flatNums.length === 0) return null;

  // Complete board (>= 81 numbers)
  if (flatNums.length >= 81) {
    const board: SudokuBoard = [];
    for (let r = 0; r < 9; r += 1) {
      board.push(flatNums.slice(r * 9, (r + 1) * 9));
    }
    return board;
  }

  // Partial board: pad up to 81
  if (allowPartial && flatNums.length > 0) {
    const padded = [...flatNums];
    while (padded.length < 81) {
      padded.push(0);
    }
    const board: SudokuBoard = [];
    for (let r = 0; r < 9; r += 1) {
      board.push(padded.slice(r * 9, (r + 1) * 9));
    }
    return board;
  }

  return null;
}

export interface SudokuOcrParameters {
  darkThreshold?: number;
  cellMarginPercent?: number;
  minDarkPixels?: number;
  ocrMode?: 'auto' | 'grid' | 'direct';
  scale?: number;
}

export const DEFAULT_OCR_PARAMETERS: Required<SudokuOcrParameters> = {
  darkThreshold: 100,
  cellMarginPercent: 18,
  minDarkPixels: 20,
  ocrMode: 'auto',
  scale: 2.5,
};

/**
 * Loads an image from a File, Blob, or URL string into an HTMLImageElement.
 */
export function loadHtmlImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let objectUrlToRevoke: string | null = null;

    img.onload = () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      resolve(img);
    };

    img.onerror = () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      reject(new Error('이미지를 불러오는데 실패했습니다.'));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      objectUrlToRevoke = URL.createObjectURL(source);
      img.src = objectUrlToRevoke;
    }
  });
}

interface GridBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Detects the outer bounding box of a 9x9 Sudoku grid by scanning line & content pixel density.
 */
function detectSudokuGridBounds(
  width: number,
  height: number,
  data: Uint8ClampedArray,
  darkThreshold = 100
): GridBounds | null {
  const rowDensity = new Array<number>(height).fill(0);
  const colDensity = new Array<number>(width).fill(0);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const isDark = r < darkThreshold && g < darkThreshold && b < darkThreshold;
      const isRed = r > 160 && g < 90 && b < 90;
      const isColoredLine =
        Math.max(r, g, b) - Math.min(r, g, b) > 80 && (r < 200 || g < 200 || b < 200);

      if (isDark || isRed || isColoredLine) {
        rowDensity[y] += 1;
        colDensity[x] += 1;
      }
    }
  }

  const xThreshold = Math.max(5, Math.floor(height * 0.05));
  let minX = 0;
  while (minX < width && colDensity[minX] < xThreshold) minX += 1;
  let maxX = width - 1;
  while (maxX > minX && colDensity[maxX] < xThreshold) maxX -= 1;

  const yThreshold = Math.max(5, Math.floor(width * 0.05));
  let minY = 0;
  while (minY < height && rowDensity[minY] < yThreshold) minY += 1;
  let maxY = height - 1;
  while (maxY > minY && rowDensity[maxY] < yThreshold) maxY -= 1;

  const gw = maxX - minX + 1;
  const gh = maxY - minY + 1;

  if (gw < 50 || gh < 50) return null;
  return { minX, maxX, minY, maxY, width: gw, height: gh };
}

export interface CleanGridResult {
  canvas: HTMLCanvasElement;
  outW: number;
  outH: number;
  totalFilled: number;
}

/**
 * Extracts and cleans the 9x9 Sudoku cells, removing all grid lines and colored backgrounds.
 * Digits are scaled up and centered on a pure white canvas for maximum OCR accuracy.
 */
export function extractAndCleanSudokuGrid(
  img: HTMLImageElement,
  parameters?: SudokuOcrParameters
): CleanGridResult | null {
  if (typeof document === 'undefined') return null;

  const darkThreshold = parameters?.darkThreshold ?? 100;
  const cellMarginPercent = parameters?.cellMarginPercent ?? 18;
  const minDarkPixels = parameters?.minDarkPixels ?? 20;
  const scale = parameters?.scale ?? 2.5;
  const ocrMode = parameters?.ocrMode ?? 'auto';

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = img.naturalWidth || img.width;
  srcCanvas.height = img.naturalHeight || img.height;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return null;

  srcCtx.drawImage(img, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

  const bounds = detectSudokuGridBounds(
    srcCanvas.width,
    srcCanvas.height,
    srcData.data,
    darkThreshold
  );
  if (!bounds) return null;

  const { minX, maxX, minY, maxY } = bounds;
  const cellW = (maxX - minX) / 9;
  const cellH = (maxY - minY) / 9;

  const outW = Math.round((maxX - minX) * scale);
  const outH = Math.round((maxY - minY) * scale);

  const cleanCanvas = document.createElement('canvas');
  cleanCanvas.width = outW;
  cleanCanvas.height = outH;
  const cleanCtx = cleanCanvas.getContext('2d');
  if (!cleanCtx) return null;

  cleanCtx.fillStyle = '#ffffff';
  cleanCtx.fillRect(0, 0, outW, outH);

  const cleanImgData = cleanCtx.getImageData(0, 0, outW, outH);
  const cleanPixels = cleanImgData.data;

  const hMargin = cellMarginPercent / 100;
  const vMargin = (cellMarginPercent * 0.85) / 100;

  let totalFilled = 0;

  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      const srcX0 = Math.round(minX + c * cellW);
      const srcX1 = Math.round(minX + (c + 1) * cellW);
      const srcY0 = Math.round(minY + r * cellH);
      const srcY1 = Math.round(minY + (r + 1) * cellH);

      // Safe inner margins to strictly isolate digits from borders
      const innerX0 = Math.round(srcX0 + cellW * hMargin);
      const innerX1 = Math.round(srcX1 - cellW * hMargin);
      const innerY0 = Math.round(srcY0 + cellH * vMargin);
      const innerY1 = Math.round(srcY1 - cellH * vMargin);

      let darkCount = 0;
      for (let sy = innerY0; sy < innerY1; sy += 1) {
        for (let sx = innerX0; sx < innerX1; sx += 1) {
          const idx = (sy * srcCanvas.width + sx) * 4;
          if (
            srcData.data[idx] < darkThreshold &&
            srcData.data[idx + 1] < darkThreshold &&
            srcData.data[idx + 2] < darkThreshold
          ) {
            darkCount += 1;
          }
        }
      }

      if (darkCount >= minDarkPixels) {
        totalFilled += 1;

        for (let sy = innerY0; sy < innerY1; sy += 1) {
          for (let sx = innerX0; sx < innerX1; sx += 1) {
            const srcIdx = (sy * srcCanvas.width + sx) * 4;
            const isDark =
              srcData.data[srcIdx] < darkThreshold &&
              srcData.data[srcIdx + 1] < darkThreshold &&
              srcData.data[srcIdx + 2] < darkThreshold;

            if (isDark) {
              const dstXStart = Math.round((sx - minX) * scale);
              const dstYStart = Math.round((sy - minY) * scale);
              const pSize = Math.ceil(scale);

              for (let dy = 0; dy < pSize; dy += 1) {
                for (let dx = 0; dx < pSize; dx += 1) {
                  const dstX = dstXStart + dx;
                  const dstY = dstYStart + dy;
                  if (dstX >= 0 && dstX < outW && dstY >= 0 && dstY < outH) {
                    const dstIdx = (dstY * outW + dstX) * 4;
                    cleanPixels[dstIdx] = 0;
                    cleanPixels[dstIdx + 1] = 0;
                    cleanPixels[dstIdx + 2] = 0;
                    cleanPixels[dstIdx + 3] = 255;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  cleanCtx.putImageData(cleanImgData, 0, 0);

  // Return grid result if reasonable number of filled cells exist
  if (ocrMode === 'auto' && (totalFilled < 8 || totalFilled > 75)) {
    return null;
  }
  if (totalFilled === 0) {
    return null;
  }

  return { canvas: cleanCanvas, outW, outH, totalFilled };
}

/**
 * Runs Tesseract OCR on an image and returns the recognized text and parsed board.
 * Automatically performs 9x9 grid detection and border/background stripping for grid images,
 * and falls back to full-image text recognition for code snippets and text images.
 */
export async function recognizeSudokuFromImage(
  imageSource: File | Blob | string,
  onProgress?: (progress: number) => void,
  parameters?: SudokuOcrParameters
): Promise<{ board: SudokuBoard | null; rawText: string }> {
  const ocrMode = parameters?.ocrMode ?? 'auto';

  // 1. Attempt grid preprocessing (browser environment) unless explicitly set to 'direct'
  let cleanGrid: CleanGridResult | null = null;
  if (typeof window !== 'undefined' && ocrMode !== 'direct') {
    try {
      const htmlImg = await loadHtmlImage(imageSource);
      cleanGrid = extractAndCleanSudokuGrid(htmlImg, parameters);
    } catch (e) {
      console.warn('Grid preprocessing failed or skipped:', e);
    }
  }

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round((m.progress || 0) * 100));
      }
    },
  });

  // 2. If a clean 9x9 grid was detected and extracted
  if (cleanGrid) {
    try {
      await worker.setParameters({
        tessedit_char_whitelist: '123456789 ',
      });

      const ret = await worker.recognize(cleanGrid.canvas, {}, { text: true, blocks: true });

      const board: SudokuBoard = Array.from({ length: 9 }, () => new Array(9).fill(0));
      const cellTargetW = cleanGrid.outW / 9;
      const cellTargetH = cleanGrid.outH / 9;
      let placedDigits = 0;

      for (const block of ret.data.blocks || []) {
        for (const para of block.paragraphs || []) {
          for (const line of para.lines || []) {
            for (const word of line.words || []) {
              const text = word.text.trim();
              const digit = parseInt(text, 10);
              if (digit >= 1 && digit <= 9) {
                const cx = (word.bbox.x0 + word.bbox.x1) / 2;
                const cy = (word.bbox.y0 + word.bbox.y1) / 2;
                const col = Math.min(8, Math.max(0, Math.floor(cx / cellTargetW)));
                const row = Math.min(8, Math.max(0, Math.floor(cy / cellTargetH)));
                board[row][col] = digit;
                placedDigits += 1;
              }
            }
          }
        }
      }

      await worker.terminate();

      if (placedDigits >= (ocrMode === 'grid' ? 1 : 8)) {
        const rawText = board.map((row) => row.join(', ')).join('\n');
        return { board, rawText };
      }
    } catch (err) {
      console.warn('Cleaned grid OCR failed, falling back to direct OCR:', err);
    }
  }

  // 3. Fallback: Direct full-image OCR (for code snippets / array text images)
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789{},[] \n\r.-_xX',
  });

  const ret = await worker.recognize(imageSource);
  await worker.terminate();

  const rawText = ret.data.text || '';
  const board = parseSudokuFromText(rawText, { allowPartial: false });

  return { board, rawText };
}
