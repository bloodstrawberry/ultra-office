export interface VideoCompressionSettings {
  strength: number;
  width: number;
  height: number;
  bitrate: number;
  fps: number;
}

export interface VideoCompressionResult {
  blob: Blob;
  extension: 'mp4' | 'webm';
  hasAudio: boolean | null;
}

export type VideoCompressionFormat = 'auto' | 'mp4' | 'webm';

export function getCompressionPreviewWindow(duration: number) {
  const start = Math.min(Math.max(0, duration / 3), Math.max(0, duration - 3));
  return { start, duration: Math.min(3, duration - start) };
}

export function estimateCompressedBytes(
  duration: number,
  bitrate: number,
  preview?: {
    size: number;
    duration: number;
    hasAudio: boolean | null;
    extension: 'mp4' | 'webm';
  } | null
) {
  const videoBytesPerSecond =
    preview && preview.duration >= 2 ? preview.size / preview.duration : bitrate / 8;
  // The export stream still contains a silent audio track. MP4 spends more bytes on it than WebM.
  const audioBitrate =
    preview?.hasAudio === false ? (preview.extension === 'mp4' ? 48_000 : 0) : 128_000;
  const audioBytesPerSecond = audioBitrate / 8;
  return Math.round((videoBytesPerSecond + audioBytesPerSecond) * duration * 1.02);
}

export function getCompressionSettings(
  width: number,
  height: number,
  strength: number
): VideoCompressionSettings {
  const longEdge = Math.max(width, height);
  const limit = strength >= 75 ? 640 : strength >= 50 ? 960 : strength >= 25 ? 1280 : longEdge;
  const scale = Math.min(1, limit / longEdge);
  const outputWidth = Math.max(2, Math.round((width * scale) / 2) * 2);
  const outputHeight = Math.max(2, Math.round((height * scale) / 2) * 2);
  const pixels = outputWidth * outputHeight;
  const bitsPerPixel = 0.16 - (strength / 100) * 0.115;

  return {
    strength,
    width: outputWidth,
    height: outputHeight,
    bitrate: Math.max(180_000, Math.round(pixels * 30 * bitsPerPixel)),
    fps: 30,
  };
}

export function readVideoMetadata(url: string): Promise<{
  duration: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        reject(new Error('재생 시간을 확인할 수 없는 동영상입니다.'));
        return;
      }
      resolve({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = () => reject(new Error('브라우저에서 이 동영상을 재생할 수 없습니다.'));
    video.src = url;
  });
}

function supportedMimeType(
  format: VideoCompressionFormat,
  includeAudio: boolean
): {
  mimeType: string;
  extension: 'mp4' | 'webm';
} {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('이 브라우저는 동영상 인코딩을 지원하지 않습니다.');
  }
  const options: { mimeType: string; extension: 'mp4' | 'webm' }[] = [
    {
      mimeType: includeAudio
        ? 'video/mp4;codecs=avc1.42E01E,mp4a.40.2'
        : 'video/mp4;codecs=avc1.42E01E',
      extension: 'mp4',
    },
    { mimeType: 'video/mp4', extension: 'mp4' },
    {
      mimeType: includeAudio ? 'video/webm;codecs=vp9,opus' : 'video/webm;codecs=vp9',
      extension: 'webm',
    },
    {
      mimeType: includeAudio ? 'video/webm;codecs=vp8,opus' : 'video/webm;codecs=vp8',
      extension: 'webm',
    },
    { mimeType: 'video/webm', extension: 'webm' },
  ];
  const supported = options.find(
    ({ mimeType, extension }) =>
      (format === 'auto' || extension === format) && MediaRecorder.isTypeSupported(mimeType)
  );
  if (!supported) {
    throw new Error(
      format === 'auto'
        ? '이 브라우저에서 사용할 수 있는 동영상 인코더가 없습니다.'
        : `이 브라우저는 ${format.toUpperCase()} 출력을 지원하지 않습니다. 다른 출력 형식을 선택해 주세요.`
    );
  }
  return supported;
}

/** Encode the source at normal playback speed. A preview uses the same encoder and settings. */
export async function compressVideo(
  url: string,
  settings: VideoCompressionSettings,
  options: {
    duration: number;
    preview?: boolean;
    format?: VideoCompressionFormat;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
  }
): Promise<VideoCompressionResult> {
  const { duration, preview = false, onProgress, signal } = options;
  const { mimeType, extension } = supportedMimeType(options.format || 'auto', !preview);
  const previewWindow = getCompressionPreviewWindow(duration);
  const startAt = preview ? previewWindow.start : 0;
  const recordDuration = preview ? previewWindow.duration : duration;
  const canvas = document.createElement('canvas');
  canvas.width = settings.width;
  canvas.height = settings.height;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('동영상 캔버스를 만들 수 없습니다.');

  const video = document.createElement('video');
  video.src = url;
  video.preload = 'auto';
  video.playsInline = true;
  video.muted = preview;

  const canvasStream = canvas.captureStream(settings.fps);
  let audioContext: AudioContext | null = null;
  let stream = canvasStream;
  if (!preview) {
    try {
      audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(video);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      stream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);
    } catch {
      audioContext?.close().catch(() => {});
      canvasStream.getTracks().forEach((track) => track.stop());
      throw new Error(
        '오디오를 보존할 수 없어 압축을 중단했습니다. 다른 브라우저에서 시도해 주세요.'
      );
    }
  }

  return new Promise((resolve, reject) => {
    let recorder: MediaRecorder;
    let animationFrame = 0;
    let settled = false;
    let stopping = false;
    let hasAudio: boolean | null = null;
    const chunks: Blob[] = [];

    const cleanup = () => {
      cancelAnimationFrame(animationFrame);
      video.pause();
      video.removeAttribute('src');
      video.load();
      stream.getTracks().forEach((track) => track.stop());
      audioContext?.close().catch(() => {});
      signal?.removeEventListener('abort', abort);
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      if (recorder?.state === 'recording') recorder.stop();
      cleanup();
      reject(error);
    };
    const abort = () => fail(new Error('압축이 취소되었습니다.'));
    const stop = () => {
      if (stopping || settled) return;
      stopping = true;
      cancelAnimationFrame(animationFrame);
      video.pause();
      if (recorder.state === 'recording') recorder.stop();
    };

    try {
      recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: settings.bitrate,
        audioBitsPerSecond: 128_000,
      });
    } catch {
      fail(new Error('선택한 압축 설정으로 인코더를 시작할 수 없습니다.'));
      return;
    }

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => fail(new Error('동영상 압축 중 오류가 발생했습니다.'));
    recorder.onstop = () => {
      if (settled) return;
      settled = true;
      cleanup();
      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType });
      if (blob.size === 0) {
        reject(new Error('인코딩된 영상이 비어 있습니다.'));
      } else {
        onProgress?.(100);
        resolve({ blob, extension, hasAudio });
      }
    };
    video.onerror = () => fail(new Error('원본 동영상을 재생할 수 없습니다.'));
    video.onended = stop;
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) {
      abort();
      return;
    }

    const start = async () => {
      try {
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          await new Promise<void>((ready, error) => {
            video.addEventListener('loadeddata', () => ready(), { once: true });
            video.addEventListener(
              'error',
              () => error(new Error('동영상을 불러오지 못했습니다.')),
              {
                once: true,
              }
            );
          });
        }
        if (startAt > 0) {
          await new Promise<void>((ready) => {
            video.addEventListener('seeked', () => ready(), { once: true });
            video.currentTime = startAt;
          });
        }
        if (settled) return;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        await audioContext?.resume();
        await video.play();
        if (settled) return;
        try {
          const captured = (
            video as HTMLVideoElement & { captureStream?: () => MediaStream }
          ).captureStream?.();
          hasAudio = captured ? captured.getAudioTracks().length > 0 : null;
        } catch {
          hasAudio = null;
        }
        recorder.start(250);
        const render = () => {
          if (settled || stopping) return;
          if (video.ended || video.currentTime - startAt >= recordDuration) {
            stop();
            return;
          }
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
          onProgress?.(
            Math.min(99, Math.round(((video.currentTime - startAt) / recordDuration) * 100))
          );
          animationFrame = requestAnimationFrame(render);
        };
        animationFrame = requestAnimationFrame(render);
      } catch (error) {
        fail(error instanceof Error ? error : new Error('동영상 재생을 시작할 수 없습니다.'));
      }
    };
    void start();
  });
}
