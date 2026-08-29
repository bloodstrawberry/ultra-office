'use client';

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

export type DoodleMode = 'doodle' | 'derpy';

export type DerpyExpression =
  | 'auto'
  | 'dot_eyes'
  | 'derp_bean'
  | 'wink'
  | 'blank'
  | 'smug'
  | 'none';

export type PaperBackground = 'white' | 'kraft' | 'grid' | 'paint_grey' | 'transparent';

export type DoodleColorStyle = 'black_ink' | 'blue_pen' | 'pencil' | 'marker_color';

export interface DoodleConfig {
  mode: DoodleMode;

  // Common & Randomization
  randomSeed: number;

  // 1. 대충 그린 그림 (Lazy Doodle) settings
  roughness: number; // 1 to 10 (Line wiggle / jitter)
  strokeWidth: number; // 1 to 8 px
  crosshatchDensity: number; // 0 to 100%
  colorStyle: DoodleColorStyle;
  paperBg: PaperBackground;

  // 2. 하찮게 그리는 그림 (Derpy MS Paint) settings
  derpLevel: number; // 1 to 10 (1 = slightly simplified, 10 = extreme derp chaos)
  mouseJitter: number; // 0 to 100% (shaky hand cursor jitter)
  pixelBrushSize: 1 | 2 | 3 | 4 | 5; // Aliased pixel thickness
  enablePaintBucket: boolean; // Flat MS paint bucket fill
  paintColorCount: 4 | 8 | 16 | 24; // Palette quantization
  derpyExpression: DerpyExpression; // Dot eyes / derp face overlay
  customCaption: string; // Funny scrawled text (e.g. "(대충 그린 원본)", "(하찮음)")
  showCaption: boolean;
}

export interface SampleDoodleImage {
  id: string;
  label: string;
  url: string;
  subLabel: string;
}

export const DOODLE_SAMPLE_IMAGES: SampleDoodleImage[] = [
  {
    id: 'sample-cat',
    label: '고양이 (하찮은 뚱냥이 변환)',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
    subLabel: '동물 & 반려동물',
  },
  {
    id: 'sample-dog',
    label: '강아지 (개발새발 댕댕이)',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
    subLabel: '귀여운 강아지',
  },
  {
    id: 'sample-portrait',
    label: '인물 초상 (점눈 표정 변환)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    subLabel: '인물 & 캐리커처',
  },
  {
    id: 'sample-scenery',
    label: '랜드마크 & 풍경 (대충 스케치)',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
    subLabel: '도시 & 풍경',
  },
];

export const FUNNY_DERPY_CAPTIONS = [
  '(대충 그린 그림)',
  '(개발새발)',
  '(하찮음 100%)',
  '(아 됐고 니맘대로 그림)',
  '(그림판 마우스 장인)',
  '(어쨌든 완성함)',
  '(이게... 나?)',
  '(대충 3초 컷)',
  '(비슷한듯 아닌듯)',
  '(세상에서 가장 하찮은 명작)',
];

// Classic Windows 95 MS Paint 16 Color Palette
export const MS_PAINT_PALETTE: [number, number, number][] = [
  [0, 0, 0], // Black
  [128, 128, 128], // Dark Gray
  [128, 0, 0], // Dark Red
  [128, 128, 0], // Dark Yellow
  [0, 128, 0], // Dark Green
  [0, 128, 128], // Dark Cyan
  [0, 0, 128], // Dark Blue
  [128, 0, 128], // Dark Magenta
  [255, 255, 255], // White
  [192, 192, 192], // Light Gray
  [255, 0, 0], // Bright Red
  [255, 255, 0], // Yellow
  [0, 255, 0], // Bright Green
  [0, 255, 255], // Cyan
  [0, 0, 255], // Blue
  [255, 0, 255], // Magenta
  [255, 192, 203], // Pink / Skin
  [255, 165, 0], // Orange
  [165, 42, 42], // Brown
];

// ----------------------------------------------------------------------
// Pseudo-Random Helper (seeded)
// ----------------------------------------------------------------------
function createRng(seed: number) {
  let s = Math.abs(seed) || 12345;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ----------------------------------------------------------------------
// Bresenham Non-Antialiased Pixel Line Drawing (MS Paint Feel)
// ----------------------------------------------------------------------
function drawAliasedLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  brushSize: number,
  color: string
) {
  ctx.fillStyle = color;
  let px0 = Math.round(x0);
  let py0 = Math.round(y0);
  const px1 = Math.round(x1);
  const py1 = Math.round(y1);

  const dx = Math.abs(px1 - px0);
  const dy = Math.abs(py1 - py0);
  const sx = px0 < px1 ? 1 : -1;
  const sy = py0 < py1 ? 1 : -1;
  let err = dx - dy;

  const half = Math.floor(brushSize / 2);

  while (true) {
    ctx.fillRect(px0 - half, py0 - half, brushSize, brushSize);
    if (px0 === px1 && py0 === py1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      px0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      py0 += sy;
    }
  }
}

// ----------------------------------------------------------------------
// Core Rendering Function
// ----------------------------------------------------------------------

export async function renderDoodlePhoto(
  canvas: HTMLCanvasElement,
  imageSrc: string,
  config: DoodleConfig
): Promise<string> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';

  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = imageSrc;
  });

  const maxDim = 1000;
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  canvas.width = w;
  canvas.height = h;

  // Offscreen canvas to sample image pixels
  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
  if (!offCtx) return '';

  offCtx.drawImage(img, 0, 0, w, h);
  const imgData = offCtx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const rng = createRng(config.randomSeed);

  // 1. Draw Paper Background
  drawBackground(ctx, w, h, config.paperBg, rng);

  if (config.mode === 'doodle') {
    // ------------------------------------------------------------------
    // MODE 1: 대충 그린 그림 (Lazy Doodle / Rough Careless Sketch)
    // ------------------------------------------------------------------
    renderLazyDoodle(ctx, offCtx, data, w, h, config, rng);
  } else {
    // ------------------------------------------------------------------
    // MODE 2: 하찮게 그리는 그림 (Derpy MS Paint Mouse Scribble)
    // ------------------------------------------------------------------
    renderDerpyMsPaint(ctx, offCtx, data, w, h, config, rng);
  }

  // Draw optional funny scrawled caption
  if (config.showCaption && config.customCaption.trim()) {
    drawFunnyCaption(ctx, w, h, config, rng);
  }

  return canvas.toDataURL('image/png');
}

// ----------------------------------------------------------------------
// Background Drawer
// ----------------------------------------------------------------------
function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: PaperBackground,
  rng: () => number
) {
  if (bg === 'transparent') {
    ctx.clearRect(0, 0, w, h);
    return;
  }

  if (bg === 'white') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    return;
  }

  if (bg === 'paint_grey') {
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, w, h);
    // Add inner white canvas with 3D sunken border
    const border = 12;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(border, border, w - border * 2, h - border * 2);

    // Bevel edges
    ctx.fillStyle = '#808080';
    ctx.fillRect(border - 2, border - 2, w - (border - 2) * 2, 2);
    ctx.fillRect(border - 2, border - 2, 2, h - (border - 2) * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(border, h - border, w - border * 2, 2);
    ctx.fillRect(w - border, border, 2, h - border * 2);
    return;
  }

  if (bg === 'kraft') {
    // Warm vintage kraft paper
    ctx.fillStyle = '#F4ECD8';
    ctx.fillRect(0, 0, w, h);

    // Subtle paper speckles
    ctx.fillStyle = 'rgba(120, 90, 40, 0.04)';
    for (let i = 0; i < 400; i += 1) {
      const sx = rng() * w;
      const sy = rng() * h;
      const sr = rng() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (bg === 'grid') {
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, w, h);

    // Light blue/grey grid lines
    ctx.strokeStyle = 'rgba(70, 130, 180, 0.18)';
    ctx.lineWidth = 1;
    const gridSize = 24;

    ctx.beginPath();
    for (let x = 0; x < w; x += gridSize) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
    }
    ctx.stroke();
  }
}

// ----------------------------------------------------------------------
// MODE 1: 대충 그린 그림 (Lazy Doodle Implementation)
// ----------------------------------------------------------------------
function renderLazyDoodle(
  ctx: CanvasRenderingContext2D,
  offCtx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  w: number,
  h: number,
  config: DoodleConfig,
  rng: () => number
) {
  // Grayscale & edge magnitude calculation (Sobel)
  const gray = new Float32Array(w * h);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }

  // If marker color is enabled, draw subtle watercolor/marker color underlay
  if (config.colorStyle === 'marker_color') {
    ctx.save();
    ctx.globalAlpha = 0.45;
    // Draw simplified blurred color patches
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = Math.max(1, Math.round(w / 6));
    tempCanvas.height = Math.max(1, Math.round(h / 6));
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(offCtx.canvas, 0, 0, tempCanvas.width, tempCanvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'low';
      ctx.drawImage(tempCanvas, 0, 0, w, h);
    }
    ctx.restore();
  }

  // Edge detection
  const edges = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const idx = y * w + x;
      // Sobel kernel
      const gx =
        -gray[(y - 1) * w + (x - 1)] +
        gray[(y - 1) * w + (x + 1)] -
        2 * gray[y * w + (x - 1)] +
        2 * gray[y * w + (x + 1)] -
        gray[(y + 1) * w + (x - 1)] +
        gray[(y + 1) * w + (x + 1)];

      const gy =
        -gray[(y - 1) * w + (x - 1)] -
        2 * gray[(y - 1) * w + x] -
        gray[(y - 1) * w + (x + 1)] +
        gray[(y + 1) * w + (x - 1)] +
        2 * gray[(y + 1) * w + x] +
        gray[(y + 1) * w + (x + 1)];

      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Set line styling based on colorStyle
  let strokeColor = '#1F2937';
  let crosshatchColor = 'rgba(31, 41, 55, 0.4)';
  if (config.colorStyle === 'blue_pen') {
    strokeColor = '#1D4ED8';
    crosshatchColor = 'rgba(29, 78, 216, 0.35)';
  } else if (config.colorStyle === 'pencil') {
    strokeColor = '#4B5563';
    crosshatchColor = 'rgba(75, 85, 99, 0.3)';
  }

  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = strokeColor;
  ctx.lineWidth = Math.max(1, config.strokeWidth);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const edgeThreshold = 45 - config.roughness * 2;
  const step = Math.max(3, Math.round(14 - config.roughness));
  const wiggleAmt = config.roughness * 1.5;

  // 1. Sketchy Outline Strokes
  ctx.beginPath();
  for (let y = 4; y < h - 4; y += step) {
    for (let x = 4; x < w - 4; x += step) {
      const idx = y * w + x;
      if (edges[idx] > edgeThreshold) {
        // Draw short careless doodle segment with overshoot
        const angle = rng() * Math.PI * 2;
        const len = step * (0.8 + rng() * 1.4);
        const jx0 = x + (rng() - 0.5) * wiggleAmt;
        const jy0 = y + (rng() - 0.5) * wiggleAmt;
        const jx1 = jx0 + Math.cos(angle) * len;
        const jy1 = jy0 + Math.sin(angle) * len;

        // Curved wobbly stroke
        const cx = (jx0 + jx1) / 2 + (rng() - 0.5) * wiggleAmt * 1.5;
        const cy = (jy0 + jy1) / 2 + (rng() - 0.5) * wiggleAmt * 1.5;

        ctx.moveTo(jx0, jy0);
        ctx.quadraticCurveTo(cx, cy, jx1, jy1);

        // Occasional double sketch line (hand-drawn scratch feel)
        if (rng() > 0.6) {
          ctx.moveTo(jx0 + (rng() - 0.5) * 4, jy0 + (rng() - 0.5) * 4);
          ctx.lineTo(jx1 + (rng() - 0.5) * 4, jy1 + (rng() - 0.5) * 4);
        }
      }
    }
  }
  ctx.stroke();

  // 2. Careless Crosshatching / Shadow Scribbles in dark areas
  if (config.crosshatchDensity > 0) {
    ctx.save();
    ctx.strokeStyle = crosshatchColor;
    ctx.lineWidth = Math.max(1, config.strokeWidth * 0.7);
    ctx.beginPath();

    const hatchStep = Math.max(8, Math.round(30 - (config.crosshatchDensity / 100) * 18));
    for (let y = 6; y < h - 6; y += hatchStep) {
      for (let x = 6; x < w - 6; x += hatchStep) {
        const val = gray[y * w + x];
        // Dark areas get scribble hatching
        if (val < 130) {
          const scribbleLen = hatchStep * 1.2;
          const sx = x + (rng() - 0.5) * 4;
          const sy = y + (rng() - 0.5) * 4;

          // Diagonal hatch line 1
          ctx.moveTo(sx - scribbleLen / 2, sy - scribbleLen / 2);
          ctx.lineTo(sx + scribbleLen / 2, sy + scribbleLen / 2);

          // Darker areas get secondary crosshatch
          if (val < 75) {
            ctx.moveTo(sx + scribbleLen / 2, sy - scribbleLen / 2);
            ctx.lineTo(sx - scribbleLen / 2, sy + scribbleLen / 2);
          }
        }
      }
    }
    ctx.stroke();
    ctx.restore();
  }
}

// ----------------------------------------------------------------------
// MODE 2: 하찮게 그리는 그림 (Derpy MS Paint Mouse Scribble Implementation)
// ----------------------------------------------------------------------
function renderDerpyMsPaint(
  ctx: CanvasRenderingContext2D,
  _offCtx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  w: number,
  h: number,
  config: DoodleConfig,
  rng: () => number
) {
  const derp = config.derpLevel; // 1 to 10
  const jitterIntensity = (config.mouseJitter / 100) * (derp * 2.2 + 2);
  const brushSize = config.pixelBrushSize;

  // 1. MS Paint Bucket Fill (Crude Quantized Color Blocking)
  if (config.enablePaintBucket) {
    drawMsPaintBucketFill(ctx, data, w, h, config, rng);
  }

  // 2. Detect dominant features, edges & center of mass for caricaturization
  const featureAnalysis = analyzeImageForDerp(data, w, h);

  // 3. Extract and draw chunky wobbly MS Paint contour outlines
  drawDerpyOutlines(ctx, data, w, h, config, jitterIntensity, brushSize, rng);

  // 4. Overlaid Derpy Facial Expression ("맞는듯 아닌듯 아리까리한 하찮은 눈코입")
  if (config.derpyExpression !== 'none') {
    drawDerpyFaceFeatures(ctx, w, h, featureAnalysis, config, rng);
  }
}

// ----------------------------------------------------------------------
// MS Paint Bucket Fill Drawer
// ----------------------------------------------------------------------
function drawMsPaintBucketFill(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  w: number,
  h: number,
  config: DoodleConfig,
  rng: () => number
) {
  // Quantize image to MS Paint Palette and render in coarse polygon grid
  const blockSize = Math.max(8, Math.round(config.derpLevel * 4 + 6));
  const palette = MS_PAINT_PALETTE.slice(0, config.paintColorCount);

  for (let y = 0; y < h; y += blockSize) {
    for (let x = 0; x < w; x += blockSize) {
      // Sample average color in block
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let count = 0;

      for (let dy = 0; dy < blockSize && y + dy < h; dy += 2) {
        for (let dx = 0; dx < blockSize && x + dx < w; dx += 2) {
          const idx = ((y + dy) * w + (x + dx)) * 4;
          sr += data[idx];
          sg += data[idx + 1];
          sb += data[idx + 2];
          count += 1;
        }
      }

      if (count === 0) continue;
      const ar = sr / count;
      const ag = sg / count;
      const ab = sb / count;

      // Skip mostly white / very bright background blocks to keep clean white canvas feel
      if (ar > 240 && ag > 240 && ab > 240) continue;

      // Find closest palette color
      let closestColor = palette[0];
      let minDist = Infinity;
      for (const col of palette) {
        const dr = ar - col[0];
        const dg = ag - col[1];
        const db = ab - col[2];
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) {
          minDist = dist;
          closestColor = col;
        }
      }

      // Draw imperfect MS paint bucket block (with slight random gap or bleed!)
      const gap = rng() < 0.15 ? 1 : 0; // classic MS Paint unpainted pixel gap!
      ctx.fillStyle = `rgb(${closestColor[0]}, ${closestColor[1]}, ${closestColor[2]})`;
      ctx.fillRect(
        x + gap,
        y + gap,
        Math.min(blockSize - gap * 2, w - x),
        Math.min(blockSize - gap * 2, h - y)
      );
    }
  }
}

// ----------------------------------------------------------------------
// Derpy Outline Tracing (Aliased MS Paint Mouse Line)
// ----------------------------------------------------------------------
function drawDerpyOutlines(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  w: number,
  h: number,
  config: DoodleConfig,
  jitter: number,
  brushSize: number,
  rng: () => number
) {
  // Coarse grid gradient sampling
  const step = Math.max(4, Math.round(config.derpLevel * 3 + 4));
  const edgeThreshold = 35 + config.derpLevel * 4;

  const strokeColor = '#000000'; // Pure MS Paint Black

  for (let y = step; y < h - step; y += step) {
    for (let x = step; x < w - step; x += step) {
      const idx = (y * w + x) * 4;
      const rightIdx = (y * w + (x + step)) * 4;
      const downIdx = ((y + step) * w + x) * 4;

      const diffR = Math.abs(data[idx] - data[rightIdx]) + Math.abs(data[idx] - data[downIdx]);
      const diffG =
        Math.abs(data[idx + 1] - data[rightIdx + 1]) + Math.abs(data[idx + 1] - data[downIdx + 1]);
      const diffB =
        Math.abs(data[idx + 2] - data[rightIdx + 2]) + Math.abs(data[idx + 2] - data[downIdx + 2]);

      if (diffR + diffG + diffB > edgeThreshold * 3) {
        // Shaky mouse cursor movement simulation
        const jx0 = x + (rng() - 0.5) * jitter;
        const jy0 = y + (rng() - 0.5) * jitter;
        const angle = (rng() - 0.5) * Math.PI * 1.5;
        const len = step * (1.1 + rng() * 0.8);
        const jx1 = jx0 + Math.cos(angle) * len;
        const jy1 = jy0 + Math.sin(angle) * len;

        // Draw non-antialiased stepped pixel line
        drawAliasedLine(ctx, jx0, jy0, jx1, jy1, brushSize, strokeColor);

        // Randomly add a clumsy mouse slip / scribble hook!
        if (rng() < 0.08 * config.derpLevel) {
          const slipX = jx1 + (rng() - 0.5) * jitter * 2;
          const slipY = jy1 + (rng() - 0.5) * jitter * 2;
          drawAliasedLine(ctx, jx1, jy1, slipX, slipY, brushSize, strokeColor);
        }
      }
    }
  }
}

// ----------------------------------------------------------------------
// Image Feature Analysis for Derpy Caricaturization
// ----------------------------------------------------------------------
interface DerpFeatureInfo {
  centerX: number;
  centerY: number;
  faceWidth: number;
  faceHeight: number;
  hasHighContrastCenter: boolean;
}

function analyzeImageForDerp(data: Uint8ClampedArray, w: number, h: number): DerpFeatureInfo {
  // Center region luminance & contrast analysis
  const cx = w / 2;
  const cy = h * 0.42; // slightly above vertical center (head/focus area)
  const sampleW = w * 0.4;
  const sampleH = h * 0.4;

  let totalLuma = 0;
  let count = 0;
  for (
    let y = Math.max(0, Math.round(cy - sampleH / 2));
    y < Math.min(h, cy + sampleH / 2);
    y += 4
  ) {
    for (
      let x = Math.max(0, Math.round(cx - sampleW / 2));
      x < Math.min(w, cx + sampleW / 2);
      x += 4
    ) {
      const idx = (y * w + x) * 4;
      totalLuma += data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      count += 1;
    }
  }

  return {
    centerX: cx,
    centerY: cy,
    faceWidth: sampleW * 0.7,
    faceHeight: sampleH * 0.7,
    hasHighContrastCenter: count > 0,
  };
}

// ----------------------------------------------------------------------
// Derpy Face Features Drawer ("하찮은 점눈 & 멍때리는 표정")
// ----------------------------------------------------------------------
function drawDerpyFaceFeatures(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  feature: DerpFeatureInfo,
  config: DoodleConfig,
  rng: () => number
) {
  const derp = config.derpLevel;
  const cx = feature.centerX + (rng() - 0.5) * derp * 3;
  const cy = feature.centerY + (rng() - 0.5) * derp * 3;
  const eyeDist = Math.max(20, w * 0.08 * (1 + (rng() - 0.5) * 0.4));
  const eyeY = cy - h * 0.03;
  const mouthY = cy + h * 0.05 + (rng() - 0.5) * derp * 2;

  const leftEyeX = cx - eyeDist;
  const rightEyeX = cx + eyeDist;

  const brushSize = Math.max(2, config.pixelBrushSize);

  let expression = config.derpyExpression;
  if (expression === 'auto') {
    const exprList: DerpyExpression[] = ['dot_eyes', 'derp_bean', 'wink', 'blank', 'smug'];
    const idx = Math.floor(rng() * exprList.length);
    expression = exprList[idx];
  }

  // Draw Eyes based on expression
  if (expression === 'dot_eyes') {
    // 2 Uneven solid black circles/dots • •
    const r1 = Math.max(3, Math.round(w * 0.012 + rng() * 3));
    const r2 = Math.max(3, Math.round(w * 0.012 + rng() * 3)); // slightly uneven!

    drawAliasedCircle(ctx, leftEyeX, eyeY + (rng() - 0.5) * 4, r1, '#000000');
    drawAliasedCircle(ctx, rightEyeX, eyeY + (rng() - 0.5) * 4, r2, '#000000');

    // Crooked little smile ~
    drawWobblyMouth(ctx, cx, mouthY, eyeDist * 1.2, brushSize, rng, 'smile');
  } else if (expression === 'derp_bean') {
    // Large uneven bean eyes with tiny pupils looking in cross directions
    const eyeR = Math.max(6, Math.round(w * 0.022));

    // Left Eye outline (White inside, black border)
    drawAliasedCircle(ctx, leftEyeX, eyeY, eyeR + 2, '#000000');
    drawAliasedCircle(ctx, leftEyeX, eyeY, eyeR, '#FFFFFF');
    // Left pupil looking up-left
    drawAliasedCircle(ctx, leftEyeX - 3, eyeY - 2, 2.5, '#000000');

    // Right Eye outline
    drawAliasedCircle(ctx, rightEyeX, eyeY + 2, eyeR + 3, '#000000');
    drawAliasedCircle(ctx, rightEyeX, eyeY + 2, eyeR + 1, '#FFFFFF');
    // Right pupil looking right-down (derpy squint!)
    drawAliasedCircle(ctx, rightEyeX + 4, eyeY + 3, 2.5, '#000000');

    // Open wobbly mouth 'o'
    drawWobblyMouth(ctx, cx, mouthY, eyeDist * 0.9, brushSize, rng, 'open');
  } else if (expression === 'wink') {
    // Left eye: ^ wink, Right eye: • dot
    const winkLen = eyeDist * 0.6;
    drawAliasedLine(
      ctx,
      leftEyeX - winkLen,
      eyeY + 2,
      leftEyeX,
      eyeY - winkLen * 0.8,
      brushSize,
      '#000000'
    );
    drawAliasedLine(
      ctx,
      leftEyeX,
      eyeY - winkLen * 0.8,
      leftEyeX + winkLen,
      eyeY + 2,
      brushSize,
      '#000000'
    );

    drawAliasedCircle(ctx, rightEyeX, eyeY, Math.max(3, w * 0.012), '#000000');

    // Smug tongue out or cat mouth ':3'
    drawWobblyMouth(ctx, cx, mouthY, eyeDist * 1.1, brushSize, rng, 'cat');
  } else if (expression === 'blank') {
    // - _ - completely deadpan annoyed lines
    const barLen = eyeDist * 0.7;
    drawAliasedLine(
      ctx,
      leftEyeX - barLen,
      eyeY,
      leftEyeX + barLen,
      eyeY,
      brushSize + 1,
      '#000000'
    );
    drawAliasedLine(
      ctx,
      rightEyeX - barLen,
      eyeY,
      rightEyeX + barLen,
      eyeY,
      brushSize + 1,
      '#000000'
    );

    // Flat horizontal mouth line
    drawAliasedLine(
      ctx,
      cx - eyeDist * 0.6,
      mouthY,
      cx + eyeDist * 0.6,
      mouthY,
      brushSize,
      '#000000'
    );
  } else if (expression === 'smug') {
    // ◡ ◡ closed happy eyes + big grin
    const arcLen = eyeDist * 0.6;
    drawAliasedLine(ctx, leftEyeX - arcLen, eyeY - 2, leftEyeX, eyeY + 4, brushSize, '#000000');
    drawAliasedLine(ctx, leftEyeX, eyeY + 4, leftEyeX + arcLen, eyeY - 2, brushSize, '#000000');

    drawAliasedLine(ctx, rightEyeX - arcLen, eyeY - 2, rightEyeX, eyeY + 4, brushSize, '#000000');
    drawAliasedLine(ctx, rightEyeX, eyeY + 4, rightEyeX + arcLen, eyeY - 2, brushSize, '#000000');

    drawWobblyMouth(ctx, cx, mouthY, eyeDist * 1.4, brushSize, rng, 'smile');
  }

  // Clumsy nose dot or dash -
  if (rng() > 0.3) {
    const noseY = (eyeY + mouthY) / 2;
    drawAliasedLine(
      ctx,
      cx - 1,
      noseY - 2,
      cx + (rng() - 0.5) * 3,
      noseY + 3,
      brushSize,
      '#000000'
    );
  }
}

// ----------------------------------------------------------------------
// Derpy Mouth Drawer
// ----------------------------------------------------------------------
function drawWobblyMouth(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  width: number,
  brushSize: number,
  rng: () => number,
  type: 'smile' | 'open' | 'cat'
) {
  const hw = width / 2;
  if (type === 'smile') {
    // Wavy curve
    const x0 = cx - hw;
    const y0 = cy - 2;
    const x1 = cx;
    const y1 = cy + hw * 0.4 + (rng() - 0.5) * 4;
    const x2 = cx + hw;
    const y2 = cy - 2 + (rng() - 0.5) * 4;

    drawAliasedLine(ctx, x0, y0, x1, y1, brushSize, '#000000');
    drawAliasedLine(ctx, x1, y1, x2, y2, brushSize, '#000000');
  } else if (type === 'open') {
    // Crooked oval / potato mouth
    drawAliasedCircle(ctx, cx, cy, hw * 0.5, '#000000');
    drawAliasedCircle(ctx, cx, cy, Math.max(1, hw * 0.5 - brushSize), '#FF8080'); // pink tongue inside!
  } else if (type === 'cat') {
    // :3 cat mouth (w shape)
    const midX = cx;
    const midY = cy + 4;
    drawAliasedLine(ctx, cx - hw, cy, cx - hw / 2, midY, brushSize, '#000000');
    drawAliasedLine(ctx, cx - hw / 2, midY, midX, cy, brushSize, '#000000');
    drawAliasedLine(ctx, midX, cy, cx + hw / 2, midY, brushSize, '#000000');
    drawAliasedLine(ctx, cx + hw / 2, midY, cx + hw, cy, brushSize, '#000000');
  }
}

// ----------------------------------------------------------------------
// Aliased Solid Circle Fill
// ----------------------------------------------------------------------
function drawAliasedCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
) {
  ctx.fillStyle = color;
  const r = Math.round(radius);
  const px = Math.round(cx);
  const py = Math.round(cy);

  for (let y = -r; y <= r; y += 1) {
    for (let x = -r; x <= r; x += 1) {
      if (x * x + y * y <= r * r) {
        ctx.fillRect(px + x, py + y, 1, 1);
      }
    }
  }
}

// ----------------------------------------------------------------------
// Funny Scrawled Hand Caption ("(대충 그린 사자)", "(하찮음)")
// ----------------------------------------------------------------------
function drawFunnyCaption(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: DoodleConfig,
  rng: () => number
) {
  ctx.save();
  const text = config.customCaption;
  const fontSize = Math.max(14, Math.round(w * 0.038));
  ctx.font = `bold ${fontSize}px sans-serif, 'Malgun Gothic', 'Apple SD Gothic Neo'`;
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'center';

  const margin = Math.round(h * 0.04);
  const tx = w / 2 + (rng() - 0.5) * 10;
  const ty = h - margin + (rng() - 0.5) * 6;
  const rot = (rng() - 0.5) * 0.08; // slight crooked angle

  ctx.translate(tx, ty);
  ctx.rotate(rot);

  // Text stroke outline (for visibility)
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.strokeText(text, 0, 0);

  // Main text fill
  ctx.fillStyle =
    config.mode === 'doodle' && config.colorStyle === 'blue_pen' ? '#1D4ED8' : '#111827';
  ctx.fillText(text, 0, 0);

  ctx.restore();
}
