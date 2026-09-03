// ----------------------------------------------------------------------
// Audio Processor - Pure Web Audio API & LAME MP3 / PCM WAV Encoder
// ----------------------------------------------------------------------

import { Mp3Encoder } from '@breezystack/lamejs';

export interface AudioExtractSettings {
  format: 'mp3' | 'wav';
  kbps?: 128 | 192 | 256 | 320;
  channels?: 1 | 2;
  volume?: number;
  startTimeSec?: number;
  endTimeSec?: number;
  onProgress?: (progress: number, phase: string) => void;
}

export interface AudioExtractResult {
  blob: Blob;
  url: string;
  duration: number;
  format: 'mp3' | 'wav';
  channels: number;
  sampleRate: number;
  sizeBytes: number;
}

/**
 * Extracts AudioBuffer from a video or audio file
 */
export async function extractAudioBufferFromFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } finally {
    await audioCtx.close();
  }
}

/**
 * Slice AudioBuffer by start and end time in seconds
 */
export function sliceAudioBuffer(
  buffer: AudioBuffer,
  startTimeSec: number,
  endTimeSec: number
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const numberOfChannels = buffer.numberOfChannels;

  const startOffset = Math.max(0, Math.floor(startTimeSec * sampleRate));
  const endOffset = Math.min(buffer.length, Math.floor(endTimeSec * sampleRate));
  const frameCount = Math.max(1, endOffset - startOffset);

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const newBuffer = audioCtx.createBuffer(numberOfChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numberOfChannels; channel += 1) {
    const channelData = buffer.getChannelData(channel);
    const newChannelData = newBuffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i += 1) {
      newChannelData[i] = channelData[startOffset + i];
    }
  }

  audioCtx.close();
  return newBuffer;
}

/**
 * Converts Float32Array PCM to Int16Array with volume scaling and clamping
 */
function floatToInt16(floatData: Float32Array, volume = 1.0): Int16Array {
  const int16 = new Int16Array(floatData.length);
  for (let i = 0; i < floatData.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, floatData[i] * volume));
    int16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return int16;
}

/**
 * Converts AudioBuffer into pure MP3 Blob using LAME encoder
 */
export async function audioBufferToMp3Blob(
  buffer: AudioBuffer,
  options?: {
    kbps?: number;
    channels?: number;
    volume?: number;
    onProgress?: (progress: number) => void;
  }
): Promise<Blob> {
  const requestedChannels = options?.channels ?? 2;
  const numChannels = Math.min(requestedChannels, buffer.numberOfChannels);
  const sampleRate = buffer.sampleRate;
  const kbps = options?.kbps ?? 192;
  const volume = options?.volume ?? 1.0;

  const mp3encoder = new Mp3Encoder(numChannels, sampleRate, kbps);
  const mp3Data: Uint8Array[] = [];

  const leftFloat = buffer.getChannelData(0);
  const leftInt16 = floatToInt16(leftFloat, volume);

  let rightInt16: Int16Array | undefined;
  if (numChannels === 2) {
    const rightFloat = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : leftFloat;
    rightInt16 = floatToInt16(rightFloat, volume);
  }

  const sampleBlockSize = 1152;
  const totalSamples = leftInt16.length;

  for (let i = 0; i < totalSamples; i += sampleBlockSize) {
    const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
    let mp3buf: Uint8Array;

    if (numChannels === 2 && rightInt16) {
      const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
      mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    } else {
      mp3buf = mp3encoder.encodeBuffer(leftChunk);
    }

    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }

    if (
      options?.onProgress &&
      (i % (sampleBlockSize * 15) === 0 || i + sampleBlockSize >= totalSamples)
    ) {
      const pct = Math.min(95, Math.round((i / totalSamples) * 95));
      options.onProgress(pct);
      // Yield to browser UI thread
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  const endBuf = mp3encoder.flush();
  if (endBuf.length > 0) {
    mp3Data.push(new Uint8Array(endBuf));
  }

  if (options?.onProgress) {
    options.onProgress(100);
  }

  return new Blob(mp3Data as BlobPart[], { type: 'audio/mp3' });
}

/**
 * Converts AudioBuffer into 16-bit PCM WAV Blob
 */
export function audioBufferToWavBlob(
  buffer: AudioBuffer,
  options?: {
    volume?: number;
    channels?: number;
  }
): Blob {
  const numChannels = options?.channels
    ? Math.min(options.channels, buffer.numberOfChannels)
    : buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const volume = options?.volume ?? 1.0;

  let result: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
    result = new Float32Array(left.length + right.length);
    for (let i = 0; i < left.length; i += 1) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = result.length * (bitDepth / 8);
  const bufferSize = 44 + dataSize;
  const wavBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(wavBuffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < result.length; i += 1) {
    const s = Math.max(-1, Math.min(1, result[i] * volume));
    const sample = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * All-in-one Video to MP3/WAV Audio Extractor Pipeline
 */
export async function extractAudioFromVideoFile(
  file: File,
  settings: AudioExtractSettings
): Promise<AudioExtractResult> {
  settings.onProgress?.(5, '동영상 오디오 트랙 디코딩 중...');
  const fullBuffer = await extractAudioBufferFromFile(file);

  const duration = fullBuffer.duration;
  const startTime = Math.max(0, settings.startTimeSec ?? 0);
  const endTime = Math.min(duration, settings.endTimeSec ?? duration);

  let targetBuffer = fullBuffer;
  if (startTime > 0 || endTime < duration) {
    settings.onProgress?.(25, '오디오 구간 자르기 중...');
    targetBuffer = sliceAudioBuffer(fullBuffer, startTime, endTime);
  }

  let audioBlob: Blob;
  const format = settings.format;

  if (format === 'mp3') {
    settings.onProgress?.(35, 'LAME MP3 고음질 인코딩 중...');
    audioBlob = await audioBufferToMp3Blob(targetBuffer, {
      kbps: settings.kbps ?? 192,
      channels: settings.channels ?? 2,
      volume: settings.volume ?? 1.0,
      onProgress: (p) => {
        const overall = 35 + Math.round(p * 0.6);
        settings.onProgress?.(overall, `MP3 인코딩 중 (${p}%)...`);
      },
    });
  } else {
    settings.onProgress?.(70, '무손실 16-bit WAV 생성 중...');
    audioBlob = audioBufferToWavBlob(targetBuffer, {
      channels: settings.channels ?? 2,
      volume: settings.volume ?? 1.0,
    });
  }

  settings.onProgress?.(100, '변환 완료!');
  const url = URL.createObjectURL(audioBlob);

  return {
    blob: audioBlob,
    url,
    duration: targetBuffer.duration,
    format,
    channels: Math.min(settings.channels ?? 2, targetBuffer.numberOfChannels),
    sampleRate: targetBuffer.sampleRate,
    sizeBytes: audioBlob.size,
  };
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.0';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

/**
 * Format bytes to readable size
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
