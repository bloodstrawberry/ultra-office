export type PhotoshopToolType =
  | 'move'
  | 'marquee-rect'
  | 'marquee-ellipse'
  | 'lasso'
  | 'lasso-poly'
  | 'magic-wand'
  | 'crop'
  | 'eyedropper'
  | 'brush'
  | 'pencil'
  | 'eraser'
  | 'clone-stamp'
  | 'healing'
  | 'paint-bucket'
  | 'gradient'
  | 'blur-tool'
  | 'sharpen-tool'
  | 'smudge-tool'
  | 'dodge'
  | 'burn'
  | 'text'
  | 'shape-rect'
  | 'shape-ellipse'
  | 'shape-line'
  | 'shape-arrow'
  | 'bubble'
  | 'focus-line'
  | 'hand'
  | 'zoom';

export type BlendMode =
  | 'source-over'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export interface BlendModeOption {
  label: string;
  value: BlendMode;
}

export const BLEND_MODE_OPTIONS: BlendModeOption[] = [
  { label: '표준 (Normal)', value: 'source-over' },
  { label: '곱하기 (Multiply)', value: 'multiply' },
  { label: '스크린 (Screen)', value: 'screen' },
  { label: '오버레이 (Overlay)', value: 'overlay' },
  { label: '어둡게 하기 (Darken)', value: 'darken' },
  { label: '밝게 하기 (Lighten)', value: 'lighten' },
  { label: '색상 닷지 (Color Dodge)', value: 'color-dodge' },
  { label: '색상 번 (Color Burn)', value: 'color-burn' },
  { label: '하드 라이트 (Hard Light)', value: 'hard-light' },
  { label: '소프트 라이트 (Soft Light)', value: 'soft-light' },
  { label: '차이 (Difference)', value: 'difference' },
  { label: '제외 (Exclusion)', value: 'exclusion' },
];

export interface PhotoshopLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 1
  blendMode: BlendMode;
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SelectionState {
  hasSelection: boolean;
  maskCanvas: HTMLCanvasElement | null;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface ToolSettings {
  // Brush & Pencil & Eraser
  brushSize: number;
  brushOpacity: number;
  brushHardness: number; // 0 (soft) to 1 (hard)
  eraserSize: number;
  eraserOpacity: number;
  eraserHardness: number;

  // Colors
  foregroundColor: string;
  backgroundColor: string;

  // Magic wand & Paint bucket
  tolerance: number; // 0 to 255

  // Gradient
  gradientType: 'linear' | 'radial';

  // Clone stamp
  cloneSource: { x: number; y: number } | null;

  // Text
  textString: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textColor: string;
  textStrokeWidth: number;
  textStrokeColor: string;

  // Shapes
  shapeFillColor: string;
  shapeStrokeColor: string;
  shapeStrokeWidth: number;
  shapeFill: boolean;
  shapeStroke: boolean;

  // Webtoon Bubble
  bubbleShape: 'oval' | 'shout' | 'thought' | 'cloud' | 'box';
  bubbleTailX: number;
  bubbleTailY: number;

  // Webtoon Focus lines
  focusLineCount: number;
  focusLineInnerRadius: number; // in px
  focusLineThickness: number;
  focusLineColor: string;
}

export interface HistoryItem {
  id: string;
  description: string;
  timestamp: number;
  layers: {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number;
    blendMode: BlendMode;
    dataUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  activeLayerId: string;
}
