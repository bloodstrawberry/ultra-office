import { createEmptyCanvas } from './canvas-layer';

export function applyFilterWithMask(
  targetCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement | null,
  filterFn: (data: ImageData) => void
): void {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const width = targetCanvas.width;
  const height = targetCanvas.height;

  const originalImgData = ctx.getImageData(0, 0, width, height);

  // If no mask, apply directly
  if (!maskCanvas) {
    const copyData = ctx.getImageData(0, 0, width, height);
    filterFn(copyData);
    ctx.putImageData(copyData, 0, 0);
    return;
  }

  // With mask: create filtered data, then blend according to mask
  const filteredData = ctx.getImageData(0, 0, width, height);
  filterFn(filteredData);

  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) return;
  const maskData = maskCtx.getImageData(0, 0, width, height);

  const orig = originalImgData.data;
  const filt = filteredData.data;
  const mask = maskData.data;
  const len = orig.length;

  for (let i = 0; i < len; i += 4) {
    const maskAlpha = mask[i + 3] / 255;
    if (maskAlpha > 0) {
      orig[i] = orig[i] * (1 - maskAlpha) + filt[i] * maskAlpha;
      orig[i + 1] = orig[i + 1] * (1 - maskAlpha) + filt[i + 1] * maskAlpha;
      orig[i + 2] = orig[i + 2] * (1 - maskAlpha) + filt[i + 2] * maskAlpha;
      orig[i + 3] = orig[i + 3] * (1 - maskAlpha) + filt[i + 3] * maskAlpha;
    }
  }

  ctx.putImageData(originalImgData, 0, 0);
}

// 1. Brightness & Contrast (-100 to 100)
export function filterBrightnessContrast(
  imageData: ImageData,
  brightness: number,
  contrast: number
): void {
  const d = imageData.data;
  const b = brightness * 2.55;
  const c = (contrast + 100) / 100;
  const factor = c * c;

  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, Math.max(0, (d[i] - 128) * factor + 128 + b));
    d[i + 1] = Math.min(255, Math.max(0, (d[i + 1] - 128) * factor + 128 + b));
    d[i + 2] = Math.min(255, Math.max(0, (d[i + 2] - 128) * factor + 128 + b));
  }
}

// 2. Hue (-180 to 180), Saturation (-100 to 100), Lightness (-100 to 100)
export function filterHueSaturationLightness(
  imageData: ImageData,
  hue: number,
  saturation: number,
  lightness: number
): void {
  const d = imageData.data;
  const satFactor = (saturation + 100) / 100;
  const lightFactor = lightness / 100;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i] / 255;
    let g = d[i + 1] / 255;
    let b = d[i + 2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
      const delta = max - min;
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      switch (max) {
        case r:
          h = (g - b) / delta + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / delta + 2;
          break;
        default:
          h = (r - g) / delta + 4;
          break;
      }
      h /= 6;
    }

    // Adjust H, S, L
    h = (h + hue / 360 + 1) % 1;
    s = Math.min(1, Math.max(0, s * satFactor));
    if (lightFactor > 0) {
      l = l + (1 - l) * lightFactor;
    } else {
      l = l + l * lightFactor;
    }

    // Convert back to RGB
    if (s === 0) {
      r = l;
      g = l;
      b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        let tAdj = t;
        if (tAdj < 0) tAdj += 1;
        if (tAdj > 1) tAdj -= 1;
        if (tAdj < 1 / 6) return p + (q - p) * 6 * tAdj;
        if (tAdj < 1 / 2) return q;
        if (tAdj < 2 / 3) return p + (q - p) * (2 / 3 - tAdj) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    d[i] = Math.round(r * 255);
    d[i + 1] = Math.round(g * 255);
    d[i + 2] = Math.round(b * 255);
  }
}

// 3. Grayscale
export function filterGrayscale(imageData: ImageData): void {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    d[i] = gray;
    d[i + 1] = gray;
    d[i + 2] = gray;
  }
}

// 4. Invert
export function filterInvert(imageData: ImageData): void {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 255 - d[i];
    d[i + 1] = 255 - d[i + 1];
    d[i + 2] = 255 - d[i + 2];
  }
}

// 5. Sepia
export function filterSepia(imageData: ImageData): void {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    d[i] = Math.min(255, Math.round(r * 0.393 + g * 0.769 + b * 0.189));
    d[i + 1] = Math.min(255, Math.round(r * 0.349 + g * 0.686 + b * 0.168));
    d[i + 2] = Math.min(255, Math.round(r * 0.272 + g * 0.534 + b * 0.131));
  }
}

// 6. Threshold (0 - 255)
export function filterThreshold(imageData: ImageData, threshold = 128): void {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = gray >= threshold ? 255 : 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
  }
}

// 7. Posterize (2 - 32)
export function filterPosterize(imageData: ImageData, levels = 4): void {
  const d = imageData.data;
  const numAreas = 256 / levels;
  const numValues = 255 / (levels - 1);

  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.floor(Math.floor(d[i] / numAreas) * numValues);
    d[i + 1] = Math.floor(Math.floor(d[i + 1] / numAreas) * numValues);
    d[i + 2] = Math.floor(Math.floor(d[i + 2] / numAreas) * numValues);
  }
}

// 8. Box/Gaussian Blur
export function filterBlur(imageData: ImageData, radius = 3): void {
  const d = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const r = Math.max(1, Math.min(20, Math.floor(radius)));
  const copy = new Uint8ClampedArray(d);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let aSum = 0;
      let count = 0;

      for (let ky = -r; ky <= r; ky += 1) {
        const ny = y + ky;
        if (ny < 0 || ny >= h) continue;

        for (let kx = -r; kx <= r; kx += 1) {
          const nx = x + kx;
          if (nx < 0 || nx >= w) continue;

          const idx = (ny * w + nx) * 4;
          rSum += copy[idx];
          gSum += copy[idx + 1];
          bSum += copy[idx + 2];
          aSum += copy[idx + 3];
          count += 1;
        }
      }

      const outIdx = (y * w + x) * 4;
      d[outIdx] = Math.round(rSum / count);
      d[outIdx + 1] = Math.round(gSum / count);
      d[outIdx + 2] = Math.round(bSum / count);
      d[outIdx + 3] = Math.round(aSum / count);
    }
  }
}

// 9. Sharpen
export function filterSharpen(imageData: ImageData, strength = 1): void {
  const d = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const copy = new Uint8ClampedArray(d);

  // Kernel: [0, -1, 0], [-1, 4 + 1/strength, -1], [0, -1, 0]
  const kernel = [
    0,
    -1 * strength,
    0,
    -1 * strength,
    4 * strength + 1,
    -1 * strength,
    0,
    -1 * strength,
    0,
  ];

  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;

      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          const kVal = kernel[(ky + 1) * 3 + (kx + 1)];
          rSum += copy[idx] * kVal;
          gSum += copy[idx + 1] * kVal;
          bSum += copy[idx + 2] * kVal;
        }
      }

      const outIdx = (y * w + x) * 4;
      d[outIdx] = Math.min(255, Math.max(0, Math.round(rSum)));
      d[outIdx + 1] = Math.min(255, Math.max(0, Math.round(gSum)));
      d[outIdx + 2] = Math.min(255, Math.max(0, Math.round(bSum)));
    }
  }
}

// 10. Webtoon Line Art Extraction (Edge detection / Sobel)
export function filterLineArt(imageData: ImageData, sensitivity = 50): void {
  const d = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const copy = new Uint8ClampedArray(d);

  // Convert copy to grayscale first
  const grays = new Float32Array(w * h);
  for (let i = 0; i < copy.length; i += 4) {
    grays[i / 4] = 0.299 * copy[i] + 0.587 * copy[i + 1] + 0.114 * copy[i + 2];
  }

  const threshold = (100 - sensitivity) * 1.5;

  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      // Sobel horizontal
      const gx =
        -1 * grays[(y - 1) * w + (x - 1)] +
        1 * grays[(y - 1) * w + (x + 1)] +
        -2 * grays[y * w + (x - 1)] +
        2 * grays[y * w + (x + 1)] +
        -1 * grays[(y + 1) * w + (x - 1)] +
        1 * grays[(y + 1) * w + (x + 1)];

      // Sobel vertical
      const gy =
        -1 * grays[(y - 1) * w + (x - 1)] +
        -2 * grays[(y - 1) * w + x] +
        -1 * grays[(y - 1) * w + (x + 1)] +
        1 * grays[(y + 1) * w + (x - 1)] +
        2 * grays[(y + 1) * w + x] +
        1 * grays[(y + 1) * w + (x + 1)];

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      // Invert so edges are black on white canvas (classic webtoon sketch)
      const val = magnitude > threshold ? 0 : 255;

      const outIdx = (y * w + x) * 4;
      d[outIdx] = val;
      d[outIdx + 1] = val;
      d[outIdx + 2] = val;
    }
  }
}

// 11. Webtoon Halftone Screentone (망점 톤)
export function filterScreentone(imageData: ImageData, dotSize = 6, angleRad = Math.PI / 4): void {
  const d = imageData.data;
  const w = imageData.width;
  const h = imageData.height;

  const sinA = Math.sin(angleRad);
  const cosA = Math.cos(angleRad);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;
      const gray = (0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2]) / 255;

      // Rotate coordinates for dot grid
      const rx = x * cosA - y * sinA;
      const ry = x * sinA + y * cosA;

      const modX = (((rx % dotSize) + dotSize) % dotSize) - dotSize / 2;
      const modY = (((ry % dotSize) + dotSize) % dotSize) - dotSize / 2;
      const dist = Math.sqrt(modX * modX + modY * modY);

      // Max dot radius depends on darkness (darker = bigger dot)
      const maxRadius = (dotSize / 2) * Math.sqrt(1 - gray);
      const isDot = dist <= maxRadius;

      const val = isDot ? 0 : 255;
      d[idx] = val;
      d[idx + 1] = val;
      d[idx + 2] = val;
    }
  }
}

// 12. Pixelate / Mosaic
export function filterMosaic(imageData: ImageData, blockSize = 8): void {
  const d = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const size = Math.max(2, Math.floor(blockSize));

  for (let y = 0; y < h; y += size) {
    for (let x = 0; x < w; x += size) {
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let aSum = 0;
      let count = 0;

      for (let dy = 0; dy < size && y + dy < h; dy += 1) {
        for (let dx = 0; dx < size && x + dx < w; dx += 1) {
          const idx = ((y + dy) * w + (x + dx)) * 4;
          rSum += d[idx];
          gSum += d[idx + 1];
          bSum += d[idx + 2];
          aSum += d[idx + 3];
          count += 1;
        }
      }

      const avgR = Math.round(rSum / count);
      const avgG = Math.round(gSum / count);
      const avgB = Math.round(bSum / count);
      const avgA = Math.round(aSum / count);

      for (let dy = 0; dy < size && y + dy < h; dy += 1) {
        for (let dx = 0; dx < size && x + dx < w; dx += 1) {
          const idx = ((y + dy) * w + (x + dx)) * 4;
          d[idx] = avgR;
          d[idx + 1] = avgG;
          d[idx + 2] = avgB;
          d[idx + 3] = avgA;
        }
      }
    }
  }
}

// 13. Draw Webtoon Radial Focus Lines on a Canvas
export function drawWebtoonFocusLines(
  canvas: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  lineCount = 80,
  innerRadius = 100,
  color = '#000000',
  thickness = 2
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const maxDim = Math.hypot(width, height);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  for (let i = 0; i < lineCount; i += 1) {
    const angle = (i / lineCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.05;
    const currentInner = innerRadius + (Math.random() - 0.5) * 20;

    const startX = centerX + Math.cos(angle) * currentInner;
    const startY = centerY + Math.sin(angle) * currentInner;
    const endX = centerX + Math.cos(angle) * maxDim;
    const endY = centerY + Math.sin(angle) * maxDim;

    ctx.beginPath();
    // Tapered triangle for comic style
    const perpAngle = angle + Math.PI / 2;
    const halfW = (thickness + Math.random() * 2) * 1.5;

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX + Math.cos(perpAngle) * halfW, endY + Math.sin(perpAngle) * halfW);
    ctx.lineTo(endX - Math.cos(perpAngle) * halfW, endY - Math.sin(perpAngle) * halfW);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}
