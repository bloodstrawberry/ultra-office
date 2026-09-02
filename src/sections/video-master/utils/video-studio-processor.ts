// ----------------------------------------------------------------------
// Multi-Track Video Studio Processing Engine
// ----------------------------------------------------------------------

import type { VideoStudioClipItem, VideoStudioTextItem, VideoStudioExportSettings } from '../types';

import gifshot from 'gifshot';

import { buildCssFilter, DEFAULT_FILTERS } from './video-processor';

/**
 * Calculate total timeline duration from sequence of clips
 */
export function calculateTotalTimelineDuration(clips: VideoStudioClipItem[]): number {
  return clips.reduce((acc, clip) => acc + (clip.duration || 0), 0);
}

/**
 * Finds which clip and its internal source timestamp corresponds to the global timeline time
 */
export function getClipAtGlobalTime(
  clips: VideoStudioClipItem[],
  globalTimeSec: number
): {
  clip: VideoStudioClipItem | null;
  clipIndex: number;
  clipLocalTimeSec: number;
  clipSourceTimeSec: number;
  clipStartGlobalTime: number;
} {
  let accumulatedTime = 0;

  for (let i = 0; i < clips.length; i += 1) {
    const clip = clips[i];
    const clipDuration = clip.duration || 0;

    if (globalTimeSec >= accumulatedTime && globalTimeSec < accumulatedTime + clipDuration) {
      const localTime = globalTimeSec - accumulatedTime;
      const sourceTime = clip.trimStart + localTime * clip.speedMultiplier;

      return {
        clip,
        clipIndex: i,
        clipLocalTimeSec: localTime,
        clipSourceTimeSec: Math.min(clip.trimEnd, Math.max(clip.trimStart, sourceTime)),
        clipStartGlobalTime: accumulatedTime,
      };
    }

    accumulatedTime += clipDuration;
  }

  // If at the exact end or beyond, pick last clip
  if (clips.length > 0) {
    const lastClip = clips[clips.length - 1];
    const lastStart = accumulatedTime - (lastClip.duration || 0);
    const localTime = lastClip.duration || 0;
    const sourceTime = lastClip.trimEnd;

    return {
      clip: lastClip,
      clipIndex: clips.length - 1,
      clipLocalTimeSec: localTime,
      clipSourceTimeSec: sourceTime,
      clipStartGlobalTime: lastStart,
    };
  }

  return {
    clip: null,
    clipIndex: -1,
    clipLocalTimeSec: 0,
    clipSourceTimeSec: 0,
    clipStartGlobalTime: 0,
  };
}

/**
 * Draw a clip's video or image element onto a target 2D Canvas with transform and filters
 */
export function drawClipFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  element: HTMLVideoElement | HTMLImageElement,
  clip: VideoStudioClipItem,
  targetWidth: number,
  targetHeight: number,
  fitMode: 'contain' | 'cover' | 'fill' = 'contain',
  bgColor = '#000000'
) {
  const elemWidth = (element as HTMLVideoElement).videoWidth || element.width || targetWidth;
  const elemHeight = (element as HTMLVideoElement).videoHeight || element.height || targetHeight;

  // 1. Background Clear
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // 2. CSS Filter
  ctx.filter = buildCssFilter(clip.filters || DEFAULT_FILTERS);

  // 3. Transformation Matrix (Rotate & Flip)
  ctx.save();
  ctx.translate(targetWidth / 2, targetHeight / 2);

  if (clip.rotation) {
    ctx.rotate((clip.rotation * Math.PI) / 180);
  }

  const scaleX = clip.flipH ? -1 : 1;
  const scaleY = clip.flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // 4. Determine Aspect Fit Coordinates
  const isRotated90or270 = clip.rotation === 90 || clip.rotation === 270;
  const availableW = isRotated90or270 ? targetHeight : targetWidth;
  const availableH = isRotated90or270 ? targetWidth : targetHeight;

  let drawW = availableW;
  let drawH = availableH;
  let drawX = -availableW / 2;
  let drawY = -availableH / 2;

  if (fitMode === 'contain') {
    const scale = Math.min(availableW / elemWidth, availableH / elemHeight);
    drawW = elemWidth * scale;
    drawH = elemHeight * scale;
    drawX = -drawW / 2;
    drawY = -drawH / 2;
  } else if (fitMode === 'cover') {
    const scale = Math.max(availableW / elemWidth, availableH / elemHeight);
    drawW = elemWidth * scale;
    drawH = elemHeight * scale;
    drawX = -drawW / 2;
    drawY = -drawH / 2;
  }

  ctx.drawImage(element, drawX, drawY, drawW, drawH);
  ctx.restore();

  // Reset filter
  ctx.filter = 'none';
}

/**
 * Draw active text items onto Canvas
 */
export function drawTextOverlaysToCanvas(
  ctx: CanvasRenderingContext2D,
  textClips: VideoStudioTextItem[],
  globalTimeSec: number,
  targetWidth: number,
  targetHeight: number
) {
  const activeTexts = textClips.filter(
    (t) => globalTimeSec >= t.startTime && globalTimeSec <= t.startTime + t.duration
  );

  activeTexts.forEach((item) => {
    if (!item.text.trim()) return;

    ctx.save();
    const fontSize = item.fontSize || 28;
    const fontFamily = item.fontFamily || 'Pretendard, -apple-system, sans-serif';
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Position calculation
    const posX = (item.xPercent / 100) * targetWidth;
    const posY = (item.yPercent / 100) * targetHeight;

    const lines = item.text.split('\n');
    const lineHeight = fontSize * 1.35;
    const totalTextHeight = lines.length * lineHeight;

    lines.forEach((line, index) => {
      const lineY = posY - totalTextHeight / 2 + index * lineHeight + lineHeight / 2;
      const metrics = ctx.measureText(line);
      const textW = metrics.width;
      const padding = fontSize * 0.35;

      // Background Box
      if (item.fontBgColor && item.fontBgColor !== 'transparent') {
        ctx.fillStyle = item.fontBgColor;
        const boxX = posX - textW / 2 - padding;
        const boxY = lineY - lineHeight / 2 + 2;
        const boxW = textW + padding * 2;
        const boxH = lineHeight;
        const radius = 6;

        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, radius);
        ctx.fill();
      }

      // Text Stroke for Legibility
      ctx.lineWidth = Math.max(2, fontSize * 0.08);
      ctx.strokeStyle = '#000000';
      ctx.strokeText(line, posX, lineY);

      // Text Fill
      ctx.fillStyle = item.fontColor || '#ffffff';
      ctx.fillText(line, posX, lineY);
    });

    ctx.restore();
  });
}

/**
 * Create a new VideoStudioClipItem from a File
 */
export async function createVideoStudioClipFromFile(file: File): Promise<VideoStudioClipItem> {
  const isVideo = file.type.startsWith('video') || file.name.match(/\.(mp4|webm|mov|mkv|avi)$/i);
  const src = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    if (isVideo) {
      const video = document.createElement('video');
      video.src = src;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = async () => {
        const w = video.videoWidth || 1280;
        const h = video.videoHeight || 720;
        const duration = video.duration || 5;

        // Generate quick thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = Math.round((160 * h) / w);
        const ctx = canvas.getContext('2d');
        let thumbnailUrl = '';

        try {
          video.currentTime = Math.min(duration / 2, 1);
          await new Promise<void>((r) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              r();
            };
            video.addEventListener('seeked', onSeeked);
          });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
          }
        } catch {
          // ignore thumbnail fail
        }

        resolve({
          id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'video',
          name: file.name,
          file,
          src,
          thumbnailUrl,
          originalWidth: w,
          originalHeight: h,
          originalDuration: duration,
          trimStart: 0,
          trimEnd: duration,
          duration,
          speedMultiplier: 1.0,
          volume: 1.0,
          mute: false,
          rotation: 0,
          flipH: false,
          flipV: false,
          filterPreset: 'normal',
          filters: { ...DEFAULT_FILTERS },
        });
      };

      video.onerror = () => {
        reject(new Error(`비디오 파일을 로드할 수 없습니다: ${file.name}`));
      };
    } else {
      // Image File
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const w = img.naturalWidth || 1280;
        const h = img.naturalHeight || 720;
        const duration = 3.0; // default 3s for image clip

        resolve({
          id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'image',
          name: file.name,
          file,
          src,
          thumbnailUrl: src,
          originalWidth: w,
          originalHeight: h,
          originalDuration: duration,
          trimStart: 0,
          trimEnd: duration,
          duration,
          speedMultiplier: 1.0,
          volume: 1.0,
          mute: true,
          rotation: 0,
          flipH: false,
          flipV: false,
          filterPreset: 'normal',
          filters: { ...DEFAULT_FILTERS },
        });
      };

      img.onerror = () => {
        reject(new Error(`이미지 파일을 로드할 수 없습니다: ${file.name}`));
      };
    }
  });
}

/**
 * Export Multi-Track Timeline Project to WebM / MP4 Video Blob
 */
export async function exportStudioVideo(
  clips: VideoStudioClipItem[],
  textClips: VideoStudioTextItem[],
  settings: VideoStudioExportSettings,
  onProgress?: (percent: number, phase: string) => void,
  abortSignal?: AbortSignal
): Promise<Blob> {
  if (!clips || clips.length === 0) {
    throw new Error('내보낼 비디오 클립이 없습니다.');
  }

  const totalDuration = calculateTotalTimelineDuration(clips);
  if (totalDuration <= 0) {
    throw new Error('전체 재생 시간이 유효하지 않습니다.');
  }

  // 1. Output Resolution calculation
  let targetW = 1280;
  let targetH = 720;

  if (settings.aspectRatio === '16:9') {
    targetW = 1920;
    targetH = 1080;
  } else if (settings.aspectRatio === '9:16') {
    targetW = 1080;
    targetH = 1920;
  } else if (settings.aspectRatio === '1:1') {
    targetW = 1080;
    targetH = 1080;
  } else if (settings.aspectRatio === '4:3') {
    targetW = 1440;
    targetH = 1080;
  } else if (clips[0]) {
    targetW = clips[0].originalWidth || 1280;
    targetH = clips[0].originalHeight || 720;
  }

  if (settings.resolution === '720p') {
    const scale = 720 / Math.min(targetW, targetH);
    targetW = Math.round(targetW * scale);
    targetH = Math.round(targetH * scale);
  } else if (settings.resolution === '480p') {
    const scale = 480 / Math.min(targetW, targetH);
    targetW = Math.round(targetW * scale);
    targetH = Math.round(targetH * scale);
  }

  if (targetW % 2 !== 0) targetW += 1;
  if (targetH % 2 !== 0) targetH += 1;

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas Context 생성 실패');

  const fps = settings.fps || 30;
  const stream = canvas.captureStream(fps);

  // 2. Audio Context & Mixing
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  let combinedStream: MediaStream = stream;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
    audioDest = audioCtx.createMediaStreamDestination();
    const audioTracks = audioDest.stream.getAudioTracks();
    if (audioTracks.length > 0) {
      combinedStream = new MediaStream([...stream.getVideoTracks(), audioTracks[0]]);
    }
  } catch {
    combinedStream = stream;
  }

  // 3. MediaRecorder Bitrate & MimeType
  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';

  let videoBitrate = 5000000;
  if (settings.quality === 'high') videoBitrate = 8000000;
  else if (settings.quality === 'standard') videoBitrate = 2500000;

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: videoBitrate,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      const finalBlob = new Blob(chunks, { type: mimeType });
      resolve(finalBlob);
    };

    recorder.onerror = (err) => {
      reject(err);
    };

    recorder.start(100);

    // Sequential Frame Rendering Loop
    let currentGlobalTime = 0;
    const timeStep = 1 / fps;

    // Load HTMLVideoElements for video clips
    const videoElements = new Map<string, HTMLVideoElement>();
    const imageElements = new Map<string, HTMLImageElement>();

    clips.forEach((clip) => {
      if (clip.type === 'video') {
        const v = document.createElement('video');
        v.src = clip.src;
        v.crossOrigin = 'anonymous';
        v.muted = true;
        v.playsInline = true;
        videoElements.set(clip.id, v);
      } else {
        const img = new Image();
        img.src = clip.src;
        imageElements.set(clip.id, img);
      }
    });

    const renderNextFrame = async () => {
      if (abortSignal?.aborted) {
        recorder.stop();
        reject(new Error('사용자에 의해 렌더링이 취소되었습니다.'));
        return;
      }

      if (currentGlobalTime >= totalDuration) {
        recorder.stop();
        return;
      }

      const { clip, clipSourceTimeSec } = getClipAtGlobalTime(clips, currentGlobalTime);

      if (clip) {
        if (clip.type === 'video') {
          const videoElem = videoElements.get(clip.id);
          if (videoElem) {
            await seekVideoToTime(videoElem, clipSourceTimeSec);
            drawClipFrameToCanvas(
              ctx,
              videoElem,
              clip,
              targetW,
              targetH,
              settings.fitMode,
              settings.backgroundColor || '#000000'
            );
          }
        } else {
          const imgElem = imageElements.get(clip.id);
          if (imgElem) {
            drawClipFrameToCanvas(
              ctx,
              imgElem,
              clip,
              targetW,
              targetH,
              settings.fitMode,
              settings.backgroundColor || '#000000'
            );
          }
        }
      }

      // Text Overlays
      drawTextOverlaysToCanvas(ctx, textClips, currentGlobalTime, targetW, targetH);

      const percent = Math.min(99, Math.round((currentGlobalTime / totalDuration) * 100));
      if (onProgress) {
        onProgress(percent, `프레임 렌더링 중... (${percent}%)`);
      }

      currentGlobalTime += timeStep;
      requestAnimationFrame(renderNextFrame);
    };

    renderNextFrame();
  });
}

function seekVideoToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    if (Math.abs(video.currentTime - time) < 0.05) {
      resolve();
      return;
    }
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}

/**
 * Export Multi-Track Timeline Project to GIF Blob
 */
export async function exportStudioGif(
  clips: VideoStudioClipItem[],
  textClips: VideoStudioTextItem[],
  settings: VideoStudioExportSettings,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const totalDuration = calculateTotalTimelineDuration(clips);
  const fps = Math.min(15, settings.fps || 10);
  const frameCount = Math.round(totalDuration * fps);

  let targetW = 480;
  let targetH = 320;
  if (settings.aspectRatio === '1:1') {
    targetW = 400;
    targetH = 400;
  } else if (settings.aspectRatio === '9:16') {
    targetW = 360;
    targetH = 640;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas Context 생성 실패');

  // Video Elements
  const videoElements = new Map<string, HTMLVideoElement>();
  const imageElements = new Map<string, HTMLImageElement>();

  clips.forEach((clip) => {
    if (clip.type === 'video') {
      const v = document.createElement('video');
      v.src = clip.src;
      v.crossOrigin = 'anonymous';
      v.muted = true;
      v.playsInline = true;
      videoElements.set(clip.id, v);
    } else {
      const img = new Image();
      img.src = clip.src;
      imageElements.set(clip.id, img);
    }
  });

  const capturedImages: string[] = [];
  const timeStep = totalDuration / Math.max(1, frameCount);

  for (let i = 0; i < frameCount; i += 1) {
    const globalTime = i * timeStep;
    const { clip, clipSourceTimeSec } = getClipAtGlobalTime(clips, globalTime);

    if (clip) {
      if (clip.type === 'video') {
        const v = videoElements.get(clip.id);
        if (v) {
          await seekVideoToTime(v, clipSourceTimeSec);
          drawClipFrameToCanvas(
            ctx,
            v,
            clip,
            targetW,
            targetH,
            settings.fitMode,
            settings.backgroundColor || '#000000'
          );
        }
      } else {
        const img = imageElements.get(clip.id);
        if (img) {
          drawClipFrameToCanvas(
            ctx,
            img,
            clip,
            targetW,
            targetH,
            settings.fitMode,
            settings.backgroundColor || '#000000'
          );
        }
      }
    }

    drawTextOverlaysToCanvas(ctx, textClips, globalTime, targetW, targetH);
    capturedImages.push(canvas.toDataURL('image/jpeg', 0.8));

    if (onProgress) {
      onProgress(Math.round(((i + 1) / frameCount) * 50));
    }
  }

  return new Promise((resolve, reject) => {
    gifshot.createGIF(
      {
        images: capturedImages,
        gifWidth: targetW,
        gifHeight: targetH,
        interval: 1 / fps,
        numWorkers: 2,
      },
      (obj) => {
        if (!obj.error) {
          if (onProgress) onProgress(100);
          fetch(obj.image)
            .then((res) => res.blob())
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error(obj.errorMsg || 'GIF 생성 실패'));
        }
      }
    );
  });
}
