// ----------------------------------------------------------------------
// Audio Processor - Pure Web Audio API & PCM WAV Encoder
// ----------------------------------------------------------------------

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
    // Interleave stereo
    const left = buffer.getChannelData(0);
    const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
    result = new Float32Array(left.length + right.length);
    for (let i = 0; i < left.length; i += 1) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
  } else {
    // Mono
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
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < result.length; i += 1) {
    // Clamp sample between -1 and 1
    const s = Math.max(-1, Math.min(1, result[i] * volume));
    // Scale to 16-bit signed integer
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
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
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
