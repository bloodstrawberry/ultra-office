import JSZip from 'jszip';
import gifshot from 'gifshot';
import { parseGIF, decompressFrames, type ParsedFrame } from 'gifuct-js';

// ----------------------------------------------------------------------

export interface GifFrameItem {
  id: string;
  dataUrl: string;
  delay: number; // in milliseconds
  width: number;
  height: number;
  disposalType?: number;
}

export interface GifCreateOptions {
  images: Array<{
    id?: string;
    src: string;
    duration?: number; // duration in seconds (e.g. 1.5)
    delay?: number; // duration in ms (e.g. 1500)
    name?: string;
  }>;
  width: number;
  height: number;
  fitMode?: 'contain' | 'cover' | 'stretch';
  bgColor?: string;
  fps?: number; // 1 to 30
  sampleInterval?: number; // 1 (best quality) to 20 (fastest)
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
    position?: 'top' | 'center' | 'bottom' | 'top-left' | 'bottom-right';
  };
  watermark?: {
    src: string;
    opacity?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    scale?: number;
  };
  progressCallback?: (progress: number) => void;
}

export interface VideoGifOptions {
  startTime: number;
  endTime: number;
  width: number;
  height: number;
  fps: number;
  quality: number; // 1 - 10
  textOverlay?: {
    text: string;
    fontSize?: number;
    fontColor?: string;
    position?: 'top' | 'center' | 'bottom';
  };
  progressCallback?: (progress: number) => void;
}

export interface GifSpeedOptions {
  speedMultiplier: number; // 0.25 to 20.0
  loopMode?: 'normal' | 'reverse' | 'boomerang';
  skipFrames?: boolean; // cut 50% frames to reduce size
  resizeScale?: number; // 0.5, 0.75, 1.0
  sampleInterval?: number; // 1 to 20
  progressCallback?: (progress: number) => void;
}

export interface StudioClipItem {
  id: string;
  type: 'image' | 'gif';
  name: string;
  src: string; // 이미지 원본 또는 GIF 첫 프레임 DataURL
  originalWidth: number;
  originalHeight: number;
  duration: number; // 지속 시간 (초, 예: 1.0)
  frames?: GifFrameItem[]; // GIF 프레임 목록 (GIF인 경우 필수)
  trimStart: number; // 0-indexed 시작 프레임
  trimEnd: number; // 0-indexed 끝 프레임 (inclusive)
  speedMultiplier: number; // 0.25 to 10.0 배속
  loopMode: 'normal' | 'reverse' | 'boomerang';
  repeatCount: number; // 1 ~ 10회 반복
  skipFrames: boolean; // 50% 프레임 건너뛰기 (압축)
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  filter: string; // 'none' | 'grayscale' | 'sepia' | 'vintage' | 'cyberpunk' | 'invert' | 'warm' | 'cool'
}

export interface StudioTextItem {
  id: string;
  text: string;
  startTime: number; // 시작 시간 (초, 예: 0.0)
  duration: number; // 지속 시간 (초, 예: 2.0)
  fontSize?: number;
  fontColor?: string;
  fontBgColor?: string;
  fontFamily?: string;
  position?: 'top' | 'center' | 'bottom' | 'top-left' | 'bottom-right';
  xPercent?: number; // 0 ~ 100 (%) (기본값: 50)
  yPercent?: number; // 0 ~ 100 (%) (기본값: 85)
}

export interface StudioCreateOptions {
  clips: StudioClipItem[];
  textClips?: StudioTextItem[];
  width: number;
  height: number;
  fitMode?: 'contain' | 'cover' | 'stretch' | 'fill';
  bgColor?: string;
  fps?: number; // 1 to 30
  sampleInterval?: number; // 1 to 20
  globalLoopMode?: 'normal' | 'reverse' | 'boomerang';
  textOverlay?: {
    text: string;
    fontSize?: number;
    fontColor?: string;
    fontBgColor?: string;
    fontFamily?: string;
    position?: 'top' | 'center' | 'bottom' | 'top-left' | 'bottom-right';
    xPercent?: number;
    yPercent?: number;
    applyScope?: 'all' | 'selected';
    selectedClipId?: string | null;
  };
  progressCallback?: (progress: number) => void;
}

export interface GifMergeClipItem {
  id: string;
  filename: string;
  originalWidth: number;
  originalHeight: number;
  frames: GifFrameItem[];
  // Per-clip controls
  trimStart: number; // 0-indexed start frame
  trimEnd: number; // 0-indexed end frame (inclusive)
  speedMultiplier: number; // 0.25 to 20.0
  loopMode: 'normal' | 'reverse' | 'boomerang';
  repeatCount: number; // 1, 2, 3, etc.
  skipFrames: boolean; // 50% compression
}

export interface GifMergeOptions {
  clips: GifMergeClipItem[];
  resolutionMode?: 'first' | 'max' | 'min' | 'custom';
  customWidth?: number;
  customHeight?: number;
  fitMode?: 'contain' | 'cover' | 'fill';
  bgColor?: string;
  sampleInterval?: number;
  progressCallback?: (progress: number) => void;
}

// ----------------------------------------------------------------------

/**
 * Helper to download Blob file
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Helper to download DataURL file
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Helper to format file size in human readable form
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Helper to calculate byte size from base64 dataURL
 */
export function getDataUrlByteSize(dataUrl: string): number {
  if (!dataUrl) return 0;
  const raw = dataUrl.startsWith('data:') ? dataUrl.split(',')[1] || '' : dataUrl;
  return Math.round((raw.length * 3) / 4);
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
export async function extractGifFrames(file: File | Blob): Promise<{
  width: number;
  height: number;
  frames: GifFrameItem[];
  totalDuration: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const gif = parseGIF(arrayBuffer);
  const decompressedFrames: ParsedFrame[] = decompressFrames(gif, true);

  if (!decompressedFrames || decompressedFrames.length === 0) {
    throw new Error('GIF 프레임을 디코딩할 수 없습니다.');
  }

  const width = gif.lsd.width;
  const height = gif.lsd.height;

  // Master canvas to construct full frames
  const masterCanvas = document.createElement('canvas');
  masterCanvas.width = width;
  masterCanvas.height = height;
  const masterCtx = masterCanvas.getContext('2d', { willReadFrequently: true });
  if (!masterCtx) throw new Error('Canvas Context 생성 실패');

  // Patch canvas for rendering frame patch
  const patchCanvas = document.createElement('canvas');
  const patchCtx = patchCanvas.getContext('2d');
  if (!patchCtx) throw new Error('Patch Canvas Context 생성 실패');

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
        masterCtx.clearRect(
          prevFrame.dims.left,
          prevFrame.dims.top,
          prevFrame.dims.width,
          prevFrame.dims.height
        );
      } else if (prevFrame.disposalType === 3 && tempCanvasState) {
        masterCtx.putImageData(tempCanvasState, 0, 0);
      }
    }

    if (disposalType === 3) {
      tempCanvasState = masterCtx.getImageData(0, 0, width, height);
    }

    patchCanvas.width = dims.width;
    patchCanvas.height = dims.height;
    const patchImageData = patchCtx.createImageData(dims.width, dims.height);
    patchImageData.data.set(patch);
    patchCtx.putImageData(patchImageData, 0, 0);

    masterCtx.drawImage(patchCanvas, dims.left, dims.top);

    const frameDataUrl = masterCanvas.toDataURL('image/png');
    const frameDelay = typeof delay === 'number' && delay > 0 ? delay : 100;
    totalDuration += frameDelay;

    resultFrames.push({
      id: `frame_${i}_${Date.now()}_${Math.random()}`,
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
 * Pre-process single image frame (Fit Mode, Background Fill, Filters, Text, Watermark)
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

  // 2. Setup CSS filters
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

  // 3. Fit mode calculation
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
  ctx.filter = 'none';

  // 4. Text Overlay
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

  // 5. Watermark
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
    } catch {
      // ignore watermark error
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * 1. Create GIF from Images
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

  // 1. Process each unique canvas once
  const renderedUniqueFrames: { dataUrl: string; durationSec: number }[] = [];
  const total = images.length;

  for (let i = 0; i < total; i += 1) {
    const item = images[i];
    const frameDataUrl = await processSingleFrameCanvas(item.src, width, height, options);

    // Determine duration in seconds: item.duration -> item.delay (ms) -> 1 / fps
    let durationSec = 1.0;
    if (typeof item.duration === 'number' && item.duration > 0) {
      durationSec = item.duration;
    } else if (typeof item.delay === 'number' && item.delay > 0) {
      durationSec = item.delay / 1000;
    } else if (fps > 0) {
      durationSec = 1 / fps;
    }

    renderedUniqueFrames.push({
      dataUrl: frameDataUrl,
      durationSec,
    });

    if (progressCallback) {
      progressCallback(Math.round(((i + 1) / total) * 35));
    }
  }

  // 2. Determine base tick interval (T_tick) to avoid excessive frames while keeping exact relative durations
  const totalDurationSec = renderedUniqueFrames.reduce((acc, f) => acc + f.durationSec, 0);

  // Target base tick:
  // e.g. <= 5s: 0.05s (20 fps, 50ms)
  // <= 12s: 0.08s (12.5 fps, 80ms)
  // <= 25s: 0.10s (10 fps, 100ms)
  // > 25s: 0.15s (~6.7 fps, 150ms)
  let baseTickSec = 0.05;
  if (totalDurationSec > 25) {
    baseTickSec = 0.15;
  } else if (totalDurationSec > 12) {
    baseTickSec = 0.1;
  } else if (totalDurationSec > 5) {
    baseTickSec = 0.08;
  }

  // Expand frames based on duration
  let expandedFrames: string[] = [];
  for (let i = 0; i < renderedUniqueFrames.length; i += 1) {
    const item = renderedUniqueFrames[i];
    const repeatCount = Math.max(1, Math.round(item.durationSec / baseTickSec));
    for (let k = 0; k < repeatCount; k += 1) {
      expandedFrames.push(item.dataUrl);
    }
  }

  if (expandedFrames.length === 0) {
    expandedFrames = renderedUniqueFrames.map((f) => f.dataUrl);
  }

  // 3. Loop mode direction
  if (loopMode === 'reverse') {
    expandedFrames.reverse();
  } else if (loopMode === 'boomerang') {
    const reversedCopy = [...expandedFrames].reverse().slice(1, -1);
    expandedFrames = [...expandedFrames, ...reversedCopy];
  }

  return new Promise((resolve, reject) => {
    gifshot.createGIF(
      {
        images: expandedFrames,
        gifWidth: width,
        gifHeight: height,
        interval: baseTickSec,
        sampleInterval,
        numWorkers: 2,
        progressCallback: (captureProgress: number) => {
          if (progressCallback) {
            progressCallback(35 + Math.round(captureProgress * 65));
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
 * 2. Convert Video Segment to GIF
 */
export async function convertVideoSegmentToGif(
  videoSourceUrl: string,
  options: VideoGifOptions,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.src = videoSourceUrl;

    video.onloadedmetadata = async () => {
      try {
        const { startTime, endTime, width, height, fps, quality, textOverlay } = options;
        const duration = Math.max(0.2, endTime - startTime);
        const totalFrames = Math.max(2, Math.floor(duration * fps));
        const frameInterval = duration / totalFrames;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas Context 생성 실패');
        }

        const frames: string[] = [];

        const seekToTime = (time: number): Promise<void> =>
          new Promise((res) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              res();
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = time;
          });

        for (let i = 0; i < totalFrames; i += 1) {
          const t = Math.min(video.duration || endTime, startTime + i * frameInterval);
          await seekToTime(t);

          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(video, 0, 0, width, height);

          // Draw text overlay if requested
          if (textOverlay && textOverlay.text) {
            const fontSize = textOverlay.fontSize || Math.round(height * 0.08);
            const color = textOverlay.fontColor || '#ffffff';
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = Math.max(2, Math.round(fontSize / 10));

            const tx = width / 2;
            let ty = height - fontSize;
            if (textOverlay.position === 'top') ty = fontSize * 1.2;
            else if (textOverlay.position === 'center') ty = height / 2 + fontSize / 3;

            ctx.strokeText(textOverlay.text, tx, ty);
            ctx.fillText(textOverlay.text, tx, ty);
          }

          frames.push(canvas.toDataURL('image/png'));

          const captureProg = Math.round(((i + 1) / totalFrames) * 50);
          if (onProgress) onProgress(captureProg);
          if (options.progressCallback) options.progressCallback(captureProg);
        }

        gifshot.createGIF(
          {
            images: frames,
            gifWidth: width,
            gifHeight: height,
            interval: 1 / fps,
            sampleInterval: Math.max(1, 11 - quality),
            numWorkers: 2,
            progressCallback: (encProgress: number) => {
              const totalProg = 50 + Math.round(encProgress * 50);
              if (onProgress) onProgress(totalProg);
              if (options.progressCallback) options.progressCallback(totalProg);
            },
          },
          (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => {
            if (obj.error) {
              reject(new Error(obj.errorMsg || obj.errorCode || 'GIF 변환 중 오류 발생'));
            } else {
              resolve(obj.image);
            }
          }
        );
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () => {
      reject(new Error('동영상 파일을 로드할 수 없습니다.'));
    };
  });
}

/**
 * 3. Export Frames to ZIP
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

/**
 * 4. Modify GIF Background Color / Chroma Key Transparency
 */
export async function modifyGifBackgroundColor(
  file: File | Blob,
  newBgColor: string,
  replaceColor?: string,
  tolerance: number = 20,
  progressCallback?: (progress: number) => void
): Promise<string> {
  const extracted = await extractGifFrames(file);
  const { width, height, frames } = extracted;

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

    if (newBgRgb) {
      ctx.fillStyle = newBgColor;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0);

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
          const dist = Math.sqrt(
            (r - targetRgb.r) ** 2 + (g - targetRgb.g) ** 2 + (b - targetRgb.b) ** 2
          );
          if (dist <= tolerance) {
            shouldReplace = true;
          }
        } else if (a < 50) {
          shouldReplace = true;
        }

        if (shouldReplace) {
          if (newBgColor === 'transparent') {
            data[i + 3] = 0;
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
 * 5. Adjust GIF Playback Speed, Reverse & Size Optimize
 */
export async function adjustGifSpeedAndReverse(
  file: File | Blob,
  options: GifSpeedOptions
): Promise<string> {
  const {
    speedMultiplier = 1.0,
    loopMode = 'normal',
    skipFrames = false,
    resizeScale = 1.0,
    sampleInterval = 10,
    progressCallback,
  } = options;

  const extracted = await extractGifFrames(file);
  const { width, height } = extracted;
  let { frames } = extracted;

  if (frames.length === 0) {
    throw new Error('프레임이 존재하지 않습니다.');
  }

  // 1. Frame skipping for compression (if requested manually)
  if (skipFrames && frames.length > 4) {
    frames = frames.filter((_, idx) => idx % 2 === 0);
  }

  // 2. Loop mode direction (base frame sequence)
  let baseSequence = [...frames];
  if (loopMode === 'reverse') {
    baseSequence.reverse();
  } else if (loopMode === 'boomerang') {
    const reversedCopy = [...baseSequence].reverse().slice(1, -1);
    baseSequence = [...baseSequence, ...reversedCopy];
  }

  // 3. Calculate total timeline duration of the sequence in milliseconds
  const totalSeqDurationMs = baseSequence.reduce((acc, f) => acc + (f.delay || 100), 0);

  // Target total playback duration for the speed-adjusted GIF
  const targetDurationMs = totalSeqDurationMs / Math.max(0.1, speedMultiplier);

  // Safe minimum frame interval for GIF format across all browsers: 30ms (0.03s, ~33.3 fps)
  // Note: All browsers (Chrome, Edge, Safari, Firefox) clamp frame delay <= 10ms to 100ms (10fps).
  // 30ms (0.03s) is universally supported and never clamped by browsers.
  const safeMinIntervalMs = 30;

  let framesToEncode: GifFrameItem[] = [];
  let finalIntervalSec = 0.03;

  const rawFrameIntervalMs = targetDurationMs / baseSequence.length;

  if (rawFrameIntervalMs >= safeMinIntervalMs) {
    // Normal / Slow / Moderate speed: keep all frames and scale the interval
    framesToEncode = baseSequence;
    const centiseconds = Math.max(3, Math.round(rawFrameIntervalMs / 10));
    finalIntervalSec = centiseconds / 100;
  } else {
    // High speed (e.g. 3x, 5x, 10x, 20x):
    // Subsample frames evenly so every output frame maintains a safe 30ms interval
    const targetFrameCount = Math.max(2, Math.round(targetDurationMs / safeMinIntervalMs));

    const sampled: GifFrameItem[] = [];
    for (let k = 0; k < targetFrameCount; k += 1) {
      const srcIdx = Math.min(
        baseSequence.length - 1,
        Math.floor((k / targetFrameCount) * baseSequence.length)
      );
      sampled.push(baseSequence[srcIdx]);
    }
    framesToEncode = sampled;
    finalIntervalSec = 0.03; // 30ms (33.3fps)
  }

  // 4. Rescaling & Canvas Preparation
  const outWidth = Math.max(16, Math.round(width * resizeScale));
  const outHeight = Math.max(16, Math.round(height * resizeScale));

  const processedImages: string[] = [];

  for (let i = 0; i < framesToEncode.length; i += 1) {
    const f = framesToEncode[i];
    if (resizeScale !== 1.0) {
      const img = await loadImage(f.dataUrl);
      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, outWidth, outHeight);
        processedImages.push(canvas.toDataURL('image/png'));
      } else {
        processedImages.push(f.dataUrl);
      }
    } else {
      processedImages.push(f.dataUrl);
    }

    if (progressCallback) {
      progressCallback(Math.round(((i + 1) / framesToEncode.length) * 40));
    }
  }

  return new Promise((resolve, reject) => {
    gifshot.createGIF(
      {
        images: processedImages,
        gifWidth: outWidth,
        gifHeight: outHeight,
        interval: finalIntervalSec,
        sampleInterval,
        numWorkers: 2,
        progressCallback: (prog: number) => {
          if (progressCallback) {
            progressCallback(40 + Math.round(prog * 60));
          }
        },
      },
      (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => {
        if (obj.error) {
          reject(
            new Error(obj.errorMsg || obj.errorCode || 'GIF 재인코딩 중 오류가 발생했습니다.')
          );
        } else {
          resolve(obj.image);
        }
      }
    );
  });
}

// ----------------------------------------------------------------------

export type SupportedVideoFormat = 'mp4' | 'avi' | 'webm' | 'mov' | 'mkv';

export interface GifToVideoOptions {
  targetFormat: SupportedVideoFormat;
  fps?: number; // default 30
  scale?: number; // default 1.0 (0.1 ~ 5.0)
  bgColor?: string; // e.g. '#ffffff' or 'transparent'
  speedMultiplier?: number; // 0.1x to 10.0x
  bitrate?: number; // bits per second, default 2500000 (2.5Mbps)
  progressCallback?: (progress: number) => void;
}

export interface GifToVideoResult {
  videoUrl: string;
  blob: Blob;
  mimeType: string;
  format: SupportedVideoFormat;
  filename: string;
  width: number;
  height: number;
  duration: number;
  size: number;
  speedMultiplier: number;
}

/**
 * Pure JS RIFF AVI (Motion JPEG) File Builder
 */
export function buildAviFileFromJpegChunks(
  jpegChunks: Uint8Array[],
  width: number,
  height: number,
  fps: number
): Blob {
  const numFrames = jpegChunks.length;
  const usPerFrame = Math.round(1000000 / fps);

  // Each movi entry is: '00dc' (4) + size (4) + jpegBytes + (optional 1 byte pad if odd size)
  let moviDataSize = 4; // for 'movi' fourcc
  const framePaddedSizes: number[] = [];
  for (let i = 0; i < numFrames; i += 1) {
    const rawLen = jpegChunks[i].length;
    const pad = rawLen % 2 === 1 ? 1 : 0;
    const chunkTotal = 8 + rawLen + pad;
    moviDataSize += chunkTotal;
    framePaddedSizes.push(chunkTotal);
  }

  // idx1 size: 4 ('idx1') + 4 (size) + 16 * numFrames
  const idx1DataSize = 16 * numFrames;
  const idx1ChunkSize = 8 + idx1DataSize;

  // Header sizes:
  // avih: 8 + 56 = 64
  // strl list: 8 + 4 ('strl') + (8+56 for strh) + (8+40 for strf) = 124
  // hdrl list: 8 + 4 ('hdrl') + 64 (avih) + 124 (strl) = 200
  // movi list: 8 + moviDataSize
  // Total RIFF size = 4 ('AVI ') + 200 (hdrl list) + (8 + moviDataSize) + idx1ChunkSize
  const riffPayloadSize = 4 + 200 + (8 + moviDataSize) + idx1ChunkSize;
  const totalFileSize = 8 + riffPayloadSize;

  const buffer = new ArrayBuffer(totalFileSize);
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);

  let offset = 0;

  const writeFourCC = (str: string) => {
    for (let i = 0; i < 4; i += 1) {
      u8[offset] = str.charCodeAt(i);
      offset += 1;
    }
  };

  const writeUint32LE = (val: number) => {
    view.setUint32(offset, val, true);
    offset += 4;
  };

  const writeUint16LE = (val: number) => {
    view.setUint16(offset, val, true);
    offset += 2;
  };

  // --- RIFF Header ---
  writeFourCC('RIFF');
  writeUint32LE(riffPayloadSize);
  writeFourCC('AVI ');

  // --- LIST hdrl ---
  writeFourCC('LIST');
  writeUint32LE(192); // 4 + 64 + 124
  writeFourCC('hdrl');

  // --- avih Chunk (Main Header) ---
  writeFourCC('avih');
  writeUint32LE(56); // size
  writeUint32LE(usPerFrame); // dwMicroSecPerFrame
  writeUint32LE(width * height * 3 * fps); // dwMaxBytesPerSec
  writeUint32LE(0); // dwPaddingGranularity
  writeUint32LE(0x10); // dwFlags (AVIF_HASINDEX = 0x10)
  writeUint32LE(numFrames); // dwTotalFrames
  writeUint32LE(0); // dwInitialFrames
  writeUint32LE(1); // dwStreams
  writeUint32LE(width * height * 3); // dwSuggestedBufferSize
  writeUint32LE(width); // dwWidth
  writeUint32LE(height); // dwHeight
  writeUint32LE(0); // dwReserved[0]
  writeUint32LE(0); // dwReserved[1]
  writeUint32LE(0); // dwReserved[2]
  writeUint32LE(0); // dwReserved[3]

  // --- LIST strl ---
  writeFourCC('LIST');
  writeUint32LE(116); // 4 + (8+56) + (8+40) = 116
  writeFourCC('strl');

  // --- strh Chunk (Stream Header) ---
  writeFourCC('strh');
  writeUint32LE(56);
  writeFourCC('vids'); // fccType
  writeFourCC('MJPG'); // fccHandler
  writeUint32LE(0); // dwFlags
  writeUint16LE(0); // wPriority
  writeUint16LE(0); // wLanguage
  writeUint32LE(0); // dwInitialFrames
  writeUint32LE(1000); // dwScale
  writeUint32LE(Math.round(fps * 1000)); // dwRate
  writeUint32LE(0); // dwStart
  writeUint32LE(numFrames); // dwLength
  writeUint32LE(width * height * 3); // dwSuggestedBufferSize
  writeUint32LE(-1); // dwQuality (-1 default)
  writeUint32LE(0); // dwSampleSize
  writeUint16LE(0); // rcFrame.left
  writeUint16LE(0); // rcFrame.top
  writeUint16LE(width); // rcFrame.right
  writeUint16LE(height); // rcFrame.bottom

  // --- strf Chunk (Stream Format: BITMAPINFOHEADER) ---
  writeFourCC('strf');
  writeUint32LE(40);
  writeUint32LE(40); // biSize
  writeUint32LE(width); // biWidth
  writeUint32LE(height); // biHeight
  writeUint16LE(1); // biPlanes
  writeUint16LE(24); // biBitCount
  writeFourCC('MJPG'); // biCompression ('MJPG')
  writeUint32LE(width * height * 3); // biSizeImage
  writeUint32LE(0); // biXPelsPerMeter
  writeUint32LE(0); // biYPelsPerMeter
  writeUint32LE(0); // biClrUsed
  writeUint32LE(0); // biClrImportant

  // --- LIST movi ---
  writeFourCC('LIST');
  writeUint32LE(moviDataSize);
  const moviOffsetBeforeFourCC = offset;
  writeFourCC('movi');

  const indexOffsets: number[] = [];
  const indexSizes: number[] = [];

  for (let i = 0; i < numFrames; i += 1) {
    const chunkRelOffset = offset - moviOffsetBeforeFourCC;
    indexOffsets.push(chunkRelOffset);
    const jpegBytes = jpegChunks[i];
    const len = jpegBytes.length;
    indexSizes.push(len);

    writeFourCC('00dc');
    writeUint32LE(len);
    u8.set(jpegBytes, offset);
    offset += len;

    if (len % 2 === 1) {
      u8[offset] = 0; // 1 byte padding for word boundary
      offset += 1;
    }
  }

  // --- idx1 Chunk (Index Table) ---
  writeFourCC('idx1');
  writeUint32LE(idx1DataSize);
  for (let i = 0; i < numFrames; i += 1) {
    writeFourCC('00dc');
    writeUint32LE(0x10); // AVIIF_KEYFRAME
    writeUint32LE(indexOffsets[i]); // Offset relative to 'movi' fourcc
    writeUint32LE(indexSizes[i]);
  }

  return new Blob([buffer], { type: 'video/x-msvideo' });
}

/**
 * 6. Convert Animated GIF to Multi-Format Video (MP4 / AVI / WebM / MOV / MKV)
 */
export async function convertGifToVideo(
  file: File | Blob,
  options: GifToVideoOptions = { targetFormat: 'mp4' }
): Promise<GifToVideoResult> {
  const {
    targetFormat = 'mp4',
    fps = 30,
    bgColor = '#ffffff',
    speedMultiplier = 1.0,
    scale = 1.0,
    bitrate = 6000000,
    progressCallback,
  } = options;

  const extracted = await extractGifFrames(file);
  const { width: origWidth, height: origHeight, frames } = extracted;

  if (!frames || frames.length === 0) {
    throw new Error('GIF 프레임을 디코딩할 수 없습니다.');
  }

  // Ensure even dimensions for video codecs
  let outWidth = Math.round(origWidth * scale);
  let outHeight = Math.round(origHeight * scale);
  if (outWidth % 2 !== 0) outWidth += 1;
  if (outHeight % 2 !== 0) outHeight += 1;

  // Preload all frame images
  const loadedImages: HTMLImageElement[] = [];
  for (let i = 0; i < frames.length; i += 1) {
    const img = await loadImage(frames[i].dataUrl);
    loadedImages.push(img);
    if (progressCallback) {
      progressCallback(Math.round(((i + 1) / frames.length) * 15)); // 0~15%
    }
  }

  // Build cumulative timeline for original GIF frames
  const frameCumulativeTimes: number[] = [];
  let cumMs = 0;
  for (let i = 0; i < frames.length; i += 1) {
    frameCumulativeTimes.push(cumMs);
    cumMs += Math.max(10, frames[i].delay || 100);
  }
  const totalGifDurationMs = cumMs; // Total duration of 1 loop in ms

  // Calculate speed-adjusted durations
  const singleLoopDurationMs = totalGifDurationMs / Math.max(0.01, speedMultiplier);
  let calculatedLoops = 1;

  // Prevent codec failure on impossibly short videos (under 0.5s) at high speed
  if (singleLoopDurationMs < 500 && speedMultiplier > 1.5) {
    calculatedLoops = Math.max(1, Math.ceil(500 / singleLoopDurationMs));
  }

  const totalVideoDurationMs = singleLoopDurationMs * calculatedLoops;
  const totalVideoDurationSec = totalVideoDurationMs / 1000;

  // Helper to find frame index at a given elapsed video time (in ms)
  const getFrameIndexAtVideoTime = (videoTimeMs: number): number => {
    const loopTimeMs = videoTimeMs % singleLoopDurationMs;
    const origTimeMs = loopTimeMs * speedMultiplier;
    for (let i = frames.length - 1; i >= 0; i -= 1) {
      if (origTimeMs >= frameCumulativeTimes[i]) {
        return i;
      }
    }
    return 0;
  };

  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas Context 생성 실패');

  const drawFrame = (frameIdx: number) => {
    if (bgColor && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, outWidth, outHeight);
    } else {
      ctx.clearRect(0, 0, outWidth, outHeight);
    }
    ctx.drawImage(loadedImages[frameIdx], 0, 0, outWidth, outHeight);
  };

  // Video frame settings
  const targetFps = Math.max(15, Math.min(60, fps));
  const totalVideoFrames = Math.max(1, Math.round((totalVideoDurationMs / 1000) * targetFps));

  // ========================================================
  // SPECIAL CASE: AVI (Motion-JPEG RIFF Video Builder)
  // ========================================================
  if (targetFormat === 'avi') {
    const jpegBuffers: Uint8Array[] = [];

    for (let f = 0; f < totalVideoFrames; f += 1) {
      const videoTimeMs = (f / targetFps) * 1000;
      const frameIdx = getFrameIndexAtVideoTime(videoTimeMs);
      drawFrame(frameIdx);

      // Convert canvas to JPEG Data
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const base64 = jpegDataUrl.split(',')[1];
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let b = 0; b < binaryStr.length; b += 1) {
        bytes[b] = binaryStr.charCodeAt(b);
      }
      jpegBuffers.push(bytes);

      if (progressCallback) {
        progressCallback(15 + Math.round(((f + 1) / totalVideoFrames) * 80)); // 15~95%
      }
    }

    const aviBlob = buildAviFileFromJpegChunks(jpegBuffers, outWidth, outHeight, targetFps);
    const videoUrl = URL.createObjectURL(aviBlob);

    if (progressCallback) progressCallback(100);

    return {
      videoUrl,
      blob: aviBlob,
      mimeType: 'video/x-msvideo',
      format: 'avi',
      filename: `gif_converted_${Date.now()}.avi`,
      width: outWidth,
      height: outHeight,
      duration: totalVideoDurationSec,
      size: aviBlob.size,
      speedMultiplier,
    };
  }

  // ========================================================
  // MEDIA RECORDER FORMATS (MP4 / WebM / MOV / MKV)
  // ========================================================
  let chosenMime = '';
  const actualExt: SupportedVideoFormat = targetFormat;

  if (targetFormat === 'mp4' || targetFormat === 'mov') {
    const mp4Mimes = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1',
      'video/mp4;codecs=h264',
      'video/mp4',
      'video/quicktime',
    ];
    for (const m of mp4Mimes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
        chosenMime = m;
        break;
      }
    }
  }

  if (!chosenMime) {
    const webmMimes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (const m of webmMimes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
        chosenMime = m;
        break;
      }
    }
  }

  const stream = canvas.captureStream(targetFps);
  const recorderOptions: MediaRecorderOptions = {
    videoBitsPerSecond: bitrate,
  };
  if (chosenMime) {
    recorderOptions.mimeType = chosenMime;
  }

  const recorder = new MediaRecorder(stream, recorderOptions);
  const recordedChunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  // Initial draw
  drawFrame(0);

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const finalBlob = new Blob(recordedChunks, {
          type: chosenMime || (targetFormat === 'mp4' ? 'video/mp4' : 'video/webm'),
        });
        const videoUrl = URL.createObjectURL(finalBlob);

        resolve({
          videoUrl,
          blob: finalBlob,
          mimeType: chosenMime || 'video/mp4',
          format: actualExt,
          filename: `gif_converted_${Date.now()}.${actualExt}`,
          width: outWidth,
          height: outHeight,
          duration: totalVideoDurationSec,
          size: finalBlob.size,
          speedMultiplier,
        });
      } catch (err) {
        reject(err);
      }
    };

    recorder.start(); // Start without small chunks to minimize encoder overhead

    const playLoop = async () => {
      try {
        // Let encoder initialize
        await new Promise((res) => setTimeout(res, 100));

        const startTime = performance.now();
        let frameCount = 0;

        const drawNextFrame = () => {
          const actualElapsed = performance.now() - startTime;
          const videoTimeMs = actualElapsed;

          // STRICT DEADLINE: Absolute prevention of timeline stretching (slow-mo bug)
          if (videoTimeMs >= totalVideoDurationMs) {
            setTimeout(() => {
              if (recorder.state !== 'inactive') {
                recorder.stop();
              }
            }, 50);
            return;
          }

          const frameIdx = getFrameIndexAtVideoTime(videoTimeMs);
          drawFrame(frameIdx);

          if (progressCallback && frameCount % 3 === 0) {
            const pct = Math.min(100, (videoTimeMs / totalVideoDurationMs) * 100);
            progressCallback(15 + Math.round(pct * 0.8)); // 15~95%
          }

          frameCount += 1;
          requestAnimationFrame(drawNextFrame);
        };

        requestAnimationFrame(drawNextFrame);
      } catch (err) {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
        reject(err);
      }
    };

    playLoop();
  });
}

/**
 * 7. Merge Multiple Animated GIFs with per-clip Trimming, Speed, Reverse & Looping
 */
export async function mergeGifs(options: GifMergeOptions): Promise<string> {
  const {
    clips,
    resolutionMode = 'first',
    customWidth,
    customHeight,
    fitMode = 'contain',
    bgColor = '#ffffff',
    sampleInterval = 10,
    progressCallback,
  } = options;

  if (!clips || clips.length === 0) {
    throw new Error('합칠 GIF 클립이 최소 1개 이상 필요합니다.');
  }

  // 1. Calculate target canvas output dimensions
  let outWidth = 320;
  let outHeight = 240;

  if (resolutionMode === 'first' && clips[0]) {
    outWidth = clips[0].originalWidth || 320;
    outHeight = clips[0].originalHeight || 240;
  } else if (resolutionMode === 'max') {
    outWidth = Math.max(...clips.map((c) => c.originalWidth || 320));
    outHeight = Math.max(...clips.map((c) => c.originalHeight || 240));
  } else if (resolutionMode === 'min') {
    outWidth = Math.min(...clips.map((c) => c.originalWidth || 320));
    outHeight = Math.min(...clips.map((c) => c.originalHeight || 240));
  } else if (resolutionMode === 'custom' && customWidth && customHeight) {
    outWidth = customWidth;
    outHeight = customHeight;
  }

  // Ensure even dimensions
  if (outWidth % 2 !== 0) outWidth += 1;
  if (outHeight % 2 !== 0) outHeight += 1;
  outWidth = Math.max(16, outWidth);
  outHeight = Math.max(16, outHeight);

  // 2. Prepare processed sequence of frames for each clip
  interface OutputFrameSpec {
    dataUrl: string;
    delay: number;
  }

  const allOutputFrames: OutputFrameSpec[] = [];
  const safeMinIntervalMs = 30; // 30ms (~33.3 fps)

  for (let cIdx = 0; cIdx < clips.length; cIdx += 1) {
    const clip = clips[cIdx];
    if (!clip.frames || clip.frames.length === 0) continue;

    // A. Trimming
    const start = Math.max(0, Math.min(clip.trimStart ?? 0, clip.frames.length - 1));
    const end = Math.max(
      start,
      Math.min(clip.trimEnd ?? clip.frames.length - 1, clip.frames.length - 1)
    );
    let clipFrames = clip.frames.slice(start, end + 1);
    if (clipFrames.length === 0) clipFrames = [clip.frames[0]];

    // B. Frame Skipping (50% compression)
    if (clip.skipFrames && clipFrames.length > 4) {
      clipFrames = clipFrames.filter((_, idx) => idx % 2 === 0);
    }

    // C. Loop Mode Direction
    let sequence = [...clipFrames];
    if (clip.loopMode === 'reverse') {
      sequence.reverse();
    } else if (clip.loopMode === 'boomerang') {
      const rev = [...sequence].reverse().slice(1, -1);
      sequence = [...sequence, ...rev];
    }

    // D. Repeat Count
    const repeats = Math.max(1, Math.min(10, clip.repeatCount || 1));
    let repeatedSequence: GifFrameItem[] = [];
    for (let r = 0; r < repeats; r += 1) {
      repeatedSequence = repeatedSequence.concat(sequence);
    }

    // E. Speed adjustment with safe intervals
    const totalClipDurationMs = repeatedSequence.reduce((acc, f) => acc + (f.delay || 100), 0);
    const speed = Math.max(0.1, clip.speedMultiplier || 1.0);
    const targetClipDurationMs = totalClipDurationMs / speed;
    const rawIntervalMs = targetClipDurationMs / repeatedSequence.length;

    if (rawIntervalMs >= safeMinIntervalMs) {
      const centisec = Math.max(3, Math.round(rawIntervalMs / 10));
      for (const f of repeatedSequence) {
        allOutputFrames.push({ dataUrl: f.dataUrl, delay: centisec * 10 });
      }
    } else {
      const targetCount = Math.max(2, Math.round(targetClipDurationMs / safeMinIntervalMs));
      for (let k = 0; k < targetCount; k += 1) {
        const srcIdx = Math.min(
          repeatedSequence.length - 1,
          Math.floor((k / targetCount) * repeatedSequence.length)
        );
        allOutputFrames.push({
          dataUrl: repeatedSequence[srcIdx].dataUrl,
          delay: safeMinIntervalMs,
        });
      }
    }

    if (progressCallback) {
      progressCallback(Math.round(((cIdx + 1) / clips.length) * 20)); // 0~20%
    }
  }

  if (allOutputFrames.length === 0) {
    throw new Error('합칠 프레임이 없습니다.');
  }

  // 3. Render all frames to target canvas with fitMode
  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D Context를 생성할 수 없습니다.');

  const renderedImageUrls: string[] = [];

  for (let i = 0; i < allOutputFrames.length; i += 1) {
    const frameSpec = allOutputFrames[i];
    const img = await loadImage(frameSpec.dataUrl);

    // Background fill
    if (bgColor && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, outWidth, outHeight);
    } else {
      ctx.clearRect(0, 0, outWidth, outHeight);
    }

    // Draw with fit mode
    if (fitMode === 'fill') {
      ctx.drawImage(img, 0, 0, outWidth, outHeight);
    } else if (fitMode === 'cover') {
      const imgRatio = img.width / img.height;
      const targetRatio = outWidth / outHeight;
      let sWidth = img.width;
      let sHeight = img.height;
      let sx = 0;
      let sy = 0;

      if (imgRatio > targetRatio) {
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / targetRatio;
        sy = (img.height - sHeight) / 2;
      }
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outWidth, outHeight);
    } else {
      // contain (default)
      const scale = Math.min(outWidth / img.width, outHeight / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (outWidth - dw) / 2;
      const dy = (outHeight - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    renderedImageUrls.push(canvas.toDataURL('image/png'));

    if (progressCallback) {
      progressCallback(20 + Math.round(((i + 1) / allOutputFrames.length) * 40)); // 20~60%
    }
  }

  // 4. Calculate average interval in seconds
  const avgDelayMs = allOutputFrames.reduce((acc, f) => acc + f.delay, 0) / allOutputFrames.length;
  const finalIntervalSec = Math.max(0.03, Math.round(avgDelayMs / 10) / 100);

  return new Promise((resolve, reject) => {
    gifshot.createGIF(
      {
        images: renderedImageUrls,
        gifWidth: outWidth,
        gifHeight: outHeight,
        interval: finalIntervalSec,
        sampleInterval,
        numWorkers: 2,
        progressCallback: (prog: number) => {
          if (progressCallback) {
            progressCallback(60 + Math.round(prog * 40)); // 60~100%
          }
        },
      },
      (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => {
        if (obj.error) {
          reject(
            new Error(obj.errorMsg || obj.errorCode || 'GIF 합치기 인코딩 중 오류가 발생했습니다.')
          );
        } else {
          resolve(obj.image);
        }
      }
    );
  });
}

// ----------------------------------------------------------------------

/**
 * 8. Filmora-style Studio GIF Creator: Unified Multi-Clip (Image + GIF) Renderer & Encoder
 */
export async function createStudioGif(options: StudioCreateOptions): Promise<string> {
  const {
    clips,
    width,
    height,
    fitMode = 'contain',
    bgColor = 'transparent',
    fps = 10,
    sampleInterval = 10,
    globalLoopMode = 'normal',
    textOverlay,
    progressCallback,
  } = options;

  if (!clips || clips.length === 0) {
    throw new Error('인코딩할 미디어 클립이 최소 1개 이상 필요합니다.');
  }

  // 1. Build Flattened Output Frame Specifications
  interface StudioFrameSpec {
    clipId: string;
    rawSrc: string;
    delayMs: number;
    rotation: number;
    flipH: boolean;
    flipV: boolean;
    filter: string;
  }

  const allFrames: StudioFrameSpec[] = [];
  const safeMinIntervalMs = 30; // 30ms (~33.3 fps max safe GIF rate)
  const defaultImageTickMs = Math.max(50, Math.round(1000 / Math.max(1, fps)));

  for (let cIdx = 0; cIdx < clips.length; cIdx += 1) {
    const clip = clips[cIdx];

    if (clip.type === 'image' || !clip.frames || clip.frames.length === 0) {
      // Single Static Image Clip
      const durationSec = Math.max(0.05, clip.duration || 1.0);
      const totalDurationMs = durationSec * 1000;
      const speed = Math.max(0.1, clip.speedMultiplier || 1.0);
      const effectiveDurationMs = totalDurationMs / speed;
      const repeats = Math.max(1, clip.repeatCount || 1);

      const frameCountPerRepeat = Math.max(1, Math.round(effectiveDurationMs / defaultImageTickMs));
      const actualDelay = Math.max(
        safeMinIntervalMs,
        Math.round(effectiveDurationMs / frameCountPerRepeat)
      );

      for (let r = 0; r < repeats; r += 1) {
        for (let k = 0; k < frameCountPerRepeat; k += 1) {
          allFrames.push({
            clipId: clip.id,
            rawSrc: clip.src,
            delayMs: actualDelay,
            rotation: clip.rotation || 0,
            flipH: !!clip.flipH,
            flipV: !!clip.flipV,
            filter: clip.filter || 'none',
          });
        }
      }
    } else {
      // Animated GIF Clip
      const start = Math.max(0, Math.min(clip.trimStart ?? 0, clip.frames.length - 1));
      const end = Math.max(
        start,
        Math.min(clip.trimEnd ?? clip.frames.length - 1, clip.frames.length - 1)
      );
      let slicedFrames = clip.frames.slice(start, end + 1);
      if (slicedFrames.length === 0) slicedFrames = [clip.frames[0]];

      // Frame skipping (compression)
      if (clip.skipFrames && slicedFrames.length > 4) {
        slicedFrames = slicedFrames.filter((_, idx) => idx % 2 === 0);
      }

      // Loop direction for this clip
      let sequence = [...slicedFrames];
      if (clip.loopMode === 'reverse') {
        sequence.reverse();
      } else if (clip.loopMode === 'boomerang') {
        const rev = [...sequence].reverse().slice(1, -1);
        sequence = [...sequence, ...rev];
      }

      // Repeat count
      const repeats = Math.max(1, Math.min(10, clip.repeatCount || 1));
      let repeatedSequence: GifFrameItem[] = [];
      for (let r = 0; r < repeats; r += 1) {
        repeatedSequence = repeatedSequence.concat(sequence);
      }

      // Speed adjustment & interval calculation
      const totalClipRawDurationMs = repeatedSequence.reduce((acc, f) => acc + (f.delay || 100), 0);
      const speed = Math.max(0.1, clip.speedMultiplier || 1.0);
      const targetClipDurationMs = totalClipRawDurationMs / speed;
      const rawIntervalMs = targetClipDurationMs / repeatedSequence.length;

      if (rawIntervalMs >= safeMinIntervalMs) {
        const centisec = Math.max(3, Math.round(rawIntervalMs / 10));
        for (const f of repeatedSequence) {
          allFrames.push({
            clipId: clip.id,
            rawSrc: f.dataUrl,
            delayMs: centisec * 10,
            rotation: clip.rotation || 0,
            flipH: !!clip.flipH,
            flipV: !!clip.flipV,
            filter: clip.filter || 'none',
          });
        }
      } else {
        const targetCount = Math.max(2, Math.round(targetClipDurationMs / safeMinIntervalMs));
        for (let k = 0; k < targetCount; k += 1) {
          const srcIdx = Math.min(
            repeatedSequence.length - 1,
            Math.floor((k / targetCount) * repeatedSequence.length)
          );
          allFrames.push({
            clipId: clip.id,
            rawSrc: repeatedSequence[srcIdx].dataUrl,
            delayMs: safeMinIntervalMs,
            rotation: clip.rotation || 0,
            flipH: !!clip.flipH,
            flipV: !!clip.flipV,
            filter: clip.filter || 'none',
          });
        }
      }
    }

    if (progressCallback) {
      progressCallback(Math.round(((cIdx + 1) / clips.length) * 15)); // 0~15%
    }
  }

  if (allFrames.length === 0) {
    throw new Error('인코딩할 프레임이 생성되지 않았습니다.');
  }

  // 2. Global Sequence Direction
  let finalFramesSequence = [...allFrames];
  if (globalLoopMode === 'reverse') {
    finalFramesSequence.reverse();
  } else if (globalLoopMode === 'boomerang') {
    const rev = [...finalFramesSequence].reverse().slice(1, -1);
    finalFramesSequence = [...finalFramesSequence, ...rev];
  }

  // 3. Canvas Rendering with Transformations, Filters, and Subtitles
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D Context를 초기화할 수 없습니다.');

  const renderedImageUrls: string[] = [];
  let accumulatedTimeMs = 0;

  for (let i = 0; i < finalFramesSequence.length; i += 1) {
    const fSpec = finalFramesSequence[i];
    const frameTimeSec = accumulatedTimeMs / 1000;
    accumulatedTimeMs += fSpec.delayMs;

    const img = await loadImage(fSpec.rawSrc);

    ctx.save();

    // A. Background
    if (bgColor && bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    // B. CSS Filter String
    let filterStr = '';
    if (fSpec.filter === 'grayscale') filterStr = 'grayscale(100%)';
    else if (fSpec.filter === 'sepia') filterStr = 'sepia(80%)';
    else if (fSpec.filter === 'vintage') filterStr = 'sepia(50%) contrast(120%)';
    else if (fSpec.filter === 'cyberpunk') filterStr = 'hue-rotate(180deg) saturate(180%)';
    else if (fSpec.filter === 'invert') filterStr = 'invert(100%)';
    else if (fSpec.filter === 'warm') filterStr = 'sepia(30%) saturate(140%)';
    else if (fSpec.filter === 'cool') filterStr = 'hue-rotate(190deg) saturate(120%)';
    ctx.filter = filterStr || 'none';

    // C. Rotation & Flip Transformations around Center
    ctx.translate(width / 2, height / 2);
    if (fSpec.rotation) {
      ctx.rotate((fSpec.rotation * Math.PI) / 180);
    }
    const scaleX = fSpec.flipH ? -1 : 1;
    const scaleY = fSpec.flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    // D. Fit Mode Calculation (drawing centered)
    let dw = width;
    let dh = height;
    let dx = -width / 2;
    let dy = -height / 2;

    if (fitMode === 'stretch' || fitMode === 'fill') {
      dw = width;
      dh = height;
      dx = -width / 2;
      dy = -height / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else if (fitMode === 'cover') {
      const imgRatio = img.width / img.height;
      const targetRatio = width / height;
      let sWidth = img.width;
      let sHeight = img.height;
      let sx = 0;
      let sy = 0;
      if (imgRatio > targetRatio) {
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / targetRatio;
        sy = (img.height - sHeight) / 2;
      }
      ctx.drawImage(img, sx, sy, sWidth, sHeight, -width / 2, -height / 2, width, height);
    } else {
      // contain (default)
      const scale = Math.min(width / img.width, height / img.height);
      dw = img.width * scale;
      dh = img.height * scale;
      dx = -dw / 2;
      dy = -dh / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    ctx.restore();

    // E. Subtitle Track Clips (T1 Track) or Legacy Text Overlay
    const textsToDraw: Array<{
      text: string;
      fontSize?: number;
      fontColor?: string;
      fontBgColor?: string;
      fontFamily?: string;
      position?: string;
      xPercent?: number;
      yPercent?: number;
    }> = [];

    if (options.textClips && options.textClips.length > 0) {
      const activeClips = options.textClips.filter(
        (t) =>
          t.text &&
          t.text.trim() &&
          frameTimeSec >= t.startTime &&
          frameTimeSec < t.startTime + t.duration
      );
      textsToDraw.push(...activeClips);
    } else if (textOverlay && textOverlay.text && textOverlay.text.trim()) {
      const shouldDraw =
        textOverlay.applyScope === 'all' ||
        !textOverlay.selectedClipId ||
        textOverlay.selectedClipId === fSpec.clipId;
      if (shouldDraw) {
        textsToDraw.push(textOverlay);
      }
    }

    for (const tItem of textsToDraw) {
      const fontSize = tItem.fontSize || Math.max(16, Math.round(height * 0.07));
      const fontColor = tItem.fontColor || '#ffffff';
      const fontBgColor = tItem.fontBgColor || 'rgba(0,0,0,0.6)';
      const fontFamily = tItem.fontFamily || "'Pretendard', 'Noto Sans KR', sans-serif";
      const pos = tItem.position || 'bottom';

      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';

      let tx = width / 2;
      let ty = height - fontSize * 0.8;

      if (typeof tItem.xPercent === 'number' && typeof tItem.yPercent === 'number') {
        tx = (width * tItem.xPercent) / 100;
        ty = (height * tItem.yPercent) / 100;
      } else if (pos === 'top') {
        ty = fontSize * 1.3;
      } else if (pos === 'center') {
        ty = height / 2 + fontSize / 3;
      } else if (pos === 'top-left') {
        tx = fontSize * 1.2;
        ty = fontSize * 1.3;
        ctx.textAlign = 'left';
      } else if (pos === 'bottom-right') {
        tx = width - fontSize * 1.2;
        ty = height - fontSize * 0.8;
        ctx.textAlign = 'right';
      }

      const textMetrics = ctx.measureText(tItem.text);
      const textW = textMetrics.width + fontSize;
      const textH = fontSize * 1.4;

      let bgX = tx - textW / 2;
      if (ctx.textAlign === 'left') bgX = tx - fontSize * 0.3;
      else if (ctx.textAlign === 'right') bgX = tx - textW + fontSize * 0.3;

      ctx.fillStyle = fontBgColor;
      ctx.fillRect(bgX, ty - fontSize * 1.05, textW, textH);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(2, Math.round(fontSize / 8));
      ctx.strokeText(tItem.text, tx, ty);

      ctx.fillStyle = fontColor;
      ctx.fillText(tItem.text, tx, ty);
    }

    renderedImageUrls.push(canvas.toDataURL('image/png'));

    if (progressCallback) {
      progressCallback(15 + Math.round(((i + 1) / finalFramesSequence.length) * 45)); // 15~60%
    }
  }

  // 4. Calculate Final Interval
  const avgDelayMs =
    finalFramesSequence.reduce((acc, f) => acc + f.delayMs, 0) / finalFramesSequence.length;
  const finalIntervalSec = Math.max(0.03, Math.round(avgDelayMs / 10) / 100);

  // 5. Final GIF Encoding via gifshot
  return new Promise((resolve, reject) => {
    gifshot.createGIF(
      {
        images: renderedImageUrls,
        gifWidth: width,
        gifHeight: height,
        interval: finalIntervalSec,
        sampleInterval,
        numWorkers: 2,
        progressCallback: (prog: number) => {
          if (progressCallback) {
            progressCallback(60 + Math.round(prog * 40)); // 60~100%
          }
        },
      },
      (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => {
        if (obj.error) {
          reject(new Error(obj.errorMsg || obj.errorCode || 'GIF 인코딩 중 오류가 발생했습니다.'));
        } else {
          resolve(obj.image);
        }
      }
    );
  });
}
