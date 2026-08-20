import type { GridCell, PathfindingAlgorithm } from '../types';

// ----------------------------------------------------------------------

export const GRID_ROWS = 16;
export const GRID_COLS = 32;

export function createInitialGrid(): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      row.push({
        row: r,
        col: c,
        isStart: r === 7 && c === 4,
        isEnd: r === 7 && c === 27,
        isWall: false,
        isVisited: false,
        isPath: false,
        distance: Infinity,
      });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * A* Pathfinding Algorithm
 */
export function runAStar(
  grid: GridCell[][],
  startNode: GridCell,
  endNode: GridCell
): { visitedNodesInOrder: GridCell[]; shortestPath: GridCell[] } {
  const visitedNodesInOrder: GridCell[] = [];
  const openSet: GridCell[] = [];

  // Reset distances
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0]!.length; c++) {
      grid[r]![c]!.distance = Infinity;
      grid[r]![c]!.isVisited = false;
      grid[r]![c]!.isPath = false;
    }
  }

  const previousNodeMap = new Map<string, GridCell>();
  const key = (n: GridCell) => `${n.row},${n.col}`;

  startNode.distance = 0;
  openSet.push(startNode);

  const heuristic = (a: GridCell, b: GridCell) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

  while (openSet.length > 0) {
    // Sort openSet by f(n) = distance + heuristic
    openSet.sort(
      (a, b) => a.distance + heuristic(a, endNode) - (b.distance + heuristic(b, endNode))
    );
    const current = openSet.shift()!;

    if (current.isWall) continue;
    if (current.distance === Infinity) break;

    current.isVisited = true;
    visitedNodesInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      // Reconstruct shortest path
      const shortestPath: GridCell[] = [];
      let curr: GridCell | undefined = current;
      while (curr) {
        shortestPath.unshift(curr);
        curr = previousNodeMap.get(key(curr));
      }
      return { visitedNodesInOrder, shortestPath };
    }

    // Neighbors
    const neighbors: GridCell[] = [];
    const { row, col } = current;
    if (row > 0) neighbors.push(grid[row - 1]![col]!);
    if (row < grid.length - 1) neighbors.push(grid[row + 1]![col]!);
    if (col > 0) neighbors.push(grid[row]![col - 1]!);
    if (col < grid[0]!.length - 1) neighbors.push(grid[row]![col + 1]!);

    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && !neighbor.isWall) {
        const tentativeDistance = current.distance + 1;
        if (tentativeDistance < neighbor.distance) {
          previousNodeMap.set(key(neighbor), current);
          neighbor.distance = tentativeDistance;
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [] };
}

/**
 * Generate random walls maze
 */
export function generateRandomMaze(grid: GridCell[][]): GridCell[][] {
  return grid.map((row) =>
    row.map((cell) => {
      if (cell.isStart || cell.isEnd) return cell;
      return {
        ...cell,
        isWall: Math.random() < 0.28,
        isVisited: false,
        isPath: false,
      };
    })
  );
}
