'use client';

import { exportCheckerboardJpeg } from 'src/sections/photo/utils/checkerboard-export';

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

export interface VideoBgModelOption {
  id: string;
  name: string;
  size: string;
  description: string;
  recommended?: boolean;
}

export const VIDEO_BG_REMOVE_MODELS: VideoBgModelOption[] = [
  {
    id: 'briaai/RMBG-1.4',
    name: 'BRIA RMBG 1.4 (정밀 AI - 강력 추천)',
    size: '~176 MB',
    description: '최신 SOTA 배경 분리 모델. 인물, 머리카락, 동물 털, 복잡한 제품/의류 완벽 분리',
    recommended: true,
  },
  {
    id: 'Xenova/modnet',
    name: 'MODNet (초경량 인물 전용 - 고속)',
    size: '~25 MB',
    description: '인물 상반신/포트레이트 전용 초경량 매팅 모델. 빠른 처리 속도 및 저사양 최적화',
  },
];

export interface VideoBgProgressInfo {
  status: 'idle' | 'init' | 'downloading' | 'compiling' | 'processing' | 'ready' | 'error';
  text: string;
  progress: number; // 0 to 1
}

export type VideoBgStyleType =
  | 'transparent'
  | 'solid'
  | 'gradient'
  | 'blur'
  | 'white'
  | 'black'
  | 'custom-image';

export interface VideoBgCompositeOptions {
  style: VideoBgStyleType;
  solidColor?: string;
  gradientPreset?: string;
  blurAmount?: number; // px
  customImageSrc?: string;
  feather?: number; // 0 ~ 10 px
  threshold?: number; // 0 ~ 255
}

export interface VideoExportSettings {
  startTime: number;
  endTime: number;
  resolution: 'original' | '1080p' | '720p' | '480p';
  quality: 'high' | 'medium' | 'standard';
  format: 'mp4' | 'webm';
  muteAudio: boolean;
  exportGreenScreen?: boolean;
}

export interface FrameMaskCacheItem {
  timeKey: string;
  maskCanvas: HTMLCanvasElement;
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
// Model Cache & Pipeline
// ----------------------------------------------------------------------

type TransformersPipeline = (input: string | HTMLCanvasElement | ImageData) => Promise<any>;

const segmenterMap = new Map<string, TransformersPipeline>();

export async function checkIsModelCached(modelId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (segmenterMap.has(modelId)) return true;
  if (!('caches' in window)) return false;
  try {
    const cache = await caches.open('transformers-cache');
    const keys = await cache.keys();
    const normalized = modelId.toLowerCase();
    return keys.some((req) => req.url.toLowerCase().includes(normalized));
  } catch {
    return false;
  }
}

export async function preloadVideoModel(
  modelId: string = 'briaai/RMBG-1.4',
  onProgress?: (p: VideoBgProgressInfo) => void
): Promise<TransformersPipeline> {
  const notify = (status: VideoBgProgressInfo['status'], text: string, progress: number) => {
    if (onProgress) onProgress({ status, text, progress });
  };

  if (segmenterMap.has(modelId)) {
    notify('ready', 'AI 모델이 메모리에 준비되어 있습니다.', 1);
    return segmenterMap.get(modelId)!;
  }

  notify('init', 'AI 모델 엔진 초기화 중...', 0.05);

  const { pipeline, env } = (await import('@huggingface/transformers')) as any;

  if (typeof window !== 'undefined') {
    env.useBrowserCache = true;
    env.allowLocalModels = false;
    env.allowRemoteModels = true;
  }

  const gpuCheck = await checkWebGPUSupport();
  const device = gpuCheck.supported ? 'webgpu' : 'wasm';

  notify('downloading', `[${modelId}] 모델 로드 및 캐시 중...`, 0.1);

  const segmenter = (await pipeline('image-segmentation', modelId, {
    device,
    progress_callback: (prog: any) => {
      if (prog?.status === 'progress' && typeof prog?.progress === 'number') {
        const ratio = Math.min(Math.max(prog.progress / 100, 0), 1);
        const loadedMB = prog.loaded ? Math.round((prog.loaded / (1024 * 1024)) * 10) / 10 : 0;
        const totalMB = prog.total ? Math.round((prog.total / (1024 * 1024)) * 10) / 10 : 0;
        const mbText = totalMB > 0 ? ` (${loadedMB}MB / ${totalMB}MB)` : '';

        notify(
          'downloading',
          `AI 가중치 다운로드 중...${mbText}`,
          Math.min(0.1 + ratio * 0.75, 0.85)
        );
      } else if (prog?.status === 'ready') {
        notify('compiling', '신경망 텐서 컴파일 중...', 0.9);
      }
    },
  })) as TransformersPipeline;

  segmenterMap.set(modelId, segmenter);
  notify('ready', '모델 로드 완료!', 1);
  return segmenter;
}

// ----------------------------------------------------------------------
// Frame Mask Segmentation
// ----------------------------------------------------------------------

/**
 * Segment a single video frame from HTMLVideoElement or Canvas
 */
export async function segmentVideoFrame(
  source: HTMLVideoElement | HTMLCanvasElement,
  modelId: string = 'briaai/RMBG-1.4',
  targetWidth?: number,
  targetHeight?: number
): Promise<HTMLCanvasElement> {
  const w =
    targetWidth || (source instanceof HTMLVideoElement ? source.videoWidth : source.width) || 640;
  const h =
    targetHeight ||
    (source instanceof HTMLVideoElement ? source.videoHeight : source.height) ||
    360;

  let segmenter = segmenterMap.get(modelId);
  if (!segmenter) {
    segmenter = await preloadVideoModel(modelId);
  }

  // Draw current frame into an offscreen canvas
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) throw new Error('Cannot create 2d canvas context');
  offCtx.drawImage(source, 0, 0, w, h);

  // Convert to image data URL for Transformers.js
  const frameDataUrl = offscreen.toDataURL('image/jpeg', 0.85);

  const output = await segmenter(frameDataUrl);

  // Extract raw mask
  let rawMask = output;
  if (Array.isArray(output)) {
    rawMask = output[0]?.mask || output[0];
  } else if (output?.mask) {
    rawMask = output.mask;
  }

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) throw new Error('Cannot create mask canvas context');

  if (typeof rawMask?.toCanvas === 'function') {
    const maskSrcCanvas = rawMask.toCanvas();
    maskCtx.drawImage(maskSrcCanvas, 0, 0, w, h);
  } else if (rawMask?.data) {
    const maskData = rawMask.data;
    const maskW = rawMask.width || w;
    const maskH = rawMask.height || h;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = maskW;
    tempCanvas.height = maskH;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      const tempImgData = tempCtx.createImageData(maskW, maskH);
      for (let i = 0; i < maskW * maskH; i += 1) {
        const val = maskData[i] !== undefined ? maskData[i] : 255;
        tempImgData.data[i * 4] = val;
        tempImgData.data[i * 4 + 1] = val;
        tempImgData.data[i * 4 + 2] = val;
        tempImgData.data[i * 4 + 3] = 255;
      }
      tempCtx.putImageData(tempImgData, 0, 0);
      maskCtx.drawImage(tempCanvas, 0, 0, w, h);
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

  return maskCanvas;
}

// ----------------------------------------------------------------------
// Composite Background Rendering
// ----------------------------------------------------------------------

/**
 * Render composite background + masked foreground onto destination context
 */
export function renderCompositeFrame(
  targetCtx: CanvasRenderingContext2D,
  videoSource: HTMLVideoElement | HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: VideoBgCompositeOptions,
  destWidth: number,
  destHeight: number,
  customBgImg?: HTMLImageElement | null
): void {
  targetCtx.clearRect(0, 0, destWidth, destHeight);

  // 1. Draw Background Layer
  if (options.style === 'white') {
    targetCtx.fillStyle = '#FFFFFF';
    targetCtx.fillRect(0, 0, destWidth, destHeight);
  } else if (options.style === 'black') {
    targetCtx.fillStyle = '#111827';
    targetCtx.fillRect(0, 0, destWidth, destHeight);
  } else if (options.style === 'solid' && options.solidColor) {
    targetCtx.fillStyle = options.solidColor;
    targetCtx.fillRect(0, 0, destWidth, destHeight);
  } else if (options.style === 'gradient') {
    const grad = targetCtx.createLinearGradient(0, 0, destWidth, destHeight);
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
      // warm-studio
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(1, '#cbd5e1');
    }
    targetCtx.fillStyle = grad;
    targetCtx.fillRect(0, 0, destWidth, destHeight);
  } else if (options.style === 'blur') {
    // Bokeh Blur original video
    targetCtx.save();
    targetCtx.filter = `blur(${options.blurAmount || 20}px)`;
    const scale = 1.08;
    const dw = destWidth * scale;
    const dh = destHeight * scale;
    const dx = (destWidth - dw) / 2;
    const dy = (destHeight - dh) / 2;
    targetCtx.drawImage(videoSource, dx, dy, dw, dh);
    targetCtx.restore();
  } else if (options.style === 'custom-image' && customBgImg) {
    targetCtx.drawImage(customBgImg, 0, 0, destWidth, destHeight);
  }

  // 2. Prepare Masked Foreground
  const fgCanvas = document.createElement('canvas');
  fgCanvas.width = destWidth;
  fgCanvas.height = destHeight;
  const fgCtx = fgCanvas.getContext('2d');
  if (!fgCtx) return;

  // Draw original video frame
  fgCtx.drawImage(videoSource, 0, 0, destWidth, destHeight);

  // Apply mask via destination-in
  fgCtx.save();
  fgCtx.globalCompositeOperation = 'destination-in';
  if (options.feather && options.feather > 0) {
    fgCtx.filter = `blur(${options.feather}px)`;
  }
  fgCtx.drawImage(maskCanvas, 0, 0, destWidth, destHeight);
  fgCtx.restore();

  // Threshold filter if specified
  if (options.threshold && options.threshold > 0) {
    const imgData = fgCtx.getImageData(0, 0, destWidth, destHeight);
    const { data } = imgData;
    const th = options.threshold;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < th) {
        data[i + 3] = 0;
      }
    }
    fgCtx.putImageData(imgData, 0, 0);
  }

  // 3. Composite foreground on top of background
  targetCtx.drawImage(fgCanvas, 0, 0);
}

// ----------------------------------------------------------------------
// Split Before/After Comparison
// ----------------------------------------------------------------------

export function renderSplitComparisonFrame(
  targetCtx: CanvasRenderingContext2D,
  videoSource: HTMLVideoElement | HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: VideoBgCompositeOptions,
  splitPercent: number, // 0 to 100
  orientation: 'horizontal' | 'vertical',
  mode: 'inside' | 'outside',
  destWidth: number,
  destHeight: number,
  customBgImg?: HTMLImageElement | null
): void {
  const w = destWidth;
  const h = destHeight;

  // Create full composite canvas
  const compCanvas = document.createElement('canvas');
  compCanvas.width = w;
  compCanvas.height = h;
  const compCtx = compCanvas.getContext('2d');
  if (!compCtx) return;

  renderCompositeFrame(compCtx, videoSource, maskCanvas, options, w, h, customBgImg);

  targetCtx.clearRect(0, 0, w, h);

  if (mode === 'inside') {
    // Base: original video
    targetCtx.drawImage(videoSource, 0, 0, w, h);

    // Overlay: composite within split region
    targetCtx.save();
    targetCtx.beginPath();
    if (orientation === 'horizontal') {
      const splitX = (splitPercent / 100) * w;
      targetCtx.rect(0, 0, splitX, h);
    } else {
      const splitY = (splitPercent / 100) * h;
      targetCtx.rect(0, 0, w, splitY);
    }
    targetCtx.clip();
    targetCtx.drawImage(compCanvas, 0, 0);
    targetCtx.restore();
  } else {
    // mode === 'outside': Base: composite, Overlay: original video
    targetCtx.drawImage(compCanvas, 0, 0);

    targetCtx.save();
    targetCtx.beginPath();
    if (orientation === 'horizontal') {
      const splitX = (splitPercent / 100) * w;
      targetCtx.rect(0, 0, splitX, h);
    } else {
      const splitY = (splitPercent / 100) * h;
      targetCtx.rect(0, 0, w, splitY);
    }
    targetCtx.clip();
    targetCtx.drawImage(videoSource, 0, 0, w, h);
    targetCtx.restore();
  }

  // Draw split divider line
  targetCtx.save();
  targetCtx.strokeStyle = '#38bdf8';
  targetCtx.lineWidth = 2;
  targetCtx.setLineDash([4, 4]);
  targetCtx.beginPath();
  if (orientation === 'horizontal') {
    const splitX = (splitPercent / 100) * w;
    targetCtx.moveTo(splitX, 0);
    targetCtx.lineTo(splitX, h);
  } else {
    const splitY = (splitPercent / 100) * h;
    targetCtx.moveTo(0, splitY);
    targetCtx.lineTo(w, splitY);
  }
  targetCtx.stroke();
  targetCtx.restore();
}

// ----------------------------------------------------------------------
// Mask View
// ----------------------------------------------------------------------

export function renderMaskFrame(
  targetCtx: CanvasRenderingContext2D,
  maskCanvas: HTMLCanvasElement,
  destWidth: number,
  destHeight: number
): void {
  targetCtx.clearRect(0, 0, destWidth, destHeight);
  targetCtx.fillStyle = '#000000';
  targetCtx.fillRect(0, 0, destWidth, destHeight);
  targetCtx.drawImage(maskCanvas, 0, 0, destWidth, destHeight);
}

// ----------------------------------------------------------------------
// Video Export (Full Render with Audio)
// ----------------------------------------------------------------------

export async function exportBgRemovedVideo(
  videoFileUrl: string,
  options: VideoBgCompositeOptions,
  exportSettings: VideoExportSettings,
  modelId: string = 'briaai/RMBG-1.4',
  customBgImg?: HTMLImageElement | null,
  onProgress?: (progress: number, elapsedSec: number) => void,
  abortSignal?: AbortSignal
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = videoFileUrl;

    const cleanup = () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = async () => {
      let outWidth = video.videoWidth || 1280;
      let outHeight = video.videoHeight || 720;

      if (exportSettings.resolution === '1080p') {
        outWidth = 1920;
        outHeight = 1080;
      } else if (exportSettings.resolution === '720p') {
        outWidth = 1280;
        outHeight = 720;
      } else if (exportSettings.resolution === '480p') {
        outWidth = 854;
        outHeight = 480;
      }

      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        cleanup();
        reject(new Error('Canvas 2D Context 초기화 실패'));
        return;
      }

      // Audio Context setup
      let audioDest: MediaStreamAudioDestinationNode | null = null;
      let audioCtx: AudioContext | null = null;

      if (!exportSettings.muteAudio) {
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            audioCtx = new AudioContextClass();
            const sourceNode = audioCtx.createMediaElementSource(video);
            audioDest = audioCtx.createMediaStreamDestination();
            sourceNode.connect(audioDest);
          }
        } catch (audioErr) {
          console.warn('Audio capture not available, exporting video only:', audioErr);
        }
      }

      const canvasStream = canvas.captureStream(30);
      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...(audioDest ? audioDest.stream.getAudioTracks() : []),
      ];
      const stream = new MediaStream(combinedTracks);

      const reqFormat = exportSettings.format;
      let mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';

      if (reqFormat === 'mp4') {
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4;codecs=avc1';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      } else {
        mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      }

      let bps = 5000000;
      if (exportSettings.quality === 'high') bps = 8000000;
      if (exportSettings.quality === 'standard') bps = 2500000;

      const recordedChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: bps,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        cleanup();
        if (audioCtx) {
          try {
            audioCtx.close();
          } catch {
            /* ignore */
          }
        }
        const outputMime = reqFormat === 'mp4' ? 'video/mp4' : mimeType;
        const outputBlob = new Blob(recordedChunks, { type: outputMime });
        resolve(outputBlob);
      };

      const startT = Math.max(0, exportSettings.startTime);
      const endT = Math.min(video.duration || 10000, exportSettings.endTime || video.duration);
      const totalDuration = Math.max(0.1, endT - startT);

      // Preload AI Model
      await preloadVideoModel(modelId);

      video.currentTime = startT;

      video.onseeked = () => {
        mediaRecorder.start(100);
        video.play();

        const startTimestamp = Date.now();
        let lastProcessedTime = -1;
        let cachedMask: HTMLCanvasElement | null = null;

        const renderLoop = async () => {
          if (abortSignal?.aborted) {
            mediaRecorder.stop();
            video.pause();
            return;
          }

          if (video.currentTime >= endT || video.ended) {
            video.pause();
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
            if (onProgress) onProgress(100, (Date.now() - startTimestamp) / 1000);
            return;
          }

          // Generate AI mask if frame advanced
          if (Math.abs(video.currentTime - lastProcessedTime) > 0.04) {
            try {
              cachedMask = await segmentVideoFrame(video, modelId, outWidth, outHeight);
              lastProcessedTime = video.currentTime;
            } catch (err) {
              console.warn('Frame segmentation skip:', err);
            }
          }

          if (cachedMask) {
            // Check green screen option
            const compositeOpts: VideoBgCompositeOptions = exportSettings.exportGreenScreen
              ? { ...options, style: 'solid', solidColor: '#00FF00' }
              : options;

            renderCompositeFrame(
              ctx,
              video,
              cachedMask,
              compositeOpts,
              outWidth,
              outHeight,
              customBgImg
            );
          }

          const currentProgress = Math.min(
            99,
            Math.max(0, ((video.currentTime - startT) / totalDuration) * 100)
          );
          if (onProgress) {
            onProgress(
              Math.round(currentProgress),
              Math.round((Date.now() - startTimestamp) / 1000)
            );
          }

          requestAnimationFrame(renderLoop);
        };

        requestAnimationFrame(renderLoop);
      };

      video.onerror = (err) => {
        cleanup();
        reject(err);
      };
    };
  });
}

// ----------------------------------------------------------------------
// Frame Snapshot Download
// ----------------------------------------------------------------------

export function downloadFrameSnapshot(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  isTransparent = true
): void {
  let dataUrl = '';
  if (format === 'png') {
    dataUrl = canvas.toDataURL('image/png');
  } else if (format === 'jpeg') {
    if (isTransparent) {
      dataUrl = exportCheckerboardJpeg(canvas, 8);
    } else {
      dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    }
  } else {
    dataUrl = canvas.toDataURL('image/webp', 0.95);
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
