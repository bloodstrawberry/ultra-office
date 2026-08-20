export type SortingAlgorithm = 'quick' | 'merge' | 'heap' | 'bubble' | 'insertion' | 'selection';

export interface SortStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  comparisons: number;
  swaps: number;
  description: string;
}

export type PathfindingAlgorithm = 'astar' | 'dijkstra' | 'bfs' | 'dfs';

export interface GridCell {
  row: number;
  col: number;
  isStart: boolean;
  isEnd: boolean;
  isWall: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
}
