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
