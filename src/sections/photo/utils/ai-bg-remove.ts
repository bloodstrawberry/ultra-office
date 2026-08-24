'use client';

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

export interface BgModelOption {
  id: string;
  name: string;
  size: string;
  description: string;
  recommended?: boolean;
}

export const BG_REMOVE_MODELS: BgModelOption[] = [
  {
    id: 'briaai/RMBG-1.4',
    name: 'BRIA RMBG 1.4 (정밀 AI - 강력 추천)',
    size: '~176 MB',
    description:
      '최신 SOTA 배경 분리 모델. 인물, 머리카락, 동물 털, 복잡한 제품/유리잔까지 완벽 분리',
    recommended: true,
  },
  {
    id: 'Xenova/modnet',
    name: 'MODNet (초경량 인물 전용)',
    size: '~25 MB',
    description: '인물 상반신/프로필 전용 초경량 매팅 모델. 저사양 PC/빠른 속도 최적화',
  },
];

export interface BgProgressInfo {
  status: 'idle' | 'init' | 'downloading' | 'compiling' | 'processing' | 'ready' | 'error';
  text: string;
  progress: number; // 0 to 1
}

export interface BgRemoveResult {
  resultDataUrl: string; // Transparent PNG
  maskDataUrl: string; // Black/White alpha mask
  width: number;
  height: number;
  originalImage: HTMLImageElement;
  foregroundCanvas: HTMLCanvasElement;
}

export type BgStyleType = 'transparent' | 'solid' | 'gradient' | 'blur' | 'white' | 'black';

export interface BgCompositeOptions {
  style: BgStyleType;
  solidColor?: string;
  gradientPreset?: string;
  blurAmount?: number; // px
}

// ----------------------------------------------------------------------
// Hardware Check (WebGPU)
// ----------------------------------------------------------------------

export async function checkWebGPUSupport(): Promise<{ supported: boolean; message: string }> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { supported: false, message: '서버 환경입니다.' };
  }

  const nav = navigator as unknown as { gpu?: { requestAdapter?: () => Promise<unknown> } };
  if (!nav.gpu || typeof nav.gpu.requestAdapter !== 'function') {
    return {
      supported: false,
      message: 'WebGPU 미지원 브라우저 (CPU WASM 모드로 동작합니다).',
    };
  }

  try {
    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        message: 'WebGPU 가속 어댑터를 찾을 수 없어 CPU WASM 모드로 전환합니다.',
      };
    }
    return { supported: true, message: 'WebGPU ⚡ 하드웨어 가속이 활성화되었습니다.' };
  } catch {
    return {
      supported: false,
      message: 'WebGPU 초기화 실패 (CPU WASM 모드로 전환합니다).',
    };
  }
}

// ----------------------------------------------------------------------
// Singleton Cache for Segmenter Pipeline
// ----------------------------------------------------------------------

let activeSegmenter: any = null;
let activeModelId: string | null = null;

/**
 * Remove background from an image URL or Data URL using Transformers.js RMBG / MODNet
 */
export async function removeBackground(
  imageSrc: string,
  modelId: string = 'briaai/RMBG-1.4',
  onProgress?: (p: BgProgressInfo) => void
): Promise<BgRemoveResult> {
  const notify = (status: BgProgressInfo['status'], text: string, progress: number) => {
    if (onProgress) onProgress({ status, text, progress });
  };

  try {
    notify('init', 'AI 모델 엔진 초기화 중...', 0.05);

    // Dynamic import to prevent SSR bundling issues

    const { pipeline, env } = (await import('@huggingface/transformers')) as any;

    // Configure env to download from HuggingFace Hub CDN
    env.allowLocalModels = false;

    const gpuCheck = await checkWebGPUSupport();
    const device = gpuCheck.supported ? 'webgpu' : 'wasm';

    // Load or reuse pipeline
    if (!activeSegmenter || activeModelId !== modelId) {
      notify('downloading', `[${modelId}] 모델 가중치 로드 중...`, 0.1);

      activeSegmenter = await pipeline('image-segmentation', modelId, {
        device,
        progress_callback: (prog: any) => {
          if (prog?.status === 'progress' && typeof prog?.progress === 'number') {
            const ratio = Math.min(Math.max(prog.progress / 100, 0), 1);
            const loadedMB = prog.loaded ? Math.round((prog.loaded / (1024 * 1024)) * 10) / 10 : 0;
            const totalMB = prog.total ? Math.round((prog.total / (1024 * 1024)) * 10) / 10 : 0;
            const mbText = totalMB > 0 ? ` (${loadedMB}MB / ${totalMB}MB)` : '';

            notify(
              'downloading',
              `모델 가중치 다운로드 중...${mbText}`,
              Math.min(0.1 + ratio * 0.7, 0.8)
            );
          } else if (prog?.status === 'ready') {
            notify('compiling', '신경망 텐서 컴파일 중...', 0.85);
          }
        },
      });
      activeModelId = modelId;
    }

    notify('processing', 'AI 픽셀 세그멘테이션 및 배경 분리 분석 중...', 0.9);

    // Load original image to get dimensions
    const originalImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
      img.src = imageSrc;
    });

    const w = originalImg.naturalWidth || originalImg.width;
    const h = originalImg.naturalHeight || originalImg.height;

    // Run segmentation pipeline
    const output = await activeSegmenter(imageSrc);

    // Extract output RawImage mask
    let rawMask = output;
    if (Array.isArray(output)) {
      rawMask = output[0]?.mask || output[0];
    } else if (output?.mask) {
      rawMask = output.mask;
    }

    // Create Canvas for Foreground
    const fgCanvas = document.createElement('canvas');
    fgCanvas.width = w;
    fgCanvas.height = h;
    const fgCtx = fgCanvas.getContext('2d');
    if (!fgCtx) throw new Error('2D Canvas Context를 생성할 수 없습니다.');

    // Draw original image
    fgCtx.drawImage(originalImg, 0, 0, w, h);
    const imgData = fgCtx.getImageData(0, 0, w, h);
    const { data: pixels } = imgData;

    // Create Canvas for Mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = w;
    maskCanvas.height = h;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) throw new Error('Mask Canvas Context를 생성할 수 없습니다.');

    // If rawMask has a canvas or toCanvas method
    if (typeof rawMask?.toCanvas === 'function') {
      const maskSrcCanvas = rawMask.toCanvas();
      maskCtx.drawImage(maskSrcCanvas, 0, 0, w, h);
    } else if (rawMask?.data) {
      // RawImage data array
      const maskData = rawMask.data;
      const maskW = rawMask.width || w;
      const maskH = rawMask.height || h;

      // Draw mask to temporary canvas if dimensions differ
      const tempMaskCanvas = document.createElement('canvas');
      tempMaskCanvas.width = maskW;
      tempMaskCanvas.height = maskH;
      const tempMaskCtx = tempMaskCanvas.getContext('2d');
      if (tempMaskCtx) {
        const tempImgData = tempMaskCtx.createImageData(maskW, maskH);
        for (let i = 0; i < maskW * maskH; i += 1) {
          const val = maskData[i] !== undefined ? maskData[i] : 255;
          tempImgData.data[i * 4] = val;
          tempImgData.data[i * 4 + 1] = val;
          tempImgData.data[i * 4 + 2] = val;
          tempImgData.data[i * 4 + 3] = 255;
        }
        tempMaskCtx.putImageData(tempImgData, 0, 0);
        maskCtx.drawImage(tempMaskCanvas, 0, 0, w, h);
      }
    } else if (typeof rawMask === 'string' || rawMask instanceof Blob) {
      const maskImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = typeof rawMask === 'string' ? rawMask : URL.createObjectURL(rawMask);
      });
      maskCtx.drawImage(maskImg, 0, 0, w, h);
    }

    // Read scaled mask pixels
    const scaledMaskData = maskCtx.getImageData(0, 0, w, h).data;

    // Apply mask to original pixel alpha channel
    for (let i = 0; i < w * h; i += 1) {
      const alphaVal = scaledMaskData[i * 4]; // R channel represents mask luminance
      pixels[i * 4 + 3] = alphaVal;
      if (alphaVal === 0) {
        pixels[i * 4] = 0;
        pixels[i * 4 + 1] = 0;
        pixels[i * 4 + 2] = 0;
      }
    }

    fgCtx.putImageData(imgData, 0, 0);

    const resultDataUrl = fgCanvas.toDataURL('image/png');
    const maskDataUrl = maskCanvas.toDataURL('image/png');

    notify('ready', '배경 분리가 성공적으로 완료되었습니다!', 1);

    return {
      resultDataUrl,
      maskDataUrl,
      width: w,
      height: h,
      originalImage: originalImg,
      foregroundCanvas: fgCanvas,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Background removal failed:', err);
    notify('error', `오류: ${msg}`, 0);
    throw err;
  }
}

// ----------------------------------------------------------------------
// Background Composite Utility (Solid, Gradient, Blur, etc.)
// ----------------------------------------------------------------------

export function renderCompositeImage(
  fgCanvas: HTMLCanvasElement,
  originalImg: HTMLImageElement,
  options: BgCompositeOptions,
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png'
): string {
  const w = fgCanvas.width;
  const h = fgCanvas.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return fgCanvas.toDataURL('image/png');

  // Clear canvas completely to transparent
  ctx.clearRect(0, 0, w, h);

  // If style is transparent and format is JPEG, draw white background so JPEG doesn't turn black
  if (mimeType === 'image/jpeg' && options.style === 'transparent') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(fgCanvas, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  // Draw Background according to style
  if (options.style === 'transparent') {
    // Keep transparent, directly draw foreground
    ctx.drawImage(fgCanvas, 0, 0);
    return canvas.toDataURL('image/png');
  }

  if (options.style === 'white') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  } else if (options.style === 'black') {
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, w, h);
  } else if (options.style === 'solid' && options.solidColor) {
    ctx.fillStyle = options.solidColor;
    ctx.fillRect(0, 0, w, h);
  } else if (options.style === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    if (options.gradientPreset === 'sunset') {
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(1, '#ec4899');
    } else if (options.gradientPreset === 'ocean') {
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#3b82f6');
    } else if (options.gradientPreset === 'cyber') {
      grad.addColorStop(0, '#8b5cf6');
      grad.addColorStop(1, '#ec4899');
    } else if (options.gradientPreset === 'emerald') {
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(1, '#06b6d4');
    } else if (options.gradientPreset === 'dark-studio') {
      grad.addColorStop(0, '#2e384d');
      grad.addColorStop(1, '#111827');
    } else {
      // Warm studio
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(1, '#cbd5e1');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (options.style === 'blur') {
    // Bokeh blur on original background
    ctx.save();
    ctx.filter = `blur(${options.blurAmount || 18}px)`;
    // Scale slightly to hide blurred edges
    const scale = 1.06;
    const dw = w * scale;
    const dh = h * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(originalImg, dx, dy, dw, dh);
    ctx.restore();
  }

  // Draw transparent foreground onto customized background
  ctx.drawImage(fgCanvas, 0, 0);

  return canvas.toDataURL(mimeType, 0.95);
}

// ----------------------------------------------------------------------
// Split Before/After Composite Utility
// ----------------------------------------------------------------------

/**
 * Render a split composite image:
 * - orientation: 'horizontal' (좌우) or 'vertical' (상하)
 * - mode 'inside': original outside [splitStart, splitEnd], cutout inside [splitStart, splitEnd]
 * - mode 'outside': cutout outside [splitStart, splitEnd], original inside [splitStart, splitEnd]
 */
export function renderSplitCompositeImage(
  result: BgRemoveResult,
  splitStart: number,
  splitEnd: number,
  options: BgCompositeOptions,
  mode: 'inside' | 'outside' = 'inside',
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png'
): string {
  const w = result.width;
  const h = result.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return result.foregroundCanvas.toDataURL('image/png');

  // Clear canvas completely to transparent
  ctx.clearRect(0, 0, w, h);

  const minSplit = Math.min(splitStart, splitEnd);
  const maxSplit = Math.max(splitStart, splitEnd);

  let cutX = 0;
  let cutY = 0;
  let cutW = w;
  let cutH = h;

  if (orientation === 'horizontal') {
    cutX = Math.round(w * (minSplit / 100));
    cutW = Math.round(w * ((maxSplit - minSplit) / 100));
  } else {
    cutY = Math.round(h * (minSplit / 100));
    cutH = Math.round(h * ((maxSplit - minSplit) / 100));
  }

  const drawCutout = (targetCtx: CanvasRenderingContext2D) => {
    if (options.style === 'white') {
      targetCtx.fillStyle = '#FFFFFF';
      targetCtx.fillRect(0, 0, w, h);
    } else if (options.style === 'black') {
      targetCtx.fillStyle = '#121212';
      targetCtx.fillRect(0, 0, w, h);
    } else if (options.style === 'solid' && options.solidColor) {
      targetCtx.fillStyle = options.solidColor;
      targetCtx.fillRect(0, 0, w, h);
    } else if (options.style === 'gradient') {
      const grad = targetCtx.createLinearGradient(0, 0, w, h);
      if (options.gradientPreset === 'sunset') {
        grad.addColorStop(0, '#f97316');
        grad.addColorStop(1, '#ec4899');
      } else if (options.gradientPreset === 'ocean') {
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(1, '#3b82f6');
      } else if (options.gradientPreset === 'cyber') {
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(1, '#ec4899');
      } else if (options.gradientPreset === 'emerald') {
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(1, '#06b6d4');
      } else if (options.gradientPreset === 'dark-studio') {
        grad.addColorStop(0, '#2e384d');
        grad.addColorStop(1, '#111827');
      } else {
        grad.addColorStop(0, '#f8fafc');
        grad.addColorStop(1, '#cbd5e1');
      }
      targetCtx.fillStyle = grad;
      targetCtx.fillRect(0, 0, w, h);
    } else if (options.style === 'blur') {
      targetCtx.save();
      targetCtx.filter = `blur(${options.blurAmount || 18}px)`;
      const scale = 1.06;
      const dw = w * scale;
      const dh = h * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      targetCtx.drawImage(result.originalImage, dx, dy, dw, dh);
      targetCtx.restore();
    }

    // Draw transparent foreground
    targetCtx.drawImage(result.foregroundCanvas, 0, 0, w, h);
  };

  const hasCutRegion = orientation === 'horizontal' ? cutW > 0 : cutH > 0;

  if (mode === 'inside') {
    // 1. Draw full original image as the base
    ctx.drawImage(result.originalImage, 0, 0, w, h);

    // 2. In [cutX, cutY, cutW, cutH], clear and draw cutout
    if (hasCutRegion) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cutX, cutY, cutW, cutH);
      ctx.clip();
      ctx.clearRect(cutX, cutY, cutW, cutH);
      drawCutout(ctx);
      ctx.restore();
    }
  } else {
    // mode === 'outside': Cutout is on outer sides, original image is in center [cutX, cutY, cutW, cutH]
    // 1. Draw full cutout as base
    drawCutout(ctx);

    // 2. In [cutX, cutY, cutW, cutH], draw original image
    if (hasCutRegion) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cutX, cutY, cutW, cutH);
      ctx.clip();
      ctx.clearRect(cutX, cutY, cutW, cutH);
      ctx.drawImage(result.originalImage, 0, 0, w, h);
      ctx.restore();
    }
  }

  // If user requested JPEG and background is transparent, fill transparent areas with white so JPEG doesn't turn black
  if (mimeType === 'image/jpeg' && options.style === 'transparent') {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, w, h);
      tempCtx.drawImage(canvas, 0, 0);
      return tempCanvas.toDataURL('image/jpeg', 0.95);
    }
  }

  return canvas.toDataURL(mimeType, 0.95);
}

// ----------------------------------------------------------------------
// Manual Touch-up Brush Utility
// ----------------------------------------------------------------------

/**
 * Apply a soft circular brush stroke to the foreground canvas.
 * - `erase` tool: sets alpha toward 0 (remove foreground)
 * - `restore` tool: blends RGBA back toward `originalData` (undo manual erase)
 *
 * Only reads/writes the affected bounding region for performance.
 */
export function applyBrushStroke(
  foregroundCanvas: HTMLCanvasElement,
  imageX: number,
  imageY: number,
  radius: number,
  tool: 'erase' | 'restore',
  originalData?: ImageData
): void {
  const ctx = foregroundCanvas.getContext('2d');
  if (!ctx) return;

  const w = foregroundCanvas.width;
  const h = foregroundCanvas.height;

  const minX = Math.max(0, Math.floor(imageX - radius));
  const maxX = Math.min(w - 1, Math.ceil(imageX + radius));
  const minY = Math.max(0, Math.floor(imageY - radius));
  const maxY = Math.min(h - 1, Math.ceil(imageY + radius));
  if (minX > maxX || minY > maxY) return;

  const regionW = maxX - minX + 1;
  const regionH = maxY - minY + 1;

  const imgData = ctx.getImageData(minX, minY, regionW, regionH);
  const pixels = imgData.data;
  const radiusSq = radius * radius;

  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const dx = px - imageX;
      const dy = py - imageY;
      const distSq = dx * dx + dy * dy;
      if (distSq > radiusSq) continue;

      const dist = Math.sqrt(distSq);
      const strength = (1 - dist / radius) ** 2; // quadratic soft falloff

      const localIdx = ((py - minY) * regionW + (px - minX)) * 4;

      if (tool === 'erase') {
        const newAlpha = Math.round(pixels[localIdx + 3] * (1 - strength));
        pixels[localIdx + 3] = newAlpha;
        if (newAlpha === 0) {
          pixels[localIdx] = 0;
          pixels[localIdx + 1] = 0;
          pixels[localIdx + 2] = 0;
        }
      } else if (originalData) {
        const origIdx = (py * w + px) * 4;
        const od = originalData.data;
        pixels[localIdx] = Math.round(
          pixels[localIdx] + (od[origIdx] - pixels[localIdx]) * strength
        );
        pixels[localIdx + 1] = Math.round(
          pixels[localIdx + 1] + (od[origIdx + 1] - pixels[localIdx + 1]) * strength
        );
        pixels[localIdx + 2] = Math.round(
          pixels[localIdx + 2] + (od[origIdx + 2] - pixels[localIdx + 2]) * strength
        );
        pixels[localIdx + 3] = Math.round(
          pixels[localIdx + 3] + (od[origIdx + 3] - pixels[localIdx + 3]) * strength
        );
      }
    }
  }

  ctx.putImageData(imgData, minX, minY);
}
