// ----------------------------------------------------------------------
// Monte Carlo & Geometric Probability Types
// ----------------------------------------------------------------------

export type MonteCarloTab = 'buffon' | 'pi-drop' | 'random-walk';

export interface Needle {
  x: number;
  y: number;
  angle: number;
  length: number;
  isCrossed: boolean;
}

export interface MonteCarloPoint {
  x: number;
  y: number;
  isInside: boolean;
}

export interface RandomWalkState {
  dimension: '1d' | '2d' | 'gbm';
  stepCount: number;
  particleCount: number;
}
