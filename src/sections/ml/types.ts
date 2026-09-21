// ----------------------------------------------------------------------
// Machine Learning Types
// ----------------------------------------------------------------------

export type MlCategory =
  | 'overview'
  | 'supervised-regression'
  | 'supervised-classification'
  | 'unsupervised-clustering'
  | 'unsupervised-dim-reduction'
  | 'neural-network'
  | 'library-sandbox';

export type MlModelId =
  | 'linear'
  | 'ridge'
  | 'lasso'
  | 'logistic'
  | 'knn'
  | 'decision-tree'
  | 'kmeans'
  | 'hierarchical'
  | 'dbscan'
  | 'pca'
  | 'neural-net'
  | 'sandbox';

export interface DataPoint2D {
  id: string;
  x: number;
  y: number;
  label?: number; // class label (0, 1, 2...) for classification/clustering
  cluster?: number;
  isNoise?: boolean;
}

export interface RegressionMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
}

export interface ClassificationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: number[][]; // 2x2 or 3x3
}

export interface ClusteringMetrics {
  k: number;
  inertia: number; // WCSS
  iterations: number;
  clusterCounts: number[];
}

export interface PcaMetrics {
  eigenvalues: [number, number];
  eigenvectors: [[number, number], [number, number]];
  explainedVarianceRatio: [number, number];
}

export interface DecisionTreeNode {
  id: string;
  featureIndex?: number; // 0 for x, 1 for y
  threshold?: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
  isLeaf: boolean;
  predictedClass?: number;
  samples: number;
  impurity: number; // Gini or Entropy
  classCounts: number[];
  depth: number;
}

export interface DendrogramNode {
  id: string;
  left?: DendrogramNode;
  right?: DendrogramNode;
  distance: number;
  pointIndex?: number;
  size: number;
}

export interface MlModelSummary {
  id: MlModelId;
  nameKo: string;
  nameEn: string;
  category: MlCategory;
  categoryNameKo: string;
  description: string;
  formula: string;
  path: string;
  tags: string[];
}
