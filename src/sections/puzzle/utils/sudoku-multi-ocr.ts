import type { TesseractModule } from '@sudobility/sudojo_ocr';

import * as Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';
import { createWebAdapter } from '@sudobility/sudojo_ocr/web';
import { extractSudokuFromImage } from '@sudobility/sudojo_ocr';

import { loadHtmlImage, extractAndCleanSudokuGrid } from './sudoku-ocr';
import { solveSudoku, getConflicts, type SudokuBoard } from './sudoku-solver';

export interface SudokuMultiOcrResult {
  id: string;
  name: string;
  badge: string;
  color: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  description: string;
  board: SudokuBoard;
  rawText: string;
  digitCount: number;
  conflicts: Set<string>;
  isSolvable: boolean;
  confidence: number;
  executionTimeMs: number;
}

function countDigits(board: SudokuBoard): number {
  let count = 0;
  for (let r = 0; r < 9; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (board[r][c] > 0) count += 1;
    }
  }
  return count;
}

function boardToRawText(board: SudokuBoard): string {
  return board.map((row) => row.join(', ')).join('\n');
}

/**
 * Engine 1: Sudojo OCR Engine (@sudobility/sudojo_ocr)
 * Specialized for Sudoku puzzle layout, cell extraction, and digit-only voting.
 */
async function runSudojoEngine(
  imageSource: File | Blob | string,
  onProgress?: (pct: number) => void
): Promise<SudokuMultiOcrResult> {
  const startTime = performance.now();
  const board: SudokuBoard = Array.from({ length: 9 }, () => new Array(9).fill(0));

  try {
    const adapter = createWebAdapter();
    const htmlImg = await loadHtmlImage(imageSource);

    const ocrResult = await extractSudokuFromImage(
      adapter,
      htmlImg,
      Tesseract as unknown as TesseractModule,
      {
        cellMargin: 0.15,
        minConfidence: 1,
        preprocess: true,
        skipBoardDetection: false,
        recognizePencilmarks: false,
      },
      (p) => {
        if (onProgress) {
          onProgress(Math.round(p.progress || 0));
        }
      }
    );

    const puzzleStr = ocrResult.board.original || '';
    for (let i = 0; i < Math.min(81, puzzleStr.length); i += 1) {
      const r = Math.floor(i / 9);
      const c = i % 9;
      const num = parseInt(puzzleStr[i], 10);
      if (!Number.isNaN(num) && num >= 1 && num <= 9) {
        board[r][c] = num;
      }
    }

    const digitCount = countDigits(board);
    const conflicts = getConflicts(board);
    const { solved } =
      conflicts.size === 0 && digitCount >= 4 ? solveSudoku(board) : { solved: false };

    return {
      id: 'sudojo',
      name: 'Sudojo 스도쿠 특화 엔진',
      badge: '🎯 Sudoku 전용',
      color: 'primary',
      description: '격자선 자동 제거 및 개별 셀 다중 투표(Voting) 알고리즘 적용',
      board,
      rawText: boardToRawText(board),
      digitCount,
      conflicts,
      isSolvable: solved,
      confidence: Math.round(ocrResult.confidence || 85),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  } catch (err) {
    console.warn('Sudojo engine execution failed:', err);
    return {
      id: 'sudojo',
      name: 'Sudojo 스도쿠 특화 엔진',
      badge: '🎯 Sudoku 전용',
      color: 'primary',
      description: '격자선 자동 제거 및 개별 셀 다중 투표(Voting) 알고리즘 적용',
      board,
      rawText: boardToRawText(board),
      digitCount: 0,
      conflicts: new Set<string>(),
      isSolvable: false,
      confidence: 0,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }
}

/**
 * Engine 2: Tesseract High-Contrast Grid Engine (Our Custom Pipeline)
 * Fast full-canvas 9x9 grid detection with Otsu thresholding and character whitelist.
 */
async function runTesseractGridEngine(
  htmlImg: HTMLImageElement,
  onProgress?: (pct: number) => void
): Promise<SudokuMultiOcrResult> {
  const startTime = performance.now();
  const board: SudokuBoard = Array.from({ length: 9 }, () => new Array(9).fill(0));

  try {
    const cleanGrid = extractAndCleanSudokuGrid(htmlImg, {
      darkThreshold: 110,
      cellMarginPercent: 16,
      minDarkPixels: 20,
      scale: 2.5,
      ocrMode: 'grid',
    });

    if (!cleanGrid) {
      throw new Error('Grid detection failed');
    }

    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round((m.progress || 0) * 100));
        }
      },
    });

    await worker.setParameters({
      tessedit_char_whitelist: '123456789 ',
    });

    const ret = await worker.recognize(cleanGrid.canvas, {}, { text: true, blocks: true });
    await worker.terminate();

    const cellTargetW = cleanGrid.outW / 9;
    const cellTargetH = cleanGrid.outH / 9;

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
            }
          }
        }
      }
    }

    const digitCount = countDigits(board);
    const conflicts = getConflicts(board);
    const { solved } =
      conflicts.size === 0 && digitCount >= 4 ? solveSudoku(board) : { solved: false };

    return {
      id: 'tesseract_grid',
      name: 'Tesseract 고대비 그리드 엔진',
      badge: '🔍 정밀 고대비',
      color: 'info',
      description: '외곽선 검출 + Otsu 이진화 + 단일 패스 캔버스 OCR',
      board,
      rawText: boardToRawText(board),
      digitCount,
      conflicts,
      isSolvable: solved,
      confidence: Math.round(ret.data.confidence || 90),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  } catch (err) {
    console.warn('Tesseract grid engine execution failed:', err);
    return {
      id: 'tesseract_grid',
      name: 'Tesseract 고대비 그리드 엔진',
      badge: '🔍 정밀 고대비',
      color: 'info',
      description: '외곽선 검출 + Otsu 이진화 + 단일 패스 캔버스 OCR',
      board,
      rawText: boardToRawText(board),
      digitCount: 0,
      conflicts: new Set<string>(),
      isSolvable: false,
      confidence: 0,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }
}

/**
 * Engine 3: Adaptive High-Sensitivity Engine
 * Tuned for low contrast, faint fonts, or darker background scans.
 */
async function runTesseractAdaptiveEngine(
  htmlImg: HTMLImageElement,
  onProgress?: (pct: number) => void
): Promise<SudokuMultiOcrResult> {
  const startTime = performance.now();
  const board: SudokuBoard = Array.from({ length: 9 }, () => new Array(9).fill(0));

  try {
    const cleanGrid = extractAndCleanSudokuGrid(htmlImg, {
      darkThreshold: 170,
      cellMarginPercent: 10,
      minDarkPixels: 12,
      scale: 2.5,
      ocrMode: 'grid',
    });

    if (!cleanGrid) {
      throw new Error('Adaptive grid detection failed');
    }

    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round((m.progress || 0) * 100));
        }
      },
    });

    await worker.setParameters({
      tessedit_char_whitelist: '123456789 ',
    });

    const ret = await worker.recognize(cleanGrid.canvas, {}, { text: true, blocks: true });
    await worker.terminate();

    const cellTargetW = cleanGrid.outW / 9;
    const cellTargetH = cleanGrid.outH / 9;

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
            }
          }
        }
      }
    }

    const digitCount = countDigits(board);
    const conflicts = getConflicts(board);
    const { solved } =
      conflicts.size === 0 && digitCount >= 4 ? solveSudoku(board) : { solved: false };

    return {
      id: 'tesseract_adaptive',
      name: '적응형 고감도 엔진',
      badge: '⚡ 고감도 추출',
      color: 'secondary',
      description: '연한 획/그림자/모바일 촬영에 최적화된 높은 감도 설정',
      board,
      rawText: boardToRawText(board),
      digitCount,
      conflicts,
      isSolvable: solved,
      confidence: Math.round(ret.data.confidence || 85),
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  } catch (err) {
    console.warn('Adaptive engine execution failed:', err);
    return {
      id: 'tesseract_adaptive',
      name: '적응형 고감도 엔진',
      badge: '⚡ 고감도 추출',
      color: 'secondary',
      description: '연한 획/그림자/모바일 촬영에 최적화된 높은 감도 설정',
      board,
      rawText: boardToRawText(board),
      digitCount: 0,
      conflicts: new Set<string>(),
      isSolvable: false,
      confidence: 0,
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }
}

/**
 * Runs all recognition engines concurrently or sequentially,
 * providing real-time multi-engine comparison results.
 */
export async function runMultiEngineSudokuOcr(
  imageSource: File | Blob | string,
  onStepProgress?: (engineName: string, pct: number) => void
): Promise<SudokuMultiOcrResult[]> {
  const htmlImg = await loadHtmlImage(imageSource);
  const results: SudokuMultiOcrResult[] = [];

  // Step 1: Run Sudojo Specialized Engine
  onStepProgress?.('🎯 Sudojo 스도쿠 특화 엔진', 10);
  const sudojoRes = await runSudojoEngine(imageSource, (p) => {
    onStepProgress?.('🎯 Sudojo 스도쿠 특화 엔진', Math.round(p * 0.33));
  });
  results.push(sudojoRes);

  // Step 2: Run Tesseract High-Contrast Grid Engine
  onStepProgress?.('🔍 Tesseract 고대비 그리드 엔진', 35);
  const gridRes = await runTesseractGridEngine(htmlImg, (p) => {
    onStepProgress?.('🔍 Tesseract 고대비 그리드 엔진', 35 + Math.round(p * 0.33));
  });
  results.push(gridRes);

  // Step 3: Run Adaptive Engine
  onStepProgress?.('⚡ 적응형 고감도 엔진', 70);
  const adaptiveRes = await runTesseractAdaptiveEngine(htmlImg, (p) => {
    onStepProgress?.('⚡ 적응형 고감도 엔진', 70 + Math.round(p * 0.3));
  });
  results.push(adaptiveRes);

  onStepProgress?.('완료', 100);

  // Sort results: Solvable & conflict-free first, then by highest digit count
  results.sort((a, b) => {
    if (a.isSolvable !== b.isSolvable) {
      return a.isSolvable ? -1 : 1;
    }
    if (a.conflicts.size !== b.conflicts.size) {
      return a.conflicts.size - b.conflicts.size;
    }
    return b.digitCount - a.digitCount;
  });

  return results;
}
