// ----------------------------------------------------------------------
// Fractals & Chaos Studio Types
// ----------------------------------------------------------------------

export type FractalsTab = 'mandelbrot' | 'chaos-game' | 'lorenz';

export type ColorPalette = 'electric-blue' | 'fire' | 'rainbow' | 'neon' | 'monochrome';

export interface ComplexNumber {
  r: number;
  i: number;
}

export interface MandelbrotViewParams {
  centerX: number;
  centerY: number;
  zoom: number;
  maxIterations: number;
  palette: ColorPalette;
  isJulia: boolean;
  juliaC: ComplexNumber;
}

export type ChaosShape = 'barnsley-fern' | 'sierpinski' | 'koch-snowflake';

export interface LorenzParams {
  sigma: number; // typically 10
  rho: number; // typically 28
  beta: number; // typically 8/3 ~ 2.667
  dt: number;
  speed: number;
}
