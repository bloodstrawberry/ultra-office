import type { DataPoint2D } from '../types';

// ----------------------------------------------------------------------
// Synthetic Dataset Generators
// ----------------------------------------------------------------------

function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// 1. Regression Datasets (X range: -5 to 5, Y range: scaled)
export function generateLinearRegressionData(
  count: number = 40,
  noise: number = 1.2,
  slope: number = 1.8,
  intercept: number = 2.0
): DataPoint2D[] {
  const points: DataPoint2D[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = -5 + (10 * i) / (count - 1);
    const y = slope * x + intercept + randn() * noise;
    points.push({ id: `reg-${i}`, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  }
  return points;
}

export function generateOutlierRegressionData(count: number = 40): DataPoint2D[] {
  const base = generateLinearRegressionData(count, 0.8, 1.5, 1.0);
  // Introduce 4 severe outliers
  if (base.length > 5) {
    base[3].y += 18;
    base[10].y -= 16;
    base[base.length - 4].y += 20;
    base[base.length - 8].y -= 19;
  }
  return base;
}

export function generatePolynomialRegressionData(
  count: number = 45,
  noise: number = 1.5
): DataPoint2D[] {
  const points: DataPoint2D[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = -4 + (8 * i) / (count - 1);
    // Cubic polynomial with noise
    const y = 0.15 * x ** 3 - 0.4 * x ** 2 - x + 3 + randn() * noise;
    points.push({ id: `poly-${i}`, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  }
  return points;
}

export function generateSineRegressionData(count: number = 50, noise: number = 0.3): DataPoint2D[] {
  const points: DataPoint2D[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = -5 + (10 * i) / (count - 1);
    const y = 3 * Math.sin(x) + randn() * noise;
    points.push({ id: `sin-${i}`, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  }
  return points;
}

// 2. Classification Datasets (2D coordinates in [-5, 5])
export function generateSeparableClassificationData(countPerClass: number = 30): DataPoint2D[] {
  const points: DataPoint2D[] = [];
  // Class 0: Center at (-2, -2)
  for (let i = 0; i < countPerClass; i += 1) {
    points.push({
      id: `c0-${i}`,
      x: Number((-2 + randn() * 0.9).toFixed(2)),
      y: Number((-2 + randn() * 0.9).toFixed(2)),
      label: 0,
    });
  }
  // Class 1: Center at (2, 2)
  for (let i = 0; i < countPerClass; i += 1) {
    points.push({
      id: `c1-${i}`,
      x: Number((2 + randn() * 0.9).toFixed(2)),
      y: Number((2 + randn() * 0.9).toFixed(2)),
      label: 1,
    });
  }
  return points;
}

export function generateCirclesClassificationData(count: number = 70): DataPoint2D[] {
  const points: DataPoint2D[] = [];
  const half = Math.floor(count / 2);
  // Inner circle (Class 0)
  for (let i = 0; i < half; i += 1) {
    const angle = (2 * Math.PI * i) / half;
    const r = 1.2 + randn() * 0.25;
    points.push({
      id: `cir0-${i}`,
      x: Number((r * Math.cos(angle)).toFixed(2)),
      y: Number((r * Math.sin(angle)).toFixed(2)),
      label: 0,
    });
  }
  // Outer circle (Class 1)
  for (let i = 0; i < count - half; i += 1) {
    const angle = (2 * Math.PI * i) / (count - half);
    const r = 3.6 + randn() * 0.35;
    points.push({
      id: `cir1-${i}`,
      x: Number((r * Math.cos(angle)).toFixed(2)),
      y: Number((r * Math.sin(angle)).toFixed(2)),
      label: 1,
    });
  }
  return points;
}

export function generateMoonsClassificationData(
  count: number = 70,
  noise: number = 0.2
): DataPoint2D[] {
  const points: DataPoint2D[] = [];
  const half = Math.floor(count / 2);
  // Upper moon
  for (let i = 0; i < half; i += 1) {
    const angle = (Math.PI * i) / half;
    points.push({
      id: `m0-${i}`,
      x: Number((2.5 * Math.cos(angle) + randn() * noise).toFixed(2)),
      y: Number((2.5 * Math.sin(angle) + randn() * noise).toFixed(2)),
      label: 0,
    });
  }
  // Lower moon
  for (let i = 0; i < count - half; i += 1) {
    const angle = (Math.PI * i) / (count - half);
    points.push({
      id: `m1-${i}`,
      x: Number((2.5 * (1 - Math.cos(angle)) - 0.5 + randn() * noise).toFixed(2)),
      y: Number((2.5 * -Math.sin(angle) - 1.0 + randn() * noise).toFixed(2)),
      label: 1,
    });
  }
  return points;
}

export function generateXorClassificationData(countPerQuad: number = 18): DataPoint2D[] {
  const points: DataPoint2D[] = [];
  let idx = 0;
  // Q1: (+, +) -> label 1
  for (let i = 0; i < countPerQuad; i += 1) {
    idx += 1;
    points.push({
      id: `xor-${idx}`,
      x: Number((1.8 + randn() * 0.6).toFixed(2)),
      y: Number((1.8 + randn() * 0.6).toFixed(2)),
      label: 1,
    });
  }
  // Q2: (-, +) -> label 0
  for (let i = 0; i < countPerQuad; i += 1) {
    idx += 1;
    points.push({
      id: `xor-${idx}`,
      x: Number((-1.8 + randn() * 0.6).toFixed(2)),
      y: Number((1.8 + randn() * 0.6).toFixed(2)),
      label: 0,
    });
  }
  // Q3: (-, -) -> label 1
  for (let i = 0; i < countPerQuad; i += 1) {
    idx += 1;
    points.push({
      id: `xor-${idx}`,
      x: Number((-1.8 + randn() * 0.6).toFixed(2)),
      y: Number((-1.8 + randn() * 0.6).toFixed(2)),
      label: 1,
    });
  }
  // Q4: (+, -) -> label 0
  for (let i = 0; i < countPerQuad; i += 1) {
    idx += 1;
    points.push({
      id: `xor-${idx}`,
      x: Number((1.8 + randn() * 0.6).toFixed(2)),
      y: Number((-1.8 + randn() * 0.6).toFixed(2)),
      label: 0,
    });
  }
  return points;
}

export function generateSpiralData(countPerArm: number = 40): DataPoint2D[] {
  const points: DataPoint2D[] = [];
  // Arm 0
  for (let i = 0; i < countPerArm; i += 1) {
    const r = (i / countPerArm) * 4.5;
    const t = (1.75 * i * 2 * Math.PI) / countPerArm;
    points.push({
      id: `sp0-${i}`,
      x: Number((r * Math.sin(t) + randn() * 0.15).toFixed(2)),
      y: Number((r * Math.cos(t) + randn() * 0.15).toFixed(2)),
      label: 0,
    });
  }
  // Arm 1
  for (let i = 0; i < countPerArm; i += 1) {
    const r = (i / countPerArm) * 4.5;
    const t = (1.75 * i * 2 * Math.PI) / countPerArm + Math.PI;
    points.push({
      id: `sp1-${i}`,
      x: Number((r * Math.sin(t) + randn() * 0.15).toFixed(2)),
      y: Number((r * Math.cos(t) + randn() * 0.15).toFixed(2)),
      label: 1,
    });
  }
  return points;
}

// 3. Clustering Datasets
export function generateBlobsClusteringData(
  numClusters: number = 3,
  countPerCluster: number = 25
): DataPoint2D[] {
  const centers: [number, number][] = [
    [-2.5, -2.5],
    [2.5, 2.5],
    [-2.0, 2.5],
    [2.5, -2.0],
    [0.0, 0.0],
  ];

  const points: DataPoint2D[] = [];
  let id = 0;

  for (let c = 0; c < numClusters; c += 1) {
    const center = centers[c % centers.length];
    for (let i = 0; i < countPerCluster; i += 1) {
      id += 1;
      points.push({
        id: `blob-${id}`,
        x: Number((center[0] + randn() * 0.75).toFixed(2)),
        y: Number((center[1] + randn() * 0.75).toFixed(2)),
      });
    }
  }
  return points;
}

// 4. PCA Correlated 2D Data
export function generateCorrelatedPcaData(
  count: number = 60,
  correlationAngleDeg: number = 35
): DataPoint2D[] {
  const points: DataPoint2D[] = [];
  const rad = (correlationAngleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  for (let i = 0; i < count; i += 1) {
    // Large variance along major axis, small along minor axis
    const u1 = randn() * 2.8;
    const u2 = randn() * 0.7;

    const x = u1 * cos - u2 * sin;
    const y = u1 * sin + u2 * cos;

    points.push({
      id: `pca-${i}`,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    });
  }
  return points;
}
