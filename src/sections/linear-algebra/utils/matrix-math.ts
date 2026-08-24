import type { Vector2D, Matrix2x2, TransformationStats } from '../types';

// ----------------------------------------------------------------------

export function transformVector(m: Matrix2x2, v: Vector2D): Vector2D {
  return {
    x: m[0][0] * v.x + m[0][1] * v.y,
    y: m[1][0] * v.x + m[1][1] * v.y,
  };
}

export function calculateMatrixStats(m: Matrix2x2): TransformationStats {
  const a = m[0][0];
  const b = m[0][1];
  const c = m[1][0];
  const d = m[1][1];

  const det = a * d - b * c;
  const trace = a + d;

  // Characteristic polynomial: λ² - trace*λ + det = 0
  const discriminant = trace * trace - 4 * det;
  const eigenvalues: number[] = [];
  if (discriminant >= 0) {
    const l1 = (trace + Math.sqrt(discriminant)) / 2;
    const l2 = (trace - Math.sqrt(discriminant)) / 2;
    eigenvalues.push(parseFloat(l1.toFixed(3)), parseFloat(l2.toFixed(3)));
  }

  return {
    det: parseFloat(det.toFixed(3)),
    trace: parseFloat(trace.toFixed(3)),
    eigenvalues,
    isSingular: Math.abs(det) < 1e-6,
    areaScale: Math.abs(parseFloat(det.toFixed(3))),
    orientationPreserved: det > 0,
  };
}

export function invertMatrix2x2(m: Matrix2x2): Matrix2x2 | null {
  const a = m[0][0];
  const b = m[0][1];
  const c = m[1][0];
  const d = m[1][1];
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-6) return null;

  return [
    [parseFloat((d / det).toFixed(3)), parseFloat((-b / det).toFixed(3))],
    [parseFloat((-c / det).toFixed(3)), parseFloat((a / det).toFixed(3))],
  ];
}

export const TRANSFORMATION_PRESETS = [
  {
    name: '45° 회전 (Rotation)',
    matrix: [
      [0.707, -0.707],
      [0.707, 0.707],
    ] as Matrix2x2,
    desc: '공간을 원점 기준으로 45도 반시계 방향 회전',
  },
  {
    name: '수평 전단 (Shear X)',
    matrix: [
      [1, 1],
      [0, 1],
    ] as Matrix2x2,
    desc: '격자망을 X축 방향으로 기울여 평행사변형으로 변형',
  },
  {
    name: '스케일링 1.5배 (Scaling)',
    matrix: [
      [1.5, 0],
      [0, 1.5],
    ] as Matrix2x2,
    desc: '면적이 2.25배로 균등 확대',
  },
  {
    name: 'Y축 반사 (Reflection)',
    matrix: [
      [-1, 0],
      [0, 1],
    ] as Matrix2x2,
    desc: '좌우 반전 (행렬식 det = -1)',
  },
  {
    name: '정사영 (Projection, 차원 붕괴)',
    matrix: [
      [1, 0],
      [0, 0],
    ] as Matrix2x2,
    desc: '2차원 평면이 1차원 직선으로 붕괴 (det = 0, 역행렬 불가)',
  },
];
