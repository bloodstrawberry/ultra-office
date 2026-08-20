export type Matrix2x2 = [[number, number], [number, number]];

export interface Vector2D {
  x: number;
  y: number;
}

export interface TransformationStats {
  det: number;
  trace: number;
  eigenvalues: number[];
  isSingular: boolean;
  areaScale: number;
  orientationPreserved: boolean;
}
