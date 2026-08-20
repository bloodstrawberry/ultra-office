import gifshot from 'gifshot';
import type { RecordedMedia, GifConvertOptions } from '../types';

// ----------------------------------------------------------------------

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if screen recording is supported in current browser
 */
export function isScreenRecordingSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;
}

/**
 * Extract frames from Video Element and convert to GIF using gifshot
 */
export async function convertVideoToGif(
  videoUrl: string,
  options: GifConvertOptions,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;

    video.onloadedmetadata = async () => {
      const duration = options.endTime - options.startTime;
      const totalFrames = Math.floor(duration * options.fps);
      const interval = 1 / options.fps;
      const images: string[] = [];

      const canvas = document.createElement('canvas');
      canvas.width = options.width;
      canvas.height = options.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      let currentTime = options.startTime;

      const captureFrame = () => {
        if (currentTime > options.endTime || images.length >= totalFrames) {
          // Generate GIF with gifshot
          gifshot.createGIF(
            {
              images,
              gifWidth: options.width,
              gifHeight: options.height,
              interval: interval,
              numFrames: images.length,
            },
            (obj: { error: boolean; image: string }) => {
              if (!obj.error) {
                resolve(obj.image);
              } else {
                reject(new Error('GIF 생성에 실패했습니다.'));
              }
            }
          );
          return;
        }

        video.currentTime = currentTime;
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, options.width, options.height);
        images.push(canvas.toDataURL('image/jpeg', 0.8));

        if (onProgress) {
          onProgress(Math.round((images.length / totalFrames) * 100));
        }

        currentTime += interval;
        captureFrame();
      };

      captureFrame();
    };

    video.onerror = () => {
      reject(new Error('비디오 로드 중 오류가 발생했습니다.'));
    };
  });
}
