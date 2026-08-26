import JSZip from 'jszip';
import gifshot from 'gifshot';
import { parseGIF, decompressFrames, type ParsedFrame } from 'gifuct-js';

import { saveBlob } from './zip-exporter';

export interface GifFrameItem {
  id: string;
  dataUrl: string;
  delay: number; // in milliseconds
  width: number;
  height: number;
  disposalType?: number;
}

export interface GifCreateOptions {
  images: Array<{ src: string; delay?: number }>;
  width: number;
  height: number;
  fitMode?: 'contain' | 'cover' | 'stretch';
  bgColor?: string;
  fps?: number; // 1 to 30
  sampleInterval?: number; // 1 (best) to 20 (fast)
  filters?: {
    grayscale?: number;
    sepia?: number;
    brightness?: number;
    contrast?: number;
    blur?: number;
    invert?: number;
    hueRotate?: number;
  };
  loopMode?: 'normal' | 'reverse' | 'boomerang';
  textOverlay?: {
    text: string;
    fontSize?: number;
    fontColor?: string;
    position?: 'top' | 'center' | 'bottom' | 'middle' | 'top-left' | 'bottom-right';
  };
  onProgress?: (progress: number) => void;
  watermark?: {
    src: string;
    opacity?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    scale?: number;
  };
  progressCallback?: (progress: number) => void;
}

/**
 * Helper to load an image from URL / DataURL into HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Extract frames from an animated GIF file
 */
export async function extractGifFrames(file: File): Promise<{
  width: number;
  height: number;
  frames: GifFrameItem[];
  totalDuration: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const gif = parseGIF(arrayBuffer);
  const decompressedFrames: ParsedFrame[] = decompressFrames(gif, true);

  if (!decompressedFrames || decompressedFrames.length === 0) {
    throw new Error('GIF 프레임을 읽을 수 없습니다.');
  }

  const width = gif.lsd.width;
  const height = gif.lsd.height;

  // Master canvas to construct full frames
  const masterCanvas = document.createElement('canvas');
  masterCanvas.width = width;
  masterCanvas.height = height;
  const masterCtx = masterCanvas.getContext('2d', { willReadFrequently: true });
  if (!masterCtx) throw new Error('Canvas context를 생성할 수 없습니다.');

  // Patch canvas for rendering frame patch
  const patchCanvas = document.createElement('canvas');
  const patchCtx = patchCanvas.getContext('2d');
  if (!patchCtx) throw new Error('Patch Canvas context를 생성할 수 없습니다.');

  let tempCanvasState: ImageData | null = null;
  const resultFrames: GifFrameItem[] = [];
  let totalDuration = 0;

  for (let i = 0; i < decompressedFrames.length; i += 1) {
    const frame = decompressedFrames[i];
    const { dims, patch, delay, disposalType } = frame;

    // Handle disposal from previous frame
    if (i > 0) {
      const prevFrame = decompressedFrames[i - 1];
      if (prevFrame.disposalType === 2) {
        // Clear previous frame patch area
        masterCtx.clearRect(
          prevFrame.dims.left,
          prevFrame.dims.top,
          prevFrame.dims.width,
          prevFrame.dims.height
        );
      } else if (prevFrame.disposalType === 3 && tempCanvasState) {
        // Restore to state before previous frame
        masterCtx.putImageData(tempCanvasState, 0, 0);
      }
    }

    if (disposalType === 3) {
      tempCanvasState = masterCtx.getImageData(0, 0, width, height);
    }

    // Prepare patch image data
    patchCanvas.width = dims.width;
    patchCanvas.height = dims.height;
    const patchImageData = patchCtx.createImageData(dims.width, dims.height);
    patchImageData.data.set(patch);
    patchCtx.putImageData(patchImageData, 0, 0);

    // Draw patch onto master canvas
    masterCtx.drawImage(patchCanvas, dims.left, dims.top);

    // Extract current frame as data URL
    const frameDataUrl = masterCanvas.toDataURL('image/png');
    const frameDelay = typeof delay === 'number' && delay > 0 ? delay : 100; // default to 100ms if 0
    totalDuration += frameDelay;

    resultFrames.push({
      id: `frame_${i}_${Date.now()}`,
      dataUrl: frameDataUrl,
      delay: frameDelay,
      width,
      height,
      disposalType,
    });
  }

  return {
    width,
    height,
    frames: resultFrames,
    totalDuration,
  };
}

/**
 * Pre-process image frame using HTML Canvas (Resize, Filters, Overlays, Background color)
 */
export async function processSingleFrameCanvas(
  imgSrc: string,
  width: number,
  height: number,
  options: Partial<GifCreateOptions>
): Promise<string> {
  const img = await loadImage(imgSrc);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return imgSrc;

  // 1. Fill background if set
  if (options.bgColor && options.bgColor !== 'transparent') {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Setup CSS filters if present
  let filterStr = '';
  if (options.filters) {
    const f = options.filters;
    if (f.grayscale) filterStr += `grayscale(${f.grayscale}%) `;
    if (f.sepia) filterStr += `sepia(${f.sepia}%) `;
    if (f.brightness) filterStr += `brightness(${f.brightness}%) `;
    if (f.contrast) filterStr += `contrast(${f.contrast}%) `;
    if (f.invert) filterStr += `invert(${f.invert}%) `;
    if (f.blur) filterStr += `blur(${f.blur}px) `;
    if (f.hueRotate) filterStr += `hue-rotate(${f.hueRotate}deg) `;
  }
  ctx.filter = filterStr.trim() || 'none';

  // 3. Draw image with fit mode
  const fitMode = options.fitMode || 'contain';
  let dx = 0;
  let dy = 0;
  let dw = width;
  let dh = height;

  if (fitMode === 'contain') {
    const scale = Math.min(width / img.width, height / img.height);
    dw = img.width * scale;
    dh = img.height * scale;
    dx = (width - dw) / 2;
    dy = (height - dh) / 2;
  } else if (fitMode === 'cover') {
    const scale = Math.max(width / img.width, height / img.height);
    dw = img.width * scale;
    dh = img.height * scale;
    dx = (width - dw) / 2;
    dy = (height - dh) / 2;
  }

  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none'; // reset filter for text & watermark

  // 4. Draw Text Overlay
  if (options.textOverlay && options.textOverlay.text) {
    const txtOpt = options.textOverlay;
    const fontSize = txtOpt.fontSize || Math.round(height * 0.08);
    const color = txtOpt.fontColor || '#ffffff';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(2, Math.round(fontSize / 10));

    let tx = width / 2;
    let ty = height - fontSize;

    if (txtOpt.position === 'top') ty = fontSize * 1.2;
    else if (txtOpt.position === 'center') ty = height / 2 + fontSize / 3;
    else if (txtOpt.position === 'top-left') {
      tx = fontSize * 1.5;
      ty = fontSize * 1.2;
      ctx.textAlign = 'left';
    } else if (txtOpt.position === 'bottom-right') {
      tx = width - fontSize * 0.5;
      ty = height - fontSize * 0.5;
      ctx.textAlign = 'right';
    }

    ctx.strokeText(txtOpt.text, tx, ty);
    ctx.fillText(txtOpt.text, tx, ty);
  }

  // 5. Draw Watermark Image
  if (options.watermark && options.watermark.src) {
    try {
      const wmImg = await loadImage(options.watermark.src);
      const scale = options.watermark.scale || 0.2;
      const opacity = options.watermark.opacity !== undefined ? options.watermark.opacity : 0.8;
      const wmW = width * scale;
      const wmH = (wmImg.height / wmImg.width) * wmW;

      let wmX = width - wmW - 10;
      let wmY = height - wmH - 10;

      const pos = options.watermark.position || 'bottom-right';
      if (pos === 'top-left') {
        wmX = 10;
        wmY = 10;
      } else if (pos === 'top-right') {
        wmX = width - wmW - 10;
        wmY = 10;
      } else if (pos === 'bottom-left') {
        wmX = 10;
        wmY = height - wmH - 10;
      } else if (pos === 'center') {
        wmX = (width - wmW) / 2;
        wmY = (height - wmH) / 2;
      }

      ctx.globalAlpha = opacity;
      ctx.drawImage(wmImg, wmX, wmY, wmW, wmH);
      ctx.globalAlpha = 1.0;
    } catch (e) {
      console.warn('Watermark load failed:', e);
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Create GIF from images using gifshot
 */
export async function createGifFromImages(options: GifCreateOptions): Promise<string> {
  const {
    images,
    width,
    height,
    fps = 10,
    sampleInterval = 10,
    loopMode = 'normal',
    progressCallback,
  } = options;

  if (!images || images.length === 0) {
    throw new Error('GIF로 변환할 이미지가 없습니다.');
  }

  // 1. Process frames (Filters, Scaling, Overlays)
  let processedFrames: string[] = [];
  const total = images.length;

  for (let i = 0; i < total; i += 1) {
    const item = images[i];
    const frameDataUrl = await processSingleFrameCanvas(item.src, width, height, options);
    processedFrames.push(frameDataUrl);
    if (progressCallback) {
      progressCallback(Math.round(((i + 1) / total) * 40)); // 0~40%
    }
  }

  // 2. Apply loop mode
  if (loopMode === 'reverse') {
    processedFrames.reverse();
  } else if (loopMode === 'boomerang') {
    const reversedCopy = [...processedFrames].reverse().slice(1, -1);
    processedFrames = [...processedFrames, ...reversedCopy];
  }

  // Calculate interval in seconds per frame
  const intervalSeconds = 1 / Math.max(1, Math.min(30, fps));

  // 3. Call gifshot createGIF
  return new Promise((resolve, reject) => {
    gifshot.createGIF(
      {
        images: processedFrames,
        gifWidth: width,
        gifHeight: height,
        interval: intervalSeconds,
        sampleInterval,
        numWorkers: 2,
        progressCallback: (captureProgress: number) => {
          if (progressCallback) {
            progressCallback(40 + Math.round(captureProgress * 60)); // 40~100%
          }
        },
      },
      (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => {
        if (obj.error) {
          reject(new Error(obj.errorMsg || obj.errorCode || 'GIF 생성 중 오류가 발생했습니다.'));
        } else {
          resolve(obj.image);
        }
      }
    );
  });
}

/**
 * Replace background color of a GIF or transparent background
 */
export async function modifyGifBackgroundColor(
  file: File,
  newBgColor: string,
  replaceColor?: string,
  tolerance: number = 20,
  progressCallback?: (progress: number) => void
): Promise<string> {
  const extracted = await extractGifFrames(file);
  const { width, height, frames } = extracted;

  // Hex helper to RGB
  const hexToRgb = (hex: string) => {
    const cleaned = hex.replace('#', '');
    if (cleaned.length === 3) {
      return {
        r: parseInt(cleaned[0] + cleaned[0], 16),
        g: parseInt(cleaned[1] + cleaned[1], 16),
        b: parseInt(cleaned[2] + cleaned[2], 16),
      };
    }
    return {
      r: parseInt(cleaned.substring(0, 2), 16),
      g: parseInt(cleaned.substring(2, 4), 16),
      b: parseInt(cleaned.substring(4, 6), 16),
    };
  };

  const targetRgb = replaceColor && replaceColor !== 'transparent' ? hexToRgb(replaceColor) : null;
  const newBgRgb = newBgColor && newBgColor !== 'transparent' ? hexToRgb(newBgColor) : null;

  const modifiedFrames: string[] = [];

  for (let idx = 0; idx < frames.length; idx += 1) {
    const frame = frames[idx];
    const img = await loadImage(frame.dataUrl);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) continue;

    // First, if newBgColor is a solid color, draw background first
    if (newBgRgb) {
      ctx.fillStyle = newBgColor;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0);

    // Pixel processing for chroma key / transparency replacement
    if (targetRgb || newBgColor === 'transparent') {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        let shouldReplace = false;

        if (targetRgb) {
          // Chroma key color matching within tolerance
          const dist = Math.sqrt(
            (r - targetRgb.r) ** 2 + (g - targetRgb.g) ** 2 + (b - targetRgb.b) ** 2
          );
          if (dist <= tolerance) {
            shouldReplace = true;
          }
        } else if (a < 50) {
          // Transparent pixel replacement
          shouldReplace = true;
        }

        if (shouldReplace) {
          if (newBgColor === 'transparent') {
            data[i + 3] = 0; // set transparent
          } else if (newBgRgb) {
            data[i] = newBgRgb.r;
            data[i + 1] = newBgRgb.g;
            data[i + 2] = newBgRgb.b;
            data[i + 3] = 255;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    modifiedFrames.push(canvas.toDataURL('image/png'));

    if (progressCallback) {
      progressCallback(Math.round(((idx + 1) / frames.length) * 50));
    }
  }

  // Determine avg interval
  const avgInterval =
    frames.length > 0 ? frames.reduce((acc, f) => acc + f.delay, 0) / frames.length / 1000 : 0.1;

  return new Promise((resolve, reject) => {
    gifshot.createGIF(
      {
        images: modifiedFrames,
        gifWidth: width,
        gifHeight: height,
        interval: Math.max(0.03, avgInterval),
        sampleInterval: 10,
        numWorkers: 2,
        progressCallback: (prog: number) => {
          if (progressCallback) {
            progressCallback(50 + Math.round(prog * 50));
          }
        },
      },
      (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => {
        if (obj.error) {
          reject(new Error(obj.errorMsg || obj.errorCode || 'GIF 인코딩 중 오류 발생'));
        } else {
          resolve(obj.image);
        }
      }
    );
  });
}

/**
 * Export frame data URLs to a downloadable ZIP file
 */
export async function exportFramesToZip(
  frames: GifFrameItem[],
  zipFilename: string = 'gif_extracted_frames.zip'
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('frames') || zip;

  for (let i = 0; i < frames.length; i += 1) {
    const frame = frames[i];
    const base64Data = frame.dataUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
    const padNum = String(i + 1).padStart(3, '0');
    folder.file(`frame_${padNum}.png`, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveBlob(content, zipFilename);
}
