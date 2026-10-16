import type { FFmpeg } from '@ffmpeg/ffmpeg';
import type { VideoCompressionResult } from './video-compress-processor';

import { getCompressionPreviewWindow } from './video-compress-processor';

export type QualityFormat = 'mp4' | 'webm';

function coreUrls() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const corePath = `${basePath}/ffmpeg-core`;
  return { coreURL: `${corePath}/ffmpeg-core.js?v=0.12.10`, wasmURL: `${corePath}/ffmpeg-core.wasm` };
}

let wrapperPromise: Promise<void> | null = null;

function createFfmpeg(): Promise<FFmpeg> {
  const browserWindow = window as Window & { FFmpegWASM?: { FFmpeg: new () => FFmpeg } };
  if (!browserWindow.FFmpegWASM) {
    wrapperPromise ??= new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/ffmpeg-core/ffmpeg.js`;
      script.onload = () => resolve();
      script.onerror = () => {
        wrapperPromise = null;
        reject(new Error('FFmpeg 스크립트를 불러오지 못했습니다.'));
      };
      document.head.appendChild(script);
    });
  }
  return (wrapperPromise || Promise.resolve()).then(() => {
    if (!browserWindow.FFmpegWASM) throw new Error('FFmpeg 인코더를 시작하지 못했습니다.');
    return new browserWindow.FFmpegWASM.FFmpeg();
  });
}

export async function readVideoMetadataWithFfmpeg(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
}> {
  const ffmpeg = await createFfmpeg();
  const logs: string[] = [];
  ffmpeg.on('log', ({ message }) => {
    if (message.trim()) logs.push(message.trim());
  });
  try {
    await ffmpeg.load(coreUrls());
    await ffmpeg.writeFile('source-video', new Uint8Array(await file.arrayBuffer()));
    // FFmpeg prints container/stream metadata even when no output is specified.
    await ffmpeg.exec(['-hide_banner', '-i', 'source-video']);
    const durationMatch = logs.join('\n').match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    const videoLine = logs.find((line) => /Stream.*Video:/.test(line));
    const sizeMatch = videoLine?.match(/\b(\d{2,5})x(\d{2,5})\b/);
    const duration = durationMatch
      ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3])
      : 0;
    const width = Number(sizeMatch?.[1]);
    const height = Number(sizeMatch?.[2]);
    if (!Number.isFinite(duration) || duration <= 0 || !width || !height) {
      throw new Error('영상의 재생 시간이나 해상도를 확인할 수 없습니다.');
    }
    return { duration, width, height };
  } finally {
    ffmpeg.terminate();
  }
}

/** CRF keeps a target level of visual quality instead of forcing a fixed bitrate. */
export function getQualityCrf(strength: number, format: QualityFormat) {
  return Math.round((format === 'mp4' ? 18 : 10) + (strength / 100) * (format === 'mp4' ? 17 : 30));
}

export async function compressVideoWithFfmpeg(
  file: File,
  options: {
    duration: number;
    strength: number;
    format: QualityFormat;
    preview?: boolean;
    signal?: AbortSignal;
    onProgress?: (progress: number) => void;
  }
): Promise<VideoCompressionResult> {
  const { duration, strength, format, preview = false, signal, onProgress } = options;
  if (signal?.aborted) throw new Error('압축이 취소되었습니다.');

  // The wrapper and worker are self-hosted and loaded only for quality encoding.
  const ffmpeg = await createFfmpeg();
  if (signal?.aborted) {
    ffmpeg.terminate();
    throw new Error('압축이 취소되었습니다.');
  }
  const abort = () => ffmpeg.terminate();
  signal?.addEventListener('abort', abort, { once: true });
  const logs: string[] = [];
  ffmpeg.on('log', ({ message }) => {
    if (message.trim()) {
      logs.push(message.trim());
      if (logs.length > 20) logs.shift();
    }
  });
  ffmpeg.on('progress', ({ progress }) => {
    if (Number.isFinite(progress)) onProgress?.(Math.min(99, Math.max(0, Math.round(progress * 100))));
  });

  try {
    await ffmpeg.load(coreUrls());
    if (signal?.aborted) throw new Error('압축이 취소되었습니다.');

    const inputName = `input.${file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'video'}`;
    const outputName = `output.${format}`;
    await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    if (signal?.aborted) throw new Error('압축이 취소되었습니다.');

    const previewWindow = getCompressionPreviewWindow(duration);
    const args = ['-hide_banner', '-i', inputName];
    if (preview) {
      args.push('-ss', previewWindow.start.toFixed(3), '-t', previewWindow.duration.toFixed(3));
    }
    args.push('-map', '0:v:0', '-map', '0:a?', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2');
    if (format === 'mp4') {
      args.push(
        '-c:v', 'libx264', '-preset', 'medium', '-threads', '1',
        '-crf', String(getQualityCrf(strength, format)), '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart'
      );
    } else {
      args.push(
        '-c:v', 'libvpx', '-deadline', 'good', '-cpu-used', '3', '-threads', '1',
        '-b:v', '0', '-crf', String(getQualityCrf(strength, format)),
        '-pix_fmt', 'yuv420p', '-c:a', 'libvorbis', '-b:a', '96k'
      );
    }
    args.push('-y', outputName);

    const exitCode = await ffmpeg.exec(args);
    if (signal?.aborted) throw new Error('압축이 취소되었습니다.');
    if (exitCode !== 0) {
      const errorLog = [...logs].reverse().find((line) => /error|fail|invalid|unsupported|unknown/i.test(line));
      throw new Error(
        errorLog
          ? `인코딩 실패: ${errorLog}`
          : `FFmpeg 인코딩에 실패했습니다. (코드 ${exitCode})`
      );
    }
    const data = await ffmpeg.readFile(outputName);
    if (typeof data === 'string' || data.byteLength === 0) {
      throw new Error('인코딩된 영상이 비어 있습니다.');
    }
    const bytes = new Uint8Array(data.byteLength);
    bytes.set(data);
    onProgress?.(100);
    return {
      blob: new Blob([bytes], { type: format === 'mp4' ? 'video/mp4' : 'video/webm' }),
      extension: format,
      hasAudio: null,
    };
  } catch (error) {
    if (signal?.aborted) throw new Error('압축이 취소되었습니다.');
    throw error;
  } finally {
    signal?.removeEventListener('abort', abort);
    ffmpeg.terminate();
  }
}
