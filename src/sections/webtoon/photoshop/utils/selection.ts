import { createEmptyCanvas } from './canvas-layer';
import type { SelectionState } from '../types';

export function createEmptySelection(): SelectionState {
  return {
    hasSelection: false,
    maskCanvas: null,
    bounds: null,
  };
}

export function createRectSelection(
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number
): SelectionState {
  const normX = Math.max(0, Math.min(x, x + w));
  const normY = Math.max(0, Math.min(y, y + h));
  const normW = Math.min(width - normX, Math.abs(w));
  const normH = Math.min(height - normY, Math.abs(h));

  if (normW <= 1 || normH <= 1) {
    return createEmptySelection();
  }

  const mask = createEmptyCanvas(width, height);
  const ctx = mask.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(normX, normY, normW, normH);
  }

  return {
    hasSelection: true,
    maskCanvas: mask,
    bounds: { x: normX, y: normY, width: normW, height: normH },
  };
}

export function createEllipseSelection(
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number
): SelectionState {
  const normX = Math.min(x, x + w);
  const normY = Math.min(y, y + h);
  const normW = Math.abs(w);
  const normH = Math.abs(h);

  if (normW <= 1 || normH <= 1) {
    return createEmptySelection();
  }

  const mask = createEmptyCanvas(width, height);
  const ctx = mask.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(normX + normW / 2, normY + normH / 2, normW / 2, normH / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
  }

  return {
    hasSelection: true,
    maskCanvas: mask,
    bounds: { x: normX, y: normY, width: normW, height: normH },
  };
}

export function createLassoSelection(
  width: number,
  height: number,
  points: { x: number; y: number }[]
): SelectionState {
  if (points.length < 3) {
    return createEmptySelection();
  }

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (const pt of points) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  const mask = createEmptyCanvas(width, height);
  const ctx = mask.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  return {
    hasSelection: true,
    maskCanvas: mask,
    bounds: {
      x: Math.max(0, minX),
      y: Math.max(0, minY),
      width: Math.min(width, maxX - minX),
      height: Math.min(height, maxY - minY),
    },
  };
}

export function createMagicWandSelection(
  sourceCanvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  tolerance: number
): SelectionState {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  if (sx < 0 || sx >= width || sy < 0 || sy >= height) {
    return createEmptySelection();
  }

  const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) return createEmptySelection();

  const srcData = srcCtx.getImageData(0, 0, width, height);
  const pixels = srcData.data;

  const targetIdx = (sy * width + sx) * 4;
  const tr = pixels[targetIdx];
  const tg = pixels[targetIdx + 1];
  const tb = pixels[targetIdx + 2];
  const ta = pixels[targetIdx + 3];

  const mask = createEmptyCanvas(width, height);
  const maskCtx = mask.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) return createEmptySelection();

  const maskImg = maskCtx.createImageData(width, height);
  const maskPixels = maskImg.data;

  const visited = new Uint8Array(width * height);

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  // Faster integer color distance approximation
  const colorMatch = (idx: number) => {
    const dr = pixels[idx] - tr;
    const dg = pixels[idx + 1] - tg;
    const db = pixels[idx + 2] - tb;
    const da = pixels[idx + 3] - ta;
    return Math.sqrt(dr * dr + dg * dg + db * db + da * da) <= tolerance;
  };

  // Span-based flood fill
  const stack = [sx, sy];
  let spanAbove = false;
  let spanBelow = false;

  while (stack.length > 0) {
    const cy = stack.pop()!;
    let cx = stack.pop()!;

    let lx = cx;
    while (lx >= 0 && !visited[cy * width + lx] && colorMatch((cy * width + lx) * 4)) {
      lx--;
    }
    lx++;

    spanAbove = false;
    spanBelow = false;

    for (let x = lx; x < width; x++) {
      const idx = cy * width + x;
      if (visited[idx] || !colorMatch(idx * 4)) {
        break;
      }

      visited[idx] = 1;

      // Update bounds
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;

      // Draw mask pixel
      const mIdx = idx * 4;
      maskPixels[mIdx] = 255;
      maskPixels[mIdx + 1] = 255;
      maskPixels[mIdx + 2] = 255;
      maskPixels[mIdx + 3] = 255;

      // Check above
      if (cy > 0) {
        const topIdx = (cy - 1) * width + x;
        if (!spanAbove && !visited[topIdx] && colorMatch(topIdx * 4)) {
          stack.push(x, cy - 1);
          spanAbove = true;
        } else if (spanAbove && (visited[topIdx] || !colorMatch(topIdx * 4))) {
          spanAbove = false;
        }
      }

      // Check below
      if (cy < height - 1) {
        const botIdx = (cy + 1) * width + x;
        if (!spanBelow && !visited[botIdx] && colorMatch(botIdx * 4)) {
          stack.push(x, cy + 1);
          spanBelow = true;
        } else if (spanBelow && (visited[botIdx] || !colorMatch(botIdx * 4))) {
          spanBelow = false;
        }
      }
    }
  }

  maskCtx.putImageData(maskImg, 0, 0);

  return {
    hasSelection: true,
    maskCanvas: mask,
    bounds: {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX + 1),
      height: Math.max(1, maxY - minY + 1),
    },
  };
}

export function invertSelection(
  selection: SelectionState,
  width: number,
  height: number
): SelectionState {
  const invertedMask = createEmptyCanvas(width, height);
  const ctx = invertedMask.getContext('2d');
  if (!ctx) return createEmptySelection();

  // Draw full white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Subtract current selection
  if (selection.hasSelection && selection.maskCanvas) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(selection.maskCanvas, 0, 0);
  }

  return {
    hasSelection: true,
    maskCanvas: invertedMask,
    bounds: { x: 0, y: 0, width, height },
  };
}

export function selectAll(width: number, height: number): SelectionState {
  const mask = createEmptyCanvas(width, height);
  const ctx = mask.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  return {
    hasSelection: true,
    maskCanvas: mask,
    bounds: { x: 0, y: 0, width, height },
  };
}

let cachedEdgeCanvas: HTMLCanvasElement | null = null;
let lastMaskSource: HTMLCanvasElement | null = null;
let tempPatternCanvas: HTMLCanvasElement | null = null;
let cachedStripePattern: CanvasPattern | null = null;
let cachedStripeCanvas: HTMLCanvasElement | null = null;

export function drawMarchingAnts(
  targetCtx: CanvasRenderingContext2D,
  selection: SelectionState,
  offset: number
): void {
  if (!selection.hasSelection || !selection.maskCanvas) return;

  const mask = selection.maskCanvas;
  const width = mask.width;
  const height = mask.height;

  // 1. Create or resize Edge Canvas
  if (!cachedEdgeCanvas || cachedEdgeCanvas.width !== width || cachedEdgeCanvas.height !== height) {
    cachedEdgeCanvas = createEmptyCanvas(width, height);
    lastMaskSource = null;
  }

  // 2. Generate 1px Edge Mask if mask has changed
  if (lastMaskSource !== mask) {
    const eCtx = cachedEdgeCanvas.getContext('2d');
    if (eCtx) {
      eCtx.clearRect(0, 0, width, height);
      // Dilate: draw mask shifted in 4 directions
      eCtx.globalCompositeOperation = 'source-over';
      eCtx.drawImage(mask, 1, 0);
      eCtx.drawImage(mask, -1, 0);
      eCtx.drawImage(mask, 0, 1);
      eCtx.drawImage(mask, 0, -1);

      // Erase original center to leave only outer 1px edge
      eCtx.globalCompositeOperation = 'destination-out';
      eCtx.drawImage(mask, 0, 0);
    }
    lastMaskSource = mask;
  }

  // 3. Create Stripe Pattern (Checkerboard for ants)
  if (!cachedStripePattern || !cachedStripeCanvas) {
    cachedStripeCanvas = document.createElement('canvas');
    cachedStripeCanvas.width = 8;
    cachedStripeCanvas.height = 8;
    const pCtx = cachedStripeCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#ffffff';
      pCtx.fillRect(0, 0, 8, 8);
      pCtx.fillStyle = '#000000';
      pCtx.fillRect(0, 0, 4, 4);
      pCtx.fillRect(4, 4, 4, 4);
      cachedStripePattern = targetCtx.createPattern(cachedStripeCanvas, 'repeat');
    }
  }

  // 4. Create or resize Temp Pattern Canvas
  if (
    !tempPatternCanvas ||
    tempPatternCanvas.width !== width ||
    tempPatternCanvas.height !== height
  ) {
    tempPatternCanvas = createEmptyCanvas(width, height);
  }

  const tpCtx = tempPatternCanvas.getContext('2d');
  if (tpCtx && cachedStripePattern) {
    tpCtx.clearRect(0, 0, width, height);

    // Draw animated checkerboard pattern
    tpCtx.globalCompositeOperation = 'source-over';
    tpCtx.fillStyle = cachedStripePattern;
    tpCtx.save();
    tpCtx.translate(-offset, -offset); // Animate diagonally backwards
    tpCtx.fillRect(offset, offset, width + 8, height + 8);
    tpCtx.restore();

    // Mask the pattern with the 1px Edge Canvas
    tpCtx.globalCompositeOperation = 'destination-in';
    tpCtx.drawImage(cachedEdgeCanvas, 0, 0);

    // Draw the final ants to target context
    targetCtx.save();
    targetCtx.drawImage(tempPatternCanvas, 0, 0);
    targetCtx.restore();
  }
}
