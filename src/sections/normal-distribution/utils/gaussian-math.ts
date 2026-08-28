// ----------------------------------------------------------------------
// Gaussian & Statistical Math Utilities
// ----------------------------------------------------------------------

import type { PopulationType, PopulationInfo } from '../types';

export const SQRT_2PI = Math.sqrt(2 * Math.PI);
export const SQRT_2 = Math.sqrt(2);

/**
 * 1. Probability Density Function (PDF)
 * f(x) = (1 / (sigma * sqrt(2*pi))) * exp(-(x - mu)^2 / (2 * sigma^2))
 */
export function normalPdf(x: number, mean: number = 0, stdDev: number = 1): number {
  if (stdDev <= 0) return 0;
  const z = (x - mean) / stdDev;
  return (1 / (stdDev * SQRT_2PI)) * Math.exp(-0.5 * z * z);
}

/**
 * High-precision error function (erf) approximation
 * Maximum error < 1.5e-7 (Abramowitz and Stegun 7.1.26)
 */
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);

  // Constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const y = 1.0 - poly * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * 2. Cumulative Distribution Function (CDF)
 * Phi(x) = 0.5 * (1 + erf((x - mu) / (sigma * sqrt(2))))
 */
export function normalCdf(x: number, mean: number = 0, stdDev: number = 1): number {
  if (stdDev <= 0) return x >= mean ? 1 : 0;
  const z = (x - mean) / (stdDev * SQRT_2);
  return 0.5 * (1 + erf(z));
}

/**
 * 3. Inverse Normal Cumulative Distribution Function (Probit function / Quantile)
 * Returns x such that normalCdf(x, 0, 1) = p (p in (0, 1))
 * Rational approximation by Peter J. Acklam (accuracy ~1.15e-9)
 */
export function normalQuantile(p: number, mean: number = 0, stdDev: number = 1): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
    -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783,
  ];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;

  if (p < pLow) {
    // Rational approximation for lower region
    q = Math.sqrt(-2 * Math.log(p));
    r =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    // Rational approximation for central region
    q = p - 0.5;
    r = q * q;
    r =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    // Rational approximation for upper region
    q = Math.sqrt(-2 * Math.log(1 - p));
    r =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  return mean + r * stdDev;
}

/**
 * 4. Z-Score helper
 */
export function calculateZScore(x: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (x - mean) / stdDev;
}

/**
 * 5. Box-Muller Transformation
 * Transforms uniform random numbers (u1, u2) in (0, 1] into two standard normal numbers (z0, z1)
 */
export function boxMullerTransform(u1: number, u2: number): { z0: number; z1: number } {
  const safeU1 = Math.max(1e-12, Math.min(0.999999999999, u1));
  const r = Math.sqrt(-2.0 * Math.log(safeU1));
  const theta = 2.0 * Math.PI * u2;
  return {
    z0: r * Math.cos(theta),
    z1: r * Math.sin(theta),
  };
}

/**
 * Generate standard normal random variable using Box-Muller
 */
export function randomStandardNormal(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(Math.max(1e-12, u1))) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * 6. Basic Descriptive Statistics
 */
export function calculateMean(data: number[]): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

export function calculateVariance(data: number[], isSample: boolean = true): number {
  if (data.length <= 1) return 0;
  const mean = calculateMean(data);
  const sumSqDiff = data.reduce((acc, val) => acc + (val - mean) ** 2, 0);
  const divisor = isSample ? data.length - 1 : data.length;
  return sumSqDiff / divisor;
}

export function calculateStdDev(data: number[], isSample: boolean = true): number {
  return Math.sqrt(calculateVariance(data, isSample));
}

export function calculateSkewness(data: number[]): number {
  if (data.length < 3) return 0;
  const mean = calculateMean(data);
  const s = calculateStdDev(data, true);
  if (s === 0) return 0;
  const n = data.length;
  const sumCubed = data.reduce((acc, val) => acc + ((val - mean) / s) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * sumCubed;
}

export function calculateExcessKurtosis(data: number[]): number {
  if (data.length < 4) return 0;
  const mean = calculateMean(data);
  const s = calculateStdDev(data, true);
  if (s === 0) return 0;
  const n = data.length;
  const sumFourth = data.reduce((acc, val) => acc + ((val - mean) / s) ** 4, 0);
  const term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
  const term2 = (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  return term1 * sumFourth - term2;
}

/**
 * 7. Population Distributions for CLT Lab
 */
export const POPULATION_DEFINITIONS: Record<PopulationType, PopulationInfo> = {
  uniform: {
    type: 'uniform',
    label: '균등 분포 (Uniform U(0, 100))',
    description: '모든 값이 동일한 확률로 나타나는 평평한 직사각형 분포입니다.',
    formula: 'f(x) = 1/100, 0 <= x <= 100',
    theoreticalMean: 50,
    theoreticalVariance: (100 * 100) / 12, // 833.33
    theoreticalStdDev: 100 / Math.sqrt(12), // 28.87
  },
  exponential: {
    type: 'exponential',
    label: '지수 분포 (Exponential λ=0.04)',
    description: '사건 발생 대기시간처럼 오른쪽으로 극심하게 긴 꼬리를 갖는 비대칭 분포입니다.',
    formula: 'f(x) = λ e^(-λ x), λ=0.04 (평균 25)',
    theoreticalMean: 25,
    theoreticalVariance: 25 * 25, // 625
    theoreticalStdDev: 25,
  },
  bernoulli: {
    type: 'bernoulli',
    label: '베르누이 분포 (동전 던지기 0 또는 100)',
    description: '성공(100) 또는 실패(0)의 극단적인 두 가지 값만 갖는 이진 분포입니다.',
    formula: 'P(X=100) = 0.5, P(X=0) = 0.5',
    theoreticalMean: 50,
    theoreticalVariance: 0.5 * 0.5 * 100 * 100, // 2500
    theoreticalStdDev: 50,
  },
  dice: {
    type: 'dice',
    label: '주사위 눈금 분포 (Discrete 1~6)',
    description: '1부터 6까지 6개 정수가 균등하게 나오는 이산 분포입니다.',
    formula: 'P(X=k) = 1/6, k in {1,2,3,4,5,6}',
    theoreticalMean: 3.5,
    theoreticalVariance: 35 / 12, // 2.917
    theoreticalStdDev: Math.sqrt(35 / 12), // 1.708
  },
  bimodal: {
    type: 'bimodal',
    label: '쌍봉 분포 (Bimodal Mixture)',
    description: '두 개의 서로 다른 집단(봉우리: 25와 75)이 혼합된 M자형 분포입니다.',
    formula: '0.5 * N(25, 8^2) + 0.5 * N(75, 8^2)',
    theoreticalMean: 50,
    theoreticalVariance: 689, // (8^2 + 25^2) = 64 + 625 = 689
    theoreticalStdDev: Math.sqrt(689), // 26.25
  },
  'u-shaped': {
    type: 'u-shaped',
    label: 'U자형 분포 (Beta(0.5, 0.5))',
    description: '양 끝단(0과 100)에 데이터가 집중되고 중앙이 비어있는 U자 모양 분포입니다.',
    formula: 'Beta(α=0.5, β=0.5) scaled to [0, 100]',
    theoreticalMean: 50,
    theoreticalVariance: (100 * 100) / 8, // 1250
    theoreticalStdDev: 100 / Math.sqrt(8), // 35.36
  },
};

/**
 * Draw a single random value from the specified population
 */
export function sampleFromPopulation(type: PopulationType): number {
  switch (type) {
    case 'uniform':
      return Math.random() * 100;

    case 'exponential': {
      // Inverse transform sampling for Exp(lambda=0.04) -> mean=25
      const u = Math.max(1e-9, Math.random());
      return -Math.log(u) / 0.04;
    }

    case 'bernoulli':
      return Math.random() < 0.5 ? 0 : 100;

    case 'dice':
      return Math.floor(Math.random() * 6) + 1;

    case 'bimodal': {
      // 50% chance N(25, 8), 50% chance N(75, 8)
      const center = Math.random() < 0.5 ? 25 : 75;
      const val = center + randomStandardNormal() * 8;
      return Math.max(0, Math.min(100, val));
    }

    case 'u-shaped': {
      // Arcsine distribution approximation (Beta(0.5, 0.5))
      // X = sin^2(U * pi/2)
      const u = Math.random();
      const val = Math.sin((u * Math.PI) / 2) ** 2;
      return val * 100;
    }

    default:
      return Math.random() * 100;
  }
}

/**
 * Draw a sample of size n and calculate its mean
 */
export function drawSampleAndCalculateMean(
  type: PopulationType,
  sampleSize: number
): { sampleValues: number[]; sampleMean: number } {
  const sampleValues: number[] = [];
  let sum = 0;
  for (let i = 0; i < sampleSize; i += 1) {
    const val = sampleFromPopulation(type);
    sampleValues.push(val);
    sum += val;
  }
  return {
    sampleValues,
    sampleMean: sum / sampleSize,
  };
}

/**
 * 8. Real-world Presets for Normal Calculator
 */
export const NORMAL_PRESETS = [
  {
    id: 'korean-male-height',
    title: '성인 남성 신장 (키)',
    unit: 'cm',
    mean: 174.5,
    stdDev: 5.8,
    lowerBound: 165,
    upperBound: 180,
    description: '대한민국 20~30대 성인 남성의 평균 키와 분포 구간 확률',
  },
  {
    id: 'iq-score',
    title: '지능지수 (IQ Score)',
    unit: '점',
    mean: 100,
    stdDev: 15,
    lowerBound: 85,
    upperBound: 115,
    description: '멘사(상위 2% = 130 이상), 일반인 평균(100) 기준 웩슬러 IQ',
  },
  {
    id: 'exam-standard-score',
    title: '수능/시험 표준점수',
    unit: '점',
    mean: 100,
    stdDev: 20,
    lowerBound: 80,
    upperBound: 120,
    description: '1등급 컷(~130점, 상위 4%), 평균 100점, 표준편차 20점',
  },
  {
    id: 'part-tolerance',
    title: '반도체 부품 공차 (mm)',
    unit: 'mm',
    mean: 50.0,
    stdDev: 0.05,
    lowerBound: 49.9,
    upperBound: 50.1,
    description: '정밀 가공 공정의 ±2σ(95.45%), ±3σ(99.73%) 불량률 분석',
  },
  {
    id: 'standard-normal',
    title: '표준 정규분포 N(0, 1)',
    unit: 'Z',
    mean: 0,
    stdDev: 1,
    lowerBound: -1.96,
    upperBound: 1.96,
    description: '유의수준 5%(양측 1.96, 95% 신뢰구간) 기초 통계 표준분포',
  },
];
