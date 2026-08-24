// ----------------------------------------------------------------------
// Video Processing Engine (Canvas 2D + MediaRecorder + Web Audio API)
// ----------------------------------------------------------------------

import type {
  FilterPreset,
  TransformSettings,
  WatermarkSettings,
  TextOverlaySettings,
  VideoFilterSettings,
} from '../types';

export const DEFAULT_FILTERS: VideoFilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hueRotate: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
};

export const DEFAULT_TRANSFORM: TransformSettings = {
  rotation: 0,
  flipH: false,
  flipV: false,
  aspectRatio: 'original',
  fitMode: 'contain',
};

export const DEFAULT_TEXT_OVERLAY: TextOverlaySettings = {
  enabled: false,
  text: '자막 또는 문구를 입력하세요',
  fontSize: 28,
  fontColor: '#ffffff',
  backgroundColor: '#000000',
  backgroundOpacity: 0.6,
  position: 'bottom',
  customX: 50,
  customY: 85,
  fontFamily: 'Pretendard, -apple-system, sans-serif',
};

export const DEFAULT_WATERMARK: WatermarkSettings = {
  enabled: false,
  imageSrc: null,
  width: 120,
  opacity: 0.8,
  position: 'top-right',
  margin: 20,
};

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    name: '기본 (Original)',
    filter: { ...DEFAULT_FILTERS },
  },
  {
    id: 'vintage',
    name: '빈티지 (Vintage)',
    filter: { ...DEFAULT_FILTERS, sepia: 60, contrast: 110, brightness: 105, saturation: 80 },
  },
  {
    id: 'cyberpunk',
    name: '사이버펑크 (Neon)',
    filter: { ...DEFAULT_FILTERS, contrast: 140, saturation: 180, hueRotate: 280, brightness: 110 },
  },
  {
    id: 'warm',
    name: '따뜻한 선셋 (Warm)',
    filter: { ...DEFAULT_FILTERS, sepia: 30, saturation: 130, brightness: 105, contrast: 105 },
  },
  {
    id: 'cool',
    name: '쿨 시네마틱 (Cool)',
    filter: { ...DEFAULT_FILTERS, hueRotate: 180, contrast: 115, saturation: 90, brightness: 98 },
  },
  {
    id: 'noir',
    name: '필름 누아르 (Noir B&W)',
    filter: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 150, brightness: 90 },
  },
  {
    id: 'vivid',
    name: '생생한 비비드 (Vivid)',
    filter: { ...DEFAULT_FILTERS, saturation: 160, contrast: 120, brightness: 102 },
  },
  {
    id: 'dramatic',
    name: '드라마틱 (Dramatic)',
    filter: { ...DEFAULT_FILTERS, contrast: 160, brightness: 85, saturation: 110 },
  },
];

/**
 * Builds CSS filter string for Canvas 2D or Video Element
 */
export function buildCssFilter(filters: VideoFilterSettings): string {
  const parts = [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    `hue-rotate(${filters.hueRotate}deg)`,
  ];
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`);
  if (filters.invert > 0) parts.push(`invert(${filters.invert}%)`);
  return parts.join(' ');
}

/**
 * Render a single video frame onto canvas with all filters, transformations, overlays
 */
export function drawVideoFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  targetWidth: number,
  targetHeight: number,
  options: {
    filters?: VideoFilterSettings;
    transform?: TransformSettings;
    textOverlay?: TextOverlaySettings;
    watermark?: WatermarkSettings;
  }
): void {
  const { filters, transform, textOverlay, watermark } = options;

  // Clear background
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // 1. Setup Filters
  if (filters) {
    ctx.filter = buildCssFilter(filters);
  } else {
    ctx.filter = 'none';
  }

  // 2. Setup Transformations & Draw Video
  ctx.save();
  ctx.translate(targetWidth / 2, targetHeight / 2);

  const rotation = transform?.rotation ?? 0;
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  const scaleX = transform?.flipH ? -1 : 1;
  const scaleY = transform?.flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  const isRotated90or270 = rotation === 90 || rotation === 270;
  const srcWidth = isRotated90or270 ? video.videoHeight : video.videoWidth;
  const srcHeight = isRotated90or270 ? video.videoWidth : video.videoHeight;

  let drawW = targetWidth;
  let drawH = targetHeight;

  if (transform?.fitMode === 'contain') {
    const scale = Math.min(targetWidth / srcWidth, targetHeight / srcHeight);
    drawW = (isRotated90or270 ? video.videoHeight : video.videoWidth) * scale;
    drawH = (isRotated90or270 ? video.videoWidth : video.videoHeight) * scale;
  } else if (transform?.fitMode === 'cover') {
    const scale = Math.max(targetWidth / srcWidth, targetHeight / srcHeight);
    drawW = (isRotated90or270 ? video.videoHeight : video.videoWidth) * scale;
    drawH = (isRotated90or270 ? video.videoWidth : video.videoHeight) * scale;
  }

  if (isRotated90or270) {
    // Draw with inverted dimensions for rotated context
    ctx.drawImage(video, -drawH / 2, -drawW / 2, drawH, drawW);
  } else {
    ctx.drawImage(video, -drawW / 2, -drawH / 2, drawW, drawH);
  }

  ctx.restore(); // Restore from rotation/scale
  ctx.filter = 'none'; // Reset filter for overlays

  // 3. Draw Watermark
  if (watermark?.enabled && watermark.imageElement && watermark.imageElement.complete) {
    const img = watermark.imageElement;
    const wmWidth = watermark.width;
    const wmHeight = (img.naturalHeight / (img.naturalWidth || 1)) * wmWidth;
    const margin = watermark.margin;

    let wx = margin;
    let wy = margin;

    switch (watermark.position) {
      case 'top-left':
        wx = margin;
        wy = margin;
        break;
      case 'top-right':
        wx = targetWidth - wmWidth - margin;
        wy = margin;
        break;
      case 'bottom-left':
        wx = margin;
        wy = targetHeight - wmHeight - margin;
        break;
      case 'bottom-right':
        wx = targetWidth - wmWidth - margin;
        wy = targetHeight - wmHeight - margin;
        break;
      case 'center':
        wx = (targetWidth - wmWidth) / 2;
        wy = (targetHeight - wmHeight) / 2;
        break;
      default:
        break;
    }

    ctx.save();
    ctx.globalAlpha = watermark.opacity;
    ctx.drawImage(img, wx, wy, wmWidth, wmHeight);
    ctx.restore();
  }

  // 4. Draw Text Overlay / Subtitle
  if (textOverlay?.enabled && textOverlay.text.trim()) {
    ctx.save();
    ctx.font = `bold ${textOverlay.fontSize}px ${textOverlay.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let tx = targetWidth / 2;
    let ty = targetHeight - textOverlay.fontSize * 2;

    if (textOverlay.position === 'top') {
      ty = textOverlay.fontSize * 2;
    } else if (textOverlay.position === 'center') {
      ty = targetHeight / 2;
    } else if (textOverlay.position === 'bottom') {
      ty = targetHeight - textOverlay.fontSize * 2.2;
    } else if (textOverlay.position === 'custom') {
      tx = (targetWidth * textOverlay.customX) / 100;
      ty = (targetHeight * textOverlay.customY) / 100;
    }

    const lines = textOverlay.text.split('\n');
    const lineHeight = textOverlay.fontSize * 1.3;
    const totalTextHeight = lines.length * lineHeight;

    lines.forEach((line, index) => {
      const lineY = ty - totalTextHeight / 2 + index * lineHeight + lineHeight / 2;
      const textMetrics = ctx.measureText(line);
      const textW = textMetrics.width;

      // Background Box
      if (textOverlay.backgroundOpacity > 0) {
        ctx.fillStyle = textOverlay.backgroundColor;
        ctx.globalAlpha = textOverlay.backgroundOpacity;
        const paddingX = textOverlay.fontSize * 0.5;
        const paddingY = textOverlay.fontSize * 0.25;
        ctx.fillRect(
          tx - textW / 2 - paddingX,
          lineY - lineHeight / 2 - paddingY / 2,
          textW + paddingX * 2,
          lineHeight + paddingY
        );
      }

      // Text Stroke & Fill
      ctx.globalAlpha = 1.0;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = textOverlay.fontColor;
      ctx.fillText(line, tx, lineY);
    });

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Export modified video with all configurations via MediaRecorder
 */
export async function renderAndExportVideo(
  videoSourceUrl: string,
  options: {
    startTime: number;
    endTime: number;
    playbackRate?: number;
    muteAudio?: boolean;
    filters?: VideoFilterSettings;
    transform?: TransformSettings;
    textOverlay?: TextOverlaySettings;
    watermark?: WatermarkSettings;
    outputWidth?: number;
    outputHeight?: number;
  },
  onProgress?: (percent: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoSourceUrl;
    video.crossOrigin = 'anonymous';
    video.muted = options.muteAudio ?? false;
    video.playsInline = true;
    video.playbackRate = options.playbackRate ?? 1.0;

    video.onloadedmetadata = async () => {
      const srcW = video.videoWidth || 1280;
      const srcH = video.videoHeight || 720;
      const rotation = options.transform?.rotation ?? 0;
      const isRotated = rotation === 90 || rotation === 270;

      let canvasW = isRotated ? srcH : srcW;
      let canvasH = isRotated ? srcW : srcH;

      // Handle aspect ratio
      if (options.transform?.aspectRatio === '16:9') {
        canvasW = 1280;
        canvasH = 720;
      } else if (options.transform?.aspectRatio === '9:16') {
        canvasW = 720;
        canvasH = 1280;
      } else if (options.transform?.aspectRatio === '1:1') {
        canvasW = 720;
        canvasH = 720;
      } else if (options.transform?.aspectRatio === '4:3') {
        canvasW = 960;
        canvasH = 720;
      }

      if (options.outputWidth && options.outputHeight) {
        canvasW = options.outputWidth;
        canvasH = options.outputHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 생성 실패'));
        return;
      }

      const canvasStream = canvas.captureStream(30);
      const combinedStream = canvasStream;

      // Audio track setup
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();

      if (!options.muteAudio) {
        try {
          const sourceNode = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          sourceNode.connect(dest);
          sourceNode.connect(audioCtx.destination);
          const audioTrack = dest.stream.getAudioTracks()[0];
          if (audioTrack) {
            combinedStream.addTrack(audioTrack);
          }
        } catch {
          // fallback if audio routing is restricted
        }
      }

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }

      const recordedChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: 4000000,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        audioCtx.close();
        const outputBlob = new Blob(recordedChunks, { type: mimeType });
        resolve(outputBlob);
      };

      video.currentTime = options.startTime;

      video.onseeked = () => {
        mediaRecorder.start(100);
        video.play();

        const duration = Math.max(0.1, options.endTime - options.startTime);

        const drawLoop = () => {
          if (video.currentTime >= options.endTime || video.ended || video.paused) {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
              video.pause();
            }
            return;
          }

          drawVideoFrameToCanvas(ctx, video, canvasW, canvasH, {
            filters: options.filters,
            transform: options.transform,
            textOverlay: options.textOverlay,
            watermark: options.watermark,
          });

          const currentElapsed = video.currentTime - options.startTime;
          const progress = Math.min(100, Math.round((currentElapsed / duration) * 100));
          if (onProgress) onProgress(progress);

          requestAnimationFrame(drawLoop);
        };

        requestAnimationFrame(drawLoop);
      };
    };

    video.onerror = () => {
      reject(new Error('비디오 로드 실패'));
    };
  });
}

/**
 * Generate a sample animated video in-memory for testing without user upload
 */
export async function createSampleVideoBlob(durationSeconds = 6): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');

  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], 'sample_ultra_video.webm', { type: 'video/webm' });
      resolve(file);
    };

    mediaRecorder.start();
    const startTime = Date.now();
    const totalMs = durationSeconds * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= totalMs) {
        clearInterval(interval);
        mediaRecorder.stop();
        return;
      }

      const progress = elapsed / totalMs;
      const hue = Math.floor(progress * 360);

      // Animated Background Gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, `hsl(${hue}, 80%, 25%)`);
      grad.addColorStop(1, `hsl(${(hue + 60) % 360}, 85%, 45%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center glowing circle
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2 + Math.sin(progress * Math.PI * 4) * 60,
        canvas.height / 2,
        40 + Math.cos(progress * Math.PI * 4) * 10,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Text Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Ultra Office Video Studio', canvas.width / 2, 100);

      // Timer Display
      const remainSec = Math.max(0, (totalMs - elapsed) / 1000).toFixed(1);
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`Sample Playback: ${remainSec}s`, canvas.width / 2, 280);
    }, 1000 / 30);
  });
}
