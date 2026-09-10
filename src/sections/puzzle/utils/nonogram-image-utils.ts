/**
 * Nonogram image processing & text parsing utilities
 */

export interface NonogramImageProcessingOptions {
  width: number;
  height: number;
  threshold: number; // 0 ~ 255 (default: 135)
  invert: boolean; // if true, invert dark/light
  contrast: number; // -100 ~ 100 (default: 20)
}

export const DEFAULT_NONOGRAM_IMAGE_OPTIONS: NonogramImageProcessingOptions = {
  width: 10,
  height: 10,
  threshold: 135,
  invert: false,
  contrast: 20,
};

/**
 * Loads an image from a File or URL into an HTMLImageElement
 */
export function loadImageElement(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      resolve(img);
    };

    img.onerror = (err) => {
      reject(new Error(`이미지를 로드할 수 없습니다: ${err}`));
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('파일을 읽는 도중 오류가 발생했습니다.'));
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Processes an image source into a 2D binary matrix (0 or 1) of specified width x height
 */
export async function processImageToNonogramMatrix(
  source: File | string,
  options: NonogramImageProcessingOptions
): Promise<{ matrix: number[][]; previewDataUrl: string }> {
  const img = await loadImageElement(source);
  const { width, height, threshold, invert, contrast } = options;

  // Offscreen canvas for downsampling and pixelation
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas 2D context를 생성할 수 없습니다.');
  }

  // Draw image stretched or fitted to the exact grid size
  ctx.drawImage(img, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const { data } = imgData;

  // Contrast factor: [-100, 100] -> factor
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  const matrix: number[][] = Array.from({ length: height }, () => Array(width).fill(0));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];
      const a = data[idx + 3];

      // If cell is largely transparent, treat as empty (0)
      if (a < 50) {
        matrix[y][x] = invert ? 1 : 0;
        data[idx] = invert ? 0 : 255;
        data[idx + 1] = invert ? 0 : 255;
        data[idx + 2] = invert ? 0 : 255;
        data[idx + 3] = 255;
        continue;
      }

      // Apply contrast
      r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, factor * (b - 128) + 128));

      // Grayscale luminance (ITU-R BT.601 standard)
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // Dark pixels (< threshold) represent filled cells in a standard image
      // But if invert is true, bright pixels (> threshold) represent filled
      let isFilled = gray < threshold;
      if (invert) {
        isFilled = !isFilled;
      }

      matrix[y][x] = isFilled ? 1 : 0;

      // Write back binarized value for preview display
      const outVal = isFilled ? 30 : 245;
      data[idx] = outVal;
      data[idx + 1] = outVal;
      data[idx + 2] = outVal;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const previewDataUrl = canvas.toDataURL();

  return { matrix, previewDataUrl };
}

/**
 * Parses a 2D binary matrix from user-entered text (supports 0/1, O/X, #/., CSV, or 2D JS array)
 */
export function parseNonogramMatrixFromText(rawText: string): number[][] | null {
  const clean = rawText.trim();
  if (!clean) return null;

  // Try parsing JSON or JS 2D Array format: [[1, 0, 1], [0, 1, 0]]
  try {
    const sanitized = clean
      .replace(/'/g, '"')
      .replace(/([{])\s*/g, '[')
      .replace(/\s*([}])/g, ']');
    const parsed = JSON.parse(sanitized);
    if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
      const height = parsed.length;
      const width = parsed[0].length;
      if (width > 0 && height > 0) {
        const matrix: number[][] = [];
        for (let r = 0; r < height; r += 1) {
          const row: number[] = [];
          for (let c = 0; c < width; c += 1) {
            const v = parsed[r][c];
            row.push(v === 1 || v === '1' || v === '#' || v === 'O' || v === 'o' ? 1 : 0);
          }
          matrix.push(row);
        }
        return matrix;
      }
    }
  } catch {
    // Fall back to line-by-line parsing
  }

  // Line-by-line parsing
  const lines = clean
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return null;

  const rows: number[][] = [];
  let detectedWidth = 0;

  for (const line of lines) {
    // If line contains commas or spaces
    let tokens: string[] = [];
    if (line.includes(',')) {
      tokens = line
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    } else if (/\s+/.test(line)) {
      tokens = line.split(/\s+/).filter((t) => t.length > 0);
    } else {
      // Continuous string like "10110" or ".##.."
      tokens = line.split('');
    }

    const row: number[] = tokens.map((t) => {
      const upper = t.toUpperCase();
      return upper === '1' || upper === '#' || upper === 'O' || upper === 'X' || upper === '*'
        ? 1
        : 0;
    });

    if (row.length > 0) {
      if (detectedWidth === 0) {
        detectedWidth = row.length;
      }
      rows.push(row);
    }
  }

  if (rows.length === 0 || detectedWidth === 0) return null;

  // Normalize row lengths
  const finalMatrix = rows.map((r) => {
    if (r.length < detectedWidth) {
      return [...r, ...Array(detectedWidth - r.length).fill(0)];
    }
    return r.slice(0, detectedWidth);
  });

  return finalMatrix;
}
