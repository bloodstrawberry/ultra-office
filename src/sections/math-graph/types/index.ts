export type EngineMode = 'function-plot' | 'desmos' | 'surface-3d' | 'calculus';

export type GraphType = 'function' | 'parametric' | 'polar' | 'implicit';

export interface CurveConfig {
  id: string;
  fn: string;
  fnType?: 'linear' | 'parametric' | 'polar' | 'implicit';
  xParam?: string; // For parametric x(t)
  yParam?: string; // For parametric y(t)
  color: string;
  visible: boolean;
  derivative?: boolean;
  tangentPoint?: number; // x0 for tangent line
  showSecant?: boolean;
  secantDx?: number;
  integralRange?: [number, number]; // [a, b] for definite integral shading
  closed?: boolean; // fill area under curve
  strokeWidth?: number;
  dashType?: 'solid' | 'dashed' | 'dotted';
}

export interface DomainRange {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface PresetCategory {
  category: string;
  icon: string;
  description: string;
  items: PresetItem[];
}

export interface PresetItem {
  id: string;
  title: string;
  description: string;
  latex: string;
  engine: EngineMode;
  formula: string;
  xParam?: string;
  yParam?: string;
  type?: GraphType;
  domain?: DomainRange;
  parameters?: Record<string, number>;
  zFormula?: string; // For 3D surface
  integral?: [number, number];
}

export interface NumericalAnalysisResult {
  roots: number[];
  yIntercept: number | null;
  extrema: { x: number; y: number; type: 'min' | 'max' }[];
  inflectionPoints: { x: number; y: number }[];
  definiteIntegral: {
    a: number;
    b: number;
    riemannLeft: number;
    riemannRight: number;
    riemannMid: number;
    trapezoidal: number;
    simpson: number;
  };
}

export interface TableRow {
  x: number;
  fx: number | null;
  dfx: number | null;
  d2fx: number | null;
}

export interface VariableSlider {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  animating?: boolean;
}
