import type { TableRow, NumericalAnalysisResult } from '../types';

// Math evaluation helper that safely computes f(x) for mathematical expressions
export function createMathEvaluator(
  formula: string,
  params: Record<string, number> = {}
): (x: number, extraVars?: Record<string, number>) => number {
  if (!formula || !formula.trim()) {
    return () => 0;
  }

  // Pre-process common math expressions to valid JS Math functions
  let jsExpr = formula
    .replace(/\bPI\b/gi, 'Math.PI')
    .replace(/\bE\b/g, 'Math.E')
    .replace(/\bsin\b/gi, 'Math.sin')
    .replace(/\bcos\b/gi, 'Math.cos')
    .replace(/\btan\b/gi, 'Math.tan')
    .replace(/\basin\b/gi, 'Math.asin')
    .replace(/\bacos\b/gi, 'Math.acos')
    .replace(/\batan\b/gi, 'Math.atan')
    .replace(/\bsinh\b/gi, 'Math.sinh')
    .replace(/\bcosh\b/gi, 'Math.cosh')
    .replace(/\btanh\b/gi, 'Math.tanh')
    .replace(/\bsqrt\b/gi, 'Math.sqrt')
    .replace(/\bcbrt\b/gi, 'Math.cbrt')
    .replace(/\bexp\b/gi, 'Math.exp')
    .replace(/\bln\b/gi, 'Math.log')
    .replace(/\blog10\b/gi, 'Math.log10')
    .replace(/\blog2\b/gi, 'Math.log2')
    .replace(/\blog\b/gi, 'Math.log')
    .replace(/\babs\b/gi, 'Math.abs')
    .replace(/\bfloor\b/gi, 'Math.floor')
    .replace(/\bceil\b/gi, 'Math.ceil')
    .replace(/\bround\b/gi, 'Math.round');

  // Convert power operators e.g. x^2 to Math.pow(x, 2) or x**2
  jsExpr = jsExpr.replace(/\^/g, '**');

  // Handle implicit multiplication like 3x -> 3*x, 4sin -> 4*Math.sin
  jsExpr = jsExpr.replace(/(\d+)([a-zA-Z(])/g, '$1*$2');
  jsExpr = jsExpr.replace(/\)([\da-zA-Z(])/g, ')*$1');

  try {
    const paramKeys = Object.keys(params);
    const paramValues = Object.values(params);

    // Create safe function

    const fn = new Function(
      'x',
      'extraVars',
      ...paramKeys,
      `
      try {
        const t = extraVars?.t ?? 0;
        const y = extraVars?.y ?? 0;
        const z = extraVars?.z ?? 0;
        const u = extraVars?.u ?? 0;
        const v = extraVars?.v ?? 0;
        const val = Number(${jsExpr});
        return isNaN(val) ? 0 : val;
      } catch (e) {
        return 0;
      }
    `
    );

    return (x: number, extraVars?: Record<string, number>) => {
      try {
        const res = fn(x, extraVars, ...paramValues);
        return typeof res === 'number' && isFinite(res) ? res : 0;
      } catch {
        return 0;
      }
    };
  } catch {
    return () => 0;
  }
}

// Numerical 1st derivative f'(x) using central difference
export function numericalDerivative(
  fn: (x: number) => number,
  x: number,
  h: number = 1e-5
): number {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}

// Numerical 2nd derivative f''(x)
export function numericalSecondDerivative(
  fn: (x: number) => number,
  x: number,
  h: number = 1e-4
): number {
  return (fn(x + h) - 2 * fn(x) + fn(x - h)) / (h * h);
}

// Definite integral approximations
export function calculateIntegrals(
  fn: (x: number) => number,
  a: number,
  b: number,
  n: number = 100
) {
  if (a === b) {
    return {
      a,
      b,
      riemannLeft: 0,
      riemannRight: 0,
      riemannMid: 0,
      trapezoidal: 0,
      simpson: 0,
    };
  }

  const sign = a < b ? 1 : -1;
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  const dx = (end - start) / n;

  let leftSum = 0;
  let rightSum = 0;
  let midSum = 0;
  let trapSum = 0;
  let simpsonSum = 0;

  for (let i = 0; i < n; i++) {
    const x0 = start + i * dx;
    const x1 = x0 + dx;
    const xMid = (x0 + x1) / 2;

    const y0 = fn(x0);
    const y1 = fn(x1);
    const yMid = fn(xMid);

    leftSum += y0 * dx;
    rightSum += y1 * dx;
    midSum += yMid * dx;
    trapSum += ((y0 + y1) / 2) * dx;
    simpsonSum += ((y0 + 4 * yMid + y1) / 6) * dx;
  }

  return {
    a,
    b,
    riemannLeft: leftSum * sign,
    riemannRight: rightSum * sign,
    riemannMid: midSum * sign,
    trapezoidal: trapSum * sign,
    simpson: simpsonSum * sign,
  };
}

// Analyze zeroes, extrema, inflection points within domain
export function analyzeFunction(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  samples: number = 400
): NumericalAnalysisResult {
  const step = (xMax - xMin) / samples;
  const roots: number[] = [];
  const extrema: { x: number; y: number; type: 'min' | 'max' }[] = [];
  const inflectionPoints: { x: number; y: number }[] = [];

  let prevY = fn(xMin);
  let prevD1 = numericalDerivative(fn, xMin);
  let prevD2 = numericalSecondDerivative(fn, xMin);

  for (let i = 1; i <= samples; i++) {
    const x = xMin + i * step;
    const y = fn(x);
    const d1 = numericalDerivative(fn, x);
    const d2 = numericalSecondDerivative(fn, x);

    // Root (sign change in y)
    if (prevY * y <= 0 && Math.abs(y - prevY) < 50) {
      // Refine with bisection
      let left = x - step;
      let right = x;
      for (let k = 0; k < 10; k++) {
        const mid = (left + right) / 2;
        if (fn(left) * fn(mid) <= 0) {
          right = mid;
        } else {
          left = mid;
        }
      }
      const rootVal = Number(((left + right) / 2).toFixed(4));
      if (!roots.some((r) => Math.abs(r - rootVal) < 0.05)) {
        roots.push(rootVal);
      }
    }

    // Extrema (sign change in first derivative)
    if (prevD1 * d1 <= 0 && Math.abs(d1 - prevD1) < 50) {
      const xExt = x - step / 2;
      const yExt = fn(xExt);
      const isMax = d2 < 0;
      const extVal = Number(xExt.toFixed(4));
      if (!extrema.some((e) => Math.abs(e.x - extVal) < 0.1)) {
        extrema.push({
          x: extVal,
          y: Number(yExt.toFixed(4)),
          type: isMax ? 'max' : 'min',
        });
      }
    }

    // Inflection point (sign change in second derivative)
    if (prevD2 * d2 <= 0 && Math.abs(d2 - prevD2) < 100) {
      const xInf = Number((x - step / 2).toFixed(4));
      if (!inflectionPoints.some((p) => Math.abs(p.x - xInf) < 0.1)) {
        inflectionPoints.push({
          x: xInf,
          y: Number(fn(xInf).toFixed(4)),
        });
      }
    }

    prevY = y;
    prevD1 = d1;
    prevD2 = d2;
  }

  const yIntercept = isFinite(fn(0)) ? Number(fn(0).toFixed(4)) : null;
  const definiteIntegral = calculateIntegrals(fn, Math.max(xMin, -2), Math.min(xMax, 2), 100);

  return {
    roots,
    yIntercept,
    extrema,
    inflectionPoints,
    definiteIntegral,
  };
}

// Generate Table of Values
export function generateTableOfValues(
  fn: (x: number) => number,
  start: number,
  end: number,
  step: number
): TableRow[] {
  const rows: TableRow[] = [];
  const safeStep = step <= 0 ? 0.5 : step;
  const count = Math.min(1000, Math.ceil(Math.abs(end - start) / safeStep) + 1);

  for (let i = 0; i < count; i++) {
    const x = Number((start + i * safeStep).toFixed(4));
    if (x > end + 1e-6) break;

    const fx = fn(x);
    const dfx = numericalDerivative(fn, x);
    const d2fx = numericalSecondDerivative(fn, x);

    rows.push({
      x,
      fx: isFinite(fx) ? Number(fx.toFixed(5)) : null,
      dfx: isFinite(dfx) ? Number(dfx.toFixed(5)) : null,
      d2fx: isFinite(d2fx) ? Number(d2fx.toFixed(5)) : null,
    });
  }

  return rows;
}
