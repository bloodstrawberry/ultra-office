// ----------------------------------------------------------------------
// Normal Distribution & Statistics Studio Types
// ----------------------------------------------------------------------

export type NormalLabTab = 'galton' | 'clt' | 'calc' | 'box-muller' | 'dice';

/**
 * 1. Galton Board Types
 */
export interface GaltonBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  currentPinRow: number;
  stuck: boolean;
  targetBin?: number;
}

export interface GaltonPin {
  x: number;
  y: number;
  row: number;
  col: number;
}

export interface GaltonConfig {
  rows: number; // 8 to 20
  totalBalls: number; // 100 to 5000
  biasProbability: number; // 0.1 to 0.9 (0.5 = symmetric)
  dropSpeed: number; // 1 to 50 balls per frame
  soundEnabled: boolean;
}

export interface GaltonStats {
  droppedCount: number;
  binCounts: number[];
  mean: number;
  stdDev: number;
  theoreticalMean: number;
  theoreticalStdDev: number;
}

/**
 * 2. Central Limit Theorem (CLT) Types
 */
export type PopulationType =
  | 'uniform'
  | 'exponential'
  | 'bernoulli'
  | 'dice'
  | 'bimodal'
  | 'u-shaped';

export interface PopulationInfo {
  type: PopulationType;
  label: string;
  description: string;
  formula: string;
  theoreticalMean: number;
  theoreticalVariance: number;
  theoreticalStdDev: number;
}

export interface CltConfig {
  populationType: PopulationType;
  sampleSize: number; // n = 1, 2, 5, 10, 30, 50, 100
  trialsPerBatch: number; // 1, 10, 50, 100, 500, 1000
  animationSpeed: number; // ms delay
}

export interface CltStats {
  totalSamples: number;
  sampleMeans: number[];
  meanOfMeans: number;
  varianceOfMeans: number;
  stdErrorOfMeans: number;
  skewness: number;
  kurtosis: number;
  currentSampleValues: number[];
}

/**
 * 3. Normal Distribution Calculator Types
 */
export type AreaCalculationType = 'lessThan' | 'greaterThan' | 'between' | 'outside' | 'sigmaRule';

export interface NormalPreset {
  id: string;
  title: string;
  unit: string;
  mean: number;
  stdDev: number;
  lowerBound: number;
  upperBound: number;
  description: string;
}

export interface NormalDistributionParams {
  mean: number;
  stdDev: number;
  calcType: AreaCalculationType;
  lowerVal: number;
  upperVal: number;
  sigmaMultiple: number; // 1, 2, 3
}

export interface NormalDistributionResult {
  probability: number; // 0 to 1
  zLower: number;
  zUpper: number;
  pdfPeak: number;
  percentileText: string;
}

/**
 * 4. Box-Muller & Q-Q Plot Types
 */
export interface BoxMullerPoint {
  u1: number;
  u2: number;
  z0: number;
  z1: number;
}

export interface QqPoint {
  theoreticalQuantile: number;
  sampleQuantile: number;
}

export interface NormalityTestResult {
  sampleSize: number;
  mean: number;
  stdDev: number;
  skewness: number;
  kurtosis: number;
  isNormalCandidate: boolean;
}

/**
 * 5. Dice & Coin Sum Types
 */
export interface DiceConfig {
  diceCount: number; // 1 to 10 dice
  sidesPerDie: number; // 6 for dice, 2 for coins
  rollsPerBatch: number;
}

export interface DiceStats {
  totalRolls: number;
  sumCounts: Record<number, number>;
  minSum: number;
  maxSum: number;
  mean: number;
  variance: number;
  stdDev: number;
}
