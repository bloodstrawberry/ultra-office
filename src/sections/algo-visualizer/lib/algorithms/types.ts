export type AlgorithmCategory =
  | 'sorting'
  | 'search'
  | 'tree'
  | 'graph'
  | 'advancedGraph'
  | 'dp'
  | 'recursion'
  | 'geometry'
  | 'string';

export type AlgorithmId =
  // 1. Sorting
  | 'bubbleSort'
  | 'selectionSort'
  | 'insertionSort'
  | 'quickSort'
  | 'mergeSort'
  | 'heapSort'
  | 'countingSort'
  | 'radixSort'
  // 2. Search
  | 'linearSearch'
  | 'binarySearch'
  | 'twoPointer'
  | 'parametricSearch'
  | 'slidingWindow'
  // 3. Tree & Linear DS
  | 'bst'
  | 'stackQueue'
  // 4. Graph & Grid
  | 'dijkstra'
  | 'astar'
  | 'bfs'
  | 'dfs'
  // 5. Advanced Graph & Network
  | 'floydWarshall'
  | 'topologicalSort'
  | 'mst'
  | 'bipartiteMatch'
  | 'maxFlow'
  // 6. Dynamic Programming
  | 'knapsack'
  | 'lcs'
  | 'kadane'
  // 7. Recursion & Backtracking
  | 'recursion'
  | 'permutationCombination'
  | 'nQueens'
  // 8. Geometry
  | 'planeSweeping'
  // 9. String
  | 'kmp';

export interface ComplexityInfo {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  spaceWorst: string;
  isStable?: boolean;
  isInPlace?: boolean;
}

export interface VariableSnapshot {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ArrayPointer {
  label: string;
  index: number;
  color?: string;
}

export interface TreeNodeData {
  id: string;
  value: number;
  label?: string;
  status?: 'default' | 'active' | 'visited' | 'found';
  children?: TreeNodeData[];
  left?: TreeNodeData | null;
  right?: TreeNodeData | null;
  x?: number;
  y?: number;
}

export type GridCellType = 'empty' | 'wall' | 'start' | 'target' | 'visited' | 'current' | 'path';

export interface GridCell {
  row: number;
  col: number;
  type: GridCellType;
  distance?: number;
  fCost?: number;
  gCost?: number;
  hCost?: number;
}

export interface NetworkNode {
  id: string;
  label: string;
  x: number;
  y: number;
  inDegree?: number;
  group?: 'A' | 'B';
  status?: 'default' | 'active' | 'selected' | 'matched';
}

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  weight?: number;
  capacity?: number;
  flow?: number;
  isDirected?: boolean;
  status?: 'default' | 'comparing' | 'selected' | 'rejected' | 'matched' | 'augmented';
}

export interface CallStackFrame {
  id: string;
  name: string;
  args: string;
  depth: number;
  status: 'calling' | 'active' | 'returning';
  returnValue?: number | string;
}

export interface RectangleData {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  label?: string;
}

export type SoundType = 'compare' | 'swap' | 'pivot' | 'found' | 'visit' | 'step' | 'complete';

export interface Step {
  stepIndex: number;
  line: number; // 1-indexed code line
  description: string;
  variables: VariableSnapshot;
  soundType?: SoundType;
  soundValue?: number;

  // Sorting & Search state
  array?: number[];
  comparingIndices?: number[];
  swappingIndices?: number[];
  sortedIndices?: number[];
  pivotIndex?: number | null;
  pointers?: ArrayPointer[];
  targetValue?: number;
  foundIndex?: number | null;

  // Counting Sort & Radix Sort
  countArray?: number[];
  outputArray?: (number | null)[];
  activeCountIdx?: number | null;
  countPhase?: 'count' | 'accumulate' | 'output' | 'done';
  radixBuckets?: number[][];
  radixDigitExp?: number;

  // Sliding Window
  windowStart?: number;
  windowEnd?: number;
  windowSum?: number;
  maxWindowSum?: number;

  // Tree state
  treeRoot?: TreeNodeData | null;
  activeNodeId?: string | null;
  visitedNodeIds?: string[];
  traversalResult?: number[];

  // Stack / Queue state
  stackItems?: number[];
  queueItems?: number[];

  // 2D Grid / Graph state
  grid?: GridCell[][];
  visitedCellCoords?: [number, number][];
  currentCellCoord?: [number, number] | null;
  pathCellCoords?: [number, number][];
  activeNeighbors?: [number, number][];

  // Advanced Network Graph state
  networkNodes?: NetworkNode[];
  networkEdges?: NetworkEdge[];
  topoOrder?: string[];
  mstTotalWeight?: number;
  maxFlowValue?: number;
  bipartiteMatches?: [string, string][];

  // Dynamic Programming (2D & 1D)
  dp2D?: (number | string | null)[][] | number[][];
  dpRowLabels?: string[];
  dpColLabels?: string[];
  dpActiveCell?: [number, number] | null;
  dpSourceCells?: [number, number][];
  kadaneCurrentSum?: number;
  kadaneMaxSum?: number;
  kadaneBestRange?: [number, number];

  // Floyd Warshall Matrix
  matrix?: (number | string)[][];
  matrixLabels?: string[];
  matrixK?: number | null;
  matrixI?: number | null;
  matrixJ?: number | null;
  matrixUpdating?: boolean;

  // Recursion & Backtracking
  callStack?: CallStackFrame[];
  currentSelection?: number[];
  generatedCombinations?: number[][];
  totalWaysCount?: number;
  chessBoard?: number[][]; // N-Queens (0: empty, 1: queen, -1: conflict)

  // Geometry / Plane Sweeping
  rectangles?: RectangleData[];
  sweepLineX?: number | null;
  activeIntervals?: [number, number][];
  accumulatedArea?: number;

  // Parametric Search
  searchLow?: number;
  searchHigh?: number;
  searchMid?: number;
  isMidFeasible?: boolean | null;
  bestAnswer?: number | null;

  // String / KMP
  kmpText?: string;
  kmpPattern?: string;
  kmpPiTable?: number[];
  kmpTextIdx?: number;
  kmpPatternIdx?: number;
  kmpMatchedIndices?: number[];
}

export interface MultiLanguageCode {
  typescript: string;
  python: string;
  cpp: string;
  java: string;
}

export interface ProblemRecommendation {
  platform: 'BOJ' | 'Programmers' | 'LeetCode';
  title: string;
  difficulty:
    | 'Bronze'
    | 'Silver'
    | 'Gold'
    | 'Platinum'
    | 'Lv1'
    | 'Lv2'
    | 'Lv3'
    | 'Easy'
    | 'Medium'
    | 'Hard';
  url: string;
  keyTakeaway: string;
}

export interface AlgorithmDefinition {
  id: AlgorithmId;
  name: string;
  englishName: string;
  category: AlgorithmCategory;
  icon: string;
  tag: string;
  tagColor: string;
  shortDescription: string;
  keyFeatures: string[];
  complexity: ComplexityInfo;
  code: string;
  codeLanguage: string;
  multiLanguageCode?: MultiLanguageCode;
  problemRecommendations?: ProblemRecommendation[];
  realWorldPatterns?: string[];
  defaultInput: unknown;
  generateSteps: (input?: unknown) => Step[];
}
