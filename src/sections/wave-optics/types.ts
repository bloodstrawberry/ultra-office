// ----------------------------------------------------------------------
// Wave, Optics & Fourier Studio Types
// ----------------------------------------------------------------------

export type WaveOpticsTab = 'fourier' | 'double-slit' | 'snell-optics';

export type FourierWaveType = 'square' | 'sawtooth' | 'triangle' | 'pulse';

export interface ComplexEpicycle {
  freq: number;
  radius: number;
  phase: number;
}

export interface OpticsMedium {
  name: string;
  n: number; // Refractive index
}
