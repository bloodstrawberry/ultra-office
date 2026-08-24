// ----------------------------------------------------------------------
// Frame Extractor - Snapshots & Timeline Frame Sampling
// ----------------------------------------------------------------------

import type { ExtractedFrame } from '../types';

import JSZip from 'jszip';

import { formatTime } from './audio-processor';

/**
 * Capture current frame of a video element
 */
export function captureCurrentVideoFrame(
  video: HTMLVideoElement,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
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
 * Extract multiple frames evenly spaced across video
 */
export async function extractFramesFromVideo(
  videoUrl: string,
  frameCount = 10,
  onProgress?: (progress: number) => void
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

      for (let i = 1; i <= frameCount; i += 1) {
        const targetTime = i * interval;
        await seekVideoToTime(video, targetTime);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

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
  const folder = zip.folder('extracted_frames');

  frames.forEach((frame, idx) => {
    const base64Data = frame.dataUrl.replace(/^data:image\/(png|jpeg|webp);base64,/, '');
    const filename = `${baseName}_${String(idx + 1).padStart(3, '0')}_${frame.timeFormatted.replace(':', 'm')}s.jpg`;
    folder?.file(filename, base64Data, { base64: true });
  });

  return zip.generateAsync({ type: 'blob' });
}
