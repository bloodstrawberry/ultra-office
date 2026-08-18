import { createWorker } from 'tesseract.js';

export type MosaicStyle = 'pixelate' | 'blur' | 'color';

export type MosaicShapeType = 'rect' | 'circle' | 'heart' | 'star' | 'triangle';

export interface MosaicShapeItem {
  id: string;
  type: MosaicShapeType;
  x: number; // center x (canvas pixels)
  y: number; // center y (canvas pixels)
  width: number;
  height: number;
  rotation?: number; // degrees
  style?: MosaicStyle;
  blockSize?: number;
  color?: string;
}

export interface MosaicBrushStroke {
  id: string;
  points: Array<{ x: number; y: number }>;
  size: number;
  style: MosaicStyle;
  blockSize: number;
  isEraser?: boolean;
}

export interface MosaicRectRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: MosaicStyle;
  blockSize: number;
}

export interface OcrTextWord {
  id: string;
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  isMosaiced: boolean;
}

export interface DetectedFaceBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  eyeY: number; // eye line estimated Y
  isMosaiced: boolean;
}

/**
 * Apply pixelate mosaic in specified region (x, y, w, h)
 */
export function applyPixelateRegion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  blockSize: number = 16
): void {
  if (w <= 0 || h <= 0) return;
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(ctx.canvas.width, Math.ceil(x + w));
  const endY = Math.min(ctx.canvas.height, Math.ceil(y + h));
  const rectW = endX - startX;
  const rectH = endY - startY;
  if (rectW <= 0 || rectH <= 0) return;

  const bs = Math.max(4, blockSize);

  const offscreen = document.createElement('canvas');
  const smallW = Math.max(1, Math.round(rectW / bs));
  const smallH = Math.max(1, Math.round(rectH / bs));
  offscreen.width = smallW;
  offscreen.height = smallH;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  offCtx.imageSmoothingEnabled = false;
  offCtx.drawImage(ctx.canvas, startX, startY, rectW, rectH, 0, 0, smallW, smallH);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, smallW, smallH, startX, startY, rectW, rectH);
}

/**
 * Apply Gaussian Blur mosaic in specified region
 */
export function applyBlurRegion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  blurRadius: number = 12
): void {
  if (w <= 0 || h <= 0) return;
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(ctx.canvas.width, Math.ceil(x + w));
  const endY = Math.min(ctx.canvas.height, Math.ceil(y + h));
  const rectW = endX - startX;
  const rectH = endY - startY;
  if (rectW <= 0 || rectH <= 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(startX, startY, rectW, rectH);
  ctx.clip();
  ctx.filter = `blur(${Math.max(2, blurRadius)}px)`;
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.restore();
}

/**
 * Apply solid color blackout in specified region
 */
export function applySolidColorRegion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string = '#000000'
): void {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export type MosaicMode = 'pixelate' | 'blur' | 'blackout';
export type MosaicTool = 'brush' | 'rect';
export type SensitiveType = 'all' | 'phone' | 'resident' | 'email' | 'account';
export const applyPixelateEffect = applyPixelateRegion;
export const applyBlurEffect = applyBlurRegion;
export const applyBlackoutEffect = applySolidColorRegion;

/**
 * Creates Path2D for geometric shape clipping
 */
export function createShapePath(
  type: MosaicShapeType,
  cx: number,
  cy: number,
  w: number,
  h: number
): Path2D {
  const path = new Path2D();
  const halfW = w / 2;
  const halfH = h / 2;

  switch (type) {
    case 'rect':
      path.rect(cx - halfW, cy - halfH, w, h);
      break;
    case 'circle':
      path.ellipse(cx, cy, Math.abs(halfW), Math.abs(halfH), 0, 0, Math.PI * 2);
      break;
    case 'triangle':
      path.moveTo(cx, cy - halfH);
      path.lineTo(cx + halfW, cy + halfH);
      path.lineTo(cx - halfW, cy + halfH);
      path.closePath();
      break;
    case 'star': {
      const outerR = Math.min(halfW, halfH);
      const innerR = outerR * 0.4;
      const points = 5;
      for (let i = 0; i < points * 2; i += 1) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) path.moveTo(px, py);
        else path.lineTo(px, py);
      }
      path.closePath();
      break;
    }
    case 'heart': {
      const topY = cy - halfH;
      path.moveTo(cx, cy + halfH * 0.7);
      path.bezierCurveTo(
        cx - halfW * 1.2,
        cy + halfH * 0.1,
        cx - halfW * 1.2,
        topY,
        cx - halfW * 0.5,
        topY
      );
      path.bezierCurveTo(cx - halfW * 0.1, topY, cx, cy - halfH * 0.3, cx, cy - halfH * 0.3);
      path.bezierCurveTo(cx, cy - halfH * 0.3, cx + halfW * 0.1, topY, cx + halfW * 0.5, topY);
      path.bezierCurveTo(
        cx + halfW * 1.2,
        topY,
        cx + halfW * 1.2,
        cy + halfH * 0.1,
        cx,
        cy + halfH * 0.7
      );
      path.closePath();
      break;
    }
    default:
      path.rect(cx - halfW, cy - halfH, w, h);
  }

  return path;
}

/**
 * Render mosaic inside geometric shape
 */
export function renderShapeMosaic(
  ctx: CanvasRenderingContext2D,
  shape: MosaicShapeItem,
  defaultStyle: MosaicStyle = 'pixelate',
  defaultBlockSize: number = 16
): void {
  const style = shape.style || defaultStyle;
  const blockSize = shape.blockSize || defaultBlockSize;
  const color = shape.color || '#000000';

  const path = createShapePath(shape.type, shape.x, shape.y, shape.width, shape.height);

  ctx.save();
  if (shape.rotation) {
    ctx.translate(shape.x, shape.y);
    ctx.rotate((shape.rotation * Math.PI) / 180);
    ctx.translate(-shape.x, -shape.y);
  }

  ctx.clip(path);

  const left = shape.x - shape.width / 2;
  const top = shape.y - shape.height / 2;

  if (style === 'pixelate') {
    applyPixelateRegion(ctx, left, top, shape.width, shape.height, blockSize);
  } else if (style === 'blur') {
    applyBlurRegion(ctx, left, top, shape.width, shape.height, blockSize);
  } else {
    applySolidColorRegion(ctx, left, top, shape.width, shape.height, color);
  }

  ctx.restore();
}

/**
 * Render freehand brush stroke mosaic
 */
export function renderBrushStrokeMosaic(
  ctx: CanvasRenderingContext2D,
  stroke: MosaicBrushStroke,
  originalImageCanvas: HTMLCanvasElement
): void {
  if (stroke.points.length === 0) return;

  if (stroke.isEraser) {
    ctx.save();
    ctx.beginPath();
    stroke.points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.clip();
    ctx.drawImage(originalImageCanvas, 0, 0);
    ctx.restore();
    return;
  }

  // 1. Stroke path mask
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = ctx.canvas.width;
  maskCanvas.height = ctx.canvas.height;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) return;

  maskCtx.beginPath();
  stroke.points.forEach((pt, i) => {
    if (i === 0) maskCtx.moveTo(pt.x, pt.y);
    else maskCtx.lineTo(pt.x, pt.y);
  });
  maskCtx.lineWidth = stroke.size;
  maskCtx.lineCap = 'round';
  maskCtx.lineJoin = 'round';
  maskCtx.strokeStyle = '#ffffff';
  maskCtx.stroke();

  // 2. Temp mosaic canvas
  const mosaicTempCanvas = document.createElement('canvas');
  mosaicTempCanvas.width = ctx.canvas.width;
  mosaicTempCanvas.height = ctx.canvas.height;
  const mosaicCtx = mosaicTempCanvas.getContext('2d');
  if (!mosaicCtx) return;

  mosaicCtx.drawImage(ctx.canvas, 0, 0);

  if (stroke.style === 'pixelate') {
    applyPixelateRegion(mosaicCtx, 0, 0, ctx.canvas.width, ctx.canvas.height, stroke.blockSize);
  } else if (stroke.style === 'blur') {
    applyBlurRegion(mosaicCtx, 0, 0, ctx.canvas.width, ctx.canvas.height, stroke.blockSize);
  } else {
    applySolidColorRegion(mosaicCtx, 0, 0, ctx.canvas.width, ctx.canvas.height, '#000000');
  }

  // 3. Composite mask with main canvas
  ctx.save();
  ctx.beginPath();
  stroke.points.forEach((pt, i) => {
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.clip();
  ctx.drawImage(mosaicTempCanvas, 0, 0);
  ctx.restore();
}

/**
 * Regex classifier for sensitive personal information (phone, SSN, email, account/card)
 */
export function isSensitiveText(text: string): boolean {
  const clean = text.replace(/\s+/g, '');
  // 1. Phone number
  if (/(01[016789]|02|0[3-9][0-9])[-~.]?\d{3,4}[-~.]?\d{4}/.test(clean)) {
    return true;
  }
  // 2. Korean Resident Registration Number / Alien Card
  if (/\d{6}[-~.]?[1-4]\d{6}/.test(clean)) {
    return true;
  }
  // 3. Email address
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(clean)) {
    return true;
  }
  // 4. Card or Account Number
  if (/\d{4}[-~.]?\d{4}[-~.]?\d{4}[-~.]?\d{4}/.test(clean)) {
    return true;
  }
  return false;
}

/**
 * Run OCR word extraction on image
 */
export async function runOcrOnImage(
  imageSrc: string,
  onProgress?: (progress: number, status: string) => void
): Promise<OcrTextWord[]> {
  try {
    const worker = await createWorker(['kor', 'eng'], 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100), '글자 추출 인식 중...');
        } else if (onProgress) {
          onProgress(Math.round((m.progress || 0) * 50), 'OCR 엔진 로딩 중...');
        }
      },
    });

    const ret = await worker.recognize(imageSrc);
    await worker.terminate();

    const pageData = ret.data as unknown as {
      words?: Array<{
        text?: string;
        bbox?: { x0: number; y0: number; x1: number; y1: number };
      }>;
    };

    const words: OcrTextWord[] = [];
    if (pageData?.words) {
      pageData.words.forEach((w, idx: number) => {
        const text = w.text ? w.text.trim() : '';
        if (text.length > 0 && w.bbox) {
          words.push({
            id: `word-${idx}-${Date.now()}`,
            text,
            bbox: {
              x0: w.bbox.x0,
              y0: w.bbox.y0,
              x1: w.bbox.x1,
              y1: w.bbox.y1,
            },
            isMosaiced: isSensitiveText(text),
          });
        }
      });
    }

    return words;
  } catch (err) {
    console.error('OCR Text Recognition failed:', err);
    throw err;
  }
}

/**
 * Face detection algorithm in canvas (native FaceDetector or skin-tone cluster fallback)
 */
export async function detectFacesInCanvas(canvas: HTMLCanvasElement): Promise<DetectedFaceBox[]> {
  const faces: DetectedFaceBox[] = [];

  // 1. Check Native Chromium FaceDetector API
  if (typeof window !== 'undefined' && 'FaceDetector' in window) {
    try {
      const FaceDetectorClass = (window as any).FaceDetector;
      const detector = new FaceDetectorClass({
        fastMode: true,
        maxDetectedFaces: 10,
      });
      const detected = await detector.detect(canvas);
      detected.forEach((f: { boundingBox: DOMRect }, idx: number) => {
        const bbox = f.boundingBox;
        faces.push({
          id: `face-${idx}-${Date.now()}`,
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height,
          eyeY: bbox.y + bbox.height * 0.35,
          isMosaiced: true,
        });
      });
      if (faces.length > 0) return faces;
    } catch (e) {
      console.log('Native FaceDetector fallback to skin tone', e);
    }
  }

  // 2. Skin tone cluster analysis fallback
  const ctx = canvas.getContext('2d');
  if (!ctx) return faces;

  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const step = 8;
  const skinMap: boolean[][] = Array.from({ length: Math.ceil(h / step) }, () =>
    new Array(Math.ceil(w / step)).fill(false)
  );

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const isSkin =
        r > 60 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        Math.abs(r - g) > 15 &&
        r - Math.min(g, b) > 15;

      if (isSkin) {
        skinMap[Math.floor(y / step)][Math.floor(x / step)] = true;
      }
    }
  }

  const mapH = skinMap.length;
  const mapW = skinMap[0]?.length || 0;
  const visited: boolean[][] = Array.from({ length: mapH }, () => new Array(mapW).fill(false));

  let faceCount = 0;
  for (let my = 0; my < mapH; my += 1) {
    for (let mx = 0; mx < mapW; mx += 1) {
      if (skinMap[my][mx] && !visited[my][mx]) {
        let minX = mx;
        let maxX = mx;
        let minY = my;
        let maxY = my;
        let count = 0;

        const queue: Array<[number, number]> = [[mx, my]];
        visited[my][mx] = true;

        while (queue.length > 0) {
          const [cx, cy] = queue.pop()!;
          count += 1;
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1],
          ];
          for (let ni = 0; ni < neighbors.length; ni += 1) {
            const [nx, ny] = neighbors[ni];
            if (
              nx >= 0 &&
              nx < mapW &&
              ny >= 0 &&
              ny < mapH &&
              skinMap[ny][nx] &&
              !visited[ny][nx]
            ) {
              visited[ny][nx] = true;
              queue.push([nx, ny]);
            }
          }
        }

        const pixelWidth = (maxX - minX + 1) * step;
        const pixelHeight = (maxY - minY + 1) * step;
        const areaRatio = (pixelWidth * pixelHeight) / (w * h);

        if (count >= 15 && areaRatio > 0.008 && areaRatio < 0.6) {
          faces.push({
            id: `face-${faceCount}-${Date.now()}`,
            x: minX * step,
            y: minY * step,
            width: pixelWidth,
            height: pixelHeight,
            eyeY: minY * step + pixelHeight * 0.35,
            isMosaiced: true,
          });
          faceCount += 1;
        }
      }
    }
  }

  // If no face found, provide a central default region
  if (faces.length === 0) {
    const defaultW = Math.round(w * 0.35);
    const defaultH = Math.round(h * 0.35);
    faces.push({
      id: `face-default-${Date.now()}`,
      x: Math.round((w - defaultW) / 2),
      y: Math.round((h - defaultH) / 3),
      width: defaultW,
      height: defaultH,
      eyeY: Math.round((h - defaultH) / 3) + defaultH * 0.35,
      isMosaiced: true,
    });
  }

  return faces;
}
