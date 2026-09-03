// ----------------------------------------------------------------------
// Video Batch Processor - Transcoding & Packaging Utilities
// ----------------------------------------------------------------------

import JSZip from 'jszip';

import { extractAudioFromVideoFile } from './audio-processor';

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  previewUrl: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number;
  resultBlob?: Blob;
  resultUrl?: string;
  resultName?: string;
  errorMessage?: string;
}

export interface BatchTranscodeOptions {
  resolution: 'original' | '1080p' | '720p' | '480p';
  fps?: number;
  quality?: 'high' | 'medium' | 'standard';
  bitrateKbps?: 128 | 192 | 256 | 320;
}

/**
 * Reads video metadata (duration, dimensions) from File
 */
export function getVideoMetadata(
  file: File
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      const dur = isFinite(video.duration) ? video.duration : 0;
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      URL.revokeObjectURL(url);
      resolve({ duration: dur, width: w, height: h });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ duration: 0, width: 1280, height: 720 });
    };
  });
}

/**
 * Transcode single video file to MP4/WebM video blob using Canvas & MediaRecorder
 */
export async function transcodeSingleVideoToMp4(
  file: File,
  options?: BatchTranscodeOptions,
  onProgress?: (percent: number) => void,
  abortSignal?: AbortSignal
): Promise<{ blob: Blob; url: string; ext: string }> {
  const meta = await getVideoMetadata(file);
  const duration = meta.duration || 5;

  let targetW = meta.width;
  let targetH = meta.height;

  if (options?.resolution === '1080p') {
    const scale = 1080 / Math.max(targetW, targetH);
    targetW = Math.round(targetW * scale);
    targetH = Math.round(targetH * scale);
  } else if (options?.resolution === '720p') {
    const scale = 720 / Math.max(targetW, targetH);
    targetW = Math.round(targetW * scale);
    targetH = Math.round(targetH * scale);
  } else if (options?.resolution === '480p') {
    const scale = 480 / Math.max(targetW, targetH);
    targetW = Math.round(targetW * scale);
    targetH = Math.round(targetH * scale);
  }

  if (targetW % 2 !== 0) targetW += 1;
  if (targetH % 2 !== 0) targetH += 1;

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D Context를 생성할 수 없습니다.');

  const fps = options?.fps || 30;
  const canvasStream = canvas.captureStream(fps);

  // Audio capture
  const videoElem = document.createElement('video');
  const fileUrl = URL.createObjectURL(file);
  videoElem.src = fileUrl;
  videoElem.crossOrigin = 'anonymous';
  videoElem.muted = false;
  videoElem.playsInline = true;

  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  let combinedStream: MediaStream = canvasStream;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
    audioDest = audioCtx.createMediaStreamDestination();

    const audioSource = audioCtx.createMediaElementSource(videoElem);
    audioSource.connect(audioDest);

    const audioTracks = audioDest.stream.getAudioTracks();
    if (audioTracks.length > 0) {
      combinedStream = new MediaStream([...canvasStream.getVideoTracks(), audioTracks[0]]);
    }
  } catch {
    combinedStream = canvasStream;
  }

  // Determine supported MIME type
  let mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
  let ext = 'mp4';

  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/mp4';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp9,opus';
    ext = 'webm';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
    ext = 'webm';
  }

  let videoBps = 4000000;
  if (options?.quality === 'high') videoBps = 7000000;
  else if (options?.quality === 'standard') videoBps = 2000000;

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: videoBps,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    let animId = 0;

    const cleanup = () => {
      cancelAnimationFrame(animId);
      URL.revokeObjectURL(fileUrl);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };

    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        if (recorder.state === 'recording') recorder.stop();
        cleanup();
        reject(new Error('작업이 사용자에 의해 취소되었습니다.'));
      });
    }

    recorder.onstop = () => {
      cleanup();
      const finalBlob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(finalBlob);
      resolve({ blob: finalBlob, url, ext });
    };

    recorder.onerror = (err) => {
      cleanup();
      reject(err);
    };

    videoElem.onloadeddata = async () => {
      try {
        if (audioCtx && audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        await videoElem.play();
        recorder.start(100);

        const renderLoop = () => {
          if (videoElem.ended || (abortSignal && abortSignal.aborted)) {
            if (recorder.state === 'recording') recorder.stop();
            return;
          }

          ctx.drawImage(videoElem, 0, 0, targetW, targetH);

          if (duration > 0 && onProgress) {
            const pct = Math.min(99, Math.round((videoElem.currentTime / duration) * 100));
            onProgress(pct);
          }

          animId = requestAnimationFrame(renderLoop);
        };

        animId = requestAnimationFrame(renderLoop);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    videoElem.onerror = () => {
      cleanup();
      reject(new Error(`비디오 로드 실패: ${file.name}`));
    };
  });
}

/**
 * Transcode single video file to MP3 audio blob
 */
export async function transcodeSingleVideoToMp3(
  file: File,
  bitrateKbps: 128 | 192 | 256 | 320 = 192,
  onProgress?: (percent: number) => void
): Promise<{ blob: Blob; url: string; ext: string }> {
  const res = await extractAudioFromVideoFile(file, {
    format: 'mp3',
    kbps: bitrateKbps,
    channels: 2,
    volume: 1.0,
    onProgress: (p) => {
      onProgress?.(p);
    },
  });

  return { blob: res.blob, url: res.url, ext: 'mp3' };
}

/**
 * Package multiple blobs into a single ZIP archive for one-click bulk download
 */
export async function packageFilesToZip(
  items: { name: string; blob: Blob }[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  items.forEach((item) => {
    zip.file(item.name, item.blob);
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  return zipBlob;
}
