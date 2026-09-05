'use client';

// ----------------------------------------------------------------------
// Device Theme & Modes
// ----------------------------------------------------------------------

export type DeviceMode = 'galaxy' | 'iphone';

export interface SampleImageItem {
  id: string;
  label: string;
  url: string;
  subLabel?: string;
  tag?: string;
}

export type TabCategory =
  | 'basic'
  | 'color'
  | 'detail'
  | 'effects'
  | 'filters'
  | 'crop'
  | 'selective'
  | 'ai'
  | 'portrait'
  | 'decorate';

// ----------------------------------------------------------------------
// 1. [기본 보정] (Basic Adjustments)
// ----------------------------------------------------------------------

export interface BasicAdjustments {
  exposure: number; // -100 ~ 100 (노출)
  brightness: number; // -100 ~ 100 (밝기)
  luminance: number; // -100 ~ 100 (휘도)
  contrast: number; // -100 ~ 100 (대비)
  highlights: number; // -100 ~ 100 (하이라이트)
  shadows: number; // -100 ~ 100 (그림자)
  whites: number; // -100 ~ 100 (화이트)
  blacks: number; // -100 ~ 100 (블랙)
  blackPoint: number; // -100 ~ 100 (블랙 포인트)
  gamma: number; // -100 ~ 100 (감마)
}

export const DEFAULT_BASIC_ADJUSTMENTS: BasicAdjustments = {
  exposure: 0,
  brightness: 0,
  luminance: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  blackPoint: 0,
  gamma: 0,
};

// ----------------------------------------------------------------------
// 2. [색상] (Color Adjustments)
// ----------------------------------------------------------------------

export type HslChannel =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'magenta';

export interface HslItem {
  h: number; // -100 ~ 100 (색조 편차)
  s: number; // -100 ~ 100 (채도 편차)
  l: number; // -100 ~ 100 (밝기 편차)
}

export type WhiteBalancePreset =
  | 'custom'
  | 'daylight'
  | 'cloudy'
  | 'shade'
  | 'tungsten'
  | 'fluorescent';

export interface ColorAdjustments {
  saturation: number; // -100 ~ 100 (채도)
  vibrance: number; // -100 ~ 100 (생동감)
  temperature: number; // -100 ~ 100 (색온도)
  tint: number; // -100 ~ 100 (색조 Tint)
  whiteBalance: WhiteBalancePreset;
  hue: number; // -180 ~ 180 (전체 Hue 회전)
  hsl: Record<HslChannel, HslItem>;
  colorGrading: {
    shadows: { color: string; intensity: number };
    midtones: { color: string; intensity: number };
    highlights: { color: string; intensity: number };
    balance: number; // -100 ~ 100
  };
}

export const DEFAULT_HSL_CHANNELS: Record<HslChannel, HslItem> = {
  red: { h: 0, s: 0, l: 0 },
  orange: { h: 0, s: 0, l: 0 },
  yellow: { h: 0, s: 0, l: 0 },
  green: { h: 0, s: 0, l: 0 },
  cyan: { h: 0, s: 0, l: 0 },
  blue: { h: 0, s: 0, l: 0 },
  purple: { h: 0, s: 0, l: 0 },
  magenta: { h: 0, s: 0, l: 0 },
};

export const DEFAULT_COLOR_ADJUSTMENTS: ColorAdjustments = {
  saturation: 0,
  vibrance: 0,
  temperature: 0,
  tint: 0,
  whiteBalance: 'custom',
  hue: 0,
  hsl: DEFAULT_HSL_CHANNELS,
  colorGrading: {
    shadows: { color: '#0055ff', intensity: 0 },
    midtones: { color: '#ffffff', intensity: 0 },
    highlights: { color: '#ffaa00', intensity: 0 },
    balance: 0,
  },
};

// ----------------------------------------------------------------------
// 3. [디테일] (Detail Adjustments)
// ----------------------------------------------------------------------

export interface DetailAdjustments {
  clarity: number; // -100 ~ 100 (선명도)
  definition: number; // -100 ~ 100 (명료도)
  texture: number; // -100 ~ 100 (텍스처)
  structure: number; // -100 ~ 100 (구조)
  dehaze: number; // -100 ~ 100 (디헤이즈)
  noiseReduction: number; // 0 ~ 100 (노이즈 감소)
  colorNoiseReduction: number; // 0 ~ 100 (색상 노이즈 감소)
  sharpening: number; // 0 ~ 100 (샤프닝)
}

export const DEFAULT_DETAIL_ADJUSTMENTS: DetailAdjustments = {
  clarity: 0,
  definition: 0,
  texture: 0,
  structure: 0,
  dehaze: 0,
  noiseReduction: 0,
  colorNoiseReduction: 0,
  sharpening: 0,
};

// ----------------------------------------------------------------------
// 4. [효과] (Effects Adjustments)
// ----------------------------------------------------------------------

export interface VignetteEffect {
  amount: number; // -100 ~ 100 (음수: 블랙 비네트, 양수: 화이트 비네트)
  midpoint: number; // 10 ~ 90
  roundness: number; // 0 ~ 100
  feather: number; // 0 ~ 100
}

export interface BokehEffect {
  amount: number; // 0 ~ 100
  shape: 'circle' | 'heart' | 'star' | 'hexagon';
  size: number; // 10 ~ 60
}

export interface LightLeakEffect {
  enabled: boolean;
  preset: string; // 'warm-corner', 'rainbow-burst', 'prism-flare', 'vintage-leak', 'sunset-glow'
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number; // 0 ~ 100
}

export interface DoubleExposureEffect {
  enabled: boolean;
  imageSrc: string | null;
  opacity: number; // 0 ~ 100
  blendMode: 'screen' | 'overlay' | 'lighten' | 'multiply' | 'soft-light';
}

export interface EffectsAdjustments {
  vignette: VignetteEffect;
  grain: { amount: number; size: number }; // 0 ~ 100
  fade: number; // 0 ~ 100 (페이드)
  blur: { amount: number; type: 'gaussian' | 'radial' | 'motion' };
  glow: { amount: number; radius: number };
  bokeh: BokehEffect;
  filmEffect: { enabled: boolean; preset: string; intensity: number };
  lightLeak: LightLeakEffect;
  doubleExposure: DoubleExposureEffect;
}

export const DEFAULT_EFFECTS_ADJUSTMENTS: EffectsAdjustments = {
  vignette: { amount: 0, midpoint: 50, roundness: 50, feather: 50 },
  grain: { amount: 0, size: 2 },
  fade: 0,
  blur: { amount: 0, type: 'gaussian' },
  glow: { amount: 0, radius: 20 },
  bokeh: { amount: 0, shape: 'circle', size: 30 },
  filmEffect: { enabled: false, preset: 'kodak-gold', intensity: 70 },
  lightLeak: { enabled: false, preset: 'warm-corner', position: 'top-right', opacity: 60 },
  doubleExposure: { enabled: false, imageSrc: null, opacity: 50, blendMode: 'screen' },
};

// ----------------------------------------------------------------------
// 5. [필터] (Filter Adjustments)
// ----------------------------------------------------------------------

export interface FilterPresetItem {
  id: string;
  name: string;
  category:
    | 'iphone'
    | 'galaxy'
    | 'vintage'
    | 'retro'
    | 'cinema'
    | 'bw'
    | 'sepia'
    | 'pastel'
    | 'film';
  subtitle: string;
  thumbnailColor: string;
  settings: Partial<BasicAdjustments & ColorAdjustments & DetailAdjustments & EffectsAdjustments>;
}

export interface FilterAdjustments {
  presetId: string; // 'none' or preset id
  intensity: number; // 0 ~ 100
}

export const DEFAULT_FILTER_ADJUSTMENTS: FilterAdjustments = {
  presetId: 'none',
  intensity: 100,
};

// ----------------------------------------------------------------------
// 6. [크롭/회전] (Crop & Transform Adjustments)
// ----------------------------------------------------------------------

export interface CropRect {
  x: number; // normalized 0 ~ 1
  y: number; // normalized 0 ~ 1
  width: number; // normalized 0 ~ 1
  height: number; // normalized 0 ~ 1
}

export interface CropAdjustments {
  cropRect: CropRect | null;
  aspectRatio: string; // 'free' | 'original' | '1:1' | '4:5' | '3:4' | '9:16' | '16:9' | '4:3' | '2:3'
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  straighten: number; // -45 ~ 45
  perspectiveVertical: number; // -30 ~ 30
  perspectiveHorizontal: number; // -30 ~ 30
  lensDistortion: number; // -50 ~ 50
}

export const DEFAULT_CROP_ADJUSTMENTS: CropAdjustments = {
  cropRect: null,
  aspectRatio: 'free',
  rotation: 0,
  flipH: false,
  flipV: false,
  straighten: 0,
  perspectiveVertical: 0,
  perspectiveHorizontal: 0,
  lensDistortion: 0,
};

// ----------------------------------------------------------------------
// 7. [선택 보정] (Selective Adjustments)
// ----------------------------------------------------------------------

export type SelectiveMaskType =
  | 'none'
  | 'brush'
  | 'radial'
  | 'rect'
  | 'linear'
  | 'color'
  | 'subject'
  | 'sky'
  | 'background';

export interface SelectiveAdjustments {
  active: boolean;
  maskType: SelectiveMaskType;
  maskInvert: boolean;
  brushRadius: number; // 5 ~ 100
  brushFeather: number; // 0 ~ 100
  radialCenter: { cx: number; cy: number; rx: number; ry: number };
  rectArea: { x: number; y: number; width: number; height: number };
  linearAngle: number; // 0 ~ 360
  colorTarget: string; // hex
  colorTolerance: number; // 10 ~ 100
  exposure: number; // -100 ~ 100
  contrast: number; // -100 ~ 100
  saturation: number; // -100 ~ 100
  temperature: number; // -100 ~ 100
  blur: number; // 0 ~ 100
}

export const DEFAULT_SELECTIVE_ADJUSTMENTS: SelectiveAdjustments = {
  active: false,
  maskType: 'none',
  maskInvert: false,
  brushRadius: 30,
  brushFeather: 50,
  radialCenter: { cx: 0.5, cy: 0.5, rx: 0.3, ry: 0.3 },
  rectArea: { x: 0.25, y: 0.25, width: 0.5, height: 0.5 },
  linearAngle: 90,
  colorTarget: '#3b82f6',
  colorTolerance: 30,
  exposure: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  blur: 0,
};

// ----------------------------------------------------------------------
// 8. [AI 편집] (AI Edit)
// ----------------------------------------------------------------------

export type AiBgMode = 'none' | 'transparent' | 'solid' | 'gradient' | 'blur' | 'preset';

export interface AiAdjustments {
  eraserActive: boolean;
  eraserBrushSize: number;
  bgRemoved: boolean;
  bgMode: AiBgMode;
  bgValue: string; // solid color hex or preset name
  outpaintingExpand: { top: number; right: number; bottom: number; left: number };
  upscaleFactor: 1 | 2 | 4;
  aiEnhance: boolean; // 선명화
  faceAutoEnhance: boolean; // 얼굴 자동 보정
}

export const DEFAULT_AI_ADJUSTMENTS: AiAdjustments = {
  eraserActive: false,
  eraserBrushSize: 24,
  bgRemoved: false,
  bgMode: 'none',
  bgValue: '#FFFFFF',
  outpaintingExpand: { top: 0, right: 0, bottom: 0, left: 0 },
  upscaleFactor: 1,
  aiEnhance: false,
  faceAutoEnhance: false,
};

// ----------------------------------------------------------------------
// 9. [인물 보정] (Portrait Adjustments)
// ----------------------------------------------------------------------

export interface BlemishSpot {
  x: number;
  y: number;
  radius: number;
}

export interface PortraitAdjustments {
  skinSmoothing: number; // 0 ~ 100 (피부 보정)
  blemishes: BlemishSpot[]; // (잡티 제거)
  wrinkleSoften: number; // 0 ~ 100 (주름 완화)
  darkCircle: number; // 0 ~ 100 (다크서클 제거)
  teethWhitening: number; // 0 ~ 100 (치아 미백)
  eyeEnlarge: number; // 0 ~ 100 (눈 크기)
  faceContour: number; // 0 ~ 100 (얼굴형 갸름하게)
  jawline: number; // 0 ~ 100 (턱선 V라인)
  noseReshape: number; // -50 ~ 50 (코 보정)
  lipEnhance: { volume: number; color: string; opacity: number };
  bodySlim: number; // 0 ~ 100 (체형 보정)
  legExtension: number; // 0 ~ 100 (다리 길이)
}

export const DEFAULT_PORTRAIT_ADJUSTMENTS: PortraitAdjustments = {
  skinSmoothing: 0,
  blemishes: [],
  wrinkleSoften: 0,
  darkCircle: 0,
  teethWhitening: 0,
  eyeEnlarge: 0,
  faceContour: 0,
  jawline: 0,
  noseReshape: 0,
  lipEnhance: { volume: 0, color: '#e11d48', opacity: 0 },
  bodySlim: 0,
  legExtension: 0,
};

// ----------------------------------------------------------------------
// 10. [합성/꾸미기] (Decorate & Layers)
// ----------------------------------------------------------------------

export type LayerType = 'text' | 'sticker' | 'image';

export interface EditorLayer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 ~ 100
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'lighten' | 'darken' | 'difference';
  x: number; // normalized 0 ~ 1
  y: number; // normalized 0 ~ 1
  width: number; // normalized
  height: number; // normalized
  rotation: number; // deg
  // Type specific properties
  text?: {
    content: string;
    fontSize: number; // px
    fontFamily: string;
    fontWeight: string | number;
    color: string;
    backgroundColor?: string;
    outlineColor?: string;
    outlineWidth?: number;
    shadow?: boolean;
    align: 'left' | 'center' | 'right';
  };
  sticker?: {
    emojiOrUrl: string;
    isEmoji: boolean;
  };
  imageUrl?: string;
}

export interface DrawingPath {
  id: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  type: 'pen' | 'highlighter' | 'eraser';
  opacity: number;
}

export interface MosaicRegion {
  id: string;
  x: number; // normalized 0 ~ 1
  y: number;
  width: number;
  height: number;
  type: 'mosaic' | 'pixelate';
  blockSize: number;
}

export interface FrameSettings {
  preset: string; // 'none' | 'iphone-viewfinder' | 'galaxy-camera' | 'polaroid' | 'film-strip' | 'simple-white' | 'shadow-card' | 'gradient-border'
  width: number; // px
  color: string;
  cornerRadius: number;
}

export interface DecorateAdjustments {
  layers: EditorLayer[];
  selectedLayerId: string | null;
  frame: FrameSettings;
  drawingActive: boolean;
  currentBrushType: 'pen' | 'highlighter' | 'eraser';
  currentBrushColor: string;
  currentBrushWidth: number;
  drawingPaths: DrawingPath[];
  mosaicRegions: MosaicRegion[];
}

export const DEFAULT_DECORATE_ADJUSTMENTS: DecorateAdjustments = {
  layers: [],
  selectedLayerId: null,
  frame: { preset: 'none', width: 24, color: '#FFFFFF', cornerRadius: 0 },
  drawingActive: false,
  currentBrushType: 'pen',
  currentBrushColor: '#ff0055',
  currentBrushWidth: 6,
  drawingPaths: [],
  mosaicRegions: [],
};

// ----------------------------------------------------------------------
// Master Editor State
// ----------------------------------------------------------------------

export interface PhotoEditorState {
  deviceMode: DeviceMode;
  basic: BasicAdjustments;
  color: ColorAdjustments;
  detail: DetailAdjustments;
  effects: EffectsAdjustments;
  filters: FilterAdjustments;
  crop: CropAdjustments;
  selective: SelectiveAdjustments;
  ai: AiAdjustments;
  portrait: PortraitAdjustments;
  decorate: DecorateAdjustments;
}

export const DEFAULT_EDITOR_STATE: PhotoEditorState = {
  deviceMode: 'galaxy',
  basic: DEFAULT_BASIC_ADJUSTMENTS,
  color: DEFAULT_COLOR_ADJUSTMENTS,
  detail: DEFAULT_DETAIL_ADJUSTMENTS,
  effects: DEFAULT_EFFECTS_ADJUSTMENTS,
  filters: DEFAULT_FILTER_ADJUSTMENTS,
  crop: DEFAULT_CROP_ADJUSTMENTS,
  selective: DEFAULT_SELECTIVE_ADJUSTMENTS,
  ai: DEFAULT_AI_ADJUSTMENTS,
  portrait: DEFAULT_PORTRAIT_ADJUSTMENTS,
  decorate: DEFAULT_DECORATE_ADJUSTMENTS,
};
