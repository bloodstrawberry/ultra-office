export type RecordingSource = 'screen' | 'camera' | 'pip_both';

export type RecordingStatus = 'idle' | 'preparing' | 'recording' | 'paused' | 'completed';

export interface RecordedMedia {
  id: string;
  blob: Blob;
  url: string;
  duration: number; // in seconds
  mimeType: string;
  width: number;
  height: number;
  createdAt: string;
  sizeBytes: number;
}

export interface GifConvertOptions {
  fps: number;
  width: number;
  height: number;
  quality: number; // 1 ~ 10
  startTime: number;
  endTime: number;
}
