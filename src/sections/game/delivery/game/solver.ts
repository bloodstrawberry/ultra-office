import {
  BLOCK_PORTAL_1,
  getBaseBlockId,
} from "../object/constants";
import { CellType, Position, copyGrid } from "./types";
import { slideOrbox, findPlayerSpawn, Direction } from "./physics";

export interface DFSSolveResult {
  solvable: boolean;
  solutionDirections: Direction[];
  solutionSymbols: string[];
  solutionKorean: string[];
  totalSteps: number;
  totalExploredStates: number;
  message: string;
}

const DIR_SYMBOLS: Record<Direction, string> = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

const DIR_KOREAN: Record<Direction, string> = {
  up: "위(↑)",
  down: "아래(↓)",
  left: "왼쪽(←)",
  right: "오른쪽(→)",
};

const ALL_DIRECTIONS: Direction[] = ["up", "right", "down", "left"];

function serializeState(grid: CellType[][], pos: Position): string {
  let res = `${pos.x},${pos.y}|`;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      res += grid[r][c] + ",";
    }
    res += ";";
  }
  return res;
}

/**
 * Solve ORBOX puzzle using Breadth-First Search (BFS) over 4 directions.
 * Includes async progress reporting for UI visualization.
 */
export async function solveOrboxBFS(
  initialGrid: CellType[][],
  customStartPos?: Position,
  maxDepth = 45,
  timeLimitMs = 60000, // 60 seconds limit for visual search
  onProgress?: (
    path: string[],
    status: "searching" | "deadend" | "success",
  ) => Promise<void>,
): Promise<DFSSolveResult> {
  const grid = copyGrid(initialGrid);
  const startPos = customStartPos || findPlayerSpawn(grid);

  // 1. Verify if goal portal exists
  let hasGoal = false;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (getBaseBlockId(grid[r][c]) === BLOCK_PORTAL_1) {
        hasGoal = true;
        break;
      }
    }
    if (hasGoal) break;
  }

  if (!hasGoal) {
    return {
      solvable: false,
      solutionDirections: [],
      solutionSymbols: [],
      solutionKorean: [],
      totalSteps: 0,
      totalExploredStates: 0,
      message: "목표 포털(Goal Portal)이 맵에 존재하지 않습니다.",
    };
  }

  const visited = new Set<string>();
  const startTime = Date.now();
  let exploredStatesCount = 0;
  let accumulatedDelay = 0;

  interface BFSNode {
    grid: CellType[][];
    pos: Position;
    dir: Direction | null;
    parent: BFSNode | null;
    depth: number;
  }

  // Root state
  const rootKey = serializeState(grid, startPos);
  visited.add(rootKey);

  const queue: BFSNode[] = [];
  let queueHead = 0;

  queue.push({
    grid,
    pos: startPos,
    dir: null,
    parent: null,
    depth: 0,
  });

  function getPathSymbols(node: BFSNode | null, includeDir?: Direction): string[] {
    const p: string[] = [];
    let curr = node;
    while (curr && curr.dir) {
      p.push(DIR_SYMBOLS[curr.dir]);
      curr = curr.parent;
    }
    p.reverse();
    if (includeDir) {
      p.push(DIR_SYMBOLS[includeDir]);
    }
    return p;
  }

  function getPathDirections(node: BFSNode | null, includeDir?: Direction): Direction[] {
    const p: Direction[] = [];
    let curr = node;
    while (curr && curr.dir) {
      p.push(curr.dir);
      curr = curr.parent;
    }
    p.reverse();
    if (includeDir) {
      p.push(includeDir);
    }
    return p;
  }

  while (queueHead < queue.length) {
    // Check timeout excluding UI delays
    const realElapsedTime = Date.now() - startTime - accumulatedDelay;
    if (realElapsedTime > timeLimitMs) break;

    const current = queue[queueHead++];

    // Periodically free up memory
    if (queueHead > 10000) {
      queue.splice(0, queueHead);
      queueHead = 0;
    }

    if (current.depth >= maxDepth) continue;

    for (const dir of ALL_DIRECTIONS) {
      const pathSymbols = getPathSymbols(current, dir);
      const sim = slideOrbox(current.grid, current.pos, dir);

      // 이동 불가 (벽에 바로 막힘)
      if (!sim.success) {
        if (onProgress) {
          const t0 = Date.now();
          await onProgress(pathSymbols, "deadend");
          accumulatedDelay += Date.now() - t0;
        }
        continue;
      }

      // 맵 밖으로 추락
      if (sim.isOutOfBounds) {
        if (onProgress) {
          const t0 = Date.now();
          await onProgress(pathSymbols, "deadend");
          accumulatedDelay += Date.now() - t0;
        }
        continue;
      }

      // 목표 도달! (최단 경로)
      if (sim.isCleared) {
        if (onProgress) {
          const t0 = Date.now();
          await onProgress(pathSymbols, "success");
          accumulatedDelay += Date.now() - t0;
        }
        const solution = getPathDirections(current, dir);
        return {
          solvable: true,
          solutionDirections: solution,
          solutionSymbols: solution.map((d) => DIR_SYMBOLS[d]),
          solutionKorean: solution.map((d) => DIR_KOREAN[d]),
          totalSteps: solution.length,
          totalExploredStates: exploredStatesCount,
          message: `${solution.length}단계 최단 경로로 클리어 가능합니다!`,
        };
      }

      // 이미 방문한 상태 (무한 루프 방지)
      const stateKey = serializeState(sim.grid, sim.finalPos);
      if (visited.has(stateKey)) {
        if (onProgress) {
          const t0 = Date.now();
          await onProgress(pathSymbols, "deadend");
          accumulatedDelay += Date.now() - t0;
        }
        continue;
      }
      visited.add(stateKey);

      exploredStatesCount++;

      // 정상적으로 큐에 추가 (다음 깊이 대기)
      if (onProgress) {
        const t0 = Date.now();
        await onProgress(pathSymbols, "searching");
        accumulatedDelay += Date.now() - t0;
      }
      
      queue.push({
        grid: sim.grid,
        pos: sim.finalPos,
        dir,
        parent: current,
        depth: current.depth + 1,
      });
    }
  }

  return {
    solvable: false,
    solutionDirections: [],
    solutionSymbols: [],
    solutionKorean: [],
    totalSteps: 0,
    totalExploredStates: exploredStatesCount,
    message: "해당 맵은 현재 배치로 클리어할 수 없습니다 (최단 경로 탐색 불가).",
  };
}
