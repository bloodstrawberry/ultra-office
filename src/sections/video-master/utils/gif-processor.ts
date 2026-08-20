// ----------------------------------------------------------------------
// GIF Processor - Video to Animated GIF
// ----------------------------------------------------------------------

import gifshot from 'gifshot';

export interface GifConvertOptions {
  startTime: number;
  endTime: number;
  width: number;
  height: number;
  fps: number;
  quality: number; // 1 - 10
}

/**
 * Converts a segment of a video to an animated GIF using gifshot
 */
export async function convertVideoSegmentToGif(
  videoSourceUrl: string,
  options: GifConvertOptions,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const duration = Math.max(0.5, options.endTime - options.startTime);
    const interval = 1 / options.fps;
    const numFrames = Math.floor(duration * options.fps);

    gifshot.createGIF(
      {
        video: [videoSourceUrl],
        gifWidth: options.width,
        gifHeight: options.height,
        interval,
        numFrames,
        sampleInterval: Math.max(1, 11 - options.quality),
        progressCallback: (captureProgress: number) => {
          if (onProgress) {
            onProgress(Math.round(captureProgress * 100));
          }
        },
      },
      (obj) => {
        if (obj.error) {
          reject(new Error(obj.errorMsg || 'GIF 변환 중 오류가 발생했습니다.'));
        } else {
          resolve(obj.image);
        }
      }
    );
  });
}
