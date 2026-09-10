import { OEM, PSM, createWorker } from 'tesseract.js';

import { loadHtmlImage } from './sudoku-ocr';
import { parseClueText, validateClues } from './nonogram-clues';

function abortable<T>(job: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new Error('인식이 취소되었습니다.'));
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
    job.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

export interface NonogramLayout {
  left: number;
  top: number;
  right: number;
  bottom: number;
  rows: number;
  cols: number;
}

export const NONOGRAM_OCR_MODELS = [
  { id: 'fast', name: 'LSTM Fast · 숫자 제한', repo: 'tessdata_fast', oem: OEM.LSTM_ONLY },
  // Integerized tessdata_best weights: floating-point tessdata_best is unsupported by some WASM builds.
  { id: 'best', name: 'LSTM Best (정수화) · 숫자 제한', repo: 'tessdata', oem: OEM.LSTM_ONLY },
  { id: 'legacy', name: 'Legacy · 숫자 전용 모드', repo: 'tessdata', oem: OEM.TESSERACT_ONLY },
] as const;

export interface NonogramOcrResult {
  id: string;
  name: string;
  rows: string;
  cols: string;
  confidence: number;
  duration: number;
  errors: string[];
}

export async function nonogramCanvas(source: File): Promise<HTMLCanvasElement> {
  const img = await loadHtmlImage(source);
  const scale = Math.min(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Long straight lines locate the clue/grid divider, including faint small screenshots. */
export function detectNonogramLayout(canvas: HTMLCanvasElement): NonogramLayout | null {
  const { width: w, height: h } = canvas;
  const { data } = canvas.getContext('2d')!.getImageData(0, 0, w, h);
  const scan = (vertical: boolean) => {
    const lines: { at: number; start: number; end: number; length: number }[] = [];
    const across = vertical ? w : h;
    const along = vertical ? h : w;
    for (let a = 0; a < across; a += 1) {
      let start = 0;
      let bestStart = 0;
      let bestEnd = 0;
      for (let b = 0; b <= along; b += 1) {
        const i = (vertical ? b * w + a : a * w + b) * 4;
        if (b === along || (data[i] + data[i + 1] + data[i + 2]) / 3 > 225) {
          if (b - start > bestEnd - bestStart) {
            bestStart = start;
            bestEnd = b;
          }
          start = b + 1;
        }
      }
      const length = bestEnd - bestStart;
      if (length < along * 0.3) continue;
      const previous = lines[lines.length - 1];
      if (previous && a - previous.at <= 2) {
        if (length > previous.length)
          lines[lines.length - 1] = { at: a, start: bestStart, end: bestEnd, length };
      } else lines.push({ at: a, start: bestStart, end: bestEnd, length });
    }
    return lines;
  };
  const xx = scan(true);
  // Discard page borders/shadows beyond the vertical grid's extent.
  const yy = scan(false).filter((line) => xx.some((v) => line.at >= v.start && line.at < v.end));
  if (xx.length < 3 || yy.length < 3) return null;
  const longestX = Math.max(...xx.map((l) => l.length));
  const longestY = Math.max(...yy.map((l) => l.length));
  const left = xx.find((l) => l.length >= longestX * 0.95)!.at;
  const top = yy.find((l) => l.length >= longestY * 0.95)!.at;
  const right = xx[xx.length - 1].at;
  const bottom = yy[yy.length - 1].at;
  const cols = xx.filter((l) => l.at >= left).length - 1;
  const rows = yy.filter((l) => l.at >= top).length - 1;
  if (rows < 1 || cols < 1 || rows > 30 || cols > 30) return null;
  return {
    left: (left / w) * 100,
    top: (top / h) * 100,
    right: (right / w) * 100,
    bottom: (bottom / h) * 100,
    rows,
    cols,
  };
}

export async function recognizeNonogram(
  canvas: HTMLCanvasElement,
  layout: NonogramLayout,
  ids: string[],
  onProgress: (message: string, pct: number) => void,
  onResult: (result: NonogramOcrResult) => void,
  signal: AbortSignal
): Promise<void> {
  const { rows, cols } = layout;
  if (
    ![rows, cols].every((n) => Number.isInteger(n) && n >= 1 && n <= 30) ||
    ![layout.left, layout.top, layout.right, layout.bottom].every(
      (n) => Number.isFinite(n) && n >= 0 && n <= 100
    ) ||
    layout.left >= layout.right ||
    layout.top >= layout.bottom ||
    layout.left === 0 ||
    layout.top === 0
  ) {
    throw new Error(
      '격자 영역과 행·열 수를 확인하세요. 숫자 단서는 격자 왼쪽과 위쪽에 있어야 합니다.'
    );
  }
  const x = (layout.left * canvas.width) / 100;
  const y = (layout.top * canvas.height) / 100;
  const cw = ((layout.right - layout.left) * canvas.width) / 100 / cols;
  const ch = ((layout.bottom - layout.top) * canvas.height) / 100 / rows;
  if (cw < 3 || ch < 3)
    throw new Error('격자 칸이 너무 작습니다. 영역을 넓히거나 더 큰 이미지를 사용하세요.');
  // Each clue cell is recognized as a whole number, so 10 and 20 stay intact.
  const cells: { axis: 'rows' | 'cols'; line: number; canvas: HTMLCanvasElement }[] = [];
  const crop = (sx: number, sy: number, axis: 'rows' | 'cols', line: number) => {
    const cell = document.createElement('canvas');
    cell.width = 100;
    cell.height = 80;
    const ctx = cell.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 100, 80);
    ctx.drawImage(canvas, sx + cw * 0.12, sy + ch * 0.12, cw * 0.76, ch * 0.76, 18, 12, 64, 56);
    const pixels = ctx.getImageData(0, 0, 100, 80);
    let ink = 0;
    for (let i = 0; i < pixels.data.length; i += 4) {
      const value = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3 < 145 ? 0 : 255;
      if (value === 0) ink += 1;
      pixels.data[i] = value;
      pixels.data[i + 1] = value;
      pixels.data[i + 2] = value;
    }
    ctx.putImageData(pixels, 0, 0);
    if (ink >= 14) cells.push({ axis, line, canvas: cell });
  };
  for (let r = 0; r < rows; r += 1) {
    for (let k = Math.min(Math.ceil(cols / 2), Math.floor(x / cw)); k >= 1; k -= 1)
      crop(x - k * cw, y + r * ch, 'rows', r);
  }
  for (let c = 0; c < cols; c += 1) {
    for (let k = Math.min(Math.ceil(rows / 2), Math.floor(y / ch)); k >= 1; k -= 1)
      crop(x + c * cw, y - k * ch, 'cols', c);
  }
  if (!cells.length) throw new Error('숫자를 찾지 못했습니다. 격자 영역을 조정하세요.');
  const models = NONOGRAM_OCR_MODELS.filter((m) => ids.includes(m.id));
  for (const [modelIndex, model] of models.entries()) {
    if (signal.aborted) return;
    const started = performance.now();
    const output = {
      rows: Array.from({ length: rows }, () => [] as string[]),
      cols: Array.from({ length: cols }, () => [] as string[]),
    };
    let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
    const cancel = () => {
      void worker?.terminate();
    };
    let confidence = 0;
    let initializationTimer: ReturnType<typeof setTimeout> | undefined;
    let abandoned = false;
    try {
      onProgress(`${model.name} 모델 로딩`, (modelIndex / models.length) * 100);
      let failInitialization: (error: Error) => void = () => {};
      const initializationFailure = new Promise<never>((_, reject) => {
        failInitialization = reject;
        initializationTimer = setTimeout(
          () =>
            reject(
              new Error('모델 로딩 시간이 초과되었습니다. 네트워크를 확인하고 다시 시도하세요.')
            ),
          90000
        );
      });
      const initialization = createWorker(
        'eng',
        model.oem,
        {
          langPath: `https://raw.githubusercontent.com/tesseract-ocr/${model.repo}/4.1.0`,
          gzip: false,
          cachePath: `nonogram-${model.repo}-${model.id}-4.1.0`,
          legacyCore: model.id === 'legacy',
          legacyLang: model.id === 'legacy',
          errorHandler: (error) => {
            failInitialization(new Error(String(error)));
          },
        },
        { load_system_dawg: '0', load_freq_dawg: '0' }
      );
      // A worker that finishes loading after cancellation must also be released.
      void initialization.then(
        (loaded) => {
          if (signal.aborted || abandoned) void loaded.terminate();
        },
        () => {}
      );
      worker = await abortable(Promise.race([initialization, initializationFailure]), signal);
      clearTimeout(initializationTimer);
      if (signal.aborted) return;
      signal.addEventListener('abort', cancel, { once: true });
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: PSM.SINGLE_WORD,
        ...(model.id === 'legacy' ? { classify_bln_numeric_mode: '1' } : {}),
      });
      for (const [index, cell] of cells.entries()) {
        if (signal.aborted) return;
        const { data } = await abortable(worker.recognize(cell.canvas), signal);
        const text = data.text.trim();
        output[cell.axis][cell.line].push(/^\d{1,2}$/.test(text) ? text : '?');
        confidence += data.confidence;
        onProgress(
          `${model.name} · ${index + 1}/${cells.length}`,
          ((modelIndex + (index + 1) / cells.length) / models.length) * 100
        );
      }
      const rowText = output.rows.map((line) => (line.length ? line.join(' ') : '?')).join('\n');
      const colText = output.cols.map((line) => (line.length ? line.join(' ') : '?')).join('\n');
      onResult({
        id: model.id,
        name: model.name,
        rows: rowText,
        cols: colText,
        confidence: Math.round(confidence / cells.length),
        duration: Math.round(performance.now() - started),
        errors: validateClues(parseClueText(rowText), parseClueText(colText)),
      });
    } catch (error) {
      if (!signal.aborted)
        onResult({
          id: model.id,
          name: model.name,
          rows: '',
          cols: '',
          confidence: 0,
          duration: Math.round(performance.now() - started),
          errors: [error instanceof Error ? error.message : String(error)],
        });
    } finally {
      abandoned = true;
      clearTimeout(initializationTimer);
      signal.removeEventListener('abort', cancel);
      if (worker && !signal.aborted) await worker.terminate();
      else if (worker) {
        try {
          await worker.terminate();
        } catch {
          /* Already cancelled. */
        }
      }
    }
  }
}
