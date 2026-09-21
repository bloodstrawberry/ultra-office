// ----------------------------------------------------------------------
// Voice & System Audio Recording Processor
// Pure Web Audio API & MediaRecorder Engine
// ----------------------------------------------------------------------

import { audioBufferToWavBlob, audioBufferToMp3Blob } from './audio-processor';

export type AudioRecordingSourceType = 'mic' | 'system' | 'mixed';

export interface AudioRecordingResult {
  blob: Blob;
  url: string;
  duration: number;
  sourceType: AudioRecordingSourceType;
  mimeType: string;
  sizeBytes: number;
}

/**
 * 1. Capture Microphone Audio Stream
 */
export async function getMicrophoneStream(echoCancellation = true): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('이 브라우저는 마이크 녹음을 지원하지 않습니다.');
  }

  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });
}

/**
 * 2. Capture Windows Entire System Audio Stream via getDisplayMedia
 */
export async function getSystemAudioStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('이 브라우저는 시스템 화면/오디오 공유를 지원하지 않습니다.');
  }

  // Request display media with audio enabled
  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: {
      // @ts-expect-error Chrome 105+ experimental hint
      systemAudio: 'include',
    },
  });

  const audioTracks = displayStream.getAudioTracks();
  if (audioTracks.length === 0) {
    // If user forgot to check "Share system audio"
    displayStream.getTracks().forEach((t) => t.stop());
    throw new Error(
      '시스템 오디오가 감지되지 않았습니다. 화면 공유 창 하단의 [시스템 오디오 공유(Share audio)]를 꼭 체크해 주세요.'
    );
  }

  // Stop video track since we only need system audio
  displayStream.getVideoTracks().forEach((track) => track.stop());

  return new MediaStream(audioTracks);
}

/**
 * 3. Mix Microphone and System Audio into a Single Unified MediaStream
 */
export function createMixedAudioStream(
  micStream: MediaStream,
  systemStream: MediaStream
): { mixedStream: MediaStream; audioCtx: AudioContext } {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const destination = audioCtx.createMediaStreamDestination();

  // Connect Mic source
  const micSource = audioCtx.createMediaStreamSource(micStream);
  const micGain = audioCtx.createGain();
  micGain.gain.value = 1.0;
  micSource.connect(micGain);
  micGain.connect(destination);

  // Connect System source
  const systemSource = audioCtx.createMediaStreamSource(systemStream);
  const systemGain = audioCtx.createGain();
  systemGain.gain.value = 1.0;
  systemSource.connect(systemGain);
  systemGain.connect(destination);

  return {
    mixedStream: destination.stream,
    audioCtx,
  };
}

/**
 * 4. Analyser Setup for Real-time Waveform / Volume Metering
 */
export function createAudioAnalyser(stream: MediaStream): {
  audioCtx: AudioContext;
  analyser: AnalyserNode;
  cleanup: () => void;
} {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();

  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);

  const cleanup = () => {
    try {
      source.disconnect();
      analyser.disconnect();
      if (audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  return { audioCtx, analyser, cleanup };
}

/**
 * 5. Audio Recorder Manager for controlling recording lifecycle
 */
export class AudioRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;

  private recordedChunks: Blob[] = [];

  private startTime = 0;

  private activeStream: MediaStream | null = null;

  private auxAudioCtx: AudioContext | null = null;

  async start(
    sourceType: AudioRecordingSourceType,
    onStopCallback?: (result: AudioRecordingResult) => void
  ): Promise<MediaStream> {
    let stream: MediaStream;
    let auxCtx: AudioContext | null = null;

    if (sourceType === 'mic') {
      stream = await getMicrophoneStream();
    } else if (sourceType === 'system') {
      stream = await getSystemAudioStream();
    } else {
      // mixed
      const [mic, sys] = await Promise.all([getMicrophoneStream(), getSystemAudioStream()]);
      const mixed = createMixedAudioStream(mic, sys);
      stream = mixed.mixedStream;
      auxCtx = mixed.audioCtx;

      // Ensure tracks stop when recording ends
      stream.addEventListener('inactive', () => {
        mic.getTracks().forEach((t) => t.stop());
        sys.getTracks().forEach((t) => t.stop());
      });
    }

    this.activeStream = stream;
    this.auxAudioCtx = auxCtx;
    this.recordedChunks = [];
    this.startTime = performance.now();

    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/mp4';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = '';

    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const duration = (performance.now() - this.startTime) / 1000;
      const finalMime = recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(this.recordedChunks, { type: finalMime });
      const url = URL.createObjectURL(audioBlob);

      // Stop stream tracks
      stream.getTracks().forEach((track) => track.stop());
      if (this.auxAudioCtx && this.auxAudioCtx.state !== 'closed') {
        this.auxAudioCtx.close().catch(() => {});
      }

      if (onStopCallback) {
        onStopCallback({
          blob: audioBlob,
          url,
          duration: Math.max(0.1, duration),
          sourceType,
          mimeType: finalMime,
          sizeBytes: audioBlob.size,
        });
      }
    };

    this.mediaRecorder = recorder;
    recorder.start(100); // 100ms time slice
    return stream;
  }

  pause() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resume() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  isPaused(): boolean {
    return this.mediaRecorder?.state === 'paused';
  }

  destroy() {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((t) => t.stop());
      this.activeStream = null;
    }
    if (this.auxAudioCtx && this.auxAudioCtx.state !== 'closed') {
      this.auxAudioCtx.close().catch(() => {});
      this.auxAudioCtx = null;
    }
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }
}

/**
 * 6. Convert Recorded Blob to MP3 or WAV
 */
export async function convertBlobToAudioFormat(
  blob: Blob,
  format: 'mp3' | 'wav',
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    if (format === 'mp3') {
      return await audioBufferToMp3Blob(audioBuffer, {
        kbps: 192,
        onProgress,
      });
    }
    return audioBufferToWavBlob(audioBuffer);
  } finally {
    if (audioCtx.state !== 'closed') {
      await audioCtx.close();
    }
  }
}
