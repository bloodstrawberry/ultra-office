// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

export type InpaintMode = 'hybrid' | 'smooth' | 'texture';

export type WatermarkPresetPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WatermarkRemoveOptions {
  mode: InpaintMode;
  radius?: number; // Inpainting patch/search radius (default: 8)
  feather?: number; // Boundary feathering blur (default: 3)
  iterations?: number; // Diffusion passes (default: 6)
}

export type ShapeType = 'rect' | 'circle' | 'triangle' | 'freehand';

export interface ShapePoint {
  x: number;
  y: number;
}

export interface MaskShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  points?: ShapePoint[];
  brushSize?: number;
  fillColor: string;
  feather: number;
  opacity: number;
}

export interface DetectedWatermark {
  box: BoundingBox;
  confidence: number;
  label: string;
  preset: WatermarkPresetPosition;
}

// ----------------------------------------------------------------------
// Preset Bounding Box Generator
// ----------------------------------------------------------------------

export function getPresetBox(
  width: number,
  height: number,
  preset: WatermarkPresetPosition
): BoundingBox {
  // Approximate standard watermark proportions (15~25% width, 6~10% height)
  const boxW = Math.max(60, Math.round(width * 0.22));
  const boxH = Math.max(30, Math.round(height * 0.08));
  const marginX = Math.round(width * 0.03);
  const marginY = Math.round(height * 0.03);

  switch (preset) {
    case 'bottom-right':
      return {
        x: Math.max(0, width - boxW - marginX),
        y: Math.max(0, height - boxH - marginY),
        width: boxW,
        height: boxH,
      };
    case 'bottom-left':
      return {
        x: marginX,
        y: Math.max(0, height - boxH - marginY),
        width: boxW,
        height: boxH,
      };
    case 'top-right':
      return {
        x: Math.max(0, width - boxW - marginX),
        y: marginY,
        width: boxW,
        height: boxH,
      };
    case 'top-left':
      return {
        x: marginX,
        y: marginY,
        width: boxW,
        height: boxH,
      };
    case 'center':
      return {
        x: Math.round((width - boxW * 1.5) / 2),
        y: Math.round((height - boxH * 1.5) / 2),
        width: Math.round(boxW * 1.5),
        height: Math.round(boxH * 1.5),
      };
    default:
      return { x: 0, y: 0, width: boxW, height: boxH };
  }
}

// ----------------------------------------------------------------------
// Smart Watermark Detection (Edge & High Frequency Energy Analysis)
// ----------------------------------------------------------------------

export function detectCandidateWatermarks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): DetectedWatermark[] {
  const candidates: DetectedWatermark[] = [];
  const presets: { preset: WatermarkPresetPosition; label: string }[] = [
    { preset: 'bottom-right', label: '우측 하단 워터마크' },
    { preset: 'bottom-left', label: '좌측 하단 워터마크' },
    { preset: 'top-right', label: '우측 상단 워터마크' },
    { preset: 'top-left', label: '좌측 상단 워터마크' },
  ];

  for (const { preset, label } of presets) {
    const box = getPresetBox(width, height, preset);
    try {
      const imgData = ctx.getImageData(box.x, box.y, box.width, box.height);
      const data = imgData.data;

      // Calculate edge variance and contrast in candidate region
      let sumL = 0;
      let sumL2 = 0;
      let edgeCount = 0;

      for (let y = 1; y < box.height - 1; y += 2) {
        for (let x = 1; x < box.width - 1; x += 2) {
          const idx = (y * box.width + x) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sumL += lum;
          sumL2 += lum * lum;

          // Simple gradient magnitude
          const rightIdx = (y * box.width + (x + 1)) * 4;
          const downIdx = ((y + 1) * box.width + x) * 4;
          const lumR =
            0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
          const lumD =
            0.299 * data[downIdx] + 0.587 * data[downIdx + 1] + 0.114 * data[downIdx + 2];

          const grad = Math.abs(lum - lumR) + Math.abs(lum - lumD);
          if (grad > 28) {
            edgeCount++;
          }
        }
      }

      const sampleCount = Math.floor(box.height / 2) * Math.floor(box.width / 2);
      const mean = sumL / (sampleCount || 1);
      const variance = sumL2 / (sampleCount || 1) - mean * mean;
      const edgeDensity = edgeCount / (sampleCount || 1);

      // Watermarks usually have moderate to high edge density and distinct contrast
      if (edgeDensity > 0.08 && variance > 120) {
        const confidence = Math.min(
          0.98,
          Math.round((edgeDensity * 1.5 + variance / 1000) * 100) / 100
        );
        candidates.push({ box, confidence, label, preset });
      }
    } catch {
      // Ignore if out of canvas bounds
    }
  }

  // Sort by confidence descending
  return candidates.sort((a, b) => b.confidence - a.confidence);
}

// ----------------------------------------------------------------------
// Core Inpainting Algorithm with ROI Optimization
// ----------------------------------------------------------------------

/**
 * Remove watermark using Hybrid ROI Inpainting (Patch Matching + Fast Diffusion).
 * Extremely fast: processes only the bounding box of the mask with margin, then composites back.
 */
export function inpaintWatermark(
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: WatermarkRemoveOptions = { mode: 'hybrid' }
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // 1. Create output canvas
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
  if (!outCtx) return sourceCanvas;

  // Copy original source
  outCtx.drawImage(sourceCanvas, 0, 0);

  // 2. Find bounding box of the mask to minimize computation (ROI)
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) return outputCanvas;

  const maskImgData = maskCtx.getImageData(0, 0, width, height);
  const mData = maskImgData.data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let hasMask = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // If mask pixel has alpha or red/any color > 20
      if (mData[idx + 3] > 20 || mData[idx] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        hasMask = true;
      }
    }
  }

  // If no mask painted, return original
  if (!hasMask || maxX < minX || maxY < minY) {
    return outputCanvas;
  }

  // Expand ROI with safety padding for surrounding texture analysis
  const padding = Math.max(24, Math.round(Math.max(maxX - minX, maxY - minY) * 0.35));
  const roiX = Math.max(0, minX - padding);
  const roiY = Math.max(0, minY - padding);
  const roiW = Math.min(width - roiX, maxX - minX + 1 + padding * 2);
  const roiH = Math.min(height - roiY, maxY - minY + 1 + padding * 2);

  // Extract ROI image data & mask data
  const roiImgData = outCtx.getImageData(roiX, roiY, roiW, roiH);
  const roiPixels = roiImgData.data;

  // Extract ROI mask
  const roiMaskData = maskCtx.getImageData(roiX, roiY, roiW, roiH);
  const roiMaskPixels = roiMaskData.data;

  // Create binary mask array (1 = masked, 0 = source pixel)
  const maskArray = new Uint8Array(roiW * roiH);
  for (let y = 0; y < roiH; y++) {
    for (let x = 0; x < roiW; x++) {
      const idx = (y * roiW + x) * 4;
      if (roiMaskPixels[idx + 3] > 30 || roiMaskPixels[idx] > 30) {
        maskArray[y * roiW + x] = 1;
      }
    }
  }

  // 3. Process Inpainting based on selected mode
  const mode = options.mode || 'hybrid';
  const iterations = options.iterations || (mode === 'smooth' ? 12 : 8);

  // Step A: Patch-based synthesis initialization if hybrid or texture mode
  if (mode === 'hybrid' || mode === 'texture') {
    applyPatchSynthesis(roiPixels, maskArray, roiW, roiH);
  }

  // Step B: Edge-aware directional diffusion & boundary harmonization
  applyEdgeAwareDiffusion(roiPixels, maskArray, roiW, roiH, iterations);

  // Step C: Boundary feathering & color smoothing
  const featherRadius = options.feather ?? 3;
  if (featherRadius > 0) {
    applyFeatherBlend(roiPixels, maskArray, roiW, roiH, featherRadius);
  }

  // 4. Put processed ROI back to output canvas
  outCtx.putImageData(roiImgData, roiX, roiY);

  return outputCanvas;
}

// ----------------------------------------------------------------------
// Helper: Patch Synthesis (Sample best-matching surrounding texture)
// ----------------------------------------------------------------------

function applyPatchSynthesis(
  pixels: Uint8ClampedArray,
  mask: Uint8Array,
  width: number,
  height: number
): void {
  const patchSize = 7;
  const halfPatch = Math.floor(patchSize / 2);
  const searchRadius = 32;

  // Find all border mask pixels
  const borderPixels: { x: number; y: number }[] = [];
  for (let y = halfPatch; y < height - halfPatch; y++) {
    for (let x = halfPatch; x < width - halfPatch; x++) {
      const idx = y * width + x;
      if (mask[idx] === 1) {
        // Check if any 4-neighbor is unmasked (border)
        if (
          mask[idx - 1] === 0 ||
          mask[idx + 1] === 0 ||
          mask[idx - width] === 0 ||
          mask[idx + width] === 0
        ) {
          borderPixels.push({ x, y });
        }
      }
    }
  }

  // For each border pixel, find closest valid source patch in search window
  for (const { x, y } of borderPixels) {
    let bestDist = Infinity;
    let bestSX = x;
    let bestSY = y;

    const minSearchX = Math.max(halfPatch, x - searchRadius);
    const maxSearchX = Math.min(width - halfPatch - 1, x + searchRadius);
    const minSearchY = Math.max(halfPatch, y - searchRadius);
    const maxSearchY = Math.min(height - halfPatch - 1, y + searchRadius);

    // Sample candidate source positions
    const step = 2;
    for (let sy = minSearchY; sy <= maxSearchY; sy += step) {
      for (let sx = minSearchX; sx <= maxSearchX; sx += step) {
        // Candidate must be entirely unmasked
        let allUnmasked = true;
        for (let dy = -halfPatch; dy <= halfPatch; dy += 2) {
          for (let dx = -halfPatch; dx <= halfPatch; dy += 2) {
            if (mask[(sy + dy) * width + (sx + dx)] === 1) {
              allUnmasked = false;
              break;
            }
          }
          if (!allUnmasked) break;
        }

        if (allUnmasked) {
          // Compare known pixels in patch around (x, y) with (sx, sy)
          let dist = 0;
          let validPairs = 0;

          for (let dy = -halfPatch; dy <= halfPatch; dy++) {
            for (let dx = -halfPatch; dx <= halfPatch; dx++) {
              const targetIdx = (y + dy) * width + (x + dx);
              if (mask[targetIdx] === 0) {
                const tP = targetIdx * 4;
                const sP = ((sy + dy) * width + (sx + dx)) * 4;

                const dr = pixels[tP] - pixels[sP];
                const dg = pixels[tP + 1] - pixels[sP + 1];
                const db = pixels[tP + 2] - pixels[sP + 2];
                dist += dr * dr + dg * dg + db * db;
                validPairs++;
              }
            }
          }

          if (validPairs > 0) {
            dist = dist / validPairs;
            // Add slight distance penalty to prefer closer texture
            const spatialDist = Math.hypot(sx - x, sy - y) * 2;
            const totalScore = dist + spatialDist;

            if (totalScore < bestDist) {
              bestDist = totalScore;
              bestSX = sx;
              bestSY = sy;
            }
          }
        }
      }
    }

    // Fill the masked pixels in target patch using best source patch
    if (bestDist < Infinity) {
      for (let dy = -halfPatch; dy <= halfPatch; dy++) {
        for (let dx = -halfPatch; dx <= halfPatch; dx++) {
          const tIdx = (y + dy) * width + (x + dx);
          if (mask[tIdx] === 1) {
            const tP = tIdx * 4;
            const sP = ((bestSY + dy) * width + (bestSX + dx)) * 4;
            pixels[tP] = pixels[sP];
            pixels[tP + 1] = pixels[sP + 1];
            pixels[tP + 2] = pixels[sP + 2];
          }
        }
      }
    }
  }
}

// ----------------------------------------------------------------------
// Helper: Edge-Aware Multi-Pass Diffusion
// ----------------------------------------------------------------------

function applyEdgeAwareDiffusion(
  pixels: Uint8ClampedArray,
  mask: Uint8Array,
  width: number,
  height: number,
  iterations: number
): void {
  // Temporary buffer for smooth relaxation
  const buffer = new Uint8ClampedArray(pixels);

  for (let it = 0; it < iterations; it++) {
    const isEven = it % 2 === 0;
    const startY = isEven ? 1 : height - 2;
    const endY = isEven ? height - 1 : 0;
    const stepY = isEven ? 1 : -1;

    for (let y = startY; y !== endY; y += stepY) {
      for (let x = 1; x < width - 1; x++) {
        const mIdx = y * width + x;
        if (mask[mIdx] === 1) {
          // Weighted sum of 8 surrounding neighbors
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let totalWeight = 0;

          const neighbors = [
            { dx: -1, dy: 0, w: 1.2 },
            { dx: 1, dy: 0, w: 1.2 },
            { dx: 0, dy: -1, w: 1.2 },
            { dx: 0, dy: 1, w: 1.2 },
            { dx: -1, dy: -1, w: 0.8 },
            { dx: 1, dy: -1, w: 0.8 },
            { dx: -1, dy: 1, w: 0.8 },
            { dx: 1, dy: 1, w: 0.8 },
            { dx: -2, dy: 0, w: 0.5 },
            { dx: 2, dy: 0, w: 0.5 },
            { dx: 0, dy: -2, w: 0.5 },
            { dx: 0, dy: 2, w: 0.5 },
          ];

          for (const n of neighbors) {
            const nx = x + n.dx;
            const ny = y + n.dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              const pIdx = nIdx * 4;
              // Higher weight for original pixels outside the mask
              const weight = mask[nIdx] === 0 ? n.w * 2.5 : n.w;

              sumR += buffer[pIdx] * weight;
              sumG += buffer[pIdx + 1] * weight;
              sumB += buffer[pIdx + 2] * weight;
              totalWeight += weight;
            }
          }

          if (totalWeight > 0) {
            const curP = mIdx * 4;
            pixels[curP] = Math.round(sumR / totalWeight);
            pixels[curP + 1] = Math.round(sumG / totalWeight);
            pixels[curP + 2] = Math.round(sumB / totalWeight);
          }
        }
      }
    }

    // Copy updated pixels to buffer for next iteration
    buffer.set(pixels);
  }
}

// ----------------------------------------------------------------------
// Helper: Boundary Feathering (Seamless Blend with Original Image)
// ----------------------------------------------------------------------

function applyFeatherBlend(
  pixels: Uint8ClampedArray,
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number
): void {
  // Compute distance from mask boundary
  const dist = new Float32Array(width * height);
  dist.fill(Infinity);

  // Initialize boundary
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (mask[idx] === 1) {
        if (
          mask[idx - 1] === 0 ||
          mask[idx + 1] === 0 ||
          mask[idx - width] === 0 ||
          mask[idx + width] === 0
        ) {
          dist[idx] = 1;
        }
      }
    }
  }

  // 2-pass Manhattan distance transform for speed
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (mask[idx] === 1 && dist[idx] > 1) {
        dist[idx] = Math.min(dist[idx], dist[idx - 1] + 1, dist[idx - width] + 1);
      }
    }
  }

  for (let y = height - 2; y >= 1; y--) {
    for (let x = width - 2; x >= 1; x--) {
      const idx = y * width + x;
      if (mask[idx] === 1) {
        dist[idx] = Math.min(dist[idx], dist[idx + 1] + 1, dist[idx + width] + 1);
      }
    }
  }

  // Apply subtle bilateral feathering on pixels with distance <= radius
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const d = dist[idx];
      if (mask[idx] === 1 && d <= radius) {
        // Soft interpolation weight (cosine curve for silky transition)
        const factor = (1 - Math.cos((d / (radius + 1)) * Math.PI)) * 0.5;
        const pIdx = idx * 4;

        // Smooth with immediate neighbors
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let count = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nP = ((y + dy) * width + (x + dx)) * 4;
            sumR += pixels[nP];
            sumG += pixels[nP + 1];
            sumB += pixels[nP + 2];
            count++;
          }
        }

        const avgR = sumR / count;
        const avgG = sumG / count;
        const avgB = sumB / count;

        pixels[pIdx] = Math.round(pixels[pIdx] * factor + avgR * (1 - factor));
        pixels[pIdx + 1] = Math.round(pixels[pIdx + 1] * factor + avgG * (1 - factor));
        pixels[pIdx + 2] = Math.round(pixels[pIdx + 2] * factor + avgB * (1 - factor));
      }
    }
  }
}

// ----------------------------------------------------------------------
// Color & Shape Utilities for Shape-Mask Concealing
// ----------------------------------------------------------------------

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Samples the outer perimeter ring around a bounding box on the canvas
 * and returns the median/average RGB background color.
 */
export function sampleSurroundingColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth?: number,
  canvasHeight?: number,
  ringMargin: number = 8
): string {
  const cW = canvasWidth ?? ctx.canvas.width;
  const cH = canvasHeight ?? ctx.canvas.height;

  // Normalized coordinates
  const left = Math.max(0, Math.min(x, x + width));
  const top = Math.max(0, Math.min(y, y + height));
  const w = Math.abs(width);
  const h = Math.abs(height);
  const right = Math.min(cW - 1, left + w);
  const bottom = Math.min(cH - 1, top + h);

  // Outer ring coordinates
  const outerLeft = Math.max(0, left - ringMargin);
  const outerTop = Math.max(0, top - ringMargin);
  const outerRight = Math.min(cW - 1, right + ringMargin);
  const outerBottom = Math.min(cH - 1, bottom + ringMargin);

  const sampledPixels: [number, number, number][] = [];

  try {
    // Read the expanded region
    const regW = outerRight - outerLeft + 1;
    const regH = outerBottom - outerTop + 1;
    if (regW <= 0 || regH <= 0) return '#ffffff';

    const imgData = ctx.getImageData(outerLeft, outerTop, regW, regH);
    const data = imgData.data;

    const innerRelLeft = left - outerLeft;
    const innerRelRight = right - outerLeft;
    const innerRelTop = top - outerTop;
    const innerRelBottom = bottom - outerTop;

    // Sample along top and bottom outer stripes
    for (let rY = 0; rY < regH; rY += 2) {
      const isYOutside = rY < innerRelTop || rY > innerRelBottom;
      for (let rX = 0; rX < regW; rX += 2) {
        const isXOutside = rX < innerRelLeft || rX > innerRelRight;
        if (isYOutside || isXOutside) {
          const idx = (rY * regW + rX) * 4;
          sampledPixels.push([data[idx], data[idx + 1], data[idx + 2]]);
        }
      }
    }
  } catch {
    return '#ffffff';
  }

  if (sampledPixels.length === 0) return '#ffffff';

  // Compute average of the outer pixels
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  for (const [r, g, b] of sampledPixels) {
    totalR += r;
    totalG += g;
    totalB += b;
  }

  const count = sampledPixels.length;
  return rgbToHex(totalR / count, totalG / count, totalB / count);
}

/**
 * Extracts dominant background colors from sample corners and borders of the image.
 */
export function extractDominantColors(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): string[] {
  const points = [
    { x: Math.min(width - 1, 20), y: Math.min(height - 1, 20) }, // Top Left
    { x: Math.max(0, width - 20), y: Math.min(height - 1, 20) }, // Top Right
    { x: Math.max(0, width - 20), y: Math.max(0, height - 20) }, // Bottom Right
    { x: Math.min(width - 1, 20), y: Math.max(0, height - 20) }, // Bottom Left
    { x: Math.round(width / 2), y: Math.min(height - 1, 20) }, // Top Center
    { x: Math.round(width / 2), y: Math.max(0, height - 20) }, // Bottom Center
  ];

  const colors = new Set<string>();

  try {
    for (const pt of points) {
      const p = ctx.getImageData(pt.x, pt.y, 1, 1).data;
      colors.add(rgbToHex(p[0], p[1], p[2]));
    }
  } catch {
    // Return standard neutral palette if error
    return ['#ffffff', '#f5f5f5', '#e0e0e0', '#333333', '#000000', '#2196f3'];
  }

  // Ensure we have at least standard fallback colors
  if (colors.size < 4) {
    colors.add('#ffffff');
    colors.add('#000000');
    colors.add('#f0f0f0');
  }

  return Array.from(colors);
}

/**
 * Renders a single MaskShape onto a canvas 2D context.
 */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: MaskShape,
  isSelected: boolean = false
): void {
  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(1, shape.opacity));

  if (shape.feather > 0) {
    ctx.filter = `blur(${shape.feather}px)`;
  } else {
    ctx.filter = 'none';
  }

  if (shape.fillColor === 'transparent') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = shape.fillColor;
    ctx.strokeStyle = shape.fillColor;
  }

  const minX = Math.min(shape.x, shape.x + shape.width);
  const minY = Math.min(shape.y, shape.y + shape.height);
  const w = Math.abs(shape.width);
  const h = Math.abs(shape.height);

  if (shape.type === 'rect') {
    ctx.fillRect(minX, minY, w, h);
  } else if (shape.type === 'circle') {
    ctx.beginPath();
    ctx.ellipse(
      minX + w / 2,
      minY + h / 2,
      Math.max(1, w / 2),
      Math.max(1, h / 2),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else if (shape.type === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(minX + w / 2, minY);
    ctx.lineTo(minX + w, minY + h);
    ctx.lineTo(minX, minY + h);
    ctx.closePath();
    ctx.fill();
  } else if (shape.type === 'freehand' && shape.points && shape.points.length > 0) {
    ctx.lineWidth = shape.brushSize || 24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const pts = shape.points;
    ctx.moveTo(pts[0].x, pts[0].y);
    if (pts.length === 1) {
      ctx.lineTo(pts[0].x + 0.1, pts[0].y + 0.1);
    } else {
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
    }
    ctx.stroke();
  }

  ctx.restore();

  // Selection outline if selected
  if (isSelected) {
    ctx.save();
    ctx.strokeStyle = '#0066FF';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    let selX = minX;
    let selY = minY;
    let selW = w;
    let selH = h;

    if (shape.type === 'freehand' && shape.points && shape.points.length > 0) {
      let fMinX = Infinity;
      let fMinY = Infinity;
      let fMaxX = -Infinity;
      let fMaxY = -Infinity;
      const pad = (shape.brushSize || 24) / 2;
      for (const p of shape.points) {
        if (p.x < fMinX) fMinX = p.x;
        if (p.y < fMinY) fMinY = p.y;
        if (p.x > fMaxX) fMaxX = p.x;
        if (p.y > fMaxY) fMaxY = p.y;
      }
      selX = fMinX - pad;
      selY = fMinY - pad;
      selW = fMaxX - fMinX + pad * 2;
      selH = fMaxY - fMinY + pad * 2;
    }

    ctx.strokeRect(selX - 2, selY - 2, selW + 4, selH + 4);

    // 8 Resize handles (4 corners + 4 edge centers)
    const handleSize = 8;
    const x1 = selX - 2;
    const y1 = selY - 2;
    const x2 = selX + selW + 2;
    const y2 = selY + selH + 2;
    const xm = (x1 + x2) / 2;
    const ym = (y1 + y2) / 2;

    const handles = [
      { x: x1, y: y1 }, // nw
      { x: xm, y: y1 }, // n
      { x: x2, y: y1 }, // ne
      { x: x2, y: ym }, // e
      { x: x2, y: y2 }, // se
      { x: xm, y: y2 }, // s
      { x: x1, y: y2 }, // sw
      { x: x1, y: ym }, // w
    ];
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0066FF';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    for (const c of handles) {
      ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
    }

    ctx.restore();
  }
}

/**
 * Checks if a point (px, py) is inside a shape.
 */
export function isPointInShape(shape: MaskShape, px: number, py: number): boolean {
  const minX = Math.min(shape.x, shape.x + shape.width);
  const minY = Math.min(shape.y, shape.y + shape.height);
  const w = Math.abs(shape.width);
  const h = Math.abs(shape.height);

  if (shape.type === 'rect') {
    return px >= minX && px <= minX + w && py >= minY && py <= minY + h;
  }

  if (shape.type === 'circle') {
    const rx = Math.max(1, w / 2);
    const ry = Math.max(1, h / 2);
    const cx = minX + rx;
    const cy = minY + ry;
    const dx = px - cx;
    const dy = py - cy;
    return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
  }

  if (shape.type === 'triangle') {
    const x1 = minX + w / 2;
    const y1 = minY;
    const x2 = minX + w;
    const y2 = minY + h;
    const x3 = minX;
    const y3 = minY + h;

    const sign = (p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number) =>
      (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);

    const d1 = sign(px, py, x1, y1, x2, y2);
    const d2 = sign(px, py, x2, y2, x3, y3);
    const d3 = sign(px, py, x3, y3, x1, y1);

    const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNeg && hasPos);
  }

  if (shape.type === 'freehand' && shape.points && shape.points.length > 0) {
    const threshold = (shape.brushSize || 24) / 2 + 8;
    for (const p of shape.points) {
      const distSq = (px - p.x) * (px - p.x) + (py - p.y) * (py - p.y);
      if (distSq <= threshold * threshold) return true;
    }
    return false;
  }

  return false;
}

/**
 * Moves a shape by delta dx, dy.
 */
export function moveShape(shape: MaskShape, dx: number, dy: number): MaskShape {
  const moved: MaskShape = {
    ...shape,
    x: shape.x + dx,
    y: shape.y + dy,
  };
  if (shape.points && shape.points.length > 0) {
    moved.points = shape.points.map((p) => ({
      x: p.x + dx,
      y: p.y + dy,
    }));
  }
  return moved;
}

/**
 * Draws all shapes onto a designated canvas context.
 */
export function drawAllShapes(
  ctx: CanvasRenderingContext2D,
  shapes: MaskShape[],
  selectedId?: string | null
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const shape of shapes) {
    drawShape(ctx, shape, shape.id === selectedId);
  }
}

export type ResizeHandleType = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w';

/**
 * Returns the normalized bounding box for any shape type (including freehand).
 */
export function getShapeBoundingBox(shape: MaskShape): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const minX = Math.min(shape.x, shape.x + shape.width);
  const minY = Math.min(shape.y, shape.y + shape.height);
  const w = Math.max(1, Math.abs(shape.width));
  const h = Math.max(1, Math.abs(shape.height));

  if (shape.type === 'freehand' && shape.points && shape.points.length > 0) {
    let fMinX = Infinity;
    let fMinY = Infinity;
    let fMaxX = -Infinity;
    let fMaxY = -Infinity;
    const pad = (shape.brushSize || 24) / 2;
    for (const p of shape.points) {
      if (p.x < fMinX) fMinX = p.x;
      if (p.y < fMinY) fMinY = p.y;
      if (p.x > fMaxX) fMaxX = p.x;
      if (p.y > fMaxY) fMaxY = p.y;
    }
    return {
      x: fMinX - pad,
      y: fMinY - pad,
      width: Math.max(1, fMaxX - fMinX + pad * 2),
      height: Math.max(1, fMaxY - fMinY + pad * 2),
    };
  }

  return { x: minX, y: minY, width: w, height: h };
}

/**
 * Detects if a pointer point is hitting one of the 8 resize handles of a selected shape.
 */
export function getShapeResizeHandle(
  shape: MaskShape,
  px: number,
  py: number,
  hitRadius: number = 9
): ResizeHandleType | null {
  const box = getShapeBoundingBox(shape);
  const x1 = box.x - 2;
  const y1 = box.y - 2;
  const x2 = box.x + box.width + 2;
  const y2 = box.y + box.height + 2;
  const xm = (x1 + x2) / 2;
  const ym = (y1 + y2) / 2;

  const handles: { type: ResizeHandleType; x: number; y: number }[] = [
    { type: 'nw', x: x1, y: y1 },
    { type: 'n', x: xm, y: y1 },
    { type: 'ne', x: x2, y: y1 },
    { type: 'e', x: x2, y: ym },
    { type: 'se', x: x2, y: y2 },
    { type: 's', x: xm, y: y2 },
    { type: 'sw', x: x1, y: y2 },
    { type: 'w', x: x1, y: ym },
  ];

  for (const h of handles) {
    const distSq = (px - h.x) * (px - h.x) + (py - h.y) * (py - h.y);
    if (distSq <= hitRadius * hitRadius) {
      return h.type;
    }
  }

  return null;
}

/**
 * Resizes a shape based on which handle is being dragged by delta dx, dy.
 */
export function resizeShape(
  initShape: MaskShape,
  handle: ResizeHandleType,
  dx: number,
  dy: number
): MaskShape {
  const origBox = getShapeBoundingBox(initShape);
  let newX = origBox.x;
  let newY = origBox.y;
  let newW = origBox.width;
  let newH = origBox.height;

  if (handle.includes('e')) {
    newW = Math.max(8, origBox.width + dx);
  }
  if (handle.includes('w')) {
    const desiredW = Math.max(8, origBox.width - dx);
    newX = origBox.x + (origBox.width - desiredW);
    newW = desiredW;
  }
  if (handle.includes('s')) {
    newH = Math.max(8, origBox.height + dy);
  }
  if (handle.includes('n')) {
    const desiredH = Math.max(8, origBox.height - dy);
    newY = origBox.y + (origBox.height - desiredH);
    newH = desiredH;
  }

  if (initShape.type === 'freehand' && initShape.points && initShape.points.length > 0) {
    const scaleX = newW / Math.max(1, origBox.width);
    const scaleY = newH / Math.max(1, origBox.height);
    const scaledPoints = initShape.points.map((p) => ({
      x: Math.round(newX + (p.x - origBox.x) * scaleX),
      y: Math.round(newY + (p.y - origBox.y) * scaleY),
    }));

    return {
      ...initShape,
      x: newX,
      y: newY,
      width: newW,
      height: newH,
      points: scaledPoints,
    };
  }

  return {
    ...initShape,
    x: newX,
    y: newY,
    width: newW,
    height: newH,
  };
}

// ----------------------------------------------------------------------
// Surrounding Background Color Sampling & Filling (Non-AI Fast Mode)
// ----------------------------------------------------------------------

export interface FillColorOptions {
  customColor?: string; // Optional custom hex color e.g. '#ffffff'
  feather?: number; // Boundary feather radius (0~20)
  opacity?: number; // 0~1 (default 1)
}

/**
 * Samples pixels directly adjacent to the outside boundary of the masked area.
 * Returns the average RGB in hex format '#rrggbb'.
 */
export function sampleMaskSurroundingColor(
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement
): string {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  if (width === 0 || height === 0) return '#ffffff';

  const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx || !maskCtx) return '#ffffff';

  const srcData = srcCtx.getImageData(0, 0, width, height).data;
  const maskData = maskCtx.getImageData(0, 0, width, height).data;

  // 1. Identify mask bounding box
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      if (maskData[idx + 3] > 20 || maskData[idx] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return '#ffffff';
  }

  // 2. Expand search box around mask to find border outside pixels (3px to 12px outside mask)
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  const sampleMargin = 12;
  const startX = Math.max(0, minX - sampleMargin);
  const endX = Math.min(width - 1, maxX + sampleMargin);
  const startY = Math.max(0, minY - sampleMargin);
  const endY = Math.min(height - 1, maxY + sampleMargin);

  for (let y = startY; y <= endY; y += 2) {
    for (let x = startX; x <= endX; x += 2) {
      const idx = (y * width + x) * 4;
      // Must be outside the mask
      const isOutside = maskData[idx + 3] <= 15 && maskData[idx] <= 15;
      if (!isOutside) continue;

      // Check if near the mask boundary (within 6 pixels of any masked pixel)
      let nearMask = false;
      const step = 3;
      for (let dy = -6; dy <= 6; dy += step) {
        for (let dx = -6; dx <= 6; dx += step) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = (ny * width + nx) * 4;
            if (maskData[nIdx + 3] > 20 || maskData[nIdx] > 20) {
              nearMask = true;
              break;
            }
          }
        }
        if (nearMask) break;
      }

      if (nearMask) {
        sumR += srcData[idx];
        sumG += srcData[idx + 1];
        sumB += srcData[idx + 2];
        count++;
        if (count > 2500) break;
      }
    }
    if (count > 2500) break;
  }

  if (count === 0) return '#ffffff';

  const r = Math.round(sumR / count);
  const g = Math.round(sumG / count);
  const b = Math.round(sumB / count);

  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Fills the masked region with the surrounding background color (or custom color)
 * with smooth feathering. 100% Client-side, non-AI, instant execution.
 */
export function fillSurroundingColor(
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: FillColorOptions = {}
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
  if (!outCtx) return sourceCanvas;

  // Draw source image
  outCtx.drawImage(sourceCanvas, 0, 0);

  // Determine fill color
  const hexColor = options.customColor || sampleMaskSurroundingColor(sourceCanvas, maskCanvas);
  const cleanHex = hexColor.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 255;

  const feather = Math.max(0, Math.min(20, options.feather ?? 4));
  const opacity = Math.max(0, Math.min(1, options.opacity ?? 1));

  // If feather is 0, simple fill
  if (feather === 0) {
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!maskCtx) return outputCanvas;

    const outImgData = outCtx.getImageData(0, 0, width, height);
    const outData = outImgData.data;
    const maskData = maskCtx.getImageData(0, 0, width, height).data;

    for (let i = 0; i < outData.length; i += 4) {
      if (maskData[i + 3] > 20 || maskData[i] > 20) {
        outData[i] = Math.round(outData[i] * (1 - opacity) + r * opacity);
        outData[i + 1] = Math.round(outData[i + 1] * (1 - opacity) + g * opacity);
        outData[i + 2] = Math.round(outData[i + 2] * (1 - opacity) + b * opacity);
      }
    }
    outCtx.putImageData(outImgData, 0, 0);
    return outputCanvas;
  }

  // With feathering: create blurred mask offscreen canvas for smooth boundary blend
  const blurredMaskCanvas = document.createElement('canvas');
  blurredMaskCanvas.width = width;
  blurredMaskCanvas.height = height;
  const bCtx = blurredMaskCanvas.getContext('2d', { willReadFrequently: true });
  if (!bCtx) return outputCanvas;

  bCtx.filter = `blur(${feather}px)`;
  bCtx.drawImage(maskCanvas, 0, 0);

  const outImgData = outCtx.getImageData(0, 0, width, height);
  const outData = outImgData.data;
  const bData = bCtx.getImageData(0, 0, width, height).data;

  for (let i = 0; i < outData.length; i += 4) {
    const maskAlpha = Math.max(bData[i], bData[i + 3]) / 255;
    if (maskAlpha > 0.01) {
      const blendFactor = Math.min(1, maskAlpha * opacity);
      outData[i] = Math.round(outData[i] * (1 - blendFactor) + r * blendFactor);
      outData[i + 1] = Math.round(outData[i + 1] * (1 - blendFactor) + g * blendFactor);
      outData[i + 2] = Math.round(outData[i + 2] * (1 - blendFactor) + b * blendFactor);
    }
  }

  outCtx.putImageData(outImgData, 0, 0);
  return outputCanvas;
}
