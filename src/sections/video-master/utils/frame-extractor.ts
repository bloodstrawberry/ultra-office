// ----------------------------------------------------------------------
// Frame Extractor - Snapshots & Timeline Frame Sampling
// ----------------------------------------------------------------------

import type { ExtractedFrame } from '../types';

import JSZip from 'jszip';

import { formatTime } from './audio-processor';

export type ImageFormatType = 'image/png' | 'image/jpeg' | 'image/webp';

/**
 * Capture current frame of a video element
 */
export function captureCurrentVideoFrame(
  video: HTMLVideoElement,
  format: ImageFormatType = 'image/png',
  quality = 0.95
): string {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(format, quality);
}

/**
 * Capture frame at a specific timestamp in video URL
 */
export async function captureVideoFrameAtTime(
  videoUrl: string,
  timeSec: number,
  format: ImageFormatType = 'image/png',
  quality = 0.95
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      try {
        const safeTime = Math.max(0, Math.min(timeSec, video.duration || timeSec));
        await seekVideoToTime(video, safeTime);

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(format, quality));
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () => {
      reject(new Error('비디오 파일을 로드할 수 없습니다.'));
    };
  });
}

/**
 * Extract multiple frames evenly spaced across video
 */
export async function extractFramesFromVideo(
  videoUrl: string,
  frameCount = 10,
  onProgress?: (progress: number) => void,
  format: ImageFormatType = 'image/jpeg',
  quality = 0.85
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      if (!duration || duration <= 0) {
        reject(new Error('비디오 재생 시간을 확인할 수 없습니다.'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.'));
        return;
      }

      const frames: ExtractedFrame[] = [];
      const interval = duration / (frameCount + 1);

      try {
        for (let i = 1; i <= frameCount; i += 1) {
          const targetTime = i * interval;
          await seekVideoToTime(video, targetTime);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL(format, quality);

          frames.push({
            id: `frame-${i}-${Date.now()}`,
            timeSec: targetTime,
            timeFormatted: formatTime(targetTime),
            dataUrl,
          });

          if (onProgress) {
            onProgress(Math.round((i / frameCount) * 100));
          }
        }

        resolve(frames);
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () => {
      reject(new Error('비디오 파일을 로드할 수 없습니다.'));
    };
  });
}

/**
 * Extract frames at specific time intervals (e.g. every 1s, 2s, 5s)
 */
export async function extractFramesByInterval(
  videoUrl: string,
  intervalSec = 1,
  startTime = 0,
  endTime?: number,
  onProgress?: (progress: number) => void,
  format: ImageFormatType = 'image/jpeg',
  quality = 0.85,
  maxLimit = 100
): Promise<ExtractedFrame[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      const totalDuration = video.duration || 0;
      const end =
        endTime !== undefined && endTime > 0 ? Math.min(endTime, totalDuration) : totalDuration;
      const start = Math.max(0, startTime);

      if (end <= start || intervalSec <= 0) {
        reject(new Error('추출 구간 또는 간격 설정이 유효하지 않습니다.'));
        return;
      }

      const timestamps: number[] = [];
      for (let t = start; t <= end; t += intervalSec) {
        timestamps.push(t);
        if (timestamps.length >= maxLimit) break;
      }

      if (timestamps.length === 0) {
        reject(new Error('추출할 프레임이 없습니다.'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D 컨텍스트를 생성할 수 없습니다.'));
        return;
      }

      const frames: ExtractedFrame[] = [];
      try {
        for (let i = 0; i < timestamps.length; i += 1) {
          const targetTime = timestamps[i];
          await seekVideoToTime(video, targetTime);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL(format, quality);

          frames.push({
            id: `interval-frame-${i}-${Date.now()}`,
            timeSec: targetTime,
            timeFormatted: formatTime(targetTime),
            dataUrl,
          });

          if (onProgress) {
            onProgress(Math.round(((i + 1) / timestamps.length) * 100));
          }
        }

        resolve(frames);
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = () => {
      reject(new Error('비디오 파일을 로드할 수 없습니다.'));
    };
  });
}

function seekVideoToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}

/**
 * Zip multiple frames and return blob for download
 */
export async function createZipFromFrames(
  frames: ExtractedFrame[],
  baseName = 'video_frame'
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder('extracted_images');

  frames.forEach((frame, idx) => {
    let ext = 'jpg';
    if (frame.dataUrl.startsWith('data:image/png')) ext = 'png';
    else if (frame.dataUrl.startsWith('data:image/webp')) ext = 'webp';

    const base64Data = frame.dataUrl.replace(/^data:image\/(png|jpeg|webp);base64,/, '');
    const filename = `${baseName}_${String(idx + 1).padStart(3, '0')}_${frame.timeFormatted.replace(':', 'm')}s.${ext}`;
    folder?.file(filename, base64Data, { base64: true });
  });

  return zip.generateAsync({ type: 'blob' });
}
