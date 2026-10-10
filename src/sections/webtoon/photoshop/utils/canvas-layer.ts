import type { PhotoshopLayer, BlendMode } from '../types';

export function createEmptyCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  return canvas;
}

export function createLayer(
  width: number,
  height: number,
  name: string,
  source?: CanvasImageSource
): PhotoshopLayer {
  const canvas = createEmptyCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (ctx && source) {
    ctx.drawImage(source, 0, 0, width, height);
  }

  return {
    id: `layer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: 'source-over',
    canvas,
    x: 0,
    y: 0,
    width,
    height,
  };
}

export function cloneLayer(layer: PhotoshopLayer): PhotoshopLayer {
  const newCanvas = createEmptyCanvas(layer.canvas.width, layer.canvas.height);
  const ctx = newCanvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(layer.canvas, 0, 0);
  }

  return {
    ...layer,
    id: `layer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: `${layer.name} (복사본)`,
    canvas: newCanvas,
  };
}

export function compositeLayers(
  targetCanvas: HTMLCanvasElement,
  layers: PhotoshopLayer[],
  options?: {
    renderCheckerboard?: boolean;
    backgroundColor?: string;
  }
): void {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const w = targetCanvas.width;
  const h = targetCanvas.height;

  ctx.clearRect(0, 0, w, h);

  if (options?.backgroundColor) {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, w, h);
  } else if (options?.renderCheckerboard) {
    drawCheckerboard(ctx, w, h);
  }

  for (const layer of layers) {
    if (!layer.visible || layer.opacity <= 0) continue;

    ctx.save();
    ctx.globalAlpha = Math.min(1, Math.max(0, layer.opacity));
    ctx.globalCompositeOperation = layer.blendMode;
    ctx.drawImage(layer.canvas, layer.x, layer.y);
    ctx.restore();
  }
}

let cachedCheckerPattern: CanvasPattern | null = null;

export function getCheckerboardPattern(
  ctx: CanvasRenderingContext2D,
  size = 16
): CanvasPattern | null {
  if (cachedCheckerPattern) return cachedCheckerPattern;
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = size * 2;
  patternCanvas.height = size * 2;
  const pCtx = patternCanvas.getContext('2d');
  if (pCtx) {
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, size * 2, size * 2);
    pCtx.fillStyle = '#e5e7eb';
    pCtx.fillRect(0, 0, size, size);
    pCtx.fillRect(size, size, size, size);
  }
  cachedCheckerPattern = ctx.createPattern(patternCanvas, 'repeat');
  return cachedCheckerPattern;
}

export function drawCheckerboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size = 16
): void {
  const pattern = getCheckerboardPattern(ctx, size);
  if (pattern) {
    ctx.save();
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

export function mergeLayersDown(
  bottomLayer: PhotoshopLayer,
  topLayer: PhotoshopLayer
): PhotoshopLayer {
  const mergedCanvas = createEmptyCanvas(bottomLayer.canvas.width, bottomLayer.canvas.height);
  const ctx = mergedCanvas.getContext('2d');
  if (ctx) {
    // 1. Draw bottom
    ctx.save();
    ctx.globalAlpha = bottomLayer.opacity;
    ctx.globalCompositeOperation = bottomLayer.blendMode;
    ctx.drawImage(bottomLayer.canvas, bottomLayer.x, bottomLayer.y);
    ctx.restore();

    // 2. Draw top with its blendMode and opacity
    ctx.save();
    ctx.globalAlpha = topLayer.opacity;
    ctx.globalCompositeOperation = topLayer.blendMode;
    ctx.drawImage(topLayer.canvas, topLayer.x, topLayer.y);
    ctx.restore();
  }

  return {
    ...bottomLayer,
    name: `${bottomLayer.name} + ${topLayer.name}`,
    opacity: 1,
    blendMode: 'source-over',
    canvas: mergedCanvas,
  };
}

export function flattenLayers(
  width: number,
  height: number,
  layers: PhotoshopLayer[],
  background = '#ffffff'
): PhotoshopLayer {
  const flattenedCanvas = createEmptyCanvas(width, height);
  compositeLayers(flattenedCanvas, layers, { backgroundColor: background });

  return {
    id: `layer_${Date.now()}_flattened`,
    name: '배경 (병합됨)',
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: 'source-over',
    canvas: flattenedCanvas,
    x: 0,
    y: 0,
    width,
    height,
  };
}

export async function layerToDataUrl(layer: PhotoshopLayer): Promise<string> {
  return layer.canvas.toDataURL('image/png');
}

export async function dataUrlToCanvas(
  dataUrl: string,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = createEmptyCanvas(width, height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      resolve(canvas);
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}
