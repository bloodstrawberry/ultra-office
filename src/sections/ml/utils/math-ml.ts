import type {
  PcaMetrics,
  DataPoint2D,
  DendrogramNode,
  DecisionTreeNode,
  RegressionMetrics,
  ClusteringMetrics,
  ClassificationMetrics,
} from '../types';

// ----------------------------------------------------------------------
// Basic Matrix & Vector Math Utilities
// ----------------------------------------------------------------------

export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

export function standardDeviation(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

/** Matrix Transpose: X^T */
export function matrixTranspose(m: number[][]): number[][] {
  const rows = m.length;
  const cols = m[0]?.length || 0;
  const result: number[][] = [];
  for (let j = 0; j < cols; j += 1) {
    result[j] = [];
    for (let i = 0; i < rows; i += 1) {
      result[j][i] = m[i][j];
    }
  }
  return result;
}

/** Matrix Multiplication: A * B */
export function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const rowsA = a.length;
  const colsA = a[0]?.length || 0;
  const colsB = b[0]?.length || 0;
  const result: number[][] = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i += 1) {
    for (let k = 0; k < colsA; k += 1) {
      const aVal = a[i][k];
      for (let j = 0; j < colsB; j += 1) {
        result[i][j] += aVal * b[k][j];
      }
    }
  }
  return result;
}

/** Matrix Vector Multiplication: A * x */
export function matrixVectorMultiply(a: number[][], v: number[]): number[] {
  return a.map((row) => row.reduce((sum, val, idx) => sum + val * (v[idx] || 0), 0));
}

/** Matrix Inversion via Gauss-Jordan Elimination with Partial Pivoting */
export function matrixInverse(m: number[][]): number[][] | null {
  const n = m.length;
  const augmented: number[][] = m.map((row, i) => {
    const identityRow = Array(n).fill(0);
    identityRow[i] = 1;
    return [...row, ...identityRow];
  });

  for (let i = 0; i < n; i += 1) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k += 1) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    if (Math.abs(augmented[maxRow][i]) < 1e-12) {
      return null; // Singular matrix
    }

    // Swap rows
    const temp = augmented[i];
    augmented[i] = augmented[maxRow];
    augmented[maxRow] = temp;

    // Scale pivot row
    const pivot = augmented[i][i];
    for (let j = 0; j < 2 * n; j += 1) {
      augmented[i][j] /= pivot;
    }

    // Eliminate other rows
    for (let k = 0; k < n; k += 1) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j += 1) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  return augmented.map((row) => row.slice(n));
}

// ----------------------------------------------------------------------
// 1. Regression (Linear, Ridge, Lasso, Polynomial)
// ----------------------------------------------------------------------

export function computeRegressionMetrics(actual: number[], predicted: number[]): RegressionMetrics {
  const n = actual.length;
  if (n === 0) return { mse: 0, rmse: 0, mae: 0, r2: 0 };

  let ssRes = 0;
  let absErr = 0;
  const yMean = mean(actual);
  let ssTot = 0;

  for (let i = 0; i < n; i += 1) {
    const diff = actual[i] - predicted[i];
    ssRes += diff * diff;
    absErr += Math.abs(diff);
    ssTot += (actual[i] - yMean) ** 2;
  }

  const mse = ssRes / n;
  const rmse = Math.sqrt(mse);
  const mae = absErr / n;
  const r2 = ssTot === 0 ? 1 : Math.max(-1, 1 - ssRes / ssTot);

  return { mse, rmse, mae, r2 };
}

/** Simple 2D Linear Regression (y = w * x + b) via Closed Form */
export function fitSimpleLinearRegression(
  points: DataPoint2D[],
  fitIntercept: boolean = true
): {
  w: number;
  b: number;
  predict: (x: number) => number;
  metrics: RegressionMetrics;
} {
  const n = points.length;
  if (n < 2) {
    return {
      w: 0,
      b: fitIntercept ? (points[0]?.y ?? 0) : 0,
      predict: () => (fitIntercept ? (points[0]?.y ?? 0) : 0),
      metrics: { mse: 0, rmse: 0, mae: 0, r2: 1 },
    };
  }

  const xVals = points.map((p) => p.x);
  const yVals = points.map((p) => p.y);

  let w = 0;
  let b = 0;

  if (fitIntercept) {
    const xMean = mean(xVals);
    const yMean = mean(yVals);

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i += 1) {
      num += (xVals[i] - xMean) * (yVals[i] - yMean);
      den += (xVals[i] - xMean) ** 2;
    }

    w = den === 0 ? 0 : num / den;
    b = yMean - w * xMean;
  } else {
    // Force intercept to 0: w = sum(x*y) / sum(x^2)
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i += 1) {
      num += xVals[i] * yVals[i];
      den += xVals[i] ** 2;
    }
    w = den === 0 ? 0 : num / den;
    b = 0;
  }

  const predict = (x: number) => w * x + b;
  const predictedY = xVals.map(predict);
  const metrics = computeRegressionMetrics(yVals, predictedY);

  return { w, b, predict, metrics };
}

/** Polynomial Feature Expansion for a single scalar x: [1, x, x^2, ..., x^d] */
export function expandPolynomialFeatures(x: number, degree: number): number[] {
  const feats: number[] = [1];
  let curr = 1;
  for (let d = 1; d <= degree; d += 1) {
    curr *= x;
    feats.push(curr);
  }
  return feats;
}

/** Ridge Regression (L2) with Polynomial Features */
export function fitRidgeRegression(
  points: DataPoint2D[],
  degree: number,
  lambdaL2: number
): {
  weights: number[];
  predict: (x: number) => number;
  metrics: RegressionMetrics;
} {
  const n = points.length;
  const numFeatures = degree + 1; // [1, x, x^2, ...]

  if (n < 2) {
    const weights = Array(numFeatures).fill(0);
    weights[0] = points[0]?.y ?? 0;
    return {
      weights,
      predict: () => points[0]?.y ?? 0,
      metrics: { mse: 0, rmse: 0, mae: 0, r2: 1 },
    };
  }

  // Build X matrix and y vector
  const X: number[][] = points.map((p) => expandPolynomialFeatures(p.x, degree));
  const y: number[] = points.map((p) => p.y);

  // X^T
  const Xt = matrixTranspose(X);
  // XtX
  const XtX = matrixMultiply(Xt, X);

  // Add L2 penalty: XtX + lambda * I (do not penalize bias intercept at index 0)
  for (let i = 1; i < numFeatures; i += 1) {
    XtX[i][i] += lambdaL2;
  }

  // Inverse: (XtX + lambda I)^-1
  const inv = matrixInverse(XtX);
  let weights: number[];

  if (inv) {
    // Xt * y
    const Xty = matrixVectorMultiply(Xt, y);
    // weights = inv * Xty
    weights = matrixVectorMultiply(inv, Xty);
  } else {
    weights = Array(numFeatures).fill(0);
    weights[0] = mean(y);
  }

  const predict = (x: number) => {
    const feats = expandPolynomialFeatures(x, degree);
    return feats.reduce((sum, f, idx) => sum + f * (weights[idx] || 0), 0);
  };

  const actualY = points.map((p) => p.y);
  const predictedY = points.map((p) => predict(p.x));
  const metrics = computeRegressionMetrics(actualY, predictedY);

  return { weights, predict, metrics };
}

/** Soft-thresholding operator for Lasso: sign(z) * max(0, |z| - lambda) */
function softThreshold(z: number, lambda: number): number {
  if (z > lambda) return z - lambda;
  if (z < -lambda) return z + lambda;
  return 0;
}

/** Lasso Regression (L1) with Coordinate Descent */
export function fitLassoRegression(
  points: DataPoint2D[],
  degree: number,
  lambdaL1: number,
  maxIter: number = 300
): {
  weights: number[];
  predict: (x: number) => number;
  metrics: RegressionMetrics;
} {
  const n = points.length;
  const numFeatures = degree + 1;

  if (n < 2) {
    const weights = Array(numFeatures).fill(0);
    weights[0] = points[0]?.y ?? 0;
    return {
      weights,
      predict: () => points[0]?.y ?? 0,
      metrics: { mse: 0, rmse: 0, mae: 0, r2: 1 },
    };
  }

  const X: number[][] = points.map((p) => expandPolynomialFeatures(p.x, degree));
  const y: number[] = points.map((p) => p.y);

  // Initialize weights with zeros or small numbers
  const weights = Array(numFeatures).fill(0);
  weights[0] = mean(y); // start bias at mean of y

  // Precompute column squared sums for normalization in coordinate descent
  const colNormSq = Array(numFeatures).fill(0);
  for (let j = 0; j < numFeatures; j += 1) {
    for (let i = 0; i < n; i += 1) {
      colNormSq[j] += X[i][j] ** 2;
    }
    if (colNormSq[j] === 0) colNormSq[j] = 1e-8;
  }

  // Coordinate Descent iterations
  for (let iter = 0; iter < maxIter; iter += 1) {
    for (let j = 0; j < numFeatures; j += 1) {
      // Calculate partial residual: r_i = y_i - sum_{k != j} X_{ik} * w_k
      let rho = 0;
      for (let i = 0; i < n; i += 1) {
        let predWithoutJ = 0;
        for (let k = 0; k < numFeatures; k += 1) {
          if (k !== j) predWithoutJ += X[i][k] * weights[k];
        }
        rho += X[i][j] * (y[i] - predWithoutJ);
      }

      if (j === 0) {
        // Intercept: not regularized
        weights[0] = rho / colNormSq[0];
      } else {
        // Soft-thresholding
        weights[j] = softThreshold(rho, lambdaL1 * n) / colNormSq[j];
      }
    }
  }

  const predict = (x: number) => {
    const feats = expandPolynomialFeatures(x, degree);
    return feats.reduce((sum, f, idx) => sum + f * (weights[idx] || 0), 0);
  };

  const actualY = points.map((p) => p.y);
  const predictedY = points.map((p) => predict(p.x));
  const metrics = computeRegressionMetrics(actualY, predictedY);

  return { weights, predict, metrics };
}

// ----------------------------------------------------------------------
// 2. Classification (Logistic Regression, KNN, Decision Tree)
// ----------------------------------------------------------------------

export function sigmoid(z: number): number {
  if (z > 25) return 1;
  if (z < -25) return 0;
  return 1 / (1 + Math.exp(-z));
}

export function computeClassificationMetrics(
  actual: number[],
  predicted: number[]
): ClassificationMetrics {
  const n = actual.length;
  if (n === 0) {
    return {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1: 0,
      confusionMatrix: [
        [0, 0],
        [0, 0],
      ],
    };
  }

  // Binary confusion matrix: [[TN, FP], [FN, TP]]
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  for (let i = 0; i < n; i += 1) {
    const a = actual[i];
    const p = predicted[i];
    if (a === 1 && p === 1) tp += 1;
    else if (a === 0 && p === 1) fp += 1;
    else if (a === 0 && p === 0) tn += 1;
    else if (a === 1 && p === 0) fn += 1;
  }

  const accuracy = (tp + tn) / n;
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return {
    accuracy,
    precision,
    recall,
    f1,
    confusionMatrix: [
      [tn, fp],
      [fn, tp],
    ],
  };
}

/** Logistic Regression for 2D Points: P(y=1|x) = sigmoid(w1 * x + w2 * y + b) */
export function fitLogisticRegression(
  points: DataPoint2D[],
  learningRate: number = 0.05,
  epochs: number = 200,
  decisionThreshold: number = 0.5
): {
  w1: number;
  w2: number;
  b: number;
  predictProb: (x: number, y: number) => number;
  predictClass: (x: number, y: number) => number;
  metrics: ClassificationMetrics;
} {
  let w1 = 0;
  let w2 = 0;
  let b = 0;

  const n = points.length;
  if (n === 0) {
    return {
      w1: 0,
      w2: 0,
      b: 0,
      predictProb: () => 0.5,
      predictClass: () => 0,
      metrics: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1: 0,
        confusionMatrix: [
          [0, 0],
          [0, 0],
        ],
      },
    };
  }

  // Standardize inputs for stable gradient descent
  const xMean = mean(points.map((p) => p.x));
  const xStd = standardDeviation(points.map((p) => p.x)) || 1;
  const yMean = mean(points.map((p) => p.y));
  const yStd = standardDeviation(points.map((p) => p.y)) || 1;

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    let dw1 = 0;
    let dw2 = 0;
    let db = 0;

    for (let i = 0; i < n; i += 1) {
      const p = points[i];
      const zx = (p.x - xMean) / xStd;
      const zy = (p.y - yMean) / yStd;
      const target = p.label ?? 0;
      const z = w1 * zx + w2 * zy + b;
      const pred = sigmoid(z);
      const err = pred - target;

      dw1 += err * zx;
      dw2 += err * zy;
      db += err;
    }

    w1 -= (learningRate * dw1) / n;
    w2 -= (learningRate * dw2) / n;
    b -= (learningRate * db) / n;
  }

  const predictProb = (x: number, y: number) => {
    const zx = (x - xMean) / xStd;
    const zy = (y - yMean) / yStd;
    return sigmoid(w1 * zx + w2 * zy + b);
  };

  const predictClass = (x: number, y: number) => (predictProb(x, y) >= decisionThreshold ? 1 : 0);

  const actual = points.map((p) => p.label ?? 0);
  const predicted = points.map((p) => predictClass(p.x, p.y));
  const metrics = computeClassificationMetrics(actual, predicted);

  return { w1, w2, b, predictProb, predictClass, metrics };
}

/** KNN (K-Nearest Neighbors) Classifier */
export function fitKnnClassifier(
  trainPoints: DataPoint2D[],
  k: number,
  metric: 'euclidean' | 'manhattan' | 'chebyshev' = 'euclidean',
  weights: 'uniform' | 'distance' = 'uniform'
): {
  predict: (x: number, y: number) => { predictedClass: number; neighbors: DataPoint2D[] };
  metrics: ClassificationMetrics;
} {
  const distance = (x1: number, y1: number, x2: number, y2: number) => {
    if (metric === 'manhattan') {
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    if (metric === 'chebyshev') {
      return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    }
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  };

  const predict = (x: number, y: number) => {
    if (trainPoints.length === 0) {
      return { predictedClass: 0, neighbors: [] };
    }

    const sorted = [...trainPoints].sort(
      (a, b) => distance(x, y, a.x, a.y) - distance(x, y, b.x, b.y)
    );
    const neighbors = sorted.slice(0, Math.min(k, sorted.length));

    // Majority vote (with optional distance weighting)
    const votes: Record<number, number> = {};
    for (const n of neighbors) {
      const lbl = n.label ?? 0;
      const d = distance(x, y, n.x, n.y);
      const voteWeight = weights === 'distance' ? 1 / (d + 1e-4) : 1;
      votes[lbl] = (votes[lbl] || 0) + voteWeight;
    }

    let bestClass = 0;
    let maxVotes = -1;
    for (const [lblStr, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        bestClass = Number(lblStr);
      }
    }

    return { predictedClass: bestClass, neighbors };
  };

  const actual = trainPoints.map((p) => p.label ?? 0);
  const predicted = trainPoints.map((p) => predict(p.x, p.y).predictedClass);
  const metrics = computeClassificationMetrics(actual, predicted);

  return { predict, metrics };
}

/** Decision Tree Classifier (CART) */
export function fitDecisionTree(
  points: DataPoint2D[],
  maxDepth: number = 4,
  criterion: 'gini' | 'entropy' = 'gini'
): {
  root: DecisionTreeNode;
  predict: (x: number, y: number) => number;
  metrics: ClassificationMetrics;
} {
  let nodeIdCounter = 0;

  function calculateImpurity(pts: DataPoint2D[]): number {
    const total = pts.length;
    if (total === 0) return 0;
    const counts: Record<number, number> = {};
    for (const p of pts) {
      const lbl = p.label ?? 0;
      counts[lbl] = (counts[lbl] || 0) + 1;
    }

    if (criterion === 'gini') {
      let sumSq = 0;
      for (const count of Object.values(counts)) {
        sumSq += (count / total) ** 2;
      }
      return 1 - sumSq;
    }

    // Entropy
    let ent = 0;
    for (const count of Object.values(counts)) {
      const prob = count / total;
      if (prob > 0) {
        ent -= prob * Math.log2(prob);
      }
    }
    return ent;
  }

  function buildTree(pts: DataPoint2D[], depth: number): DecisionTreeNode {
    nodeIdCounter += 1;
    const id = `node-${nodeIdCounter}`;
    const total = pts.length;

    const classCounts: [number, number] = [0, 0];
    for (const p of pts) {
      const lbl = p.label ?? 0;
      if (lbl === 0) classCounts[0] += 1;
      else classCounts[1] += 1;
    }

    const majorityClass = classCounts[1] > classCounts[0] ? 1 : 0;
    const impurity = calculateImpurity(pts);

    // Stop conditions
    if (depth >= maxDepth || impurity === 0 || total < 2) {
      return {
        id,
        isLeaf: true,
        predictedClass: majorityClass,
        samples: total,
        impurity,
        classCounts,
        depth,
      };
    }

    // Search for best split across features (0: x, 1: y)
    let bestGain = 0;
    let bestFeature = 0;
    let bestThreshold = 0;
    let bestLeft: DataPoint2D[] = [];
    let bestRight: DataPoint2D[] = [];

    for (let f = 0; f <= 1; f += 1) {
      const values = pts.map((p) => (f === 0 ? p.x : p.y)).sort((a, b) => a - b);

      for (let i = 0; i < values.length - 1; i += 1) {
        const threshold = (values[i] + values[i + 1]) / 2;
        const left = pts.filter((p) => (f === 0 ? p.x : p.y) <= threshold);
        const right = pts.filter((p) => (f === 0 ? p.x : p.y) > threshold);

        if (left.length === 0 || right.length === 0) continue;

        const leftImpurity = calculateImpurity(left);
        const rightImpurity = calculateImpurity(right);
        const gain =
          impurity - (left.length / total) * leftImpurity - (right.length / total) * rightImpurity;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = f;
          bestThreshold = threshold;
          bestLeft = left;
          bestRight = right;
        }
      }
    }

    if (bestGain <= 1e-7 || bestLeft.length === 0 || bestRight.length === 0) {
      return {
        id,
        isLeaf: true,
        predictedClass: majorityClass,
        samples: total,
        impurity,
        classCounts,
        depth,
      };
    }

    return {
      id,
      featureIndex: bestFeature,
      threshold: bestThreshold,
      left: buildTree(bestLeft, depth + 1),
      right: buildTree(bestRight, depth + 1),
      isLeaf: false,
      predictedClass: majorityClass,
      samples: total,
      impurity,
      classCounts,
      depth,
    };
  }

  const root = buildTree(points, 0);

  const predict = (x: number, y: number): number => {
    let curr: DecisionTreeNode | undefined = root;
    while (curr && !curr.isLeaf) {
      const val = curr.featureIndex === 0 ? x : y;
      if (val <= (curr.threshold ?? 0)) {
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }
    return curr?.predictedClass ?? 0;
  };

  const actual = points.map((p) => p.label ?? 0);
  const predicted = points.map((p) => predict(p.x, p.y));
  const metrics = computeClassificationMetrics(actual, predicted);

  return { root, predict, metrics };
}

// ----------------------------------------------------------------------
// 3. Clustering (K-Means, Hierarchical, DBSCAN)
// ----------------------------------------------------------------------

export function fitKMeans(
  points: DataPoint2D[],
  k: number,
  initMethod: 'random' | 'kmeans++' = 'kmeans++',
  maxIterations: number = 30
): {
  centroids: { x: number; y: number }[];
  clusteredPoints: DataPoint2D[];
  metrics: ClusteringMetrics;
} {
  const n = points.length;
  if (n === 0 || k <= 0) {
    return {
      centroids: [],
      clusteredPoints: [],
      metrics: { k, inertia: 0, iterations: 0, clusterCounts: [] },
    };
  }

  const actualK = Math.min(k, n);
  let centroids: { x: number; y: number }[] = [];

  // 1. Initialization
  if (initMethod === 'kmeans++') {
    // Pick first centroid uniformly at random
    const firstIdx = Math.floor(Math.random() * n);
    centroids.push({ x: points[firstIdx].x, y: points[firstIdx].y });

    // Pick remaining centroids with prob proportional to min distance squared
    while (centroids.length < actualK) {
      const distSq = points.map((p) => {
        let minDist = Infinity;
        for (const c of centroids) {
          const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
          if (d < minDist) minDist = d;
        }
        return minDist;
      });

      const totalDist = distSq.reduce((a, b) => a + b, 0);
      let rand = Math.random() * totalDist;
      let selectedIdx = 0;
      for (let i = 0; i < n; i += 1) {
        rand -= distSq[i];
        if (rand <= 0) {
          selectedIdx = i;
          break;
        }
      }
      centroids.push({ x: points[selectedIdx].x, y: points[selectedIdx].y });
    }
  } else {
    // Random sample points as centroids
    const indices = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
    centroids = indices.slice(0, actualK).map((idx) => ({
      x: points[idx].x,
      y: points[idx].y,
    }));
  }

  // 2. Lloyd's iterations
  let clustered: DataPoint2D[] = points.map((p) => ({ ...p, cluster: 0 }));
  let iters = 0;

  for (iters = 0; iters < maxIterations; iters += 1) {
    // Assign each point to nearest centroid
    let changed = false;
    clustered = clustered.map((p) => {
      let minD = Infinity;
      let bestCluster = 0;
      for (let cIdx = 0; cIdx < centroids.length; cIdx += 1) {
        const c = centroids[cIdx];
        const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
        if (d < minD) {
          minD = d;
          bestCluster = cIdx;
        }
      }
      if (p.cluster !== bestCluster) changed = true;
      return { ...p, cluster: bestCluster };
    });

    if (!changed && iters > 0) break;

    // Recalculate centroids
    const newCentroids = centroids.map((c, cIdx) => {
      const clusterPoints = clustered.filter((p) => p.cluster === cIdx);
      if (clusterPoints.length === 0) return c;
      return {
        x: mean(clusterPoints.map((p) => p.x)),
        y: mean(clusterPoints.map((p) => p.y)),
      };
    });

    centroids = newCentroids;
  }

  // Compute inertia (WCSS)
  let inertia = 0;
  const clusterCounts = Array(actualK).fill(0);
  for (const p of clustered) {
    const cIdx = p.cluster ?? 0;
    clusterCounts[cIdx] += 1;
    const c = centroids[cIdx];
    if (c) {
      inertia += (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
    }
  }

  return {
    centroids,
    clusteredPoints: clustered,
    metrics: { k: actualK, inertia, iterations: iters + 1, clusterCounts },
  };
}

/** Compute Elbow Curve data (Inertia for K=1..maxK) */
export function computeElbowCurve(
  points: DataPoint2D[],
  maxK: number = 8
): { k: number; inertia: number }[] {
  const result: { k: number; inertia: number }[] = [];
  const limit = Math.min(maxK, points.length);
  for (let k = 1; k <= limit; k += 1) {
    const model = fitKMeans(points, k, 'kmeans++', 20);
    result.push({ k, inertia: model.metrics.inertia });
  }
  return result;
}

/** Agglomerative Hierarchical Clustering */
export function fitHierarchicalClustering(
  points: DataPoint2D[],
  numClusters: number,
  linkage: 'single' | 'complete' | 'average' = 'average'
): {
  dendrogramRoot: DendrogramNode | null;
  clusteredPoints: DataPoint2D[];
} {
  const n = points.length;
  if (n === 0) return { dendrogramRoot: null, clusteredPoints: [] };

  // Initialize leaf nodes
  let nodes: DendrogramNode[] = points.map((p, idx) => ({
    id: `leaf-${idx}`,
    pointIndex: idx,
    distance: 0,
    size: 1,
  }));

  // Initial distance matrix
  let clusters: number[][] = points.map((_, i) => [i]);

  const pointDist = (i: number, j: number) =>
    Math.sqrt((points[i].x - points[j].x) ** 2 + (points[i].y - points[j].y) ** 2);

  const clusterDist = (c1: number[], c2: number[]) => {
    let d = linkage === 'single' ? Infinity : linkage === 'complete' ? -Infinity : 0;
    let count = 0;
    for (const p1 of c1) {
      for (const p2 of c2) {
        const dist = pointDist(p1, p2);
        if (linkage === 'single') d = Math.min(d, dist);
        else if (linkage === 'complete') d = Math.max(d, dist);
        else {
          d += dist;
          count += 1;
        }
      }
    }
    return linkage === 'average' ? d / count : d;
  };

  let mergeCount = 0;
  while (clusters.length > 1) {
    let minDist = Infinity;
    let bestA = 0;
    let bestB = 1;

    for (let i = 0; i < clusters.length; i += 1) {
      for (let j = i + 1; j < clusters.length; j += 1) {
        const d = clusterDist(clusters[i], clusters[j]);
        if (d < minDist) {
          minDist = d;
          bestA = i;
          bestB = j;
        }
      }
    }

    mergeCount += 1;
    const newNode: DendrogramNode = {
      id: `merge-${mergeCount}`,
      left: nodes[bestA],
      right: nodes[bestB],
      distance: minDist,
      size: nodes[bestA].size + nodes[bestB].size,
    };

    const newCluster = [...clusters[bestA], ...clusters[bestB]];

    // Remove bestB then bestA
    clusters = clusters.filter((_, idx) => idx !== bestA && idx !== bestB);
    clusters.push(newCluster);

    nodes = nodes.filter((_, idx) => idx !== bestA && idx !== bestB);
    nodes.push(newNode);
  }

  // Assign cluster IDs to points based on numClusters cuts
  const finalClusters = fitKMeans(points, numClusters).clusteredPoints;

  return {
    dendrogramRoot: nodes[0] || null,
    clusteredPoints: finalClusters,
  };
}

/** DBSCAN (Density-Based Spatial Clustering of Applications with Noise) */
export function fitDbscan(
  points: DataPoint2D[],
  eps: number = 25,
  minPts: number = 4
): {
  clusteredPoints: DataPoint2D[];
  coreCount: number;
  borderCount: number;
  noiseCount: number;
  clusterCount: number;
} {
  const n = points.length;
  const dist = (p1: DataPoint2D, p2: DataPoint2D) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);

  const neighbors = points.map((p) =>
    points.filter((other) => dist(p, other) <= eps).map((other) => other.id)
  );

  const isCore = neighbors.map((nList) => nList.length >= minPts);
  const clusterAssignment: Record<string, number> = {};
  const isNoise: Record<string, boolean> = {};

  let currentCluster = 0;
  const visited = new Set<string>();

  for (let i = 0; i < n; i += 1) {
    const p = points[i];
    if (visited.has(p.id)) continue;
    visited.add(p.id);

    if (!isCore[i]) {
      isNoise[p.id] = true;
      continue;
    }

    currentCluster += 1;
    clusterAssignment[p.id] = currentCluster;
    isNoise[p.id] = false;

    // Expand cluster
    const queue = [...neighbors[i]];
    while (queue.length > 0) {
      const neighborId = queue.shift()!;
      const neighborIdx = points.findIndex((pt) => pt.id === neighborId);
      if (neighborIdx === -1) continue;

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        if (isCore[neighborIdx]) {
          queue.push(...neighbors[neighborIdx]);
        }
      }

      if (clusterAssignment[neighborId] === undefined) {
        clusterAssignment[neighborId] = currentCluster;
        isNoise[neighborId] = false;
      }
    }
  }

  let coreCount = 0;
  let borderCount = 0;
  let noiseCount = 0;

  const clusteredPoints: DataPoint2D[] = points.map((p, idx) => {
    const c = clusterAssignment[p.id];
    const noise = isNoise[p.id] ?? true;
    if (noise) {
      noiseCount += 1;
      return { ...p, isNoise: true, cluster: -1 };
    }
    if (isCore[idx]) {
      coreCount += 1;
    } else {
      borderCount += 1;
    }
    return { ...p, isNoise: false, cluster: c ?? 0 };
  });

  return {
    clusteredPoints,
    coreCount,
    borderCount,
    noiseCount,
    clusterCount: currentCluster,
  };
}

// ----------------------------------------------------------------------
// 4. Dimensionality Reduction (PCA)
// ----------------------------------------------------------------------

export function fitPca2D(points: DataPoint2D[]): {
  meanX: number;
  meanY: number;
  metrics: PcaMetrics;
  project1D: (
    x: number,
    y: number,
    angleDeg?: number
  ) => { projX: number; projY: number; t: number };
} {
  const n = points.length;
  if (n < 2) {
    return {
      meanX: 0,
      meanY: 0,
      metrics: {
        eigenvalues: [1, 0],
        eigenvectors: [
          [1, 0],
          [0, 1],
        ],
        explainedVarianceRatio: [1, 0],
      },
      project1D: (x, y) => ({ projX: x, projY: y, t: 0 }),
    };
  }

  const meanX = mean(points.map((p) => p.x));
  const meanY = mean(points.map((p) => p.y));

  // Compute 2x2 covariance matrix
  let covXX = 0;
  let covXY = 0;
  let covYY = 0;

  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    covXX += dx * dx;
    covXY += dx * dy;
    covYY += dy * dy;
  }
  covXX /= n - 1;
  covXY /= n - 1;
  covYY /= n - 1;

  // Solve characteristic polynomial: det(C - lambda * I) = 0
  // lambda^2 - (covXX + covYY) * lambda + (covXX * covYY - covXY^2) = 0
  const trace = covXX + covYY;
  const det = covXX * covYY - covXY * covXY;
  const disc = Math.sqrt(Math.max(0, trace * trace - 4 * det));

  const lambda1 = (trace + disc) / 2;
  const lambda2 = Math.max(0, (trace - disc) / 2);

  // Compute eigenvector for lambda1
  let v1x = 1;
  let v1y = 0;
  if (Math.abs(covXY) > 1e-9) {
    v1x = lambda1 - covYY;
    v1y = covXY;
  } else if (covXX >= covYY) {
    v1x = 1;
    v1y = 0;
  } else {
    v1x = 0;
    v1y = 1;
  }
  const norm1 = Math.sqrt(v1x * v1x + v1y * v1y) || 1;
  v1x /= norm1;
  v1y /= norm1;

  // Eigenvector 2 is perpendicular to v1
  const v2x = -v1y;
  const v2y = v1x;

  const totalVar = lambda1 + lambda2 || 1;
  const evr1 = lambda1 / totalVar;
  const evr2 = lambda2 / totalVar;

  const project1D = (x: number, y: number, angleDeg?: number) => {
    let ux = v1x;
    let uy = v1y;
    if (angleDeg !== undefined) {
      const rad = (angleDeg * Math.PI) / 180;
      ux = Math.cos(rad);
      uy = Math.sin(rad);
    }
    const dx = x - meanX;
    const dy = y - meanY;
    const t = dx * ux + dy * uy;
    return {
      projX: meanX + t * ux,
      projY: meanY + t * uy,
      t,
    };
  };

  return {
    meanX,
    meanY,
    metrics: {
      eigenvalues: [lambda1, lambda2],
      eigenvectors: [
        [v1x, v1y],
        [v2x, v2y],
      ],
      explainedVarianceRatio: [evr1, evr2],
    },
    project1D,
  };
}

// ----------------------------------------------------------------------
// 5. Neural Network (MLP Playground)
// ----------------------------------------------------------------------

export interface MlpWeights {
  w1: number[][]; // [inputDim x hidden1]
  b1: number[];
  w2: number[][]; // [hidden1 x hidden2] or [hidden1 x output]
  b2: number[];
  w3?: number[][]; // [hidden2 x output]
  b3?: number[];
}

export class SimpleMlpClassifier {
  inputDim: number = 2;

  hidden1Dim: number;

  hidden2Dim: number;

  activation: 'relu' | 'tanh' | 'sigmoid';

  lr: number;

  weights: MlpWeights;

  constructor(
    hidden1Dim: number = 4,
    hidden2Dim: number = 0,
    activation: 'relu' | 'tanh' | 'sigmoid' = 'tanh',
    lr: number = 0.05
  ) {
    this.hidden1Dim = hidden1Dim;
    this.hidden2Dim = hidden2Dim;
    this.activation = activation;
    this.lr = lr;
    this.weights = this.initWeights();
  }

  private randWeight(fanIn: number): number {
    return (Math.random() * 2 - 1) * Math.sqrt(2 / fanIn);
  }

  private initWeights(): MlpWeights {
    const w1 = Array.from({ length: this.inputDim }, () =>
      Array.from({ length: this.hidden1Dim }, () => this.randWeight(this.inputDim))
    );
    const b1 = Array(this.hidden1Dim).fill(0);

    if (this.hidden2Dim > 0) {
      const w2 = Array.from({ length: this.hidden1Dim }, () =>
        Array.from({ length: this.hidden2Dim }, () => this.randWeight(this.hidden1Dim))
      );
      const b2 = Array(this.hidden2Dim).fill(0);
      const w3 = Array.from({ length: this.hidden2Dim }, () => [this.randWeight(this.hidden2Dim)]);
      const b3 = [0];
      return { w1, b1, w2, b2, w3, b3 };
    }

    const w2 = Array.from({ length: this.hidden1Dim }, () => [this.randWeight(this.hidden1Dim)]);
    const b2 = [0];
    return { w1, b1, w2, b2 };
  }

  private act(x: number): number {
    if (this.activation === 'relu') return Math.max(0, x);
    if (this.activation === 'tanh') return Math.tanh(x);
    return sigmoid(x);
  }

  private actDeriv(out: number): number {
    if (this.activation === 'relu') return out > 0 ? 1 : 0;
    if (this.activation === 'tanh') return 1 - out * out;
    return out * (1 - out);
  }

  public forward(
    x: number,
    y: number
  ): {
    h1: number[];
    h2?: number[];
    output: number;
  } {
    const input = [x, y];
    // Layer 1
    const h1: number[] = Array(this.hidden1Dim).fill(0);
    for (let j = 0; j < this.hidden1Dim; j += 1) {
      let sum = this.weights.b1[j];
      for (let i = 0; i < this.inputDim; i += 1) {
        sum += input[i] * this.weights.w1[i][j];
      }
      h1[j] = this.act(sum);
    }

    if (this.hidden2Dim > 0 && this.weights.w3 && this.weights.b3) {
      // Layer 2
      const h2: number[] = Array(this.hidden2Dim).fill(0);
      for (let j = 0; j < this.hidden2Dim; j += 1) {
        let sum = this.weights.b2[j];
        for (let i = 0; i < this.hidden1Dim; i += 1) {
          sum += h1[i] * this.weights.w2[i][j];
        }
        h2[j] = this.act(sum);
      }
      // Output
      let sumOut = this.weights.b3[0];
      for (let i = 0; i < this.hidden2Dim; i += 1) {
        sumOut += h2[i] * this.weights.w3[i][0];
      }
      return { h1, h2, output: sigmoid(sumOut) };
    }

    // 1 Hidden Layer Output
    let sumOut = this.weights.b2[0];
    for (let i = 0; i < this.hidden1Dim; i += 1) {
      sumOut += h1[i] * this.weights.w2[i][0];
    }
    return { h1, output: sigmoid(sumOut) };
  }

  public trainEpoch(points: DataPoint2D[]): number {
    if (points.length === 0) return 0;
    let totalLoss = 0;

    for (const p of points) {
      const target = p.label ?? 0;
      const { h1, h2, output } = this.forward(p.x, p.y);

      // Binary cross-entropy loss
      const loss = -(
        target * Math.log(Math.max(1e-9, output)) +
        (1 - target) * Math.log(Math.max(1e-9, 1 - output))
      );
      totalLoss += loss;

      const dOut = output - target;

      if (this.hidden2Dim > 0 && h2 && this.weights.w3 && this.weights.b3) {
        // Backprop Layer 3
        const dH2: number[] = Array(this.hidden2Dim).fill(0);
        for (let j = 0; j < this.hidden2Dim; j += 1) {
          dH2[j] = dOut * this.weights.w3[j][0] * this.actDeriv(h2[j]);
          this.weights.w3[j][0] -= this.lr * dOut * h2[j];
        }
        this.weights.b3[0] -= this.lr * dOut;

        // Backprop Layer 2
        const dH1: number[] = Array(this.hidden1Dim).fill(0);
        for (let i = 0; i < this.hidden1Dim; i += 1) {
          let sum = 0;
          for (let j = 0; j < this.hidden2Dim; j += 1) {
            sum += dH2[j] * this.weights.w2[i][j];
            this.weights.w2[i][j] -= this.lr * dH2[j] * h1[i];
          }
          dH1[i] = sum * this.actDeriv(h1[i]);
          this.weights.b2[i] -= this.lr * (dH2[i] || 0);
        }

        // Backprop Layer 1
        for (let i = 0; i < this.inputDim; i += 1) {
          const inVal = i === 0 ? p.x : p.y;
          for (let j = 0; j < this.hidden1Dim; j += 1) {
            this.weights.w1[i][j] -= this.lr * dH1[j] * inVal;
          }
        }
        for (let j = 0; j < this.hidden1Dim; j += 1) {
          this.weights.b1[j] -= this.lr * dH1[j];
        }
      } else {
        // 1 Hidden Layer Backprop
        const dH1: number[] = Array(this.hidden1Dim).fill(0);
        for (let j = 0; j < this.hidden1Dim; j += 1) {
          dH1[j] = dOut * this.weights.w2[j][0] * this.actDeriv(h1[j]);
          this.weights.w2[j][0] -= this.lr * dOut * h1[j];
        }
        this.weights.b2[0] -= this.lr * dOut;

        for (let i = 0; i < this.inputDim; i += 1) {
          const inVal = i === 0 ? p.x : p.y;
          for (let j = 0; j < this.hidden1Dim; j += 1) {
            this.weights.w1[i][j] -= this.lr * dH1[j] * inVal;
          }
        }
        for (let j = 0; j < this.hidden1Dim; j += 1) {
          this.weights.b1[j] -= this.lr * dH1[j];
        }
      }
    }

    return totalLoss / points.length;
  }
}
