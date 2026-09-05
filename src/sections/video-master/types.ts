// ----------------------------------------------------------------------
// Video Master Type Definitions
// ----------------------------------------------------------------------

export interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  duration: number;
  width: number;
  height: number;
  aspectRatio: string;
  hasAudio: boolean;
}

export interface VideoFilterSettings {
  brightness: number; // 50% - 200% (default 100)
  contrast: number; // 50% - 200% (default 100)
  saturation: number; // 0% - 200% (default 100)
  hueRotate: number; // 0 - 360 deg (default 0)
  blur: number; // 0 - 20 px (default 0)
  grayscale: number; // 0% - 100% (default 0)
  sepia: number; // 0% - 100% (default 0)
  invert: number; // 0% - 100% (default 0)
}

export interface TextOverlaySettings {
  enabled: boolean;
  text: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  position: 'top' | 'center' | 'bottom' | 'custom';
  customX: number; // 0% - 100%
  customY: number; // 0% - 100%
  fontFamily: string;
}

export interface WatermarkSettings {
  enabled: boolean;
  imageSrc: string | null;
  imageElement?: HTMLImageElement;
  width: number; // 20 - 300 px
  opacity: number; // 0.1 - 1.0
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  margin: number;
}

export interface TransformSettings {
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  aspectRatio: 'original' | '16:9' | '9:16' | '1:1' | '4:3';
  fitMode: 'contain' | 'cover';
}

export interface RenderProgress {
  phase: string;
  percent: number;
  currentFrame?: number;
  totalFrames?: number;
}

export type VideoPresetKey =
  | 'normal'
  | 'vintage'
  | 'cyberpunk'
  | 'warm'
  | 'cool'
  | 'noir'
  | 'vivid'
  | 'dramatic';

export interface FilterPreset {
  id: VideoPresetKey;
  name: string;
  filter: VideoFilterSettings;
}

export interface ExtractedFrame {
  id: string;
  timeSec: number;
  timeFormatted: string;
  dataUrl: string;
}

export interface MergeClipItem {
  id: string;
  file: File;
  name: string;
  size: number;
  duration: number;
  previewUrl: string;
}

export interface STTTranscriptItem {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  isFinal?: boolean;
}

export interface STTLanguage {
  code: string;
  label: string;
  native: string;
}

export type STTExtractStatus = 'idle' | 'recognizing' | 'paused' | 'completed' | 'error';

// ----------------------------------------------------------------------
// Multi-Track Video Studio Types (GIF Studio Style)
// ----------------------------------------------------------------------

export interface VideoStudioClipItem {
  id: string;
  type: 'video' | 'image';
  name: string;
  file?: File;
  src: string; // Object URL or Base64 / Remote URL
  thumbnailUrl?: string;
  thumbnails?: string[]; // Filmstrip frame thumbnails
  originalWidth: number;
  originalHeight: number;
  originalDuration: number; // in seconds
  trimStart: number; // in seconds (0-based)
  trimEnd: number; // in seconds (inclusive)
  duration: number; // calculated playback duration = (trimEnd - trimStart) / speedMultiplier
  speedMultiplier: number; // 0.25 to 4.0
  volume: number; // 0 to 2.0 (default 1.0)
  mute: boolean;
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  filterPreset: VideoPresetKey;
  filters: VideoFilterSettings;
}

export interface VideoStudioTextItem {
  id: string;
  text: string;
  startTime: number; // in seconds on global timeline
  duration: number; // in seconds
  fontSize: number;
  fontColor: string;
  fontBgColor: string;
  fontFamily: string;
  position?: 'top' | 'center' | 'bottom' | 'custom';
  xPercent: number; // 0% - 100% (horizontal center = 50)
  yPercent: number; // 0% - 100% (vertical position = 85)
}

export interface VideoStudioExportSettings {
  aspectRatio: 'original' | '16:9' | '9:16' | '1:1' | '4:3';
  resolution: 'original' | '1080p' | '720p' | '480p';
  fps: number; // 15, 24, 30, 60
  format: 'mp4' | 'webm' | 'gif';
  quality: 'high' | 'medium' | 'standard';
  fitMode: 'contain' | 'cover' | 'fill';
  backgroundColor: string;
}

// ----------------------------------------------------------------------
// Subtitle Studio Types
// ----------------------------------------------------------------------

export interface SubtitleItem {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

export interface SubtitleStyleSettings {
  fontFamily: string;
  fontSize: number; // 16 - 72 px
  fontWeight: 400 | 600 | 700 | 800;
  fontColor: string; // e.g. '#ffffff'
  strokeColor: string; // e.g. '#000000'
  strokeWidth: number; // 0 - 10 px
  backgroundColor: string; // e.g. 'rgba(0, 0, 0, 0.65)'
  backgroundEnabled: boolean;
  backgroundPadding: number; // 4 - 20 px
  backgroundRadius: number; // 0 - 16 px
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  position: 'bottom' | 'top' | 'center' | 'custom';
  yPercent: number; // 0% - 100%
  xPercent: number; // 0% - 100%
  textAlign: 'left' | 'center' | 'right';
}

export interface SubtitlePreset {
  id: string;
  name: string;
  description: string;
  badge?: string;
  style: Partial<SubtitleStyleSettings>;
}
